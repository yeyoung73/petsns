import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getImageUrl } from "../config/api";
import { useFollow } from "../hooks/useFollow";
import styles from "./ProfilePage.module.css";

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("user_id"));

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = id ? Number(id) : null;
  const { isFollowing, followerCount, followingCount, toggleFollow } =
    useFollow(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/users/${id}`);
        setProfile(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "유저 프로필 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  const handleEdit = () => {
    navigate("/profile/edit");
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;
    try {
      await api.delete("/api/users/me");
      alert("탈퇴 완료. 로그아웃합니다.");
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      alert("탈퇴 실패");
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

  const handleBlock = async () => {
    if (!window.confirm("정말 이 유저를 차단하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockedUserId: profile?.user_id }),
      });
      alert("이 유저를 차단했습니다.");
      navigate("/"); // 차단 후 홈으로
    } catch (err) {
      console.error("차단 실패:", err);
      alert("차단에 실패했습니다.");
    }
  };

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div>프로필이 없습니다.</div>;

  const isOwnProfile = profile.user_id === currentUserId;

  return (
    <div className={styles.container}>
      <h2>{profile.username}님의 프로필</h2>

      {profile.profile_image && (
        <img
          src={getImageUrl(profile.profile_image)}
          alt="프로필 이미지"
          className={styles.avatar}
        />
      )}

      <p>
        <strong>이메일:</strong> {profile.email}
      </p>

      {profile.bio && (
        <p>
          <strong>소개:</strong> {profile.bio}
        </p>
      )}

      <p>
        <strong>가입일:</strong>{" "}
        {new Date(profile.created_at).toLocaleDateString()}
      </p>

      <p>
        <strong>팔로워:</strong> {followerCount}명
      </p>
      <p>
        <strong>팔로잉:</strong> {followingCount}명
      </p>

      {isOwnProfile && (
        <div className={styles.actions}>
          <button onClick={handleEdit}>수정</button>
          <button onClick={handleDelete}>탈퇴</button>
        </div>
      )}

      {!isOwnProfile && (
        <>
          <button
            onClick={toggleFollow}
            className={`${styles.followButton} ${
              isFollowing ? styles.followingTrue : styles.followingFalse
            }`}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </button>
          <button
            onClick={() => handleReport("user", profile.user_id)}
            className={styles.reportButton}
          >
            🚨 신고
          </button>
          <button onClick={handleBlock} className={styles.blockButton}>
            🚫 차단
          </button>
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
