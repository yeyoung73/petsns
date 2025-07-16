// controllers/authController.js
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  getUserByEmail,
  insertUser,
  verifyUserEmail,
} from "../models/userModel.js";
import {
  findEmailToken,
  deleteEmailToken,
  findRefreshToken,
  deleteRefreshToken,
} from "../models/tokenModels.js";
// import { sendVerificationEmail } from "../utils/sendEmail.js";

dotenv.config();

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // 1) 중복 이메일 체크
    if (await getUserByEmail(email)) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2) 비밀번호 해시 + 모델에 삽입
    const hashed = await bcrypt.hash(password, 10);
    const user = await insertUser(username, email, hashed);

    // 3) 이메일 인증 토큰 생성·전송 (선택)
    // await sendVerificationEmail(user.user_id, user.email);

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    console.error("회원가입 에러:", err.message);
    console.error("상세 내용:", err.stack);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function verifyEmail(req, res) {
  const { token } = req.query;
  try {
    // 토큰 유효성 검사
    const payload = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const record = await findEmailToken(token);
    if (!record || record.isExpired()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 실제 이메일 검증 flag 업데이트
    await verifyUserEmail(payload.userId);
    await deleteEmailToken(record.id);

    return res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Verification failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ is_admin을 JWT에 포함
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        isAdmin: user.is_admin, // 여기에 포함
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin, // 프론트에서도 사용 가능하게 응답에 포함
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refreshToken(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const record = await findRefreshToken(token);
    if (!record || record.isExpired()) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    return res.json({ token: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Refresh failed" });
  }
}

export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    const record = await findRefreshToken(token);
    if (record) await deleteRefreshToken(record.id);
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  }
  return res.json({ message: "Logged out" });
}

export const handleGetProfile = async (req, res) => {
  const userId = req.user.userId;

  const result = await db.query(
    "SELECT user_id, username, email FROM public.users WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "사용자를 찾을 수 없습니다" });
  }

  res.json(result.rows[0]);
};
