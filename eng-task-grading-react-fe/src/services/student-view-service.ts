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
      durationSeconds: durationSeconds
    };
    const { data } = await apiHttp.post<StudentViewTokenDto>('/v1/studentView/verify', request);
    return data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await apiHttp.post<string>('/v1/studentView/refresh', refreshToken);
    return data;
  },

  getCourses: async (): Promise<CourseDto[]> => {
    const makeRequest = async (accessToken: string) => {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const { data } = await apiHttp.get<CourseDto[]>('/v1/studentView/courses', { headers });
      return data;
    };

    try {
      const token = localStorage.getItem('studentViewAccessJWT');
      if (!token) {
        throw new Error('No access token found');
      }

      return await makeRequest(token);
    } catch (error: any) {
      // Check if it's a 401 error
      if (error?.response?.status === 401 || error?.status === 401) {
        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('studentViewRefreshJWT');
          if (!refreshToken) {
            throw new Error('No refresh token found');
          }

          const newAccessToken = await studentViewService.refresh(refreshToken);
          console.log("HERE new token data:", newAccessToken);

          // Save new access token
          localStorage.setItem('studentViewAccessJWT', newAccessToken);

          // Retry the original request with new token
          return await makeRequest(newAccessToken);
        } catch (refreshError) {
          // If refresh fails, clear tokens and rethrow original error
          //localStorage.removeItem('studentViewAccessJWT');
          //localStorage.removeItem('studentViewRefreshJWT');
          throw error;
        }
      }

      // If it's not a 401 error, just rethrow
      throw error;
    }
  }
}