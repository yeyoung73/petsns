import db from "../config/db.js";

// 1. 산책 기록 삽입
export async function insertWalk({ pet_id, started_at, route, memo }) {
  const result = await db.query(
    `INSERT INTO public.walks (pet_id, started_at, route, memo)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [pet_id, started_at, JSON.stringify(route), memo]
  );

  return result.rows[0];
}

// 2. 특정 반려동물 ID로 산책 기록 조회
// 1. 전체 조회
export async function getWalksByPetId(petId) {
  const result = await db.query(
    `SELECT * FROM public.walks WHERE pet_id = $1 ORDER BY started_at DESC`,
    [petId]
  );

  return result.rows.map((walk) => ({
    ...walk,
    route: typeof walk.route === "string" ? JSON.parse(walk.route) : walk.route,
  }));
}

// 2. 단일 조회
export async function findWalkById(walkId) {
  const result = await db.query(
    `SELECT * FROM public.walks WHERE walk_id = $1`,
    [walkId]
  );

  if (result.rows.length === 0) return null;

  const walk = result.rows[0];
  walk.route =
    typeof walk.route === "string" ? JSON.parse(walk.route) : walk.route;
  return walk;
}

// 4. 산책 기록 수정
export async function updateWalkById(walkId, { started_at, route, memo }) {
  // 먼저 기존 데이터 가져오기
  const existing = await findWalkById(walkId);
  if (!existing) return null;

  const result = await db.query(
    `UPDATE public.walks 
     SET started_at = $1, route = $2, memo = $3 
     WHERE walk_id = $4
     RETURNING *`,
    [
      started_at || existing.started_at,
      JSON.stringify(route || existing.route),
      memo ?? existing.memo,
      walkId,
    ]
  );

  return result.rows[0] || null;
}

// 5. 산책 기록 삭제
export async function deleteWalkById(walkId) {
  const result = await db.query(`DELETE FROM public.walks WHERE walk_id = $1`, [
    walkId,
  ]);

  return result.rowCount > 0;
}
