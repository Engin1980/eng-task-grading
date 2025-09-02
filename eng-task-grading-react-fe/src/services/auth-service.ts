import { apiHttp } from "./api-http";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiHttp.post<LoginResponse>("/login", payload);
  // uložení tokenu
  localStorage.setItem("token", data.token);

  return data;
}

export function logout() {
  localStorage.removeItem("token");
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