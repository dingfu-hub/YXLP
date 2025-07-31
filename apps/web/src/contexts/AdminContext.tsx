'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { AdminUser, Permission, AdminContextType } from '@/types/admin'

// 初始状态 - 简化状态管理，避免复杂的reducer
const initialState = {
  user: null as AdminUser | null,
  permissions: [] as Permission[],
  isLoading: true,
  error: null as string | null
}

// Context
const AdminContext = createContext<AdminContextType | undefined>(undefined)

// Provider 组件 - 重构为简单的useState管理
export function AdminProvider({ children }: { children: React.ReactNode }) {
  // 使用简单的useState替代复杂的useReducer，避免循环依赖
  const [user, setUser] = useState<AdminUser | null>(initialState.user)
  const [permissions, setPermissions] = useState<Permission[]>(initialState.permissions)
  const [isLoading, setIsLoading] = useState<boolean>(initialState.isLoading)
  const [error, setError] = useState<string | null>(initialState.error)

  // 组件挂载状态管理
  const mountedRef = useRef(true)
  const initializingRef = useRef(false) // 防止重复初始化

  console.log('🔥 AdminProvider 重新渲染')
  console.log('🔥 当前状态:', { user: !!user, permissions: permissions.length, isLoading, error })
  console.log('🔥 initializingRef.current:', initializingRef.current)
  console.log('🔥 mountedRef.current:', mountedRef.current)

  // 检查是否需要初始化（仅用于调试）
  if (!initializingRef.current && isLoading && !user) {
    console.log('🔥 检测到需要初始化状态')
  }

  // 组件挂载/卸载管理
  useEffect(() => {
    console.log('🔥 组件挂载useEffect执行')
    mountedRef.current = true

    // 在这里直接调用初始化
    if (!initializingRef.current) {
      console.log('🔥 在挂载useEffect中开始初始化')
      initializingRef.current = true

      const initializeUser = async () => {
        console.log('🔥 开始初始化用户状态')

        try {
          setIsLoading(true)
          setError(null)

          const response = await fetch('/api/admin/auth/me', {
            method: 'GET',
            credentials: 'include'
          })

          console.log('🔥 初始化API响应状态:', response.status)

          if (!response.ok) {
            if (response.status === 401) {
              console.log('🔥 用户未登录，清除状态')
              clearUserData()
              return
            }
            throw new Error(`获取用户信息失败: ${response.status}`)
          }

          const result = await response.json()
          console.log('🔥 初始化API响应结果:', result)

          if (result.data && mountedRef.current) {
            console.log('🔥 设置用户数据:', result.data)
            setUserData(result.data)
          } else {
            console.log('🔥 清除用户数据，原因:', !result.data ? '无数据' : '组件未挂载')
            clearUserData()
          }
        } catch (error) {
          console.error('🔥 初始化用户错误:', error)
          if (mountedRef.current) {
            setError('初始化失败')
            setIsLoading(false)
          }
        } finally {
          initializingRef.current = false
        }
      }

      initializeUser()
    }

    return () => {
      console.log('🔥 组件卸载useEffect执行')
      mountedRef.current = false
    }
  }, [])

  // 权限转换辅助函数 - 提取为独立函数，避免重复逻辑
  const convertPermissions = (userPermissions: string[] = []): Permission[] => {
    return Object.values(Permission).filter(permission =>
      userPermissions.includes(permission)
    )
  }

  // 设置用户数据的统一函数 - 避免重复的状态设置逻辑
  const setUserData = (userData: AdminUser) => {
    if (!mountedRef.current) return

    console.log('🔥 设置用户数据:', userData)
    const convertedPermissions = convertPermissions(userData.permissions)

    // 批量更新状态，避免多次渲染
    setUser(userData)
    setPermissions(convertedPermissions)
    setIsLoading(false)
    setError(null)
  }

  // 清除用户数据的统一函数
  const clearUserData = () => {
    if (!mountedRef.current) return

    console.log('🔥 清除用户数据')
    setUser(null)
    setPermissions([])
    setIsLoading(false)
    setError(null)
  }

  // 登录函数 - 简化逻辑，避免复杂的dispatch调用
  const login = async (username: string, password: string): Promise<void> => {
    if (!mountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)

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

      if (result.data?.user) {
        setUserData(result.data.user)
      } else {
        throw new Error('登录响应数据格式错误')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败'
      if (mountedRef.current) {
        setError(errorMessage)
        setIsLoading(false)
      }
      throw error
    }
  }

  // 登出函数 - 简化逻辑
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearUserData()
      // 重定向到登录页面
      window.location.href = '/admin/login'
    }
  }

  // 检查权限函数 - 直接使用state而不是通过复杂的context
  const checkPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  // 刷新用户信息 - 移除useCallback避免依赖问题
  const refreshUser = async (): Promise<void> => {
    if (!mountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // 添加超时控制
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401) {
          clearUserData()
          return
        }
        throw new Error(`获取用户信息失败: ${response.status}`)
      }

      const result = await response.json()
      console.log('🔥 刷新用户信息API响应:', result)

      // 用户信息API返回格式: { message: "...", data: userInfo }
      if (result.data) {
        setUserData(result.data)
      } else {
        console.warn('用户信息格式异常:', result)
        clearUserData()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      if (mountedRef.current) {
        if ((error as any)?.name === 'AbortError') {
          console.error('用户信息请求超时')
          setError('请求超时，请刷新页面重试')
        } else {
          clearUserData()
        }
      }
    }
  }

  // 初始化时检查用户登录状态 - 移除依赖数组避免循环
  useEffect(() => {
    console.log('🔥 useEffect 初始化开始执行')
    console.log('🔥 initializingRef.current:', initializingRef.current)

    // 防止重复初始化
    if (initializingRef.current) {
      console.log('🔥 初始化已在进行中，跳过')
      return
    }

    const initializeUser = async () => {
      initializingRef.current = true
      console.log('🔥 开始初始化用户状态')

      try {
        if (!mountedRef.current) {
          console.log('🔥 组件未挂载，跳过初始化')
          return
        }

        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/admin/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        console.log('🔥 初始化API响应状态:', response.status)

        if (!response.ok) {
          if (response.status === 401) {
            console.log('🔥 用户未登录，清除状态')
            clearUserData()
            return
          }
          throw new Error(`获取用户信息失败: ${response.status}`)
        }

        const result = await response.json()
        console.log('🔥 初始化API响应结果:', result)

        if (result.data && mountedRef.current) {
          console.log('🔥 设置用户数据:', result.data)
          setUserData(result.data)
        } else {
          console.log('🔥 清除用户数据，原因:', !result.data ? '无数据' : '组件未挂载')
          clearUserData()
        }
      } catch (error) {
        console.error('🔥 初始化用户错误:', error)
        if (mountedRef.current) {
          setError('初始化失败')
          setIsLoading(false)
        }
      } finally {
        initializingRef.current = false
      }
    }

    initializeUser()
  }, []) // 空依赖数组，只在组件挂载时执行一次

  // 构建context值 - 使用直接的state值而不是复杂的state对象
  const value: AdminContextType = {
    user,
    permissions,
    isLoading,
    login,
    logout,
    checkPermission,
    refreshUser
  }

  console.log('🔥 AdminProvider 提供的context值:', {
    hasUser: !!user,
    permissionsCount: permissions.length,
    isLoading,
    hasError: !!error
  })

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

// 多权限检查 Hook - 优化性能，避免不必要的重新计算
export function usePermissions(permissions: Permission[], requireAll = false) {
  const { permissions: userPermissions } = useAdmin()

  // 添加空数组检查，避免不必要的计算
  if (!permissions.length) return false
  if (!userPermissions.length) return false

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
