import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostForm from "../components/PostForm";
import api from "../services/api";

const PostEditPage: React.FC = () => {
  const { id } = useParams(); // ✅ postId 받기
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<{
    content: string;
    image: string | null;
    tags: string[]; // 태그도 있다면 포함
  } | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) {
          alert("잘못된 접근입니다.");
          return;
        }

        const res = await api.get(`/api/posts/${id}`);
        const post = res.data;

        setInitialData({
          content: post.content || "",
          image: post.imageUrl || null,
          tags: post.tags || [],
        });
      } catch (err) {
        console.error("게시글 불러오기 실패", err);
        alert("게시글 정보를 불러오지 못했습니다.");
        navigate("/posts");
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // 방법 1: FormData를 그대로 사용 (이미지 업로드 지원)
      await api.put(`/api/posts/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type을 설정하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
        },
      });

      alert("수정 완료!");
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error("게시글 수정 실패", err);
      alert("수정 중 문제가 발생했습니다.");
    }
  };

  if (!initialData) return <div>게시글을 불러오는 중입니다...</div>;

  return <PostForm initialData={initialData} onSubmit={handleSubmit} />;
};

export default PostEditPage;
