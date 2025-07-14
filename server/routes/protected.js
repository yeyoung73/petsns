import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    message: "인증된 사용자입니다.",
    userId: req.user.userId,
  });
});

export default router;
