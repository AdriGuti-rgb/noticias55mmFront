import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { adminApi, AdminUser, getAdminToken, setAdminToken } from "@/config/admin-api";

type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthValue {
  status: AdminAuthStatus;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!getAdminToken()) {
      setStatus("unauthenticated");
      return;
    }

    adminApi
      .get<AdminUser>("/admin/auth/me")
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        setAdminToken(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await adminApi.post<{ accessToken: string }>("/admin/auth/login", {
      email,
      password,
    });
    setAdminToken(accessToken);

    const me = await adminApi.get<AdminUser>("/admin/auth/me");
    setUser(me);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth debe usarse dentro de <AdminAuthProvider>");
  }
  return ctx;
}
