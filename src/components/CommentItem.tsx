import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./CommentItem.module.css";
import { getImageUrl } from "../config/api";
import { differenceInHours, format } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
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
  is_deleted: boolean;
  profile_image?: string;
}

type Props = {
  comment: CommentNode;
  currentUserId: number;
  onDelete: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onReplySuccess: () => void;
  depth?: number; // 댓글 깊이 추가
};

const CommentItem: React.FC<Props> = ({
  comment,
  currentUserId,
  onDelete,
  onUpdate,
  onReplySuccess,
  depth = 0,
}) => {
  const [reply, setReply] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 삭제된 댓글이고 자식이 없으면 렌더링하지 않음
  if (comment.is_deleted && comment.children.length === 0) {
    return null;
  }

  const createdDate = new Date(comment.created_at);
  const hoursDiff = differenceInHours(new Date(), createdDate);
  const timeDisplay =
    hoursDiff < 24
      ? formatDistanceToNow(createdDate, { addSuffix: true, locale: ko })
      : format(createdDate, "yyyy.MM.dd");

  const handleReply = async () => {
    if (!reply.trim() || isSubmitting) return;

    setIsSubmitting(true);
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "답글 작성 실패");
      }

      setReply("");
      setShowReplyBox(false);
      onReplySuccess();
    } catch (err: any) {
      console.error("답글 작성 오류:", err);
      alert(err.message || "답글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
      const res = await fetch("/api/reports", {
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

      if (!res.ok) throw new Error("신고 실패");
      alert("신고가 접수되었습니다.");
    } catch (err) {
      console.error("신고 실패:", err);
      alert("신고에 실패했습니다.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleReply();
    }
  };

  // 깊이에 따른 스타일 클래스
  const getDepthClass = () => {
    if (depth === 0) return styles.rootComment;
    if (depth === 1) return styles.firstReply;
    return styles.deepReply;
  };

  return (
    <li className={`${styles.commentItem} ${getDepthClass()}`}>
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

      <div className={styles.content}>
        {comment.is_deleted ? (
          comment.children.length > 0 ? (
            <i className={styles.deletedText}>삭제된 댓글입니다</i>
          ) : null
        ) : (
          <p className={styles.contentText}>{comment.content}</p>
        )}
      </div>

      {!comment.is_deleted && (
        <div className={styles.actions}>
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
        </div>
      )}

      {showReplyBox && (
        <div className={styles.replyBox}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={2}
            placeholder="답글을 입력하세요... (Ctrl+Enter로 작성)"
            className={styles.replyInput}
            disabled={isSubmitting}
          />
          <div className={styles.replyActions}>
            <button
              onClick={handleReply}
              className={styles.replySubmit}
              disabled={isSubmitting || !reply.trim()}
            >
              {isSubmitting ? "작성 중..." : "작성"}
            </button>
            <button
              onClick={() => {
                setShowReplyBox(false);
                setReply("");
              }}
              className={styles.replyCancel}
            >
              취소
            </button>
          </div>
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
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CommentItem;
