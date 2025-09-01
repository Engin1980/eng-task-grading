// src/hooks/useAuth.ts
import { useState } from "react";
import { login, logout } from "../services/auth-service";
import { type User } from "../services/auth-service";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });
    setUser(result.user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return { user, handleLogin, handleLogout };
}