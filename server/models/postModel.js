import db from "../config/db.js";

// 게시글 생성
// postModel.ts
export const createPost = async ({ userId, content, image, tags }) => {
  // ✅ 문자열인 경우 파싱
  if (typeof tags === "string") {
    try {
      tags = JSON.parse(tags); // 👉 ["고양이", "산책"]
    } catch (err) {
      console.error("❌ 태그 JSON 파싱 실패", err);
      tags = []; // fallback
    }
  }

  // ✅ PostgreSQL 배열 형식으로 전달하기 위해 배열로 유지
  const result = await db.query(
    `INSERT INTO petsns.posts (user_id, content, image, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, content, image, tags] // tags는 string[]
  );
  const post = result.rows[0];

  // ✅ post_tags 연결도 같이
  for (const tagName of tags) {
    const tagRes = await db.query(
      `INSERT INTO petsns.tags (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING tag_id`,
      [tagName]
    );
    const tagId = tagRes.rows[0].tag_id;

    await db.query(
      `INSERT INTO petsns.post_tags (post_id, tag_id)
       VALUES ($1, $2)`,
      [post.post_id, tagId]
    );
  }

  return post;
};

export async function getAllPosts(userId) {
  const { rows } = await db.query(
    `SELECT p.post_id, p.user_id, u.username, p.content, p.image, p.created_at, p.is_deleted,
            COALESCE(l.like_count,0) AS like_count,
            COALESCE(c.comment_count,0) AS comment_count,
            ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) AS tags
     FROM petsns.posts p
LEFT JOIN petsns.users u ON p.user_id = u.user_id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS like_count FROM petsns.likes GROUP BY post_id
) l ON p.post_id = l.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS comment_count FROM petsns.comments GROUP BY post_id
) c ON p.post_id = c.post_id
LEFT JOIN petsns.post_tags pt ON p.post_id = pt.post_id
LEFT JOIN petsns.tags t ON pt.tag_id = t.tag_id
WHERE p.user_id NOT IN (
  SELECT blocked_id FROM petsns.blocks WHERE blocker_id = $1
)
GROUP BY p.post_id, u.username, l.like_count, c.comment_count, p.is_deleted
ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getPostById(postId, currentUserId) {
  const { rows } = await db.query(
    `SELECT p.post_id, p.user_id, u.username, p.content, p.image, p.created_at, p.is_deleted,
            COALESCE(l.like_count,0) AS like_count,
            COALESCE(c.comment_count,0) AS comment_count,
            ARRAY_REMOVE(ARRAY_AGG(t.name), NULL) AS tags
     FROM petsns.posts p
LEFT JOIN petsns.users u ON p.user_id = u.user_id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS like_count FROM petsns.likes GROUP BY post_id
) l ON p.post_id = l.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS comment_count FROM petsns.comments GROUP BY post_id
) c ON p.post_id = c.post_id
LEFT JOIN petsns.post_tags pt ON p.post_id = pt.post_id
LEFT JOIN petsns.tags t ON pt.tag_id = t.tag_id
WHERE p.post_id = $1
  AND p.user_id NOT IN (
    SELECT blocked_id FROM petsns.blocks WHERE blocker_id = $2
  )
GROUP BY p.post_id, u.username, l.like_count, c.comment_count`,
    [postId, currentUserId]
  );

  return rows[0] || null;
}

export async function deletePost(postId, userId) {
  const result = await db.query(
    `DELETE FROM petsns.posts WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );
  return result.rowCount > 0;
}

export const updatePost = async (postId, userId, content, image, tags) => {
  console.log("💬 updatePost에 전달된 tags:", tags);

  const pgTags = `{${tags.map((t) => `"${t}"`).join(",")}}`; // ← PostgreSQL용 문자열로 변환

  await db.query(
    "UPDATE petsns.posts SET content = $1, image = $2, tags = $3 WHERE post_id = $4 AND user_id = $5",
    [content, image, pgTags, postId, userId]
  );

  // 연관 테이블 삭제 및 다시 삽입
  await db.query("DELETE FROM petsns.post_tags WHERE post_id = $1", [postId]);

  for (const tagName of tags) {
    const tagRes = await db.query(
      "INSERT INTO petsns.tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING tag_id",
      [tagName]
    );
    const tagId = tagRes.rows[0].tag_id;

    await db.query(
      "INSERT INTO petsns.post_tags (post_id, tag_id) VALUES ($1, $2)",
      [postId, tagId]
    );
  }
};

export async function getPostsFromFollowings(userId) {
  const query = `
      SELECT
    posts.post_id,
    posts.user_id,
    posts.content,
    posts.image,
    posts.created_at,
    posts.is_deleted,
    users.username,
    users.profile_image,
    (
      SELECT array_agg(t.name ORDER BY pt.created_at)
      FROM petsns.post_tags pt
      JOIN petsns.tags t ON pt.tag_id = t.tag_id
      WHERE pt.post_id = posts.post_id
    ) AS tags,
    COUNT(DISTINCT likes.like_id) AS like_count
  FROM petsns.posts
  JOIN petsns.follows ON posts.user_id = follows.following_id
  JOIN petsns.users ON posts.user_id = users.user_id
  LEFT JOIN petsns.likes ON posts.post_id = likes.post_id
  WHERE follows.follower_id = $1
    AND posts.user_id NOT IN (
      SELECT blocked_id FROM petsns.blocks WHERE blocker_id = $1
    )
  GROUP BY posts.post_id, posts.user_id, posts.content, posts.image,
          posts.created_at, users.username, users.profile_image
  ORDER BY posts.created_at DESC
  `;

  const { rows } = await db.query(query, [userId]);
  return rows;
}

export async function getPostsByTag(tagName, userId) {
  const query = `
    SELECT
      posts.post_id,
      posts.user_id,
      posts.content,
      posts.image,
      posts.created_at,
      posts.is_deleted,
      users.username,
      users.profile_image,
      COALESCE(array_agg(DISTINCT tags.name), '{}') AS tags,
      COUNT(DISTINCT likes.like_id) AS like_count
    FROM petsns.posts
    JOIN petsns.users ON posts.user_id = users.user_id
    LEFT JOIN petsns.post_tags ON posts.post_id = post_tags.post_id
    LEFT JOIN petsns.tags ON post_tags.tag_id = tags.tag_id
    LEFT JOIN petsns.likes ON posts.post_id = likes.post_id
    WHERE tags.name = $1
      AND posts.user_id NOT IN (
        SELECT blocked_id FROM petsns.blocks WHERE blocker_id = $2
      )
    GROUP BY
      posts.post_id,
      posts.user_id,
      posts.content,
      posts.image,
      posts.created_at,
      users.username,
      users.profile_image
    ORDER BY posts.created_at DESC
  `;
  const { rows } = await db.query(query, [tagName, userId]);
  return rows;
}
