import express from "express";
import {
  toggleFollow,
  checkFollowStatus,
  getFollowCounts,
} from "../controllers/followController.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔒 모든 라우터는 로그인된 사용자만 접근 가능
router.use(verifyToken);

// 팔로우 또는 언팔로우 (POST /api/follows/:userId/toggle)
router.post("/:userId/toggle", toggleFollow);

// 팔로우 여부 확인 (GET /api/follows/:userId/status)
router.get("/:userId/status", checkFollowStatus);

// 팔로워/팔로잉 수 확인 (GET /api/follows/:userId/counts)
router.get("/:userId/counts", getFollowCounts);

export default router;
