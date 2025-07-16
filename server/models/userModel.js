// models/userModel.js
import pool from "../config/db.js";

// 1) 이메일 중복 체크 및 로그인용 조회
export async function getUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT user_id, username, email, password, is_admin
      FROM public.users
      WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

// 2) 회원가입용 삽입
export async function insertUser(username, email, passwordHash) {
  const { rows } = await pool.query(
    `INSERT INTO public.users
       (username, email, password, email_verified, created_at)
     VALUES ($1, $2, $3, false, NOW())
     RETURNING user_id, username, email`,
    [username, email, passwordHash]
  );
  return rows[0];
}

// 3) 이메일 인증 완료 flag 업데이트
export async function verifyUserEmail(userId) {
  await pool.query(
    `UPDATE public.users 
        SET email_verified = true
      WHERE user_id = $1`,
    [userId]
  );
}

export async function getUserById(userId) {
  const { rows } = await pool.query(
    `SELECT user_id, username, email, profile_image, bio, created_at
       FROM public.users
      WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// 사용자 정보 수정
export async function updateUserProfile(userId, updates) {
  const fields = [];
  const values = [];
  let index = 1;

  if (updates.username) {
    fields.push(`username = $${index++}`);
    values.push(updates.username);
  }
  if (updates.email) {
    fields.push(`email = $${index++}`);
    values.push(updates.email);
  }
  if (updates.bio !== undefined) {
    fields.push(`bio = $${index++}`);
    values.push(updates.bio);
  }
  if (updates.profileImage) {
    fields.push(`profile_image = $${index++}`);
    values.push(updates.profileImage);
  }

  if (fields.length === 0) return null;

  values.push(userId);

  const { rows } = await pool.query(
    `
    UPDATE public.users
       SET ${fields.join(", ")}
     WHERE user_id = $${index}
     RETURNING user_id, username, email, profile_image, bio, created_at
    `,
    values
  );

  return rows[0] || null;
}

// 사용자 삭제
export async function deleteUserById(userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM public.users WHERE user_id = $1`,
    [userId]
  );
  return rowCount > 0; // true if deleted
}
