// models/commentModel.js
import pool from "../config/db.js";

// 댓글 목록 조회
function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  comments.forEach((comment) => {
    map.set(comment.comment_id, {
      ...comment,
      is_deleted: comment.is_deleted ?? false,
      children: [],
    });
  });

  comments.forEach((comment) => {
    const node = map.get(comment.comment_id);
    if (comment.parent_id) {
      const parent = map.get(comment.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        // ✅ 부모가 없으면 루트로 간주 (삭제된 부모로 인해 고아가 된 대댓글)
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function getCommentsByPostId(postId, userId) {
  const { rows } = await pool.query(
    `
    SELECT 
      c.comment_id, 
      c.post_id, 
      c.parent_id, 
      c.user_id,
      u.username, 
      u.profile_image,
      c.content, 
      c.created_at, 
      c.is_deleted
    FROM petsns.comments c
    LEFT JOIN petsns.users u ON c.user_id = u.user_id
    WHERE c.post_id = $1
      AND c.user_id NOT IN (
        SELECT blocked_id FROM petsns.blocks WHERE blocker_id = $2
      )
    ORDER BY c.created_at ASC
  `,
    [postId, userId]
  );

  return buildCommentTree(rows);
}
// 댓글 또는 대댓글 생성
export const createComment = async ({ postId, userId, parentId, content }) => {
  const query = `
    INSERT INTO petsns.comments (post_id, user_id, parent_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    postId,
    userId,
    parentId || null,
    content,
  ]);
  return rows[0];
};

// 댓글 수정
export const updateCommentById = async ({ commentId, userId, content }) => {
  const query = `
    UPDATE petsns.comments
    SET content = $1
    WHERE comment_id = $2 AND user_id = $3
  `;
  const result = await pool.query(query, [content, commentId, userId]);
  return result.rowCount > 0;
};

export async function softDeleteCommentById(commentId) {
  const client = await pool.connect();
  try {
    // 대댓글이 있는지 확인
    const childResult = await client.query(
      `SELECT 1 FROM petsns.comments WHERE parent_id = $1 LIMIT 1`,
      [commentId]
    );

    if (childResult.rowCount > 0) {
      // 대댓글이 있으면 소프트 삭제
      await client.query(
        `UPDATE petsns.comments SET is_deleted = true WHERE comment_id = $1`,
        [commentId]
      );
    } else {
      // 대댓글이 없으면 하드 삭제
      await client.query(`DELETE FROM petsns.comments WHERE comment_id = $1`, [
        commentId,
      ]);
    }
  } finally {
    client.release();
  }
}
