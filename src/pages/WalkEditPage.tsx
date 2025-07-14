import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Walk } from "../types/Walk";
import styles from "./WalkEditPage.module.css";

const WalkEditPage: React.FC = () => {
  const { walkId } = useParams<{ walkId: string }>();
  const navigate = useNavigate();
  const [walk, setWalk] = useState<Walk | null>(null);
  const [memo, setMemo] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalk = async () => {
      try {
        const res = await api.get(`/api/walks/${walkId}`);
        setWalk(res.data);
        setMemo(res.data.memo || "");
        setStartedAt(res.data.started_at);
      } catch (err) {
        console.error("산책 데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalk();
  }, [walkId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walk) return;

    try {
      await api.put(`/api/walks/${walk.walk_id}`, {
        memo: memo.trim(),
        started_at: startedAt,
        route: walk.path,
      });
      navigate(`/walks/pets/${walk.pet_id}`);
    } catch (err) {
      console.error("산책 수정 실패", err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중...</div>;
  }

  if (!walk) {
    return <div className={styles.error}>산책 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>산책 기록 수정</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          날짜 및 시간:
          <input
            type="datetime-local"
            value={new Date(startedAt).toISOString().slice(0, 16)}
            onChange={(e) =>
              setStartedAt(new Date(e.target.value).toISOString())
            }
            className={styles.input}
            required
          />
        </label>

        <label className={styles.label}>
          메모:
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className={styles.textarea}
            rows={5}
          />
        </label>

        <button type="submit" className={styles.button}>
          수정 완료
        </button>
      </form>
    </div>
  );
};

export default WalkEditPage;
