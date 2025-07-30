import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
  NewsArticle,
  User,
  Comment,
  RSSSource,
  AIPolishTask,
  AIPolishConfig,
  CrawlTask,
  ScheduleRule,
  Statistics,
  SystemSettings,
  SupportedLanguage
} from '../types';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并重定向到登录页
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 通用API方法
class ApiService {
  // 认证相关
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }

  // 新闻相关
  async getNews(params?: PaginationParams & SearchParams): Promise<ApiResponse<PaginatedResponse<NewsArticle>>> {
    const response = await apiClient.get('/admin/news', { params });
    return response.data;
  }

  async getNewsById(id: string): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.get(`/admin/news/${id}`);
    return response.data;
  }

  async createNews(news: Partial<NewsArticle>): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.post('/admin/news', news);
    return response.data;
  }

  async updateNews(id: string, news: Partial<NewsArticle>): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.put(`/admin/news/${id}`, news);
    return response.data;
  }

  async deleteNews(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/admin/news/${id}`);
    return response.data;
  }

  async publishNews(id: string): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.post(`/admin/news/${id}/publish`);
    return response.data;
  }

  async archiveNews(id: string): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.post(`/admin/news/${id}/archive`);
    return response.data;
  }

  // AI润色相关
  async polishNews(newsId: string, config: AIPolishConfig): Promise<ApiResponse<AIPolishTask>> {
    const response = await apiClient.post(`/admin/news/${newsId}/polish`, config);
    return response.data;
  }

  async getPolishTask(taskId: string): Promise<ApiResponse<AIPolishTask>> {
    const response = await apiClient.get(`/admin/news/polish/${taskId}`);
    return response.data;
  }

  async getPolishTasks(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<AIPolishTask>>> {
    const response = await apiClient.get('/admin/news/polish', { params });
    return response.data;
  }

  // 翻译相关
  async translateNews(newsId: string, targetLanguages: SupportedLanguage[]): Promise<ApiResponse<NewsArticle>> {
    const response = await apiClient.post(`/admin/news/${newsId}/translate`, { targetLanguages });
    return response.data;
  }

  // 新闻采集相关
  async startCrawl(config: CrawlTask['config']): Promise<ApiResponse<CrawlTask>> {
    const response = await apiClient.post('/admin/news/crawl', config);
    return response.data;
  }

  async getCrawlTask(taskId: string): Promise<ApiResponse<CrawlTask>> {
    const response = await apiClient.get(`/admin/news/crawl/${taskId}`);
    return response.data;
  }

  async getCrawlTasks(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<CrawlTask>>> {
    const response = await apiClient.get('/admin/news/crawl', { params });
    return response.data;
  }

  async cancelCrawlTask(taskId: string): Promise<ApiResponse> {
    const response = await apiClient.post(`/admin/news/crawl/${taskId}/cancel`);
    return response.data;
  }

  // RSS源管理
  async getRSSSources(params?: PaginationParams & { language?: SupportedLanguage; country?: string }): Promise<ApiResponse<PaginatedResponse<RSSSource>>> {
    const response = await apiClient.get('/admin/news/sources', { params });
    return response.data;
  }

  async getRSSSourceById(id: string): Promise<ApiResponse<RSSSource>> {
    const response = await apiClient.get(`/admin/news/sources/${id}`);
    return response.data;
  }

  async createRSSSource(source: Partial<RSSSource>): Promise<ApiResponse<RSSSource>> {
    const response = await apiClient.post('/admin/news/sources', source);
    return response.data;
  }

  async updateRSSSource(id: string, source: Partial<RSSSource>): Promise<ApiResponse<RSSSource>> {
    const response = await apiClient.put(`/admin/news/sources/${id}`, source);
    return response.data;
  }

  async deleteRSSSource(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/admin/news/sources/${id}`);
    return response.data;
  }

  async testRSSSource(url: string): Promise<ApiResponse<{ valid: boolean; title?: string; description?: string }>> {
    const response = await apiClient.post('/admin/news/sources/test', { url });
    return response.data;
  }

  // 定时任务管理
  async getScheduleRules(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<ScheduleRule>>> {
    const response = await apiClient.get('/admin/news/schedule', { params });
    return response.data;
  }

  async createScheduleRule(rule: Partial<ScheduleRule>): Promise<ApiResponse<ScheduleRule>> {
    const response = await apiClient.post('/admin/news/schedule', rule);
    return response.data;
  }

  async updateScheduleRule(id: string, rule: Partial<ScheduleRule>): Promise<ApiResponse<ScheduleRule>> {
    const response = await apiClient.put(`/admin/news/schedule/${id}`, rule);
    return response.data;
  }

  async deleteScheduleRule(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/admin/news/schedule/${id}`);
    return response.data;
  }

  async toggleScheduleRule(id: string): Promise<ApiResponse<ScheduleRule>> {
    const response = await apiClient.post(`/admin/news/schedule/${id}/toggle`);
    return response.data;
  }

  // 用户管理
  async getUsers(params?: PaginationParams & { role?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(user: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    const response = await apiClient.post('/admin/users', user);
    return response.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put(`/admin/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.post(`/admin/users/${id}/toggle`);
    return response.data;
  }

  // 评论管理
  async getComments(params?: PaginationParams & { newsId?: string; status?: string }): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    const response = await apiClient.get('/admin/comments', { params });
    return response.data;
  }

  async approveComment(id: string): Promise<ApiResponse<Comment>> {
    const response = await apiClient.post(`/admin/comments/${id}/approve`);
    return response.data;
  }

  async rejectComment(id: string): Promise<ApiResponse<Comment>> {
    const response = await apiClient.post(`/admin/comments/${id}/reject`);
    return response.data;
  }

  async deleteComment(id: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/admin/comments/${id}`);
    return response.data;
  }

  // 统计数据
  async getStatistics(): Promise<ApiResponse<Statistics>> {
    const response = await apiClient.get('/admin/statistics');
    return response.data;
  }

  // 系统设置
  async getSettings(): Promise<ApiResponse<SystemSettings>> {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<ApiResponse<SystemSettings>> {
    const response = await apiClient.put('/admin/settings', settings);
    return response.data;
  }

  // 文件上传
  async uploadFile(file: File, type: 'image' | 'document' = 'image'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// 导出单例实例
export const apiService = new ApiService();
export default apiService;
