// controllers/userController.js
import { getUserById } from "../models/userModel.js";
import * as userService from "../services/userService.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    // (원하시면) 중복 이메일 체크
    const exists = await userService.fetchByEmail(email);
    if (exists)
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });

    await userService.createUser(email, password, username);
    res.status(201).json({ message: "회원가입 완료" });
  } catch (err) {
    next(err);
  }
};

export async function getProfile(req, res) {
  try {
    const user = await userService.fetchProfile(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "프로필 조회 실패" });
  }
}

export async function updateProfile(req, res) {
  try {
    const updates = {
      username: req.body.username,
      email: req.body.email,
      bio: req.body.bio,
      profileImage: req.file?.filename, // ✅ multer에서 저장된 이미지 경로
    };

    const user = await userService.modifyProfile(req.user.userId, updates);

    if (!user) {
      return res
        .status(400)
        .json({ message: "수정할 필드를 하나 이상 제공하세요." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "내 정보 수정 실패" });
  }
}

export async function deleteProfile(req, res) {
  try {
    const success = await userService.removeProfile(req.user.userId);
    if (!success) {
      return res.status(400).json({ message: "회원 탈퇴에 실패했습니다." });
    }
    res.json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "회원 탈퇴 실패" });
  }
}

export async function getOtherUser(req, res) {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (err) {
    console.error("다른 사용자 프로필 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
}
