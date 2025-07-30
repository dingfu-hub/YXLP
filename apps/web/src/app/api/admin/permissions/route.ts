// 管理员权限管理API

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { userOperations } from '@/data/users'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 权限定义接口
interface PermissionDefinition {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
  isSystem: boolean
}

// 权限分类
interface PermissionCategory {
  id: string
  name: string
  description: string
  permissions: PermissionDefinition[]
}

// 系统权限定义
const systemPermissions: PermissionDefinition[] = [
  // 用户管理权限
  {
    id: 'users:read',
    name: '查看用户',
    description: '可以查看用户列表和基本信息',
    category: 'users',
    resource: 'users',
    action: 'read',
    isSystem: true
  },
  {
    id: 'users:write',
    name: '编辑用户',
    description: '可以创建和编辑用户信息',
    category: 'users',
    resource: 'users',
    action: 'write',
    isSystem: true
  },

  // 管理员用户权限
  {
    id: 'admin:users:read',
    name: '管理员查看用户',
    description: '管理员可以查看详细的用户信息',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'read',
    isSystem: true
  },
  {
    id: 'admin:users:write',
    name: '管理员编辑用户',
    description: '管理员可以创建和编辑用户',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'write',
    isSystem: true
  },
  {
    id: 'admin:users:manage_status',
    name: '管理用户状态',
    description: '可以激活、禁用、暂停用户账户',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'manage_status',
    isSystem: true
  },
  {
    id: 'admin:users:manage_roles',
    name: '管理用户角色',
    description: '可以分配和修改用户角色',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'manage_roles',
    isSystem: true
  },
  {
    id: 'admin:users:manage_security',
    name: '管理用户安全',
    description: '可以管理用户安全设置',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'manage_security',
    isSystem: true
  },
  {
    id: 'admin:users:export',
    name: '导出用户数据',
    description: '可以导出用户数据',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'export',
    isSystem: true
  },
  {
    id: 'admin:users:delete',
    name: '删除用户',
    description: '可以删除用户账户',
    category: 'admin_users',
    resource: 'admin_users',
    action: 'delete',
    isSystem: true
  },

  // 角色管理权限
  {
    id: 'admin:roles:read',
    name: '查看角色',
    description: '可以查看角色列表和权限',
    category: 'roles',
    resource: 'admin_roles',
    action: 'read',
    isSystem: true
  },
  {
    id: 'admin:roles:write',
    name: '管理角色',
    description: '可以创建、编辑、删除角色',
    category: 'roles',
    resource: 'admin_roles',
    action: 'write',
    isSystem: true
  },

  // 产品管理权限
  {
    id: 'products:read',
    name: '查看产品',
    description: '可以查看产品信息',
    category: 'products',
    resource: 'products',
    action: 'read',
    isSystem: true
  },
  {
    id: 'products:write',
    name: '管理产品',
    description: '可以创建、编辑、删除产品',
    category: 'products',
    resource: 'products',
    action: 'write',
    isSystem: true
  },

  // 订单管理权限
  {
    id: 'orders:read',
    name: '查看订单',
    description: '可以查看订单信息',
    category: 'orders',
    resource: 'orders',
    action: 'read',
    isSystem: true
  },
  {
    id: 'orders:write',
    name: '管理订单',
    description: '可以创建、编辑订单',
    category: 'orders',
    resource: 'orders',
    action: 'write',
    isSystem: true
  },

  // 分析权限
  {
    id: 'analytics:read',
    name: '查看分析',
    description: '可以查看基础分析数据',
    category: 'analytics',
    resource: 'analytics',
    action: 'read',
    isSystem: true
  },
  {
    id: 'admin:analytics:read',
    name: '管理员分析',
    description: '可以查看详细的分析数据',
    category: 'analytics',
    resource: 'admin_analytics',
    action: 'read',
    isSystem: true
  },

  // 审计权限
  {
    id: 'admin:audit:read',
    name: '查看审计日志',
    description: '可以查看系统审计日志',
    category: 'audit',
    resource: 'admin_audit',
    action: 'read',
    isSystem: true
  },

  // 个人资料权限
  {
    id: 'profile:read',
    name: '查看个人资料',
    description: '可以查看个人资料',
    category: 'profile',
    resource: 'profile',
    action: 'read',
    isSystem: true
  },
  {
    id: 'profile:write',
    name: '编辑个人资料',
    description: '可以编辑个人资料',
    category: 'profile',
    resource: 'profile',
    action: 'write',
    isSystem: true
  }
]

// 权限分类定义
const permissionCategories: Record<string, { name: string; description: string }> = {
  users: {
    name: '用户管理',
    description: '基础用户管理权限'
  },
  admin_users: {
    name: '管理员用户管理',
    description: '管理员级别的用户管理权限'
  },
  roles: {
    name: '角色管理',
    description: '角色和权限管理'
  },
  products: {
    name: '产品管理',
    description: '产品相关权限'
  },
  orders: {
    name: '订单管理',
    description: '订单相关权限'
  },
  analytics: {
    name: '数据分析',
    description: '分析和报表权限'
  },
  audit: {
    name: '审计日志',
    description: '审计和安全日志权限'
  },
  profile: {
    name: '个人资料',
    description: '个人资料管理权限'
  }
}

// 获取所有权限
export async function GET(request: NextRequest) {
  try {
    // 验证管理员认证
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    const currentUser = userOperations.getUserById(payload.userId)
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 检查权限
    const context = createAccessContext(currentUser, { id: payload.sessionId }, request)
    const checker = new PermissionChecker(context)

    if (!checker.hasPermission('admin:roles:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 按分类组织权限
    const categorizedPermissions: PermissionCategory[] = []

    for (const [categoryId, categoryInfo] of Object.entries(permissionCategories)) {
      const categoryPermissions = systemPermissions.filter(perm => perm.category === categoryId)
      
      if (categoryPermissions.length > 0) {
        categorizedPermissions.push({
          id: categoryId,
          name: categoryInfo.name,
          description: categoryInfo.description,
          permissions: categoryPermissions
        })
      }
    }

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_permissions',
      'read',
      true,
      request,
      { permissionCount: systemPermissions.length }
    )

    return NextResponse.json({
      success: true,
      data: {
        categories: categorizedPermissions,
        allPermissions: systemPermissions,
        total: systemPermissions.length
      }
    })

  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 获取权限树结构（用于可视化权限分配）
export async function POST(request: NextRequest) {
  try {
    // 验证管理员认证
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    const currentUser = userOperations.getUserById(payload.userId)
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 检查权限
    const context = createAccessContext(currentUser, { id: payload.sessionId }, request)
    const checker = new PermissionChecker(context)

    if (!checker.hasPermission('admin:roles:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    const body = await request.json()
    const { selectedPermissions = [] } = body

    // 构建权限树
    const permissionTree = Object.entries(permissionCategories).map(([categoryId, categoryInfo]) => {
      const categoryPermissions = systemPermissions.filter(perm => perm.category === categoryId)
      
      return {
        id: categoryId,
        name: categoryInfo.name,
        description: categoryInfo.description,
        type: 'category',
        checked: categoryPermissions.every(perm => selectedPermissions.includes(perm.id)),
        indeterminate: categoryPermissions.some(perm => selectedPermissions.includes(perm.id)) &&
                      !categoryPermissions.every(perm => selectedPermissions.includes(perm.id)),
        children: categoryPermissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          description: perm.description,
          type: 'permission',
          checked: selectedPermissions.includes(perm.id),
          resource: perm.resource,
          action: perm.action
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tree: permissionTree,
        selectedCount: selectedPermissions.length,
        totalCount: systemPermissions.length
      }
    })

  } catch (error) {
    console.error('Get permission tree error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
