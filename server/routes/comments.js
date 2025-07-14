import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  fetchComments,
  postComment,
  updateComment,
  getPostIdByCommentId,
  softDeleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/:postId", verifyToken, fetchComments);
router.post("/", verifyToken, postComment);
router.put("/:id", verifyToken, updateComment);
router.delete("/:id", verifyToken, softDeleteComment);
router.get("/:id/post", getPostIdByCommentId);

export default router;
