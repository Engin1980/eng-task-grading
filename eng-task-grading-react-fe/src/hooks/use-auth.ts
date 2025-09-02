// src/hooks/useAuth.ts
import { useState } from "react";
import { login, logout } from "../services/auth-service";
import { type User } from "../services/auth-service";
import { useLogger } from "./use-logger";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const logger = useLogger("useAuth");

  const handleLogin = async (email: string, password: string) => {
    try {
      logger.info("Začíná proces přihlášení");
      const result = await login({ email, password });
      setUser(result.user);
      logger.info("Přihlášení dokončeno v hooku");
    } catch (error) {
      logger.error("Chyba při přihlášení v hooku", { error });
      throw error;
    }
  };

  const handleLogout = () => {
    logger.info("Začíná proces odhlášení");
    logout();
    setUser(null);
    logger.info("Odhlášení dokončeno v hooku");
  };

  return { user, handleLogin, handleLogout };
}