// components/FeedPost.tsx
import React from "react";
import { Link } from "react-router-dom";
import type { Post } from "../types/Post";
import styles from "./FeedPost.module.css";
import { useLike } from "../hooks/useLike";
import { getImageUrl } from "../config/api";

type Props = {
  post: Post;
  onTagClick?: (tag: string) => void; // 👈 이거 추가!
};

const FeedPost: React.FC<Props> = ({ post, onTagClick }) => {
  const { liked, likeCount, toggleLike } = useLike(post.post_id);
  if (post.is_deleted) {
    return null;
  }
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

  const handleLikeClick = async () => {
    try {
      await toggleLike();
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("❌ 차단된 유저의 게시물에는 좋아요를 누를 수 없습니다.");
      } else {
        console.error("좋아요 실패:", err);
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className={styles.feedPost}>
      <div className={styles.userInfo}>
        <Link to={`/users/${post.user_id}`}>
          <img
            src={getImageUrl(post.profile_image)}
            alt={`${post.username}의 프로필 이미지`}
            className={styles.profileImage}
          />
        </Link>
        <Link to={`/users/${post.user_id}`} className={styles.usernameLink}>
          {post.username}
        </Link>
      </div>

      <div className={styles.content}>
        <p className={styles.text}>{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={styles.tag}
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.image && (
          <img
            src={getImageUrl(post.image)}
            alt="게시글 이미지"
            className={styles.image}
          />
        )}
        <button
          onClick={handleLikeClick}
          className={styles.likeButton}
          disabled={!localStorage.getItem("token")}
        >
          {liked ? "❤️" : "🤍"} {likeCount}
        </button>

        <Link to={`/posts/${post.post_id}`} className={styles.link}>
          댓글 보기 →
        </Link>
      </div>

      <button
        onClick={() => handleReport("post", post.post_id)}
        className={styles.reportButton}
      >
        🚨 신고
      </button>
    </div>
  );
};

export default FeedPost;
