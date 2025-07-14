import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  likePost,
  unlikePost,
  getLikeCount,
  checkIfLiked,
} from "../controllers/likeController.js";

const router = express.Router();

// POST /api/posts/:postId/like - 좋아요 누르기
router.post("/:postId/like", verifyToken, likePost);

// DELETE /api/posts/:postId/like - 좋아요 취소
router.delete("/:postId/like", verifyToken, unlikePost);

// GET /api/posts/:postId/likes/count - 좋아요 수 조회
router.get("/:postId/count", getLikeCount);

// GET /api/posts/:postId/likes/me - 내가 좋아요 눌렀는지
router.get("/:postId/me", verifyToken, checkIfLiked);

export default router;
