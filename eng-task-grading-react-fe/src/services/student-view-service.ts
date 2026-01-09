import type { CourseDto } from "../model/course-dto";
import type { StudentTokenInfoDto, StudentViewCourseDto, StudentViewTokenDto } from "../model/student-view-dto";
import type { StudentViewLoginDto } from "../model/student-view-dto";
import { apiHttp } from "./api-http";

export const studentViewService = {
  login: async (data: StudentViewLoginDto) => {
    await apiHttp.post('/v1/auth/student/login', data);
    return Promise.resolve();
  },

  verify: async (token: string, durationSeconds: number) => {
    const request = {
      token: token,
      durationSeconds: durationSeconds
    };
    const { data } = await apiHttp.post<StudentViewTokenDto>('/v1/auth/student/verify', request);
    return data;
  },

  forget: async (refreshToken: string) => {
    await apiHttp.post('/v1/studentView/forget', refreshToken);
    return Promise.resolve();
  },

  getCourse: async (courseId: number): Promise<StudentViewCourseDto> => {
    const { data } = await apiHttp.get<StudentViewCourseDto>(`/v1/studentView/courses/${courseId}`);
    return data;
  },

  getCourses: async (): Promise<CourseDto[]> => {
    const { data } = await apiHttp.get<CourseDto[]>('/v1/studentView/courses');
    return data;
  },

  getActiveTokens: async (): Promise<StudentTokenInfoDto[]> => {
    const { data } = await apiHttp.get<StudentTokenInfoDto[]>('/v1/studentView/tokens');
    return data;
  },

  deleteTokens: async (): Promise<void> => {
    await apiHttp.delete('/v1/studentView/tokens');
    return Promise.resolve();
  }
}