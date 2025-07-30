'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, UserRole, UserStatus } from '@/types/user'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, token } = useAdminAuth()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

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
        setUser(result.data)
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

  // 更新用户状态
  const updateUserStatus = async (status: UserStatus) => {
    if (!user || !token) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(result.data)
        alert('用户状态已更新')
      } else {
        alert(`更新失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Update status error:', error)
      alert('更新失败')
    }
  }

  // 重置密码
  const resetPassword = async () => {
    if (!user || !token) return

    if (!confirm('确定要重置该用户的密码吗？')) return

    try {
      // 这里应该调用重置密码的API
      alert('密码重置功能待实现')
    } catch (error) {
      console.error('Reset password error:', error)
      alert('重置密码失败')
    }
  }

  // 解锁用户
  const unlockUser = async () => {
    if (!user || !token) return

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'unlock',
          userIds: [user.id]
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadUser()
        alert('用户已解锁')
      } else {
        alert(`解锁失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Unlock user error:', error)
      alert('解锁失败')
    }
  }

  // 获取状态显示样式
  const getStatusBadge = (status: UserStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending_verification: 'bg-yellow-100 text-yellow-800'
    }
    
    const labels = {
      active: '活跃',
      inactive: '非活跃',
      suspended: '已暂停',
      pending_verification: '待验证'
    }

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // 获取角色显示
  const getRoleLabel = (role: UserRole) => {
    const labels = {
      super_admin: '超级管理员',
      dealer_admin: '经销商管理员',
      dealer_staff: '经销商员工',
      end_user: '终端用户'
    }
    return labels[role] || role
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

  const tabs = [
    { id: 'profile', name: '基本信息', icon: '👤' },
    { id: 'security', name: '安全设置', icon: '🔒' },
    { id: 'activity', name: '活动记录', icon: '📊' },
    { id: 'permissions', name: '权限管理', icon: '🔑' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← 返回用户列表
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName}`}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {user.email} • {getRoleLabel(user.role)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(user.status)}
              <button
                onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                编辑用户
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧用户卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-medium text-gray-700">
                    {user.profile.displayName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName}`}
                </h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">用户ID</label>
                  <p className="text-sm text-gray-900 font-mono">{user.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">注册时间</label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">最后登录</label>
                  <p className="text-sm text-gray-900">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : '从未登录'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">登录次数</label>
                  <p className="text-sm text-gray-900">{user.loginCount}</p>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-900">快速操作</h4>
                
                {user.status === 'active' ? (
                  <button
                    onClick={() => updateUserStatus('suspended')}
                    className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    暂停用户
                  </button>
                ) : (
                  <button
                    onClick={() => updateUserStatus('active')}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    激活用户
                  </button>
                )}

                {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                  <button
                    onClick={unlockUser}
                    className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                  >
                    解锁用户
                  </button>
                )}

                <button
                  onClick={resetPassword}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                >
                  重置密码
                </button>
              </div>
            </div>
          </div>

          {/* 右侧详细信息 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* 标签页导航 */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 标签页内容 */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">名字</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.firstName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">姓氏</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">显示名称</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.displayName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">手机号</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {user.phone || '未设置'}
                            {user.phoneVerified && (
                              <span className="ml-2 text-green-600">✓ 已验证</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">公司</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.company || '未设置'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">职位</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.jobTitle || '未设置'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">个人简介</label>
                          <p className="mt-1 text-sm text-gray-900">{user.profile.bio || '未设置'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">偏好设置</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">语言</label>
                          <p className="mt-1 text-sm text-gray-900">{user.preferences.language}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">时区</label>
                          <p className="mt-1 text-sm text-gray-900">{user.preferences.timezone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">货币</label>
                          <p className="mt-1 text-sm text-gray-900">{user.preferences.currency}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">主题</label>
                          <p className="mt-1 text-sm text-gray-900">{user.preferences.theme}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">安全状态</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">邮箱验证</h4>
                            <p className="text-sm text-gray-500">邮箱地址验证状态</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.emailVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.emailVerified ? '已验证' : '未验证'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">双因素认证</h4>
                            <p className="text-sm text-gray-500">2FA安全认证</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.security.twoFactorEnabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.security.twoFactorEnabled ? '已启用' : '未启用'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">登录通知</h4>
                            <p className="text-sm text-gray-500">新设备登录通知</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.security.loginNotifications 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.security.loginNotifications ? '已启用' : '未启用'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">会话超时</h4>
                            <p className="text-sm text-gray-500">自动登出时间</p>
                          </div>
                          <span className="text-sm text-gray-900">
                            {user.security.sessionTimeout} 分钟
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">安全记录</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">密码最后修改</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(user.security.passwordLastChanged).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">失败登录次数</label>
                          <p className="mt-1 text-sm text-gray-900">{user.failedLoginAttempts}</p>
                        </div>
                        {user.lockedUntil && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">锁定到期时间</label>
                            <p className="mt-1 text-sm text-red-600">
                              {new Date(user.lockedUntil).toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">可信设备数量</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {Array.isArray(user.security.trustedDevices) ? user.security.trustedDevices.length : 0} 台设备
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">活动统计</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{user.loginCount}</div>
                          <div className="text-sm text-blue-600">总登录次数</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {user.lastActiveAt 
                              ? Math.floor((Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
                              : '∞'
                            }
                          </div>
                          <div className="text-sm text-green-600">天前最后活跃</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                          </div>
                          <div className="text-sm text-purple-600">注册天数</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
                      <div className="text-sm text-gray-500">
                        活动记录功能待实现...
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'permissions' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">角色和权限</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">当前角色</label>
                          <p className="mt-1 text-sm text-gray-900">{getRoleLabel(user.role)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">权限列表</label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {user.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
