import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * 특정 유저에 대한 팔로우 상태 및 수를 다루는 훅
 * @param targetUserId - 팔로우 대상 유저의 user_id (nullable)
 */
export const useFollow = (targetUserId: number | null) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchFollowInfo = async () => {
      const token = localStorage.getItem("token");
      const followerId = Number(localStorage.getItem("user_id"));

      // 유효성 검사
      if (!token || !targetUserId || isNaN(followerId)) return;

      try {
        const [statusRes, countsRes] = await Promise.all([
          api.get(`/api/follows/${targetUserId}/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/api/follows/${targetUserId}/counts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ 백엔드에서 반환하는 키와 일치시키기
        setIsFollowing(statusRes.data.followed);
        setFollowerCount(countsRes.data.followerCount);
        setFollowingCount(countsRes.data.followingCount);
      } catch (err) {
        console.error("팔로우 정보 로딩 실패", err);
      }
    };

    fetchFollowInfo();
  }, [targetUserId]);

  const toggleFollow = async () => {
    const token = localStorage.getItem("token");
    const followerId = Number(localStorage.getItem("user_id"));

    // 방어 코드
    if (!token || !targetUserId || isNaN(followerId)) {
      console.error(
        "🚨 유효하지 않은 팔로우 요청: token, targetUserId, followerId 확인"
      );
      return;
    }

    try {
      // 토글 요청
      await api.post(
        `/api/follows/${targetUserId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 토글 후 상태 재조회
      const [statusRes, countsRes] = await Promise.all([
        api.get(`/api/follows/${targetUserId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/api/follows/${targetUserId}/counts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // ✅ 백엔드에서 반환하는 키와 일치시키기
      setIsFollowing(statusRes.data.followed);
      setFollowerCount(countsRes.data.followerCount);
      setFollowingCount(countsRes.data.followingCount);
    } catch (err) {
      console.error("팔로우 토글 실패", err);
    }
  };

  return {
    isFollowing,
    followerCount,
    followingCount,
    toggleFollow,
  };
};
