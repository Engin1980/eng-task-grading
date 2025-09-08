import type { CourseDto } from "../model/course-dto";
import type { StudentViewTokenDto } from "../model/student-view-dto";
import type { StudentViewLoginDto } from "../model/student-view-dto";
import { apiHttp } from "./api-http";

export const studentViewService = {
  login: async (data: StudentViewLoginDto) => {
    await apiHttp.post('/v1/studentView/login', data);
    return Promise.resolve();
  },

  verify: async (token: string, durationSeconds: number) => {
    const request = {
      token: token,
      duration: durationSeconds
    };
    const { data } = await apiHttp.post<StudentViewTokenDto>('/v1/studentView/verify', request);
    return data;
  },

  getCourses: async (): Promise<CourseDto[]> => {
    const token = localStorage.getItem('studentViewAccessJWT');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const { data } = await apiHttp.get<CourseDto[]>('/v1/studentView/courses', { headers });
    return data;
  }
}