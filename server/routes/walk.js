import express from "express";
import {
  createWalk,
  getWalks,
  getWalkById,
  updateWalk,
  deleteWalk,
} from "../controllers/walkController.js";

const router = express.Router();

/**
 * POST   /api/walks               - 산책 경로 등록
 * GET    /api/walks/pets/:petId   - 특정 반려동물의 산책 기록 전체 조회
 * GET    /api/walks/:id           - 산책 상세 조회
 * PUT    /api/walks/:id           - 산책 수정
 * DELETE /api/walks/:id           - 산책 삭제
 */

// 🚶 산책 기록 생성
router.post("/", createWalk);

// 🐾 특정 반려동물의 산책 기록 전체 조회
router.get("/pets/:petId", getWalks);

// 🔍 산책 상세 조회
router.get("/:id", getWalkById);

// ✏️ 산책 기록 수정
router.put("/:id", updateWalk);

// ❌ 산책 기록 삭제
router.delete("/:id", deleteWalk);

export default router;
