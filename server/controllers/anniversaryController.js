import {
  insertAnniversary,
  findAnniversariesByPet,
  removeAnniversary,
  findUpcomingAnniversaries,
} from "../models/anniversaryModel.js";

export const createAnniversary = async (req, res) => {
  const { pet_id, title, date, memo, image } = req.body;

  if (!pet_id || !title || !date) {
    return res.status(400).json({ message: "필수 항목이 누락되었습니다." });
  }

  const anniversary = await insertAnniversary({
    pet_id,
    title,
    date,
    memo,
    image,
  });
  res.status(201).json(anniversary);
};

export const getAnniversariesByPet = async (req, res) => {
  const petId = Number(req.params.petId);
  const anniversaries = await findAnniversariesByPet(petId);
  res.json(anniversaries);
};

export const deleteAnniversary = async (req, res) => {
  const id = Number(req.params.id);
  const success = await removeAnniversary(id);

  if (!success) {
    return res.status(404).json({ message: "기념일을 찾을 수 없습니다." });
  }

  res.json({ message: "삭제 완료" });
};

export const getUpcomingAnniversaries = async (req, res) => {
  try {
    const upcoming = await findUpcomingAnniversaries();
    res.json(upcoming);
  } catch (err) {
    console.error("다가오는 기념일 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};
