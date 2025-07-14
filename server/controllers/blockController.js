import db from "../config/db.js";

// 차단하기
export const handleBlockUser = async (req, res) => {
  const blockerId = req.user.userId;
  const { blockedUserId } = req.body;
  console.log("👉 차단 요청 도착:", { blockerId, blockedUserId });

  if (!blockedUserId) {
    return res.status(400).json({ error: "차단할 사용자 ID가 필요합니다." });
  }

  try {
    // 중복 차단 방지
    await db.query(
      `INSERT INTO petsns.blocks (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [blockerId, blockedUserId]
    );

    res.status(201).json({ message: "사용자를 차단했습니다." });
  } catch (err) {
    console.error("❌ 차단 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

// 차단한 사용자 목록 조회
export const getBlockedUsers = async (req, res) => {
  const blockerId = req.user.userId;

  try {
    const { rows } = await db.query(
      `SELECT u.user_id, u.username, u.profile_image
       FROM petsns.blocks b
       JOIN petsns.users u ON b.blocked_id = u.user_id
       WHERE b.blocker_id = $1`,
      [blockerId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ 차단 목록 조회 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
};

export async function isBlockedBetween(userId1, userId2) {
  const { rows } = await db.query(
    `SELECT 1 FROM petsns.blocks 
     WHERE (blocker_id = $1 AND blocked_id = $2) 
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [userId1, userId2]
  );
  return rows.length > 0;
}
