'use client'

import { useState, useEffect, useRef } from 'react'
import { User, UserRole, UserStatus } from '@/types/user'
import { useAdmin } from '@/contexts/AdminContext'
import { useSafeState } from '@/hooks/useSafeState'

interface UserListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  const { user: currentUser, isLoading } = useAdmin()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchAction, setBatchAction] = useState<string>('')
  const [authError, setAuthError] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    displayName: ''
  })

  // 筛选和分页状态
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    dealerId: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // 统计数据
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0
  })

  // 加载用户列表
  const loadUsers = async () => {
    setLoading(true)
    setAuthError('')

    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString())
      })

      const response = await fetch(`/api/admin/users?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // 包含cookies
      })

      const result = await response.json()

      if (result.success) {
        setUsers(result.data.users)
        setStats({
          total: result.data.total,
          active: result.data.users.filter((u: User) => u.status === 'active').length,
          inactive: result.data.users.filter((u: User) => u.status === 'inactive').length,
          suspended: result.data.users.filter((u: User) => u.status === 'suspended').length,
          pending: result.data.users.filter((u: User) => u.status === 'pending_verification').length
        })
      } else {
        console.error('Failed to load users:', result.message)
        if (result.error === 'UNAUTHORIZED' || result.error === 'INVALID_TOKEN') {
          setAuthError('认证失败，请重新登录')
        } else {
          setAuthError(`加载失败: ${result.message}`)
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setAuthError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [filters])

  // 处理筛选变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 重置到第一页
    }))
  }

  // 处理创建表单输入变化
  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCreateFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 创建管理员用户
  const handleCreateUser = async () => {
    console.log('创建管理员按钮被点击')
    console.log('表单数据:', createFormData)

    // 验证表单
    if (!createFormData.username || !createFormData.password) {
      setError('请填写必填字段')
      return
    }

    if (createFormData.password !== createFormData.confirmPassword) {
      setError('密码确认不匹配')
      return
    }

    if (createFormData.password.length < 8) {
      setError('密码长度至少8位')
      return
    }

    // 密码强度验证
    const passwordValidation = {
      hasUppercase: /[A-Z]/.test(createFormData.password),
      hasLowercase: /[a-z]/.test(createFormData.password),
      hasNumbers: /\d/.test(createFormData.password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(createFormData.password)
    }

    if (!passwordValidation.hasUppercase) {
      setError('密码必须包含至少一个大写字母')
      return
    }
    if (!passwordValidation.hasLowercase) {
      setError('密码必须包含至少一个小写字母')
      return
    }
    if (!passwordValidation.hasNumbers) {
      setError('密码必须包含至少一个数字')
      return
    }
    if (!passwordValidation.hasSpecialChars) {
      setError('密码必须包含至少一个特殊字符 (!@#$%^&* 等)')
      return
    }

    // 用户名格式验证
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(createFormData.username)) {
      setError('用户名只能包含字母、数字和下划线，长度3-20位')
      return
    }

    setCreating(true)
    setError('')

    try {
      console.log('开始发送API请求')
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 包含cookies
        body: JSON.stringify({
          username: createFormData.username,
          password: createFormData.password,
          role: createFormData.role,
          profile: {
            displayName: createFormData.displayName || createFormData.username
          }
        })
      })

      console.log('API响应状态:', response.status)
      const result = await response.json()
      console.log('API响应结果:', result)

      if (result.success) {
        await loadUsers()
        setShowCreateModal(false)
        setCreateFormData({
          username: '',
          password: '',
          confirmPassword: '',
          role: 'admin',
          displayName: ''
        })
        setSuccess('管理员用户创建成功！')

        // 3秒后清除成功消息
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.message || '创建失败，请稍后重试')
      }
    } catch (error) {
      console.error('Create user error:', error)
      setError('网络错误，请稍后重试')
    } finally {
      setCreating(false)
    }
  }

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // 处理用户选择
  const handleUserSelect = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers)
    if (selected) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedUsers(newSelected)
  }

  // 全选/取消全选
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(users.map(u => u.id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  // 批量操作
  const handleBatchOperation = async (action: string) => {
    if (selectedUsers.size === 0) return

    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 包含cookies
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedUsers)
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadUsers()
        setSelectedUsers(new Set())
        setShowBatchModal(false)
        alert(`批量${action}操作完成`)
      } else {
        alert(`批量操作失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Batch operation error:', error)
      alert('批量操作失败')
    }
  }

  // 导出用户数据
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/users/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 包含cookies
        body: JSON.stringify({
          action: 'export',
          userIds: selectedUsers.size > 0 ? Array.from(selectedUsers) : users.map(u => u.id)
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // 下载CSV文件
        const csvContent = convertToCSV(result.data.users)
        downloadCSV(csvContent, 'users_export.csv')
      }
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  // 转换为CSV格式
  const convertToCSV = (data: any[]) => {
    const headers = ['ID', '用户名', '邮箱', '姓名', '角色', '状态', '邮箱验证', '创建时间']
    const rows = data.map(user => [
      user.id,
      user.username,
      user.email,
      user.displayName,
      user.role,
      user.status,
      user.emailVerified ? '是' : '否',
      new Date(user.createdAt).toLocaleDateString()
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // 下载CSV文件
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // 获取角色显示
  const getRoleLabel = (role: UserRole) => {
    const labels = {
      super_admin: '超级管理员',
      admin: '普通管理员'
    }
    return labels[role] || role
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">请先登录管理后台</p>
          {authError && (
            <p className="mt-2 text-red-600 text-sm">{authError}</p>
          )}
          <a href="/admin/login" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            前往登录
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 错误和成功消息 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError('')}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccess('')}
                  className="inline-flex text-green-400 hover:text-green-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理系统用户账户。注意：此处只能创建管理员账户，经销商和普通用户请通过客户端注册
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                创建管理员
              </button>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                导出数据
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 重要提醒 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                用户管理说明
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  此管理界面仅用于创建和管理管理员账户。经销商和普通用户应通过客户端注册功能进行注册，
                  系统会自动分配相应的角色和权限。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">总用户数</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">活跃用户</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <div className="text-sm text-gray-500">非活跃用户</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            <div className="text-sm text-gray-500">已暂停用户</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">待验证用户</div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="搜索用户名、邮箱..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有角色</option>
                <option value="super_admin">超级管理员</option>
                <option value="admin">普通管理员</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有状态</option>
                <option value="active">活跃</option>
                <option value="inactive">非活跃</option>
                <option value="suspended">已暂停</option>
                <option value="pending_verification">待验证</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">创建时间（新到旧）</option>
                <option value="createdAt-asc">创建时间（旧到新）</option>
                <option value="username-asc">用户名（A-Z）</option>
                <option value="username-desc">用户名（Z-A）</option>
                <option value="lastLoginAt-desc">最后登录（新到旧）</option>
              </select>
            </div>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                已选择 {selectedUsers.size} 个用户
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setBatchAction('activate')
                    setShowBatchModal(true)
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  批量激活
                </button>
                <button
                  onClick={() => {
                    setBatchAction('deactivate')
                    setShowBatchModal(true)
                  }}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  批量禁用
                </button>
                <button
                  onClick={() => {
                    setBatchAction('suspend')
                    setShowBatchModal(true)
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  批量暂停
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  取消选择
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 用户列表 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最后登录
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.profile.displayName?.charAt(0) || user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getRoleLabel(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : '从未登录'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => window.location.href = `/admin/users/${user.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            查看
                          </button>
                          <button
                            onClick={() => window.location.href = `/admin/users/${user.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            编辑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 分页 */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= Math.ceil(stats.total / filters.limit)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                显示第 <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> 到{' '}
                <span className="font-medium">
                  {Math.min(filters.page * filters.limit, stats.total)}
                </span>{' '}
                条，共 <span className="font-medium">{stats.total}</span> 条记录
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= Math.ceil(stats.total / filters.limit)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* 创建管理员用户模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">创建管理员用户</h3>
              <p className="text-sm text-gray-600 mb-6">
                注意：此功能仅用于创建管理员账户。经销商和普通用户请通过客户端注册。
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={createFormData.username}
                    onChange={handleCreateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入用户名"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      密码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={createFormData.password}
                      onChange={handleCreateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="至少8位密码"
                    />
                    {createFormData.password && (
                      <div className="mt-2 text-xs space-y-1">
                        <div className={`flex items-center ${createFormData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{createFormData.password.length >= 8 ? '✓' : '✗'}</span>
                          至少8个字符
                        </div>
                        <div className={`flex items-center ${/[A-Z]/.test(createFormData.password) ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{/[A-Z]/.test(createFormData.password) ? '✓' : '✗'}</span>
                          包含大写字母
                        </div>
                        <div className={`flex items-center ${/[a-z]/.test(createFormData.password) ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{/[a-z]/.test(createFormData.password) ? '✓' : '✗'}</span>
                          包含小写字母
                        </div>
                        <div className={`flex items-center ${/\d/.test(createFormData.password) ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{/\d/.test(createFormData.password) ? '✓' : '✗'}</span>
                          包含数字
                        </div>
                        <div className={`flex items-center ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(createFormData.password) ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="mr-1">{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(createFormData.password) ? '✓' : '✗'}</span>
                          包含特殊字符 (!@#$%^&* 等)
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      确认密码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={createFormData.confirmPassword}
                      onChange={handleCreateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请再次输入密码"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      角色 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={createFormData.role}
                      onChange={handleCreateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="super_admin">超级管理员</option>
                      <option value="admin">普通管理员</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      显示名称
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={createFormData.displayName}
                      onChange={handleCreateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="显示名称（可选）"
                    />
                  </div>
                </div>



                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        重要提醒
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>此功能仅用于创建管理员账户</li>
                          <li>经销商和普通用户应通过客户端注册</li>
                          <li>用户名只能包含字母、数字和下划线</li>
                          <li>密码至少8位，必须包含大写字母、小写字母、数字和特殊字符</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 错误消息 */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateFormData({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      role: 'admin',
                      displayName: ''
                    })
                    setError('')
                  }}
                  disabled={creating}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('=== 创建管理员按钮被点击 ===')
                    console.log('表单数据:', createFormData)

                    try {
                      await handleCreateUser()
                    } catch (error) {
                      console.error('创建用户时发生错误:', error)
                      setError(`创建失败: ${error}`)
                    }
                  }}
                  disabled={creating}
                  className={`px-4 py-2 rounded-md text-white ${
                    creating
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {creating ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      创建中...
                    </div>
                  ) : (
                    '创建管理员'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量操作确认模态框 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">确认批量操作</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  您确定要对选中的 {selectedUsers.size} 个用户执行 "{batchAction}" 操作吗？
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  onClick={() => handleBatchOperation(batchAction)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
