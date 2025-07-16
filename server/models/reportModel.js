// models/reportModel.js
import db from "../config/db.js";

export async function insertReport({
  reporter_id,
  target_type,
  target_id,
  reason,
}) {
  const query = `
    INSERT INTO reports (reporter_id, target_type, target_id, reason)
    VALUES ($1, $2, $3, $4)
  `;
  await db.query(query, [reporter_id, target_type, target_id, reason]);
}

export async function fetchAllReports() {
  const query = `
    SELECT 
      r.report_id,
      r.reporter_id,
      ru.username AS reporter_name,
      r.target_type,
      r.target_id,
      r.reason,
      r.created_at
    FROM reports r
    JOIN users ru ON r.reporter_id = ru.user_id
    ORDER BY r.created_at DESC
  `;
  const { rows } = await db.query(query);
  return rows;
}

export async function checkAndHideComment(commentId) {
  const { rows } = await db.query(
    `SELECT COUNT(*) AS count FROM reports 
     WHERE target_type = 'comment' AND target_id = $1`,
    [commentId]
  );
  const reportCount = parseInt(rows[0].count);

  if (reportCount >= 5) {
    await db.query(
      `UPDATE comments SET is_deleted = true WHERE comment_id = $1`,
      [commentId]
    );
  }
}

export async function checkAndHidePost(postId) {
  console.log("✅ checkAndHidePost 호출됨: postId =", postId);
  postId = Number(postId);
  const { rows } = await db.query(
    `SELECT COUNT(*) AS count FROM reports 
     WHERE target_type = 'post' AND target_id = $1`,
    [postId]
  );

  const reportCount = parseInt(rows[0].count);
  console.log("📊 현재 신고 수:", reportCount);

  if (reportCount >= 5) {
    console.log("🛑 신고 기준 충족, 삭제 처리 시작");

    await db.query(`UPDATE posts SET is_deleted = true WHERE post_id = $1`, [
      postId,
    ]);
    console.log("✅ 게시글 자동 삭제 완료");
  } else {
    console.log("ℹ️ 신고 수 부족: 삭제되지 않음");
  }
}
