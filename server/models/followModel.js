import db from "../config/db.js";

// ✅ 팔로우 생성
export const createFollow = async (followerId, followingId) => {
  const sql = `
    INSERT INTO public.follows (follower_id, following_id)
    VALUES ($1, $2)
  `;
  await db.query(sql, [followerId, followingId]);
};

// ✅ 팔로우 삭제
export const deleteFollow = async (followerId, followingId) => {
  const sql = `
    DELETE FROM public.follows
    WHERE follower_id = $1 AND following_id = $2
  `;
  await db.query(sql, [followerId, followingId]);
};

// ✅ 팔로우 여부 확인
export const isFollowing = async (followerId, followingId) => {
  console.log("🔍 isFollowing:", { followerId, followingId }); // ✅ 확인용 로그
  const sql = `
    SELECT COUNT(*) as count
    FROM public.follows
    WHERE follower_id = $1 AND following_id = $2
  `;
  const result = await db.query(sql, [followerId, followingId]);
  return result.rows[0].count > 0;
};

// ✅ 팔로워 수 (나를 팔로우한 사람 수)
export const countFollowers = async (userId) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM public.follows
    WHERE following_id = $1
  `;
  const result = await db.query(sql, [userId]);
  return Number(result.rows[0].count);
};

// ✅ 팔로잉 수 (내가 팔로우하는 사람 수)
export const countFollowing = async (userId) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM public.follows
    WHERE follower_id = $1
  `;
  const result = await db.query(sql, [userId]);
  return Number(result.rows[0].count);
};
