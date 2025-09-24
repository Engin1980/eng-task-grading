import type { AuthenticatedDto } from "../model/auth-dto";
import type { TeacherLoginDto } from "../model/teacher-dto";
import { apiHttp } from "./api-http";
import { createLogger } from "./log-service";

const logger = createLogger("AuthService");

export async function login(loginData: TeacherLoginDto): Promise<AuthenticatedDto> {
  logger.info("Pokus o přihlášení uživatele", { email: loginData.email });

  const { data } = await apiHttp.post<AuthenticatedDto>("/v1/auth/login", loginData);

  // uložení tokenu
  localStorage.setItem("accessToken", data.tokens.accessToken);
  localStorage.setItem("refreshToken", data.tokens.refreshToken);
  logger.info("Uživatel úspěšně přihlášen", { email: loginData.email });
  logger.info("Access:");
  console.log(data.tokens.accessToken);

  return data;
}

export function logout() {
  logger.info("Uživatel se odhlašuje");
  localStorage.removeItem("token");
  logger.info("Uživatel úspěšně odhlášen");
}