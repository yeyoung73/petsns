import React, { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./UpcomingAnniversaryList.module.css";

type Anniversary = {
  anniversary_id: number;
  pet_id: number;
  title: string;
  date: string;
  memo?: string;
};

const UpcomingAnniversaryList: React.FC = () => {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await api.get("/api/anniversaries/upcoming");
        setAnniversaries(res.data);
      } catch (err) {
        console.error("기념일 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  if (loading) return <p className={styles.loading}>불러오는 중...</p>;

  if (anniversaries.length === 0)
    return <p className={styles.noItem}>다가오는 기념일이 없습니다.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🎉 다가오는 기념일</h2>
      <ul className={styles.list}>
        {anniversaries.map((a) => (
          <li key={a.anniversary_id} className={styles.item}>
            <span className={styles.date}>
              {new Date(a.date).toLocaleDateString()}
            </span>
            <span className={styles.titleText}>{a.title}</span>
            {a.memo && <span className={styles.memo}>({a.memo})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingAnniversaryList;
