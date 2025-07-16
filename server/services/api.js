// services/api.js
import axios from "axios";

// 🔥 임시 하드코딩 - 반드시 백엔드 실제 URL로 변경하세요!
const API_BASE_URL = "https://petsns-production.up.railway.app";

console.log("🌐 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터에서 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("📤 API 요청:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    console.error("❌ API 요청 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터에서 토큰 만료 처리
api.interceptors.response.use(
  (response) => {
    console.log("✅ API 응답 성공:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API 응답 에러:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // HTML 응답 감지
    if (error.message.includes("Unexpected token")) {
      console.error(
        "🚨 서버에서 HTML을 반환했습니다. API 엔드포인트를 확인하세요!"
      );
    }

    if (error.response?.status === 401) {
      // 토큰 만료 시 로그인 페이지로 리다이렉트
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// fetch 함수들 (기존 코드와 호환성 위해)
export async function fetchFollowedPosts(token) {
  const response = await api.get("/api/posts/feed", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export default api;
