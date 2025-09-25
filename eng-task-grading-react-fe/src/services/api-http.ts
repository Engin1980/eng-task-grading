import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import { createLogger } from "./log-service";

const logger = createLogger("ApiHttp");
const BASE_URL = "https://localhost:55556/api";

let getAccessToken: (() => string | null) = () => null;
let refreshHandler: (() => Promise<string | undefined>) = () => Promise.resolve(undefined);

export function setTokenProvider(provider: () => string | null) {
  getAccessToken = provider;
}

export function setRefreshHandler(handler: () => Promise<string | undefined>) {
  refreshHandler = handler;
}

// Vytvoříme axios instanci
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "", // změň podle svého backendu
  timeout: 5000,
  withCredentials: true, // pro zasílání cookies
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    let token = getAccessToken() || null;
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("### axiosInstance - adding accessToken:", token);
    }
    else
      console.log("### axiosInstance - no accessToken available");
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pro refresh tokenu při 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url: string = originalRequest.url || '';
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !url.endsWith('login') &&
      !url.endsWith('refresh') &&
      !url.endsWith('studentView/login') &&
      !url.endsWith('studentView/verify')
    ) {
      originalRequest._retry = true;
      try {
        const newAccessToken: string | undefined = await refreshHandler();
        console.log("### axiosInstance - refreshed token:", newAccessToken);
        if (newAccessToken) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
        else
          return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// HTTP Service s logováním
export const apiHttp = {
  BASE_URL: BASE_URL,

  async refreshToken(): Promise<string | null> {
    const refreshConfig = {
      headers: {
        "Content-Type": "application/json"
        // Nezadávej Authorization!
      }
    };

    try {
      const { data } = await axiosInstance.post<string>("/v1/auth/refresh", undefined, refreshConfig);
      return data;
    } catch (error) {
      logger.error("Chyba při obnově tokenu", { error });
      return null;
    }
  },

  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logger.debug(`GET ${url}`, { config });

    try {
      const response = await axiosInstance.get<T>(url, config);
      logger.debug(`GET ${url} - SUCCESS`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logger.error(`GET ${url} - ERROR`, { error, config });
      throw error;
    }
  },

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logger.debug(`POST ${url}`, { data, config });

    try {
      const response = await axiosInstance.post<T>(url, data, config);
      logger.debug(`POST ${url} - SUCCESS`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logger.error(`POST ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logger.debug(`PUT ${url}`, { data, config });

    try {
      const response = await axiosInstance.put<T>(url, data, config);
      logger.debug(`PUT ${url} - SUCCESS`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logger.error(`PUT ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logger.debug(`DELETE ${url}`, { config });

    try {
      const response = await axiosInstance.delete<T>(url, config);
      logger.debug(`DELETE ${url} - SUCCESS`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logger.error(`DELETE ${url} - ERROR`, { error, config });
      throw error;
    }
  },

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logger.debug(`PATCH ${url}`, { data, config });

    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      logger.debug(`PATCH ${url} - SUCCESS`, {
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logger.error(`PATCH ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  // Přístup k původní axios instanci pro pokročilé použití
  instance: axiosInstance,
};