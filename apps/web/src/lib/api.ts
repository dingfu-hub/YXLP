import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { 
  getStoredToken, 
  getStoredRefreshToken, 
  setAuthData, 
  clearAuthData, 
  isTokenExpired,
  shouldRefreshToken,
  AuthResponse 
} from './auth'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = getStoredRefreshToken()
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const authData: AuthResponse = response.data
          setAuthData(authData)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${authData.tokens.accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear auth data and redirect to login
          clearAuthData()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      } else {
        // No valid refresh token, clear auth data and redirect to login
        clearAuthData()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// API response wrapper
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: any
}

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete(url, config),
}

// Auth API methods
export const authApi = {
  login: async (credentials: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResponse> => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials)
    return response.data.data
  },
  
  register: async (userData: any): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData)
    return response.data
  },
  
  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken })
  },
  
  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all')
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },
  
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },
  
  resetPassword: async (data: { token: string; password: string; confirmPassword: string }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', data)
  },
  
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token })
  },
  
  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email })
  },
  
  getProfile: async (): Promise<any> => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me')
    return response.data.data
  },
  
  checkAuth: async (): Promise<{ authenticated: boolean; user: any }> => {
    const response = await apiClient.get<{ success: boolean; data: any }>('/auth/me')
    return { authenticated: true, user: response.data.data }
  },
}

// Products API methods
export const productsApi = {
  getProducts: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },
  
  getProduct: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },
  
  searchProducts: async (query: string, filters?: any): Promise<any> => {
    const response = await apiClient.get('/products/search', { 
      params: { q: query, ...filters } 
    })
    return response.data
  },
}

// Categories API methods
export const categoriesApi = {
  getCategories: async (): Promise<any> => {
    const response = await apiClient.get('/categories')
    return response.data
  },
  
  getCategory: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },
}

// Orders API methods
export const ordersApi = {
  getOrders: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/orders', { params })
    return response.data
  },
  
  getOrder: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },
  
  createOrder: async (orderData: any): Promise<any> => {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },
  
  updateOrder: async (id: string, updateData: any): Promise<any> => {
    const response = await apiClient.patch(`/orders/${id}`, updateData)
    return response.data
  },
}

// Cart API methods
export const cartApi = {
  getCart: async (): Promise<any> => {
    const response = await apiClient.get('/cart')
    return response.data
  },
  
  addToCart: async (productId: string, quantity: number, variantId?: string): Promise<any> => {
    const response = await apiClient.post('/cart/add', { productId, quantity, variantId })
    return response.data
  },
  
  updateCartItem: async (itemId: string, quantity: number): Promise<any> => {
    const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity })
    return response.data
  },
  
  removeFromCart: async (itemId: string): Promise<any> => {
    const response = await apiClient.delete(`/cart/items/${itemId}`)
    return response.data
  },
  
  clearCart: async (): Promise<any> => {
    const response = await apiClient.delete('/cart')
    return response.data
  },
}

export default api
