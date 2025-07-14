import express from "express";
import upload from "../middlewares/upload.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  validateId,
  validatePetData,
} from "../middlewares/ValidationMiddleware.js";
import {
  registerPet,
  editPet,
  getPetDetail,
  getPetList,
  deletePet,
} from "../controllers/petController.js";

const router = express.Router();

// ✅ 이걸로 수정하세요!
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "profileImage", maxCount: 1 }, // 이미지 필드
  ]),
  validatePetData,
  registerPet
);

router.put(
  "/:id",
  verifyToken,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  validateId(),
  validatePetData,
  editPet
);

// ✅ 반려동물 목록 조회
router.get("/", verifyToken, getPetList);

// ✅ 반려동물 상세 조회
router.get("/:id", verifyToken, validateId(), getPetDetail);

router.delete("/:id", verifyToken, validateId(), deletePet);

export default router;
