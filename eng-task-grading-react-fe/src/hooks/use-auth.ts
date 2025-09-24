// src/hooks/useAuth.ts
import { useState } from "react";
import { login, logout } from "../services/auth-service";
import { useLogger } from "./use-logger";
import type { UserDto } from "../model/auth-dto";

export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null);
  const logger = useLogger("useAuth");

  const handleLogin = async (email: string, password: string) => {
    try {
      logger.info("Začíná proces přihlášení");
      const result = await login({ email, password });
      setUser(result.teacher);
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