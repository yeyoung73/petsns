import { useEffect, useState } from "react";
import api from "../services/api";

export const useLike = (postId: number) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchLikeInfo = async () => {
      try {
        const token = localStorage.getItem("token");

        const [countRes, likedRes] = await Promise.all([
          api.get(`/api/likes/${postId}/count`),
          api.get(`/api/likes/${postId}/me`, {
            headers: { Authorization: `Bearer ${token}` }, // ✅ 여기 있어야 인증됨
          }),
        ]);

        setLikeCount(countRes.data.count);
        setLiked(likedRes.data.liked);
        console.log("❤️ likedRes.data:", likedRes.data);
      } catch (err) {
        console.error("좋아요 정보 로딩 실패", err);
      }
    };

    fetchLikeInfo();
  }, [postId, localStorage.getItem("token")]);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("token");

      if (liked) {
        await api.delete(`/api/likes/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikeCount((prev) => prev - 1);
      } else {
        await api.post(
          `/api/likes/${postId}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLikeCount((prev) => prev + 1);
      }

      setLiked(!liked);
    } catch (err) {
      console.error("좋아요 토글 실패", err);
    }
  };

  return { liked, likeCount, toggleLike };
};
