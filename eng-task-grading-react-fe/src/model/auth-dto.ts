import type { TeacherDto } from "./teacher-dto";

export interface AuthenticatedDto {
  teacher: TeacherDto;
  tokens: TokensDto;
}


export interface TokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserDto {
  id: number;
  email: string;
}
