import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";

const logger = createLogger("AuthService");

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  logger.info("Pokus o přihlášení uživatele", { email: payload.email });
  
  const { data } = await apiHttp.post<LoginResponse>("/login", payload);
  
  // uložení tokenu
  localStorage.setItem("token", data.token);
  logger.info("Uživatel úspěšně přihlášen", { email: payload.email });

  return data;
}

export function logout() {
  logger.info("Uživatel se odhlašuje");
  localStorage.removeItem("token");
  logger.info("Uživatel úspěšně odhlášen");
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}