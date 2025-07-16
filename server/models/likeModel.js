import pool from "../config/db.js";

// 좋아요 추가
export const addLike = async (userId, postId) => {
  const query = `
    INSERT INTO public.likes (user_id, post_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, post_id) DO NOTHING
  `;
  await pool.query(query, [userId, postId]);
};

// 좋아요 취소
export const removeLike = async (userId, postId) => {
  const query = `
    DELETE FROM public.likes WHERE user_id = $1 AND post_id = $2
  `;
  await pool.query(query, [userId, postId]);
};

// 좋아요 개수 조회
export const countLikes = async (postId) => {
  const query = `SELECT COUNT(*) FROM public.likes WHERE post_id = $1`;
  const { rows } = await pool.query(query, [postId]);
  return Number(rows[0].count);
};

// 특정 유저가 좋아요 눌렀는지
export const hasUserLiked = async (userId, postId) => {
  const query = `SELECT 1 FROM public.likes WHERE user_id = $1 AND post_id = $2`;
  const { rowCount } = await pool.query(query, [userId, postId]);
  return rowCount > 0;
};
