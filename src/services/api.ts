// services/api.ts - 개선된 API 서비스 (TypeScript)
import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosResponse,
} from "axios";

// 🔥 임시 하드코딩 - 모든 환경에서 Railway URL 사용
const API_BASE_URL = "https://petsns-production.up.railway.app";

console.log("🌐 API Base URL (services):", API_BASE_URL);

// 타입 정의
interface PetData {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  description?: string;
  image?: File | null;
  [key: string]: any;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  gender?: string;
  weight?: number;
  description?: string;
  imageUrl?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface PetCountResponse {
  count: number;
}

interface ApiError {
  error?: string;
  message?: string;
}

interface TokenPayload {
  exp: number;
  userId: number;
  [key: string]: any;
}

// Axios 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 요청 로깅
    console.log("📤 API 요청:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error: any) => {
    console.error("❌ 요청 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("✅ API 응답 성공:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error: any) => {
    console.error("❌ API 응답 에러:", {
      status: error.response?.status,
      url: error.config?.url,
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message,
      data: error.response?.data,
    });

    // HTML 응답 감지
    if (error.message.includes("Unexpected token")) {
      console.error(
        "🚨 서버에서 HTML을 반환했습니다. API 엔드포인트를 확인하세요!"
      );
    }

    // 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Pet API 함수들
export const petAPI = {
  // 반려동물 등록 (FormData 사용)
  register: async (formData: FormData): Promise<AxiosResponse<Pet>> => {
    return api.post<Pet>("/api/pets", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 반려동물 목록 조회
  getAll: async (): Promise<AxiosResponse<Pet[]>> => {
    return api.get<Pet[]>("/api/pets");
  },

  // 특정 반려동물 조회
  getById: async (petId: string | number): Promise<AxiosResponse<Pet>> => {
    const id = parseInt(String(petId));
    if (isNaN(id) || id <= 0) {
      throw new Error("유효하지 않은 반려동물 ID입니다.");
    }
    return api.get<Pet>(`/api/pets/${id}`);
  },

  // 반려동물 수정 (FormData 사용)
  update: async (
    petId: string | number,
    formData: FormData
  ): Promise<AxiosResponse<Pet>> => {
    const id = parseInt(String(petId));
    if (isNaN(id) || id <= 0) {
      throw new Error("유효하지 않은 반려동물 ID입니다.");
    }

    return api.put<Pet>(`/api/pets/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 반려동물 삭제
  delete: async (petId: string | number): Promise<AxiosResponse<void>> => {
    const id = parseInt(String(petId));
    if (isNaN(id) || id <= 0) {
      throw new Error("유효하지 않은 반려동물 ID입니다.");
    }

    return api.delete<void>(`/api/pets/${id}`);
  },

  // 반려동물 수 조회
  getCount: async (): Promise<AxiosResponse<PetCountResponse>> => {
    return api.get<PetCountResponse>("/api/pets/count/my-pets");
  },
};

// 토큰 관리 유틸리티
export const authUtils = {
  // 토큰 저장
  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  // 토큰 조회
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  // 토큰 삭제
  removeToken: (): void => {
    localStorage.removeItem("token");
  },

  // 로그인 상태 확인
  isLoggedIn: (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // 토큰 검증 (간단한 만료 시간 체크)
  isTokenValid: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const payload: TokenPayload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
      return false;
    }
  },
};

// 🔥 수정: 기념일 API들도 올바른 axios 인스턴스 사용
// 기념일 목록 가져오기
export const fetchAnniversaries = async (petId: number) => {
  const res = await api.get(`/api/anniversaries/pets/${petId}`);
  return res.data;
};

// 기념일 등록
export const createAnniversary = async (data: {
  pet_id: number;
  title: string;
  date: string;
  memo?: string;
  image?: string;
}) => {
  const res = await api.post(`/api/anniversaries`, data);
  return res.data;
};

// 기념일 삭제
export const deleteAnniversary = async (anniversaryId: number) => {
  await api.delete(`/api/anniversaries/${anniversaryId}`);
};

export default api;

// 타입 내보내기
export type { PetData, Pet, PetCountResponse, ApiError, TokenPayload };
