import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import { createLogger } from "./log-service";
import AppSettings from "../config/app-settings";
import { useToast } from "../hooks/use-toast";
import { router } from "./router";

const logger = createLogger("ApiHttp");
const BASE_URL = AppSettings.backendUrl; //backendUrl; "https://localhost:55556/api";
const tst = useToast();

let getAccessToken: (() => string | null) = () => null;
let refreshHandler: (() => Promise<string | undefined>) = () => Promise.resolve(undefined);

export function setTokenProvider(provider: () => string | null) {
  getAccessToken = provider;
}

export function setRefreshHandler(handler: () => Promise<string | undefined>) {
  refreshHandler = handler;
}

function tryUnwrapAxiosError(error: any): any {
  if (axios.isAxiosError(error))
    return error.response?.data || error.message;
  else
    return error;
}

function getLoginPageFromUrl(url: string): string {
  if (url.endsWith("/student/verify")
    || url.includes("/studentView"))
    return "/studentView/login";
  else
    return "/login";
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
      logger.debug("interceptors.request - adding accessToken:", token);
    }
    else
      logger.debug("interceptors.request - no accessToken available");
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
      !url.endsWith('student/login') &&
      !url.endsWith('student/verify')
    ) {
      originalRequest._retry = true;

      let newAccessToken: string | undefined = undefined;
      try {
        newAccessToken = await refreshHandler();
        logger.debug("interceptors.response - refreshed token:", newAccessToken);
      } catch (error) {
        newAccessToken = undefined;
        logger.debug("interceptors.response - token refresh failed:", error);
      }

      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } else {
        // refresh did not return a token -> redirect to login with nextPage
        tst.error(tst.ERR.LOGIN_EXPIRED); //TODO this probably should not be here, causing two error toasts
        if (typeof window !== 'undefined') {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          const loginUrl = getLoginPageFromUrl(url);
          router.navigate({ to: `${loginUrl}?nextPage=${next}` });
        }
        const unwrappedError = tryUnwrapAxiosError(error);
        return Promise.reject(unwrappedError);
      }
    }
    logger.debug("interceptors.response - non-401 error or retry already attempted");
    const unwrappedError = tryUnwrapAxiosError(error);
    return Promise.reject(unwrappedError);
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
      const uwError = tryUnwrapAxiosError(error);
      return uwError;
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
      const uwError = tryUnwrapAxiosError(error);
      throw uwError;
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
      const uwError = tryUnwrapAxiosError(error);
      throw uwError;
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
      const uwError = tryUnwrapAxiosError(error);
      throw uwError;
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
      const uwError = tryUnwrapAxiosError(error);
      throw uwError;
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
      const uwError = tryUnwrapAxiosError(error);
      throw uwError;
    }
  },

  // Přístup k původní axios instanci pro pokročilé použití
  instance: axiosInstance,
};