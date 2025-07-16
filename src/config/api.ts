const getApiBaseUrl = (): string => {
  // 🔥 임시 하드코딩 - 모든 환경에서 Railway URL 사용
  return "https://petsns-production.up.railway.app";

  // 환경변수 방식 (나중에 사용)
  // return import.meta.env.VITE_API_URL || "https://petsns-production.up.railway.app";
};

export const API_BASE_URL = getApiBaseUrl();

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/default-profile.png";
  const normalized = path.replace(/\\/g, "/").replace(/^\/?uploads\/+/, ""); // 맨 앞 uploads/ 제거
  return `https://petsns-production.up.railway.app/uploads/${normalized}`;
}
