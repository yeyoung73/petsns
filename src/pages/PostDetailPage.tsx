import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getImageUrl } from "../config/api";
import CommentSection from "../components/CommentSectiont";
import type { Post } from "../types/Post";
import styles from "./PostDetailPage.module.css";
import { useLike } from "../hooks/useLike";
import { useFollow } from "../hooks/useFollow";
import { Link } from "react-router-dom";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = Number(localStorage.getItem("user_id"));
  const [followTargetId, setFollowTargetId] = useState<number | null>(null);

  const { liked, likeCount, toggleLike } = useLike(post?.post_id || 0);
  const { isFollowing, followerCount, toggleFollow } =
    useFollow(followTargetId);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/posts/${id}`);
        setPost(res.data);

        if (res.data.user_id && res.data.user_id !== currentUserId) {
          setFollowTargetId(res.data.user_id);
        }
      } catch (err) {
        console.error("게시글 로드 실패", err);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, currentUserId]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/api/posts/${id}`);
      alert("삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제에 실패했습니다.");
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

  if (error) {
    return (
      <div className={styles.centeredMessage}>
        <p className={styles.error}>오류: {error}</p>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.centeredMessage}>
        <p>게시글을 찾을 수 없습니다.</p>
        <button className={styles.backButton} onClick={() => navigate("/")}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <div className={styles.authorInfo}>
            <Link
              to={`/users/${post.user_id}`}
              className={styles.authorProfile}
            >
              <img
                src={getImageUrl(post.profile_image)}
                alt={`${post.username}의 프로필 이미지`}
                className={styles.profileImage}
                onError={(e) => {
                  e.currentTarget.src = "/default-profile.png"; // 실패 시 대체 이미지
                }}
              />
              <span className={styles.authorName}>{post.username}</span>
            </Link>
          </div>

          {followTargetId && (
            <button
              onClick={toggleFollow}
              className={`${styles.followButton} ${
                isFollowing ? styles.followingTrue : styles.followingFalse
              }`}
            >
              {isFollowing ? "언팔로우" : "팔로우"} ({followerCount})
            </button>
          )}

          <small className={styles.timestamp}>
            {new Date(post.created_at).toLocaleString()}
          </small>
        </div>

        <button
          onClick={() => handleReport("post", post.post_id)}
          className={styles.reportButton}
        >
          🚨 신고
        </button>
        {currentUserId === post.user_id && (
          <div className={styles.actionButtons}>
            <button onClick={() => navigate(`/posts/${id}/edit`)}>수정</button>
            <button onClick={handleDelete}>삭제</button>
          </div>
        )}
      </div>

      {post.image && (
        <div className={styles.imageWrapper}>
          <img
            src={getImageUrl(post.image)}
            alt="게시글 이미지"
            onError={(e) => {
              console.error("이미지 로드 실패:", post.image);
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <div className={styles.content}>
        {post.content}
        {post.tags && post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag: string, idx: number) => (
              <span key={idx} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className={styles.likeWrapper}>
          <button
            onClick={async () => {
              try {
                await toggleLike();
              } catch (err: any) {
                if (err.response?.status === 403) {
                  alert(
                    "❌ 차단된 유저의 게시물에는 좋아요를 누를 수 없습니다."
                  );
                } else {
                  console.error("좋아요 실패", err);
                  alert("좋아요 처리 중 오류가 발생했습니다.");
                }
              }
            }}
            className={styles.likeButton}
            disabled={!localStorage.getItem("token")}
          >
            {liked ? "❤️" : "🤍"} {likeCount}
          </button>
        </div>
      </div>

      <CommentSection postId={post.post_id} />
    </div>
  );
};

export default PostDetailPage;
