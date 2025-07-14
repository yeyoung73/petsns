import express from "express";
import {
  handleGetPosts,
  handleGetPost,
  handleCreatePost,
  handleUpdatePost,
  handleDeletePost,
  handleGetFollowedPosts,
  handleGetPostsByTag,
} from "../controllers/postController.js";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  validateId,
  validateContent,
} from "../middlewares/ValidationMiddleware.js";

const router = express.Router();

router.get("/feed", verifyToken, handleGetFollowedPosts);

router.get("/by-tag/:tag", verifyToken, handleGetPostsByTag);

// GET /api/posts - 게시글 목록
router.get("/", verifyToken, handleGetPosts);

// GET /api/posts/:id - 게시글 상세
router.get("/:id", verifyToken, validateId(), handleGetPost);

// POST /api/posts - 게시글 작성
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  validateContent,
  handleCreatePost
);

// PUT /api/posts/:id - 게시글 수정
router.put(
  "/:id",
  verifyToken,
  validateId(),
  validateContent,
  handleUpdatePost
);

// DELETE /api/posts/:id - 게시글 삭제
router.delete("/:id", verifyToken, validateId(), handleDeletePost);

export default router;
