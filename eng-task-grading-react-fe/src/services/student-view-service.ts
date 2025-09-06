import type { StudentViewLoginDto } from "../model/student-view-login-dto";
import { apiHttp } from "./api-http";

export const studentViewService = {
  login: async (data: StudentViewLoginDto) => {
    await apiHttp.post('/v1/studentView/login', data);
    return Promise.resolve();
  }
}