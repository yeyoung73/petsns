import axios from "axios";

// src/services/api.ts
export const logout = () =>
  axios.create({
    baseURL: "http://localhost:3000/api", // 백엔드 주소
    withCredentials: true,
  });

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("accessToken");
};
