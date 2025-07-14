import React, { useState } from "react";
import { createAnniversary } from "../services/api";
import styles from "./AnniversaryForm.module.css";

type Props = {
  petId: number;
  onCreated: () => void;
};

const AnniversaryForm: React.FC<Props> = ({ petId, onCreated }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnniversary({ pet_id: petId, title, date, memo });
      alert("🎉 기념일이 등록되었습니다.");
      setTitle("");
      setDate("");
      setMemo("");
      onCreated();
    } catch (err) {
      console.error("기념일 등록 실패", err);
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>📅 기념일 등록</h3>
      <input
        type="text"
        placeholder="예: 생일, 입양일"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.input}
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={styles.input}
        required
      />
      <textarea
        placeholder="메모 (선택)"
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className={styles.textarea}
      />
      <button type="submit" className={styles.button}>
        등록
      </button>
    </form>
  );
};

export default AnniversaryForm;
