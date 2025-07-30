import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  setAuthData, 
  clearAuthData, 
  getStoredUser,
  getStoredToken
} from '@/lib/auth'
import { authApi } from '@/lib/api'
import { UserRole } from '../types'

interface AuthState {
  // State
  user: AuthResponse['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  
  // Getters
  isAdmin: () => boolean
  isDistributor: () => boolean
  isCustomer: () => boolean
  canAccessAdminPanel: () => boolean
  canAccessDistributorFeatures: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const authResponse = await authApi.login(credentials)
          setAuthData(authResponse)
          
          set({
            user: authResponse.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const authResponse = await authApi.register(userData)
          setAuthData(authResponse)
          
          set({
            user: authResponse.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authApi.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error)
        } finally {
          clearAuthData()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      logoutAll: async () => {
        set({ isLoading: true })
        
        try {
          await authApi.logoutAll()
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout all API call failed:', error)
        } finally {
          clearAuthData()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      forgotPassword: async (data: ForgotPasswordData) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.forgotPassword(data.email)
          set({ isLoading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to send reset email'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.resetPassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to reset password'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.changePassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to change password'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.verifyEmail(token)
          set({ isLoading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Email verification failed'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authApi.resendVerification(email)
          set({ isLoading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to resend verification'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      checkAuth: async () => {
        const token = getStoredToken()
        const storedUser = getStoredUser()
        
        if (!token || !storedUser) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return
        }
        
        set({ isLoading: true })
        
        try {
          const response = await authApi.checkAuth()
          
          if (response.authenticated) {
            set({
              user: storedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            clearAuthData()
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          clearAuthData()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      // Getters
      isAdmin: () => {
        const { user } = get()
        return user?.role === UserRole.ADMIN
      },

      isDistributor: () => {
        const { user } = get()
        return user?.role === UserRole.DISTRIBUTOR
      },

      isCustomer: () => {
        const { user } = get()
        return user?.role === UserRole.CUSTOMER
      },

      canAccessAdminPanel: () => {
        const { user } = get()
        return user?.role === UserRole.ADMIN
      },

      canAccessDistributorFeatures: () => {
        const { user } = get()
        return user?.role === UserRole.ADMIN || user?.role === UserRole.DISTRIBUTOR
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
