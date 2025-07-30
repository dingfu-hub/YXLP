import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { testConfig } from '../config/test-config';

// 确保fetch在Node.js环境中可用
if (typeof global !== 'undefined' && !global.fetch) {
  global.fetch = require('node-fetch');
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
  headers: any;
  duration: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = testConfig.apiUrl) {
    this.client = axios.create({
      baseURL,
      timeout: testConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        config.metadata = { startTime: Date.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        response.duration = duration;
        return response;
      },
      (error) => {
        if (error.config) {
          const duration = Date.now() - error.config.metadata.startTime;
          error.duration = duration;
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request('GET', url, undefined, params);
  }

  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request('POST', url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request('PUT', url, data);
  }

  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request('DELETE', url);
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.request({
        method,
        url,
        data,
        params
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers,
        duration: response.duration || 0
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.message,
        status: axiosError.response?.status || 0,
        headers: axiosError.response?.headers || {},
        duration: axiosError.duration || 0
      };
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<ApiResponse<{ token: string }>> {
    const response = await this.post('/admin/auth/login', {
      username,
      password
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/admin/auth/logout');
    this.clearAuthToken();
    return response;
  }

  // User management methods
  async getUsers(params?: any): Promise<ApiResponse> {
    return this.get('/admin/users', params);
  }

  async createUser(userData: any): Promise<ApiResponse> {
    return this.post('/admin/users', userData);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.put(`/admin/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.delete(`/admin/users/${id}`);
  }

  // News management methods
  async getNews(params?: any): Promise<ApiResponse> {
    return this.get('/admin/news', params);
  }

  async createNews(newsData: any): Promise<ApiResponse> {
    return this.post('/admin/news', newsData);
  }

  async updateNews(id: string, newsData: any): Promise<ApiResponse> {
    return this.put(`/admin/news/${id}`, newsData);
  }

  async deleteNews(id: string): Promise<ApiResponse> {
    return this.delete(`/admin/news/${id}`);
  }

  // News sources methods
  async getNewsSources(params?: any): Promise<ApiResponse> {
    return this.get('/admin/news/sources', params);
  }

  async createNewsSource(sourceData: any): Promise<ApiResponse> {
    return this.post('/admin/news/sources', sourceData);
  }

  async updateNewsSource(id: string, sourceData: any): Promise<ApiResponse> {
    return this.put(`/admin/news/sources/${id}`, sourceData);
  }

  async deleteNewsSource(id: string): Promise<ApiResponse> {
    return this.delete(`/admin/news/sources/${id}`);
  }

  // Crawl jobs methods
  async getCrawlJobs(params?: any): Promise<ApiResponse> {
    return this.get('/admin/news/crawl/jobs', params);
  }

  async startCrawlJob(jobData: any): Promise<ApiResponse> {
    return this.post('/admin/news/crawl/jobs', jobData);
  }

  async cancelCrawlJob(id: string): Promise<ApiResponse> {
    return this.delete(`/admin/news/crawl/jobs/${id}`);
  }

  // AI processing methods
  async processWithAI(articleId: string, config?: any): Promise<ApiResponse> {
    return this.post('/admin/news/ai-process', { articleId, config });
  }

  async batchProcessWithAI(articleIds: string[], config?: any): Promise<ApiResponse> {
    return this.post('/admin/news/ai-process/batch', { articleIds, config });
  }

  async getAIConfigs(): Promise<ApiResponse> {
    return this.get('/admin/news/ai-configs');
  }

  // Publishing methods
  async publishNews(publishData: any): Promise<ApiResponse> {
    return this.post('/admin/news/publish', publishData);
  }

  async schedulePublish(scheduleData: any): Promise<ApiResponse> {
    return this.post('/admin/news/schedule', scheduleData);
  }

  async getPublishStats(params?: any): Promise<ApiResponse> {
    return this.get('/admin/news/publish/stats', params);
  }

  // Dashboard methods
  async getDashboardData(): Promise<ApiResponse> {
    return this.get('/admin/dashboard');
  }

  async getSystemStats(): Promise<ApiResponse> {
    return this.get('/admin/dashboard/stats');
  }

  // Settings methods
  async getSettings(): Promise<ApiResponse> {
    return this.get('/admin/settings');
  }

  async updateSettings(settings: any): Promise<ApiResponse> {
    return this.put('/admin/settings', settings);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health');
  }
}
