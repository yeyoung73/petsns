import React, { useEffect, useState } from "react";
import api from "../services/api";
import CommentItem from "./CommentItem";
import styles from "./CommentSection.module.css";

interface CommentNode {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  children: CommentNode[];
}

type Props = {
  postId: number;
};

const CommentSection: React.FC<Props> = ({ postId }) => {
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [newComment, setNewComment] = useState("");
  const currentUserId = Number(localStorage.getItem("user_id"));

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const addIdToComments = (comments: any[]): CommentNode[] => {
    return comments.map((comment) => ({
      ...comment,
      id: comment.comment_id,
      children: comment.children ? addIdToComments(comment.children) : [],
    }));
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/${postId}`, {
        headers: getAuthHeaders(),
      });
      const converted = addIdToComments(res.data); // ✅ 재귀 변환
      setComments(converted);
    } catch (err) {
      console.error("댓글 조회 오류:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(
        "/api/comments",
        { postId, content: newComment },
        { headers: getAuthHeaders() }
      );
      setNewComment("");
      fetchComments();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("❌ 차단된 유저의 게시물에는 댓글을 작성할 수 없습니다.");
      } else {
        alert("⚠️ 댓글 작성에 실패했습니다.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/comments/${id}`, {
        headers: getAuthHeaders(),
      });
      fetchComments();
    } catch {
      alert("삭제 실패");
    }
  };

  const handleUpdate = async (id: number, content: string) => {
    const updated = prompt("수정할 내용을 입력하세요", content);
    if (updated) {
      try {
        await api.put(
          `/api/comments/${id}`,
          { content: updated },
          { headers: getAuthHeaders() }
        );
        fetchComments();
      } catch {
        alert("수정 실패");
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.heading}>댓글</h3>
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          placeholder="댓글을 입력하세요"
          required
          className={styles.textarea}
        />
        <button type="submit" className={styles.submitButton}>
          작성
        </button>
      </form>

      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={{ ...comment, is_deleted: comment.is_deleted ?? false }}
            currentUserId={currentUserId}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onReplySuccess={fetchComments}
          />
        ))}
      </ul>
    </div>
  );
};

export default CommentSection;
