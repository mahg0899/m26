"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// Siempre usar el proxy interno de Next.js para evitar CORS / Private Network Access.
// Next.js redirige /api/pb/* → PocketBase server-to-server (ver next.config.ts).
const PB_URL = "/api/pb";
const STORAGE_KEY = "m26:admin:token";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load token from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setToken(stored);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist token changes
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (token) {
        sessionStorage.setItem(STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [token, hydrated]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");
    const data = await res.json();
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  // Don't render children until hydrated to avoid flash
  if (!hydrated) return null;

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
