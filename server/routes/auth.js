import express from "express";
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  handleGetProfile,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";

console.log("⚙️  authRoutes loaded");

const router = express.Router();
router.post("/register", (req, res, next) => {
  console.log("🛎  Inside POST /api/auth/register handler");
  return register(req, res, next);
});

router.get("/profile", verifyToken, handleGetProfile);
router.get("/verify", verifyEmail);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "로그아웃 성공" });
});

export default router;
