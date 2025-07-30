'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, UserRole, UserStatus, UpdateUserRequest } from '@/types/user'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminUserEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, token } = useAdminAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 加载用户详情
  const loadUser = async () => {
    if (!token || !params.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        const userData = result.data
        setUser(userData)
        setFormData({
          firstName: userData.profile.firstName,
          lastName: userData.profile.lastName,
          displayName: userData.profile.displayName,
          email: userData.email,
          phone: userData.phone,
          company: userData.profile.company,
          jobTitle: userData.profile.jobTitle,
          bio: userData.profile.bio,
          website: userData.profile.website,
          role: userData.role,
          status: userData.status,
          emailVerified: userData.emailVerified,
          phoneVerified: userData.phoneVerified,
          dealerId: userData.dealerId,
          language: userData.preferences.language,
          timezone: userData.preferences.timezone,
          currency: userData.preferences.currency,
          theme: userData.preferences.theme,
          twoFactorEnabled: userData.security.twoFactorEnabled,
          loginNotifications: userData.security.loginNotifications,
          sessionTimeout: userData.security.sessionTimeout,
          adminNotes: userData.metadata?.adminNotes || ''
        })
      } else {
        console.error('Failed to load user:', result.message)
        if (result.error === 'USER_NOT_FOUND') {
          router.push('/admin/users')
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [params.id, token])

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = '邮箱是必填项'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    // 姓名验证
    if (!formData.firstName) {
      newErrors.firstName = '名字是必填项'
    }
    if (!formData.lastName) {
      newErrors.lastName = '姓氏是必填项'
    }

    // 手机号验证（可选）
    if (formData.phone) {
      const phoneRegex = /^[+]?[\d\s\-()]+$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '手机号格式不正确'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存用户信息
  const handleSave = async () => {
    if (!validateForm() || !user || !token) return

    setSaving(true)
    try {
      const updateData: UpdateUserRequest = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          company: formData.company,
          jobTitle: formData.jobTitle,
          bio: formData.bio,
          website: formData.website
        },
        phone: formData.phone,
        emailVerified: formData.emailVerified,
        phoneVerified: formData.phoneVerified,
        role: formData.role,
        status: formData.status,
        dealerId: formData.dealerId,
        preferences: {
          language: formData.language,
          timezone: formData.timezone,
          currency: formData.currency,
          theme: formData.theme
        },
        security: {
          twoFactorEnabled: formData.twoFactorEnabled,
          loginNotifications: formData.loginNotifications,
          sessionTimeout: formData.sessionTimeout
        },
        adminNotes: formData.adminNotes
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()
      
      if (result.success) {
        alert('用户信息已更新')
        router.push(`/admin/users/${user.id}`)
      } else {
        alert(`更新失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Update user error:', error)
      alert('更新失败')
    } finally {
      setSaving(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录管理后台</p>
          <a href="/admin/login" className="mt-2 text-blue-600 hover:text-blue-500">
            前往登录
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">用户不存在</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-2 text-blue-600 hover:text-blue-500"
          >
            返回用户列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回用户详情
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">编辑用户</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {user.email} • {user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/admin/users/${user.id}`)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <form className="space-y-8">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      名字 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      姓氏 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱地址 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">网站</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 角色和状态 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">角色和状态</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                    <select
                      name="role"
                      value={formData.role || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="end_user">终端用户</option>
                      <option value="dealer_staff">经销商员工</option>
                      <option value="dealer_admin">经销商管理员</option>
                      {currentUser.role === 'super_admin' && (
                        <option value="super_admin">超级管理员</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                    <select
                      name="status"
                      value={formData.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">活跃</option>
                      <option value="inactive">非活跃</option>
                      <option value="suspended">已暂停</option>
                      <option value="pending_verification">待验证</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailVerified"
                      checked={formData.emailVerified || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">邮箱已验证</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="phoneVerified"
                      checked={formData.phoneVerified || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">手机已验证</label>
                  </div>
                </div>
              </div>

              {/* 偏好设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">偏好设置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">语言</label>
                    <select
                      name="language"
                      value={formData.language || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="zh-CN">简体中文</option>
                      <option value="en-US">English (US)</option>
                      <option value="ja-JP">日本語</option>
                      <option value="ko-KR">한국어</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">时区</label>
                    <select
                      name="timezone"
                      value={formData.timezone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Shanghai">中国标准时间</option>
                      <option value="America/New_York">美国东部时间</option>
                      <option value="Europe/London">格林威治时间</option>
                      <option value="Asia/Tokyo">日本标准时间</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">货币</label>
                    <select
                      name="currency"
                      value={formData.currency || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CNY">人民币 (¥)</option>
                      <option value="USD">美元 ($)</option>
                      <option value="EUR">欧元 (€)</option>
                      <option value="JPY">日元 (¥)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主题</label>
                    <select
                      name="theme"
                      value={formData.theme || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">浅色</option>
                      <option value="dark">深色</option>
                      <option value="auto">跟随系统</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 安全设置 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">安全设置</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={formData.twoFactorEnabled || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">启用双因素认证</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="loginNotifications"
                      checked={formData.loginNotifications || false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">启用登录通知</label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">会话超时（分钟）</label>
                    <input
                      type="number"
                      name="sessionTimeout"
                      value={formData.sessionTimeout || ''}
                      onChange={handleInputChange}
                      min="30"
                      max="1440"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 管理员备注 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">管理员备注</h3>
                <textarea
                  name="adminNotes"
                  value={formData.adminNotes || ''}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="添加管理员备注..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
