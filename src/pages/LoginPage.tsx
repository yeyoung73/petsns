import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "./LoginPage.module.css"; // 모듈 import

const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user_id", String(user.userId));
      localStorage.setItem("username", user.username);
      localStorage.setItem("is_admin", String(user.isAdmin));

      alert("로그인 성공!");
      navigate("/");
    } catch (error) {
      alert("로그인 실패");
      console.error("로그인 오류:", error);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post("/api/auth/register", { email, username, password });
      alert("회원가입 성공! 로그인 해주세요.");
      setMode("login");
    } catch (error) {
      alert("회원가입 실패");
      console.error("회원가입 오류:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {mode === "login" ? "로그인" : "회원가입"}
      </h2>

      <div className={styles.toggleButtons}>
        <button
          onClick={() => setMode("login")}
          disabled={mode === "login"}
          className={mode === "login" ? styles.active : ""}
        >
          로그인
        </button>
        <button
          onClick={() => setMode("register")}
          disabled={mode === "register"}
          className={mode === "register" ? styles.active : ""}
        >
          회원가입
        </button>
      </div>

      <div className={styles.form}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
        />

        {mode === "register" && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자 이름"
          />
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
        />

        <button
          onClick={mode === "login" ? handleLogin : handleRegister}
          className={styles.submitBtn}
        >
          {mode === "login" ? "로그인" : "회원가입"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
