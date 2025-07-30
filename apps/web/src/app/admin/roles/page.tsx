'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  userCount?: number
  createdAt: string
  updatedAt: string
}

interface PermissionCategory {
  id: string
  name: string
  description: string
  permissions: Array<{
    id: string
    name: string
    description: string
    category: string
    resource: string
    action: string
    isSystem: boolean
  }>
}

export default function AdminRolesPage() {
  const { user: currentUser, token } = useAdminAuth()
  const [roles, setRoles] = useState<RoleDefinition[]>([])
  const [permissions, setPermissions] = useState<PermissionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  // 加载角色列表
  const loadRoles = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setRoles(result.data.roles)
      } else {
        console.error('Failed to load roles:', result.message)
      }
    } catch (error) {
      console.error('Error loading roles:', error)
    }
  }

  // 加载权限列表
  const loadPermissions = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/admin/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setPermissions(result.data.categories)
      } else {
        console.error('Failed to load permissions:', result.message)
      }
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadRoles(), loadPermissions()])
      setLoading(false)
    }
    
    loadData()
  }, [token])

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 处理权限选择
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }))
  }

  // 处理分类权限选择
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const category = permissions.find(cat => cat.id === categoryId)
    if (!category) return

    const categoryPermissionIds = category.permissions.map(perm => perm.id)
    
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...categoryPermissionIds])]
        : prev.permissions.filter(id => !categoryPermissionIds.includes(id))
    }))
  }

  // 创建角色
  const handleCreate = async () => {
    if (!token || !formData.name || !formData.description) {
      alert('请填写角色名称和描述')
      return
    }

    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        await loadRoles()
        setShowCreateModal(false)
        setFormData({ name: '', description: '', permissions: [] })
        alert('角色创建成功')
      } else {
        alert(`创建失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Create role error:', error)
      alert('创建失败')
    }
  }

  // 编辑角色
  const handleEdit = async () => {
    if (!token || !selectedRole || !formData.name || !formData.description) {
      alert('请填写角色名称和描述')
      return
    }

    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        await loadRoles()
        setShowEditModal(false)
        setSelectedRole(null)
        setFormData({ name: '', description: '', permissions: [] })
        alert('角色更新成功')
      } else {
        alert(`更新失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Update role error:', error)
      alert('更新失败')
    }
  }

  // 删除角色
  const handleDelete = async (role: RoleDefinition) => {
    if (!token || role.isSystem) {
      alert('系统角色不能删除')
      return
    }

    if (!confirm(`确定要删除角色 "${role.name}" 吗？`)) return

    try {
      const response = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        await loadRoles()
        alert('角色删除成功')
      } else {
        alert(`删除失败: ${result.message}`)
      }
    } catch (error) {
      console.error('Delete role error:', error)
      alert('删除失败')
    }
  }

  // 打开编辑模态框
  const openEditModal = (role: RoleDefinition) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setShowEditModal(true)
  }

  // 检查分类是否全选
  const isCategorySelected = (categoryId: string) => {
    const category = permissions.find(cat => cat.id === categoryId)
    if (!category) return false
    return category.permissions.every(perm => formData.permissions.includes(perm.id))
  }

  // 检查分类是否部分选中
  const isCategoryIndeterminate = (categoryId: string) => {
    const category = permissions.find(cat => cat.id === categoryId)
    if (!category) return false
    const selectedCount = category.permissions.filter(perm => formData.permissions.includes(perm.id)).length
    return selectedCount > 0 && selectedCount < category.permissions.length
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理系统角色和权限分配
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                创建角色
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 角色列表 */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      权限数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
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
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {role.permissions.includes('*') ? '全部权限' : role.permissions.length}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {role.userCount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          role.isSystem 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {role.isSystem ? '系统角色' : '自定义角色'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(role)}
                            disabled={role.isSystem}
                            className={`${
                              role.isSystem 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:text-blue-900'
                            }`}
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
                            disabled={role.isSystem}
                            className={`${
                              role.isSystem 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            删除
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
      </div>

      {/* 创建角色模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">创建新角色</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入角色名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色描述</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入角色描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">权限分配</label>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                    {permissions.map((category) => (
                      <div key={category.id} className="mb-4">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isCategorySelected(category.id)}
                            ref={(el) => {
                              if (el) el.indeterminate = isCategoryIndeterminate(category.id)
                            }}
                            onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-900">
                            {category.name}
                          </label>
                        </div>
                        <div className="ml-6 space-y-1">
                          {category.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">
                                {permission.name}
                                <span className="text-gray-500 text-xs ml-1">
                                  ({permission.description})
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', permissions: [] })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  创建角色
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑角色模态框 */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">编辑角色: {selectedRole.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入角色名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">角色描述</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入角色描述"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">权限分配</label>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                    {permissions.map((category) => (
                      <div key={category.id} className="mb-4">
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={isCategorySelected(category.id)}
                            ref={(el) => {
                              if (el) el.indeterminate = isCategoryIndeterminate(category.id)
                            }}
                            onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-900">
                            {category.name}
                          </label>
                        </div>
                        <div className="ml-6 space-y-1">
                          {category.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">
                                {permission.name}
                                <span className="text-gray-500 text-xs ml-1">
                                  ({permission.description})
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedRole(null)
                    setFormData({ name: '', description: '', permissions: [] })
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  取消
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存更改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
