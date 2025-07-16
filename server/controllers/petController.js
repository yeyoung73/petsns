import {
  createPet,
  deletePetById,
  getPetById,
  updatePetById,
} from "../models/petModel.js";
import pool from "../config/db.js";

// 등록
export async function registerPet(req, res) {
  try {
    const userId = req.user.userId; // ✅ 일관성 있게 수정
    const { name, species, breed, gender, birthday } = req.body;
    const profileImage = req.files?.profileImage?.[0]
      ? `/uploads/${req.files.profileImage[0].filename}`
      : null;

    console.log("✅ 업로드된 파일:", req.file);
    console.log("✅ 파일 경로:", req.file?.path);

    if (!name || !species || !gender) {
      return res.status(400).json({ message: "필수 항목 누락" });
    }
    const newPet = await createPet({
      ownerId: userId,
      name,
      species,
      breed: breed || null,
      gender,
      birthday: birthday || null,
      profileImage,
    });

    res.status(201).json({
      message: "반려동물 등록 완료",
      pet: newPet,
    });
  } catch (err) {
    console.error("펫 등록 오류:", err);
    res.status(500).json({ message: "펫 등록 실패" });
  }
}

// 수정
export async function editPet(req, res) {
  try {
    const userId = req.user.userId;
    const petId = parseInt(req.params.id);

    const { name, species, breed, gender, birthday } = req.body;

    // 필수 필드 검증을 더 명확하게
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "name은(는) 필수 항목입니다." });
    }
    if (!species || !species.trim()) {
      return res
        .status(400)
        .json({ message: "species은(는) 필수 항목입니다." });
    }
    if (!gender) {
      return res.status(400).json({ message: "gender은(는) 필수 항목입니다." });
    }
    if (isNaN(petId)) {
      return res.status(400).json({ message: "유효하지 않은 ID" });
    }

    const profileImage = req.files?.profileImage?.[0]
      ? `/uploads/${req.files.profileImage[0].filename}`
      : null;

    const updated = await updatePetById(petId, userId, {
      name: name.trim(),
      species: species.trim(),
      breed,
      gender,
      birthday,
      profileImage,
    });

    if (!updated) {
      return res
        .status(403)
        .json({ message: "수정 권한 없음 또는 존재하지 않음" });
    }

    res.json({ message: "수정 완료", pet: updated });
  } catch (err) {
    console.error("펫 수정 오류:", err);
    res.status(500).json({ message: "펫 수정 실패" });
  }
}

// 상세 조회
export async function getPetDetail(req, res) {
  try {
    const userId = req.user.userId;
    const petId = parseInt(req.params.id, 10);

    if (isNaN(petId)) {
      return res.status(400).json({ message: "유효하지 않은 ID" });
    }

    const pet = await getPetById(petId, userId);

    if (!pet) {
      return res.status(404).json({ message: "존재하지 않음 또는 권한 없음" });
    }

    // 🛠️ birthday를 "YYYY-MM-DD" 문자열로 변환
    if (pet.birthday instanceof Date) {
      pet.birthday = pet.birthday.toISOString().slice(0, 10);
    }
    console.log(pet.birthday);
    res.json(pet);
  } catch (err) {
    console.error("펫 상세 조회 오류:", err);
    res.status(500).json({ message: "상세 조회 실패" });
  }
}
// 목록 조회
export const getPetList = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ 일관성 있게 수정

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자입니다." });
    }

    const { rows } = await pool.query(
      `SELECT pet_id, name, species, breed, gender, birthday, profile_image, created_at
       FROM public.pets
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("getPetList 오류:", err);
    res.status(500).json({ message: "반려동물 목록 조회 실패" });
  }
};

export const deletePet = async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (isNaN(petId)) {
      return res.status(400).json({ message: "잘못된 요청입니다." });
    }

    const result = await deletePetById(petId, userId);
    if (!result) {
      return res
        .status(404)
        .json({ message: "존재하지 않거나 권한이 없습니다." });
    }

    res.json({ message: "삭제 완료" });
  } catch (err) {
    console.error("삭제 실패:", err);
    res.status(500).json({ message: "서버 오류로 삭제 실패" });
  }
};
