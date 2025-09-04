import type { AppLogDto } from "../model/applog-dto";
import { apiHttp } from "./api-http";

export const appLogService = {
  getAll: async (): Promise<AppLogDto[]> => {
    const { data } = await apiHttp.get<AppLogDto[]>('/v1/appLog');
    return data;
  }
};