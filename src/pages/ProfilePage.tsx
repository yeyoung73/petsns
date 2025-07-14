import React, { useEffect, useState } from "react";
import api from "../services/api";
import styles from "./ProfilePage.module.css";
import { getImageUrl } from "../config/api";
import { useNavigate, useParams } from "react-router-dom";
import { useFollow } from "../hooks/useFollow";

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = Number(localStorage.getItem("user_id"));
  const navigate = useNavigate();
  const { id } = useParams(); // 다른 사람 프로필 볼 때는 /profile/:id 라고 가정

  const targetUserId = id ? Number(id) : currentUserId;
  const { isFollowing, followerCount, followingCount, toggleFollow } =
    useFollow(targetUserId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const url = id ? `/api/users/${id}` : `/api/users/me`;
        const { data } = await api.get<UserProfile>(url);
        setProfile(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "프로필 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleEdit = () => navigate("/profile/edit");

  const handleDelete = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;
    try {
      await api.delete("/api/users/me");
      alert("탈퇴 완료. 로그아웃합니다.");
      localStorage.clear();
      navigate("/login");
    } catch {
      alert("탈퇴 실패");
    }
  };

  if (loading) return <div>불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!profile) return <div>프로필이 없습니다.</div>;

  return (
    <div className={styles.container}>
      <h2>{id ? `${profile.username}님의 프로필` : "내 프로필"}</h2>

      {profile.profile_image && (
        <img
          src={getImageUrl(profile.profile_image)}
          alt="프로필 이미지"
          className={styles.avatar}
        />
      )}

      <p>
        <strong>이름:</strong> {profile.username}
      </p>
      <p>
        <strong>이메일:</strong> {profile.email}
      </p>

      {profile.user_id !== currentUserId && (
        <button
          onClick={toggleFollow}
          className={`${styles.followButton} ${
            isFollowing ? styles.followingTrue : styles.followingFalse
          }`}
        >
          {isFollowing ? "언팔로우" : "팔로우"} ({followerCount})
        </button>
      )}

      <p>
        <strong>팔로잉:</strong> {followingCount}명
      </p>
      <p>
        <strong>팔로워:</strong> {followerCount}명
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

      {profile.user_id === currentUserId && (
        <div className={styles.actions}>
          <button onClick={handleEdit}>수정</button>
          <button onClick={handleDelete}>탈퇴</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
