import type { TeacherRegisterDto } from "../model/teacher-dto";
import { apiHttp } from "./api-http";

export const teacherService = {
  register: async (data: TeacherRegisterDto) => {
    await apiHttp.post('/v1/teacher', data);
  }
};