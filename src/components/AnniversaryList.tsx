import React, { useEffect, useState } from "react";
import type { Anniversary } from "../types/Anniversary";
import { fetchAnniversaries, deleteAnniversary } from "../services/api";
import styles from "./AnniversaryList.module.css";

type Props = {
  petId: number;
};

const AnniversaryList: React.FC<Props> = ({ petId }) => {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);

  const load = async () => {
    const data = await fetchAnniversaries(petId);
    setAnniversaries(data);
  };

  useEffect(() => {
    load();
  }, [petId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await deleteAnniversary(id);
    await load();
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.heading}>🎈 등록된 기념일</h3>
      {anniversaries.length === 0 ? (
        <p>기념일이 없습니다.</p>
      ) : (
        <ul>
          {anniversaries.map((a) => (
            <li key={a.anniversary_id} className={styles.item}>
              <span className={styles.title}>{a.title}</span>
              <span className={styles.date}>
                - {new Date(a.date).toLocaleDateString()}
              </span>
              {a.memo && <p className={styles.memo}>{a.memo}</p>}
              <button
                onClick={() => handleDelete(a.anniversary_id)}
                className={styles.deleteButton}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnniversaryList;
