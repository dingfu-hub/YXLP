import { User, UserRole } from '../types'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    role: UserRole
    profile: {
      firstName: string
      lastName: string
      displayName?: string
      avatar?: string
      language: string
      country: string
    }
  }
  tokens: AuthTokens
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  firstName: string
  lastName: string
  username?: string
  phone?: string
  country: string
  language: string
  acceptTerms: boolean
  company?: {
    name: string
    registrationNumber?: string
    industry?: string
    website?: string
    description?: string
  }
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Token management
export const TOKEN_KEY = 'yxlp_access_token'
export const REFRESH_TOKEN_KEY = 'yxlp_refresh_token'
export const USER_KEY = 'yxlp_user'

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const getStoredUser = (): AuthResponse['user'] | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const setAuthData = (authResponse: AuthResponse): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(TOKEN_KEY, authResponse.tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.tokens.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user))
}

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch {
    return true
  }
}

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    const timeUntilExpiry = payload.exp - currentTime
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 300
  } catch {
    return true
  }
}

// Role-based access control
export const hasRole = (user: AuthResponse['user'] | null, roles: UserRole[]): boolean => {
  if (!user) return false
  return roles.includes(user.role)
}

export const isAdmin = (user: AuthResponse['user'] | null): boolean => {
  return hasRole(user, [UserRole.ADMIN])
}

export const isDistributor = (user: AuthResponse['user'] | null): boolean => {
  return hasRole(user, [UserRole.DISTRIBUTOR])
}

export const isCustomer = (user: AuthResponse['user'] | null): boolean => {
  return hasRole(user, [UserRole.CUSTOMER])
}

export const canAccessAdminPanel = (user: AuthResponse['user'] | null): boolean => {
  return hasRole(user, [UserRole.ADMIN])
}

export const canAccessDistributorFeatures = (user: AuthResponse['user'] | null): boolean => {
  return hasRole(user, [UserRole.ADMIN, UserRole.DISTRIBUTOR])
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  
  if (score < 3) return 'weak'
  if (score < 5) return 'medium'
  return 'strong'
}
