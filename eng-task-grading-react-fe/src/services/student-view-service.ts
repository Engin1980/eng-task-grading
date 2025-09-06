import type { StudentViewLoginDto } from "../model/student-view-login-dto";
import { apiHttp } from "./api-http";

export const studentViewService = {
  login: async (data: StudentViewLoginDto) => {
    await apiHttp.post('/student-view/login', data);
    return Promise.resolve();
  }
}