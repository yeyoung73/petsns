import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CommentItem.module.css";
import { getImageUrl } from "../config/api";
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommentNode {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
  children: CommentNode[];
  profile_image?: string; // 선택적 이미지
}

type Props = {
  comment: CommentNode;
  currentUserId: number;
  onDelete: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onReplySuccess: () => void;
};

const CommentItem: React.FC<Props> = ({
  comment,
  currentUserId,
  onDelete,
  onUpdate,
  onReplySuccess,
}) => {
  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  if (comment.is_deleted && comment.children.length === 0) {
    return null;
  }
  const createdDate = new Date(comment.created_at);
  const hoursDiff = differenceInHours(new Date(), createdDate);
  const timeDisplay =
    hoursDiff < 24
      ? formatDistanceToNow(createdDate, { addSuffix: true, locale: ko }) // 예: "3시간 전"
      : format(createdDate, "yyyy.MM.dd"); // 예: "2024.07.08"

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: comment.post_id,
          parentId: comment.id,
          content: reply.trim(),
        }),
      });

      if (!res.ok) throw new Error("답글 작성 실패");
      setReply("");
      setShowReplyBox(false);
      onReplySuccess();
    } catch (err) {
      alert("답글 작성에 실패했습니다.");
    }
  };

  const handleReport = async (
    type: "post" | "comment" | "user",
    id: number
  ) => {
    const reason = prompt("신고 사유를 입력해주세요:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_type: type,
          target_id: id,
          reason,
        }),
      });
      alert("신고가 접수되었습니다.");
    } catch (err) {
      console.error("신고 실패:", err);
      alert("신고에 실패했습니다.");
    }
  };

  console.log("💬 댓글 데이터:", comment);

  return (
    <li className={styles.commentItem}>
      <div className={styles.commentHeader}>
        <Link to={`/users/${comment.user_id}`} className={styles.userLink}>
          {comment.profile_image ? (
            <img
              src={getImageUrl(comment.profile_image)}
              alt="프로필"
              className={styles.avatar}
            />
          ) : (
            <div className={styles.placeholderAvatar} />
          )}
          <span className={styles.username}>{comment.username}</span>
        </Link>
        <span className={styles.timestamp}>{timeDisplay}</span>
      </div>

      <p className={styles.content}>
        {comment.is_deleted ? (
          comment.children.length > 0 ? (
            <i>삭제된 댓글입니다</i>
          ) : null
        ) : (
          comment.content
        )}
      </p>

      <div className={styles.actions}>
        {!comment.is_deleted && (
          <>
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className={styles.actionBtn}
            >
              답글
            </button>
            {currentUserId === comment.user_id && (
              <>
                <button
                  onClick={() => onUpdate(comment.id, comment.content)}
                  className={styles.actionBtn}
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className={styles.actionBtn}
                >
                  삭제
                </button>
              </>
            )}
            <button
              onClick={() => handleReport("comment", comment.id)}
              className={styles.reportButton}
            >
              🚨 신고
            </button>
          </>
        )}
      </div>

      {showReplyBox && (
        <div className={styles.replyBox}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="답글을 입력하세요..."
            className={styles.replyInput}
          />
          <button onClick={handleReply} className={styles.replySubmit}>
            작성
          </button>
        </div>
      )}

      {comment.children.length > 0 && (
        <ul className={styles.children}>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CommentItem;
