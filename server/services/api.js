// services/api.js
import axios from "axios";

// 요청 인터셉터에서 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 또는 sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터에서 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// services/api.ts
export async function fetchFollowedPosts(token) {
  const response = await fetch("/api/posts/feed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("팔로우 피드 요청 실패");
  return await response.json();
}
// 임시 하드코딩 (테스트용)
const API_BASE_URL = "https://petsns-production.up.railway.app";

console.log("🌐 API Base URL (하드코딩):", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log("📤 API 요청:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    console.error("❌ API 요청 에러:", error);
    return Promise.reject(error);
  }
);

export default api;
