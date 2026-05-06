"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  apiError,
  clearToken,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from "./api";
import type { AuthResponse, User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser<User>();
    const token = getToken();
    if (stored && token) setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>("/users/login", {
        email,
        password,
      });
      setToken(data.token);
      setStoredUser(data.user);
      setUser(data.user);
      return data.user;
    } catch (err) {
      throw new Error(apiError(err));
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await api.post("/users/register", { name, email, password });
      } catch (err) {
        throw new Error(apiError(err));
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
