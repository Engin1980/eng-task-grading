import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import { logService } from "./log-service";

// Vytvoříme axios instanci
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "", // změň podle svého backendu
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// HTTP Service s logováním
export const apiHttp = {
  BASE_URL: "https://localhost:55556/api",
  /**
   * GET request
   */
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logService.debug(`ApiHttp: GET ${url}`, { config });
    
    try {
      const response = await axiosInstance.get<T>(url, config);
      logService.debug(`ApiHttp: GET ${url} - SUCCESS`, { 
        status: response.status, 
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logService.error(`ApiHttp: GET ${url} - ERROR`, { error, config });
      throw error;
    }
  },

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logService.debug(`ApiHttp: POST ${url}`, { data, config });
    
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      logService.debug(`ApiHttp: POST ${url} - SUCCESS`, { 
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logService.error(`ApiHttp: POST ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logService.debug(`ApiHttp: PUT ${url}`, { data, config });
    
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      logService.debug(`ApiHttp: PUT ${url} - SUCCESS`, { 
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logService.error(`ApiHttp: PUT ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logService.debug(`ApiHttp: DELETE ${url}`, { config });
    
    try {
      const response = await axiosInstance.delete<T>(url, config);
      logService.debug(`ApiHttp: DELETE ${url} - SUCCESS`, { 
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logService.error(`ApiHttp: DELETE ${url} - ERROR`, { error, config });
      throw error;
    }
  },

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    url = `${apiHttp.BASE_URL}${url}`;
    logService.debug(`ApiHttp: PATCH ${url}`, { data, config });
    
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      logService.debug(`ApiHttp: PATCH ${url} - SUCCESS`, { 
        status: response.status,
        dataLength: Array.isArray(response.data) ? response.data.length : 'single object'
      });
      return response;
    } catch (error) {
      logService.error(`ApiHttp: PATCH ${url} - ERROR`, { error, data, config });
      throw error;
    }
  },

  // Přístup k původní axios instanci pro pokročilé použití
  instance: axiosInstance,
};