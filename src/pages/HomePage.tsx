import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PostList from "../components/PostList";
import type { Post } from "../types/Post";
import styles from "./HomePage.module.css";
import api from "../services/api";
import UpcomingAnniversaryList from "../components/UpcomingAnniversaryList";

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "follow" | "tag">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 초기 인증 및 사용자 정보 설정
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const adminFlag = localStorage.getItem("is_admin") === "true";

    if (!token) {
      navigate("/login");
      return;
    }

    if (username) setUser(username);
    setIsAdmin(adminFlag);
  }, [navigate]);

  // 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        let url = "/api/posts";

        if (filter === "follow") {
          url = "/api/posts/feed";
        } else if (filter === "tag" && selectedTag) {
          url = `/api/posts/by-tag/${encodeURIComponent(selectedTag)}`;
        }

        console.log(`📡 API 요청 중: ${url}`);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`📊 응답 상태: ${res.status}`);

        if (!res.ok) {
          if (res.status === 401) {
            // 토큰이 만료되었거나 유효하지 않음
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("is_admin");
            navigate("/login");
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("📝 받은 게시글 데이터:", data);

        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.warn("⚠️ 받은 데이터가 배열이 아닙니다:", data);
          setPosts([]);
        }
      } catch (err) {
        console.error("❌ 게시글 불러오기 실패:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter, selectedTag, navigate]);

  // 다가오는 기념일 확인
  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await api.get("/api/anniversaries/upcoming");
        if (res.data.length > 0) {
          alert(`📅 ${res.data.length}건의 다가오는 기념일이 있어요!`);
        }
      } catch (err) {
        console.error("다가오는 기념일 불러오기 실패:", err);
      }
    };

    fetchUpcoming();
  }, []);

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("is_admin");
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>반려동물 피드</h1>
        </div>
        <p style={{ textAlign: "center", padding: "20px" }}>
          게시글을 불러오는 중...
        </p>
      </div>
    );
  }

  if (!Array.isArray(posts)) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>반려동물 피드</h1>
        </div>
        <p style={{ textAlign: "center", padding: "20px" }}>
          게시글을 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>반려동물 피드</h1>
          {user && <p className={styles.greeting}>{user}님, 안녕하세요!</p>}
        </div>
        <div>
          <Link
            to="/profile"
            className={`${styles.menuButton} ${styles.profileButton}`}
          >
            내 프로필
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`${styles.menuButton} ${styles.adminButton}`}
            >
              관리자 페이지
            </Link>
          )}
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </div>

      <UpcomingAnniversaryList />

      <div className={styles.menu}>
        <Link
          to="/pets"
          className={`${styles.menuButton} ${styles.listButton}`}
        >
          반려동물 목록
        </Link>
        <Link
          to="/pets/register"
          className={`${styles.menuButton} ${styles.registerButton}`}
        >
          반려동물 추가
        </Link>
        <Link
          to="/walks"
          className={`${styles.menuButton} ${styles.walkButton}`}
        >
          산책 기록
        </Link>
        <Link
          to="/posts/new"
          className={`${styles.menuButton} ${styles.postButton}`}
        >
          게시글 작성
        </Link>
      </div>

      {/* 필터 버튼 영역 */}
      <div className={styles.filterWrapper}>
        <button
          onClick={() => {
            setFilter("all");
            setSelectedTag(null);
          }}
          className={`${styles.filterButton} ${
            filter === "all" ? styles.active : ""
          }`}
        >
          전체 보기
        </button>
        <button
          onClick={() => setFilter("follow")}
          className={`${styles.filterButton} ${
            filter === "follow" ? styles.active : ""
          }`}
        >
          팔로우한 유저
        </button>
      </div>

      {selectedTag && filter === "tag" && (
        <div className={styles.tagFilterNotice}>
          <span>
            <strong>현재 태그 필터:</strong> #{selectedTag}
          </span>
          <button
            onClick={() => {
              setSelectedTag(null);
              setFilter("all");
            }}
            className={styles.clearTagButton}
          >
            ❌ 필터 해제
          </button>
        </div>
      )}

      <PostList
        posts={posts}
        onTagClick={(tag) => {
          setSelectedTag(tag);
          setFilter("tag");
        }}
      />
    </div>
  );
};

export default HomePage;
