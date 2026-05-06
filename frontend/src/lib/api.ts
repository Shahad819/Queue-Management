import axios, { AxiosError } from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

const TOKEN_KEY = "qm_token";
const USER_KEY = "qm_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setStoredUser(user: unknown) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t && config.headers) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

const AUTH_FAIL_MESSAGES = [
  "not authorized, token failed",
  "not authorized, no token provided",
  "you have been blacklisted",
];

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (typeof window !== "undefined") {
      const status = err.response?.status;
      const data = err.response?.data as { message?: string } | undefined;
      const msg = (data?.message || "").toLowerCase();
      const isBlacklist = status === 403 && msg.includes("blacklist");
      const isAuthFailure =
        status === 401 ||
        (status === 403 && AUTH_FAIL_MESSAGES.some((m) => msg.includes(m)));
      if (isAuthFailure && getToken()) {
        clearToken();
        const here = window.location.pathname;
        if (here !== "/login" && here !== "/register") {
          const reason = isBlacklist ? "blacklisted" : "session";
          window.location.replace(
            `/login?next=${encodeURIComponent(here)}&reason=${reason}`
          );
        }
      }
    }
    return Promise.reject(err);
  }
);

export function apiError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
