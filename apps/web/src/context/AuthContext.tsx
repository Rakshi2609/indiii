"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserRole = "OWNER" | "REVENUE_OFFICER" | "ADMIN" | "LAND_OFFICER" | "VIEWER";

export interface UserSession {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_superuser: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: (role: "OWNER" | "REVENUE_OFFICER" | "ADMIN") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => ({ success: false }),
  demoLogin: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore session from localStorage
    try {
      const savedToken = localStorage.getItem("land_ai_token");
      const savedUser = localStorage.getItem("land_ai_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Default to Demo Owner if first visit
        const defaultOwner: UserSession = {
          id: 1,
          email: "nishu@demo.landai",
          full_name: "Nishu Kumar",
          role: "OWNER",
          is_superuser: false
        };
        setUser(defaultOwner);
      }
    } catch (e) {
      console.warn("Error restoring session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const userObj: UserSession = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name || data.user.email,
        role: data.user.role as UserRole,
        is_superuser: data.user.is_superuser || false,
      };

      setToken(data.access_token);
      setUser(userObj);
      localStorage.setItem("land_ai_token", data.access_token);
      localStorage.setItem("land_ai_user", JSON.stringify(userObj));

      // Role-based routing
      if (userObj.role === "OWNER") {
        router.push("/owner");
      } else {
        router.push("/dashboard");
      }
      return true;
    } catch (e) {
      console.error("Login failed:", e);
      return false;
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
          role: "OWNER"
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || "Registration failed. An account with this email may already exist."
        };
      }

      const data = await res.json();
      const userObj: UserSession = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name || data.user.email,
        role: data.user.role as UserRole,
        is_superuser: data.user.is_superuser || false,
      };

      setToken(data.access_token);
      setUser(userObj);
      localStorage.setItem("land_ai_token", data.access_token);
      localStorage.setItem("land_ai_user", JSON.stringify(userObj));

      router.push("/owner");
      return { success: true };
    } catch (e: any) {
      console.error("Signup failed:", e);
      return { success: false, error: e.message || "Network error. Please try again." };
    }
  };

  const demoLogin = async (role: "OWNER" | "REVENUE_OFFICER" | "ADMIN") => {
    let email = "nishu@demo.landai";
    if (role === "REVENUE_OFFICER") email = "officer@demo.landai";
    if (role === "ADMIN") email = "admin@demo.landai";

    await login(email, "LandAI@123");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("land_ai_token");
    localStorage.removeItem("land_ai_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
