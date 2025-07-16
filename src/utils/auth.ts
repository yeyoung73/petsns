import axios from "axios";

// src/services/api.ts
export const logout = () =>
  axios.create({
    baseURL: " https://petsns-production.up.railway.app/api", // 백엔드 주소
    withCredentials: true,
  });

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem("accessToken");
};
