const getApiBaseUrl = (): string => {
  // 개발 환경에서는 localhost 사용
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:3000";
  }

  // 운영 환경에서는 현재 도메인 사용
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // 기본값
  return "http://localhost:3000";
};

export const API_BASE_URL = getApiBaseUrl();

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "/default-profile.png";
  const normalized = path.replace(/\\/g, "/").replace(/^\/?uploads\/+/, ""); // 맨 앞 uploads/ 제거
  return `http://localhost:3000/uploads/${normalized}`;
}
