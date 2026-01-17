import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import { setTokenProvider, setRefreshHandler, apiHttp } from '../services/api-http';
import { createLogger } from '../services/log-service';
import { studentViewService } from '../services/student-view-service';
import { jwtDecode } from 'jwt-decode';
import type { TeacherLoginDto } from '../model/teacher-dto';
import type { LoggedUserDto } from '../model/auth-dto';

let accessToken: string | null = null; // Globální proměnná

interface AuthContextType {
  loggedUser: LoggedUserDto | null;
  loginStudent: (token: string, duration: number) => Promise<void>;
  loginTeacher: (data: TeacherLoginDto) => Promise<void>;
  logout: () => Promise<void>;
  requestTeacherPasswordReset: (email: string) => Promise<void>;
  setNewTeacherPassword: (token: string, email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUserDto | null>(null);
  const logger = createLogger("AuthProvider");

  useEffect(() => {
    setTokenProvider(() => accessToken);
    setRefreshHandler(refresh);
  }, []);

  const setNewTeacherPassword = async (token: string, email: string, newPassword: string): Promise<void> => {
    logger.info("Pokus o nastavení nového hesla učitele", { email });
    await apiHttp.post("/v1/auth/teacher/set-new-teacher-password", { token, email, password: newPassword });
    logger.info("Nové heslo učitele úspěšně nastaveno", { email });
  };

  const requestTeacherPasswordReset = async (email: string): Promise<void> => {
    logger.info("Pokus o odeslání požadavku na reset hesla učitele", { email });
    await apiHttp.post("/v1/auth/teacher/request-password-reset", email);
    logger.info("Požadavek na reset hesla učitele úspěšně odeslán", { email });
  };

  const setLoggedUserByToken = (token: string | null) => {
    if (token) {
      const decoded: { sub?: string, role?: string } = jwtDecode(token);
      const newLoggedUser: LoggedUserDto = {
        email: decoded.sub ?? "(email-not-decoded-from-jwt)",
        role: decoded.role ?? "(role-not-decoded-from-jwt)"
      };
      setLoggedUser(newLoggedUser);
    }
  };

  const setAccessToken = (token: string | null) => {
    accessToken = token;
  };

  const loginStudent = async (token: string, duration: number): Promise<void> => {
    logger.info("Pokus o přihlášení studenta", { token });
    try {
      const result = await studentViewService.verify(token, duration);
      setAccessToken(result.accessToken);
      setLoggedUserByToken(result.accessToken);
      logger.info("Student úspěšně přihlášen", { token });
    } catch (error) {
      logger.error("Chyba při přihlašování studenta", { error });
      throw error;
    }
  };

  const loginTeacher = async (loginData: TeacherLoginDto): Promise<void> => {
    logger.info("Pokus o přihlášení uživatele", { email: loginData.email });
    const { data } = await apiHttp.post<string>("/v1/auth/teacher/login", loginData);
    setAccessToken(data);
    setLoggedUserByToken(data);
    logger.info("Uživatel úspěšně přihlášen", { email: loginData.email });
  }

  const refresh = async (): Promise<string | undefined> => {
    logger.info("Zpracovávám žádost o obnovení access tokenu.");
    try {
      const { data } = await apiHttp.post<string>("/v1/auth/refresh");
      setAccessToken(data);
      setLoggedUserByToken(data);
      logger.info("Token úspěšně obnoven za " + data);
      return data;
    } catch (error) {
      logger.error("Chyba při obnově tokenu", { error });
      return undefined;
    }
  }

  const logout = async (): Promise<void> => {
    logger.info("Uživatel se odhlašuje");
    setAccessToken(null);
    setLoggedUser(null);
    try {
      await apiHttp.post("/v1/auth/logout");
    } catch (error) {
      logger.error("Chyba při odhlašování", { error });
    }
  }

  return (
    <AuthContext.Provider value={{ loggedUser, loginTeacher, loginStudent, logout, requestTeacherPasswordReset, setNewTeacherPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};