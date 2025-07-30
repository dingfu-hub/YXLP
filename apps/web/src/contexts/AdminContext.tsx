'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { AdminUser, Permission, AdminContextType } from '@/types/admin'

// 状态类型
interface AdminState {
  user: AdminUser | null
  permissions: Permission[]
  isLoading: boolean
  error: string | null
}

// 动作类型
type AdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AdminUser }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_USER' }
  | { type: 'CLEAR_ERROR' }

// 初始状态
const initialState: AdminState = {
  user: null,
  permissions: [],
  isLoading: true, // 改为true，在初始化期间显示加载状态，避免闪烁
  error: null
}

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      // 将字符串权限转换为Permission枚举
      const userPermissions = action.payload.permissions || []
      const convertedPermissions = Object.values(Permission).filter(permission =>
        userPermissions.includes(permission)
      )

      return {
        ...state,
        user: action.payload,
        permissions: convertedPermissions,
        isLoading: false,
        error: null
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_USER':
      return { ...state, user: null, permissions: [], isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

// Context
const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Provider 组件
export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const mountedRef = useRef(true)

  // 确保组件挂载时设置ref
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // 登录函数
  const login = async (username: string, password: string): Promise<void> => {
    try {
      safeDispatch({ type: 'SET_LOADING', payload: true })
      safeDispatch({ type: 'CLEAR_ERROR' })

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '登录失败')
      }

      if (mountedRef.current) {
        safeDispatch({ type: 'SET_USER', payload: result.data.user })
        safeDispatch({ type: 'SET_LOADING', payload: false }) // 确保清除loading状态
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      if (mountedRef.current) {
        safeDispatch({ type: 'SET_ERROR', payload: errorMessage })
        safeDispatch({ type: 'SET_LOADING', payload: false }) // 确保清除loading状态
      }
      throw error
    }
  }

  // 登出函数
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (mountedRef.current) {
        safeDispatch({ type: 'CLEAR_USER' })
        // 重定向到登录页面
        window.location.href = '/admin/login'
      }
    }
  }

  // 检查权限函数
  const checkPermission = (permission: Permission): boolean => {
    return state.permissions.includes(permission)
  }

  // 安全的dispatch函数
  const safeDispatch = useCallback((action: AdminAction) => {
    if (mountedRef.current) {
      dispatch(action)
    }
  }, [dispatch])

  // 刷新用户信息
  const refreshUser = useCallback(async (): Promise<void> => {
    console.log('🔄 refreshUser 开始执行')
    try {
      console.log('📡 设置加载状态为true')
      safeDispatch({ type: 'SET_LOADING', payload: true })

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      console.log('📡 发送请求到 /api/admin/auth/me')
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('📡 响应状态:', response.status, response.ok)

      if (!response.ok) {
        if (response.status === 401) {
          console.log('用户未登录，清除用户状态')
          safeDispatch({ type: 'CLEAR_USER' })
          safeDispatch({ type: 'SET_LOADING', payload: false })
          return
        }
        throw new Error(`获取用户信息失败: ${response.status}`)
      }

      const result = await response.json()
      console.log('获取用户信息成功:', result)

      // 用户信息API返回格式: { message: "...", data: userInfo }
      if (result.data && mountedRef.current) {
        safeDispatch({ type: 'SET_USER', payload: result.data })
        safeDispatch({ type: 'SET_LOADING', payload: false })
      } else {
        console.warn('用户信息格式异常:', result)
        safeDispatch({ type: 'CLEAR_USER' })
        safeDispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      if ((error as any)?.name === 'AbortError') {
        console.error('用户信息请求超时')
        safeDispatch({ type: 'SET_ERROR', payload: '请求超时，请刷新页面重试' })
      } else {
        safeDispatch({ type: 'CLEAR_USER' })
      }
      safeDispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [safeDispatch])

  // 初始化时检查用户登录状态
  useEffect(() => {
    refreshUser()
  }, [])

  const value: AdminContextType = {
    user: state.user,
    permissions: state.permissions,
    isLoading: state.isLoading,
    login,
    logout,
    checkPermission,
    refreshUser
  }

  console.log('🚀 AdminProvider 准备返回 JSX，state:', state)

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// Hook
export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// 权限检查 Hook
export function usePermission(permission: Permission) {
  const { checkPermission } = useAdmin()
  return checkPermission(permission)
}

// 多权限检查 Hook
export function usePermissions(permissions: Permission[], requireAll = false) {
  const { permissions: userPermissions } = useAdmin()
  
  if (requireAll) {
    return permissions.every(permission => userPermissions.includes(permission))
  } else {
    return permissions.some(permission => userPermissions.includes(permission))
  }
}

// 角色检查 Hook
export function useRole(roles: string | string[]) {
  const { user } = useAdmin()
  
  if (!user) return false
  
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return roleArray.includes(user.role)
}
