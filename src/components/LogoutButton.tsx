// components/LogoutButton.tsx

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { clearUser } from "../stores/authSlice";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // 서버에 요청 보내 로그아웃 처리
      dispatch(clearUser()); // Redux 스토어에서 유저 정보 제거
      navigate("/login"); // 로그인 페이지로 이동
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      로그아웃
    </button>
  );
};

export default LogoutButton;
