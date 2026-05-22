// packages/core/src/services/api.ts

import axios, { AxiosInstance, AxiosResponse } from 'axios';
export type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, { params });
    return response.data.data;
  }

  async post<T>(url: string, body?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, body);
    return response.data.data;
  }

  async put<T>(url: string, body?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, body);
    return response.data.data;
  }

  async delete<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, { params });
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
