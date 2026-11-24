import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = String(error.response?.data?.message || "");

    if (
      status === 401 &&
      /not authorized|token failed|no token|user not found/i.test(message)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/forgot-password" &&
        !window.location.pathname.startsWith("/reset-password/")
      ) {
        window.location.replace("/login?session=expired");
      }
    }

    return Promise.reject(error);
  }
);
