// 프론트엔드에서 토큰 디코딩해서 확인
const checkTokenExpiration = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
    console.log("현재 시간:", new Date());
    console.log("토큰 만료됨:", payload.exp < now);

    if (payload.exp < now) {
      console.log("토큰이 만료되었습니다. 다시 로그인하세요.");
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
  }
};

// 페이지 로드 시 확인
checkTokenExpiration();
