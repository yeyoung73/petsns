import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsFromFollowings,
  getPostsByTag,
} from "../models/postModel.js";

// 전체 게시글 목록
export async function handleGetPosts(req, res) {
  try {
    const userId = Number(req.user?.userId);
    const posts = await getAllPosts(userId);
    // Parse tags from JSON string to array for each post
    const postsWithTags = posts.map((post) => ({
      ...post,
      is_deleted: post.is_deleted,
      tags: post.tags
        ? Array.isArray(post.tags)
          ? post.tags
          : JSON.parse(post.tags)
        : [],
    }));
    res.json(postsWithTags);
  } catch (err) {
    console.error("게시글 목록 조회 오류:", err);
    res.status(500).json({ message: "게시물 조회 실패" });
  }
}

// 단일 게시글 조회
export const handleGetPost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const currentUserId = Number(req.user.userId);
    if (isNaN(postId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    const post = await getPostById(postId, currentUserId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    // Parse tags from JSON string to array
    const postWithTags = {
      ...post,
      is_deleted: post.is_deleted,
      tags: post.tags
        ? Array.isArray(post.tags)
          ? post.tags
          : JSON.parse(post.tags)
        : [],
    };

    res.json(postWithTags);
  } catch (err) {
    console.error("게시글 조회 오류:", err);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
};

// 게시글 생성
export const handleCreatePost = async (req, res) => {
  try {
    const userId = req.user?.userId; // 로그인된 사용자
    const content = req.body.content;
    const tags = req.body.tags; // JSON 문자열 (["고양이","산책"])
    const image = req.file?.filename || null;

    if (!userId || !content) {
      return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
    }

    const post = await createPost({
      userId,
      content,
      image,
      tags,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("📛 게시글 생성 오류:", err);
    res.status(500).json({ message: "게시글 생성 중 오류 발생" });
  }
};

// 게시글 삭제
export async function handleDeletePost(req, res) {
  try {
    const postId = Number(req.params.id);
    const userId = req.user.userId;

    if (isNaN(postId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 게시글 ID입니다." });
    }

    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    const deleted = await deletePost(postId, userId);
    if (!deleted) {
      return res.status(500).json({ message: "게시글 삭제 실패" });
    }

    res.json({ message: "게시글 삭제 완료" });
  } catch (err) {
    console.error("게시글 삭제 오류:", err);
    res.status(500).json({ message: "게시글 삭제 실패" });
  }
}

// 게시글 수정
// postController.js 또는 postModel.js
export const handleUpdatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;

    const { content } = req.body;
    const image = req.file?.filename
      ? `/uploads/${req.file.filename}`
      : req.body.image || null;
    const tags = JSON.parse(req.body.tags || "[]");

    await updatePost(postId, userId, content, image, tags);

    res.json({ message: "게시글 수정 완료" });
  } catch (err) {
    console.error("게시글 수정 오류:", err);
    res.status(500).json({ message: "게시글 수정 중 오류 발생" });
  }
};

export async function handleGetFollowedPosts(req, res) {
  console.log(req.user);
  const userId = req.user.userId;
  try {
    const posts = await getPostsFromFollowings(userId);
    res.json(posts);
  } catch (error) {
    console.error("팔로우 피드 에러:", error);
    res.status(500).json({ message: "피드를 불러오는 데 실패했습니다." });
  }
}

export async function handleGetPostsByTag(req, res) {
  const tag = req.params.tag;
  try {
    const posts = await getPostsByTag(tag);
    res.json(posts);
  } catch (err) {
    console.error("태그 검색 실패:", err);
    res.status(500).json({ message: "태그 게시글 조회 실패" });
  }
}
