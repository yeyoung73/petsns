import React, { useState } from "react";
import api from "../services/api";
import axios from "axios";

interface ReplyFormProps {
  postId: number;
  parentId: number;
  onReplySuccess: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  postId,
  parentId,
  onReplySuccess,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await api.post(
        "/api/comments",
        {
          postId,
          parentId,
          content,
        },
        { headers }
      );

      setContent("");
      onReplySuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        alert("❌ 차단된 유저의 게시물에는 댓글을 작성할 수 없습니다.");
      } else {
        console.error("대댓글 작성 실패:", err);
        alert("대댓글 작성에 실패했습니다.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginLeft: "1rem", marginTop: "0.5rem" }}
    >
      <textarea
        placeholder="대댓글을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        style={{ width: "100%" }}
        required
      />
      <button type="submit" style={{ marginTop: "0.25rem" }}>
        작성
      </button>
    </form>
  );
};

export default ReplyForm;
