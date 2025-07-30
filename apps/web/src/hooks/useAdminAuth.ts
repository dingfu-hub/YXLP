// 管理员认证Hook

import { useState, useEffect, useRef } from 'react'
import { User } from '@/types/user'

interface AdminAuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAdmin: boolean
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    token: null,
    loading: true,
    isAdmin: false
  })
  const mountedRef = useRef(true)

  // 安全的setState函数
  const safeSetState = (newState: Partial<AdminAuthState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...newState }))
    }
  }

  useEffect(() => {
    // 从localStorage获取认证信息
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)

        // 检查是否是管理员角色
        const isAdmin = ['super_admin', 'dealer_admin'].includes(user.role)

        safeSetState({
          user,
          token,
          loading: false,
          isAdmin
        })
      } catch (error) {
        console.error('Failed to parse user data:', error)
        // 清除无效数据
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        safeSetState({
          user: null,
          token: null,
          loading: false,
          isAdmin: false
        })
      }
    } else {
      safeSetState({
        user: null,
        token: null,
        loading: false,
        isAdmin: false
      })
    }

    // 清理函数
    return () => {
      mountedRef.current = false
    }
  }, [])

  return state
}
