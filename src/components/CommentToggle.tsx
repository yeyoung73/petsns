import React from "react";
import { MessageSquare } from "lucide-react";

const CommentToggle: React.FC<{ postId: number; commentCount: number }> = ({
  postId,
  commentCount,
}) => {
  const goToComments = () => {
    // TODO: navigate or expand comment UI
    alert(`댓글 보기: 게시물 ID ${postId}`);
  };

  return (
    <button
      onClick={goToComments}
      className="flex items-center gap-1 text-blue-600"
    >
      <MessageSquare />
      <span>{commentCount}</span>
    </button>
  );
};

export default CommentToggle;
