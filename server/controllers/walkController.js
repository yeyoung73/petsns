import {
  insertWalk,
  getWalksByPetId,
  findWalkById,
  updateWalkById,
  deleteWalkById,
} from "../models/walkModel.js";

export async function createWalk(req, res) {
  const { pet_id, started_at, route, memo } = req.body;
  console.log(req.body);

  if (!pet_id || !started_at || !route) {
    return res.status(400).json({ message: "필수 항목 누락" });
  }

  try {
    const walk = await insertWalk({ pet_id, started_at, route, memo });
    res.status(201).json(walk);
  } catch (err) {
    console.error("산책 저장 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}

export async function getWalks(req, res) {
  const { petId } = req.params;

  try {
    // URL 디코딩
    const decodedPetId = decodeURIComponent(petId);

    // petId가 숫자인지 확인
    const numericPetId = parseInt(decodedPetId, 10);

    // 숫자가 아니거나 유효하지 않은 경우
    if (isNaN(numericPetId) || numericPetId <= 0) {
      return res.status(400).json({
        error: "Invalid pet ID. ID must be a positive number.",
        receivedId: decodedPetId,
        message: "유효하지 않은 반려동물 ID입니다. 숫자여야 합니다.",
      });
    }

    const walks = await getWalksByPetId(numericPetId);
    res.json(walks);
  } catch (err) {
    console.error("산책 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}

export const getWalkById = async (req, res) => {
  try {
    const { id } = req.params;

    // URL 디코딩
    const decodedId = decodeURIComponent(id);

    // ID가 숫자인지 확인
    const walkId = parseInt(decodedId, 10);

    // 숫자가 아니거나 유효하지 않은 경우
    if (isNaN(walkId) || walkId <= 0) {
      return res.status(400).json({
        error: "Invalid walk ID. ID must be a positive number.",
        receivedId: decodedId,
        message: "유효하지 않은 산책 ID입니다. 숫자여야 합니다.",
      });
    }

    // 데이터베이스에서 산책 정보 조회
    const walk = await findWalkById(walkId);

    if (!walk) {
      return res.status(404).json({
        error: "Walk not found",
        message: "산책 기록을 찾을 수 없습니다.",
      });
    }

    res.json(walk);
  } catch (error) {
    console.error("Error in getWalkById:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 다른 walk 관련 함수들도 비슷하게 수정
export const updateWalk = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    const walkId = parseInt(decodedId, 10);

    if (isNaN(walkId) || walkId <= 0) {
      return res.status(400).json({
        error: "Invalid walk ID. ID must be a positive number.",
        receivedId: decodedId,
        message: "유효하지 않은 산책 ID입니다.",
      });
    }

    const updatedWalk = await updateWalkById(walkId, req.body);

    if (!updatedWalk) {
      return res.status(404).json({
        error: "Walk not found",
        message: "산책 기록을 찾을 수 없습니다.",
      });
    }

    res.json(updatedWalk);
  } catch (error) {
    console.error("Error in updateWalk:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "서버 오류가 발생했습니다.",
    });
  }
};

export const deleteWalk = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    const walkId = parseInt(decodedId, 10);

    if (isNaN(walkId) || walkId <= 0) {
      return res.status(400).json({
        error: "Invalid walk ID. ID must be a positive number.",
        receivedId: decodedId,
        message: "유효하지 않은 산책 ID입니다.",
      });
    }

    const deleted = await deleteWalkById(walkId);

    if (!deleted) {
      return res.status(404).json({
        error: "Walk not found",
        message: "산책 기록을 찾을 수 없습니다.",
      });
    }

    res.json({
      message: "Walk deleted successfully",
      message_ko: "산책 기록이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Error in deleteWalk:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "서버 오류가 발생했습니다.",
    });
  }
};
