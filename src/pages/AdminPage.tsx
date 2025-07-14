import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "./AdminPage.module.css";

interface Report {
  report_id: number;
  target_type: "post" | "comment" | "user";
  target_id: number;
  reason: string;
  reporter_id: number;
  reporter_name: string;
  created_at: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin") === "true";
    if (!isAdmin) {
      alert("접근 권한이 없습니다.");
      navigate("/");
    } else {
      fetchReports();
    }
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReports(res.data);
    } catch (err) {
      console.error("신고 내역 불러오기 실패:", err);
    }
  };

  const handleDelete = async (reportId: number) => {
    if (!confirm("정말 이 신고 항목을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("삭제되었습니다");
      fetchReports();
    } catch {
      alert("삭제 실패");
    }
  };

  const handleMoveToTarget = async (report: Report) => {
    if (report.target_type === "post") {
      window.open(`/posts/${report.target_id}`, "_blank");
    } else if (report.target_type === "comment") {
      try {
        const res = await api.get(`/api/comments/${report.target_id}/post`);
        const postId = res.data.post_id;
        window.open(`/posts/${postId}#comment-${report.target_id}`, "_blank");
      } catch (err) {
        console.error("댓글 이동 실패:", err);
        alert("댓글의 게시글을 찾을 수 없습니다");
      }
    } else if (report.target_type === "user") {
      window.open(`/users/${report.target_id}`, "_blank");
    }
  };

  const handleTargetDelete = async (report: Report) => {
    if (!confirm("정말 이 항목을 삭제하시겠습니까?")) return;

    const targetType = report.target_type;
    const targetId = report.target_id;

    try {
      await api.delete(`/api/admin/${targetType}s/${targetId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert(`${targetType}가 삭제되었습니다`);
      fetchReports();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 실패");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚨 관리자 대시보드</h1>
      <h2 className={styles.subtitle}>신고된 항목</h2>

      {reports.length === 0 ? (
        <p>신고된 내용이 없습니다.</p>
      ) : (
        <ul className={styles.reportList}>
          {reports.map((report) => (
            <div key={report.report_id} className={styles.reportCard}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(report.report_id)}
              >
                신고 내역 삭제
              </button>

              <button
                className={styles.moveBtn}
                onClick={() => handleMoveToTarget(report)}
              >
                {report.target_type === "post"
                  ? "게시글 보기"
                  : report.target_type === "comment"
                  ? "댓글 보기"
                  : report.target_type === "user"
                  ? "유저 프로필"
                  : "이동"}
              </button>
              <button
                onClick={() => handleTargetDelete(report)}
                className={styles.dangerBtn}
              >
                {report.target_type === "user" ? "사용자 삭제" : "삭제"}
              </button>
              <p>
                유형:{" "}
                {report.target_type === "post"
                  ? "게시글"
                  : report.target_type === "comment"
                  ? "댓글"
                  : report.target_type === "user"
                  ? "사용자"
                  : "알 수 없음"}
              </p>
              <p>ID: {report.target_id}</p>
              <p>사유: {report.reason}</p>
              <p>
                신고자: {report.reporter_name} (ID: {report.reporter_id})
              </p>
              <p>신고일: {new Date(report.created_at).toLocaleString()}</p>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPage;
