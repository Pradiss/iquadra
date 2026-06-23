import axios from "axios";
import { clearAuthStorage } from "@/lib/auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined" && isMutatingMethod(config.method)) {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/csrf-token`,
      { withCredentials: true }
    );

    const csrfToken = response.data?.csrfToken;

    if (csrfToken) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["X-CSRF-Token"] = csrfToken;
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

function isMutatingMethod(method?: string) {
  return ["post", "put", "patch", "delete"].includes(
    method?.toLowerCase() ?? ""
  );
}

