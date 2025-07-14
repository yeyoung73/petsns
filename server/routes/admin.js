// routes/adminRoutes.js
import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";
import {
  deletePostByAdmin,
  deleteCommentByAdmin,
  deleteUserByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.delete("/posts/:id", verifyToken, adminOnly, deletePostByAdmin);
router.delete("/comments/:id", verifyToken, adminOnly, deleteCommentByAdmin);
router.delete("/users/:id", verifyToken, adminOnly, deleteUserByAdmin);

export default router;
