// controllers/commentController.js
import {
  createComment,
  updateCommentById,
  softDeleteCommentById,
  getCommentsByPostId,
} from "../models/commentModel.js";
import { isBlockedBetween } from "./blockController.js";
import db from "../config/db.js";

// 댓글 전체 조회
export const fetchComments = async (req, res) => {
  const postId = req.params.postId;
  try {
    const commentTree = await getCommentsByPostId(postId);
    res.json(commentTree);
  } catch (err) {
    console.error("댓글 조회 오류:", err);
    res.status(500).json({ message: "댓글 조회 실패" });
  }
};

export const postComment = async (req, res) => {
  const userId = req.user.userId;
  const { postId, parentId, content } = req.body;

  if (!postId || !content) {
    return res.status(400).json({ message: "내용과 postId는 필수입니다" });
  }

  try {
    // 1. 게시글 작성자 가져오기
    const result = await db.query(
      "SELECT user_id FROM public.posts WHERE post_id = $1",
      [postId]
    );
    const postOwnerId = result.rows[0]?.user_id;

    if (!postOwnerId) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다" });
    }

    // 2. 차단 관계 확인
    const blocked = await isBlockedBetween(userId, postOwnerId);
    if (blocked) {
      return res.status(403).json({
        message: "차단된 유저의 게시글에는 댓글을 작성할 수 없습니다.",
      });
    }

    // 3. 댓글 작성
    const newComment = await createComment({
      postId,
      userId,
      parentId,
      content,
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error("댓글 작성 오류:", err);
    res.status(500).json({ message: "댓글 작성 실패" });
  }
};

// 댓글 수정
export const updateComment = async (req, res) => {
  const userId = req.user.userId;
  const commentId = req.params.id;
  const { content } = req.body;
  console.log("✅ 수정 요청: commentId =", commentId, typeof commentId);
  try {
    const success = await updateCommentById({ commentId, userId, content });
    if (!success) {
      return res.status(403).json({ message: "수정 권한 없음" });
    }
    res.json({ message: "수정 완료" });
  } catch (err) {
    console.error("댓글 수정 오류:", err);
    res.status(500).json({ message: "댓글 수정 실패" });
  }
};

// 댓글 삭제
export async function softDeleteComment(req, res) {
  const { id } = req.params;

  try {
    await softDeleteCommentById(id);
    res.json({ message: "댓글이 삭제 처리되었습니다" });
  } catch (err) {
    console.error("댓글 삭제 실패:", err);
    res.status(500).json({ message: "댓글 삭제 실패" });
  }
}

export async function getPostIdByCommentId(req, res) {
  const { id } = req.params;
  const result = await db.query(
    `SELECT post_id FROM public.comments WHERE comment_id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "댓글을 찾을 수 없습니다" });
  }

  res.json({ post_id: result.rows[0].post_id });
}
