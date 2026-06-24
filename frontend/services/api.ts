import axios from "axios";
import { clearAuthStorage } from "@/lib/auth-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const CSRF_EXEMPT_PATHS = [
  "/auth/login",
  "/auth/register/cliente",
  "/auth/register/professor",
  "/auth/register/academia",
  "/auth/logout",
];

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const url = config.url ?? "";

  const isMutating = ["post", "put", "patch", "delete"].includes(method ?? "");
  const isExempt = CSRF_EXEMPT_PATHS.some((path) => url.startsWith(path));

  if (typeof window !== "undefined" && isMutating && !isExempt) {
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true,
    });

    const csrfToken = response.data?.csrfToken;

    if (csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }

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