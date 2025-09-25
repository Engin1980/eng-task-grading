export interface TeacherRegisterDto {
  email: string;
  password: string;
}

export interface TeacherLoginDto {
  email: string;
  password: string;
  rememberMe: boolean;
captchaToken?: string;
}

export interface TeacherDto {
  id: number;
  email: string;
}