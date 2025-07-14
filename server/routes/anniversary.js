import express from "express";
import {
  createAnniversary,
  getAnniversariesByPet,
  deleteAnniversary,
  getUpcomingAnniversaries,
} from "../controllers/anniversaryController.js";

const router = express.Router();

// [POST] 기념일 생성
router.post("/", createAnniversary);

// [GET] 특정 반려동물의 기념일 전체 조회
router.get("/pets/:petId/", getAnniversariesByPet);

router.get("/upcoming", getUpcomingAnniversaries);

// [DELETE] 기념일 삭제
router.delete("/:id", deleteAnniversary);

export default router;
