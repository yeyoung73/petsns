// models/tokenModels.js
import pool from "../config/db.js";

// 이메일 인증 토큰 조회/삭제
export async function findEmailToken(token) {
  const { rows } = await pool.query(
    `SELECT id, token, expires_at 
       FROM public.email_tokens
      WHERE token = $1`,
    [token]
  );
  return rows[0] || null;
}

export async function deleteEmailToken(id) {
  await pool.query(`DELETE FROM public.email_tokens WHERE id = $1`, [id]);
}

// 리프레시 토큰 조회/삭제
export async function findRefreshToken(token) {
  const { rows } = await pool.query(
    `SELECT id, token, expires_at 
       FROM public.refresh_tokens
      WHERE token = $1`,
    [token]
  );
  return rows[0] || null;
}

export async function deleteRefreshToken(id) {
  await pool.query(`DELETE FROM public.refresh_tokens WHERE id = $1`, [id]);
}
