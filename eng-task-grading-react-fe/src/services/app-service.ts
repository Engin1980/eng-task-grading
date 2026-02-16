import { apiHttp } from "./api-http";

export const appService = {
  getBackendVersion: async (): Promise<string> => {
    const { data } = await apiHttp.get<string>('/v1/app/version');
    return data;
  }
};