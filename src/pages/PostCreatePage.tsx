import React from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm";
import api from "../services/api";

const PostCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/api/posts", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newId = res.data.post_id;
      alert("작성 완료");
      navigate(`/posts/${newId}`);
    } catch (err) {
      console.error("게시글 작성 실패", err);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2>새 게시글 작성</h2>
      <PostForm onSubmit={handleSubmit} />
    </div>
  );
};

export default PostCreatePage;
