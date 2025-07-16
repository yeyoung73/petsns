// controllers/reportController.js
import {
  checkAndHideComment,
  checkAndHidePost,
  fetchAllReports,
  insertReport,
} from "../models/reportModel.js";
import db from "../config/db.js";

export async function createReport(req, res) {
  const { target_type, target_id, reason } = req.body;
  const reporter_id = req.user.userId;

  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  try {
    await insertReport({ reporter_id, target_type, target_id, reason });
    res.status(201).json({ message: "신고가 접수되었습니다." });
  } catch (err) {
    console.error("❌ 신고 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await fetchAllReports();
    res.json(reports);
  } catch (err) {
    console.error("🚨 신고 조회 실패:", err);
    res
      .status(500)
      .json({ error: "신고 내역을 불러오는 중 오류가 발생했습니다." });
  }
}

// controllers/reportController.js
export async function deleteReport(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM public.reports WHERE report_id = $1", [id]);
    res.json({ message: "신고가 삭제되었습니다." });
  } catch (err) {
    console.error("신고 삭제 실패:", err);
    res.status(500).json({ message: "삭제 실패" });
  }
}

export const submitReport = async (req, res) => {
  const { target_type, target_id, reason } = req.body;
  const reporter_id = req.user.userId;

  try {
    await db.query(
      `INSERT INTO public.reports (reporter_id, target_type, target_id, reason) VALUES ($1, $2, $3, $4)`,
      [reporter_id, target_type, target_id, reason]
    );

    // ✅ 신고 누적 검사 및 자동 숨김
    if (target_type === "comment") {
      await checkAndHideComment(target_id);
    } else if (target_type === "post") {
      await checkAndHidePost(target_id);
    }

    res.json({ message: "신고가 접수되었습니다." });
  } catch (err) {
    console.error("신고 오류:", err);
    res.status(500).json({ message: "신고 실패" });
  }
};
