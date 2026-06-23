import axios from "axios";
import { clearAuthStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      clearAuthStorage();

      if (!window.location.pathname.startsWith("/login")) {
        const redirect = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`
        );

        window.location.assign(`/login?redirect=${redirect}`);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
