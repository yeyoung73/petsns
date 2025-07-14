import React, { useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  postId: number;
  initialLiked: boolean;
  initialCount: number;
};

const LikeToggle: React.FC<Props> = ({
  postId,
  initialLiked,
  initialCount,
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/likes/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        alert("차단된 유저의 게시글에는 좋아요를 누를 수 없습니다.");
        return;
      }

      if (!res.ok) {
        throw new Error("좋아요 요청 실패");
      }

      // 서버에서는 liked 상태를 반전시켜서 알려준다고 가정
      const data = await res.json();
      setLiked(data.liked);
      setCount((prev) => prev + (data.liked ? 1 : -1));
    } catch (err) {
      console.error("좋아요 처리 오류:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <button onClick={toggleLike} className="flex items-center gap-1">
      <Heart
        fill={liked ? "red" : "none"}
        className={liked ? "text-red-500" : "text-gray-500"}
      />
      <span>{count}</span>
    </button>
  );
};

export default LikeToggle;
