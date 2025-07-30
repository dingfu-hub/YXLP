// 管理员单个角色管理API

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { userOperations } from '@/data/users'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 角色定义接口
interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 系统预定义角色（从主文件导入的简化版本）
const systemRoles: Record<string, RoleDefinition> = {
  'super_admin': {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限，可以管理所有用户和设置',
    permissions: ['*'],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'dealer_admin': {
    id: 'dealer_admin',
    name: '经销商管理员',
    description: '经销商管理员，可以管理本经销商的用户和业务',
    permissions: [
      'users:read', 'users:write',
      'admin:users:read', 'admin:users:write', 'admin:users:manage_status', 'admin:users:manage_roles',
      'admin:users:manage_security', 'admin:users:export', 'admin:users:delete',
      'admin:roles:read', 'admin:roles:write',
      'products:read', 'products:write',
      'orders:read', 'orders:write',
      'analytics:read', 'admin:analytics:read',
      'admin:audit:read',
      'profile:read', 'profile:write'
    ],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'dealer_staff': {
    id: 'dealer_staff',
    name: '经销商员工',
    description: '经销商员工，可以处理订单和查看产品',
    permissions: [
      'users:read',
      'products:read',
      'orders:read', 'orders:write',
      'profile:read', 'profile:write'
    ],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'end_user': {
    id: 'end_user',
    name: '终端用户',
    description: '终端用户，可以浏览产品和管理个人订单',
    permissions: [
      'products:read',
      'orders:read', 'orders:write',
      'profile:read', 'profile:write'
    ],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// 自定义角色存储（生产环境应使用数据库）
const customRoles = new Map<string, RoleDefinition>()

// 获取单个角色详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 查找角色
    const role = systemRoles[params.id] || customRoles.get(params.id)
    
    if (!role) {
      return NextResponse.json({
        success: false,
        message: 'Role not found',
        error: 'ROLE_NOT_FOUND'
      }, { status: 404 })
    }

    // 获取使用该角色的用户数量
    const users = userOperations.getAllUsers()
    const userCount = users.filter(user => user.role === params.id).length

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_role_detail',
      'read',
      true,
      request,
      { roleId: params.id }
    )

    return NextResponse.json({
      success: true,
      data: {
        ...role,
        userCount
      }
    })

  } catch (error) {
    console.error('Get role detail error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!checker.hasPermission('admin:roles:write')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 查找角色
    const existingRole = systemRoles[params.id] || customRoles.get(params.id)
    
    if (!existingRole) {
      return NextResponse.json({
        success: false,
        message: 'Role not found',
        error: 'ROLE_NOT_FOUND'
      }, { status: 404 })
    }

    // 系统角色不能修改
    if (existingRole.isSystem) {
      return NextResponse.json({
        success: false,
        message: 'System roles cannot be modified',
        error: 'SYSTEM_ROLE_READONLY'
      }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    // 验证必填字段
    if (!name || !description || !Array.isArray(permissions)) {
      return NextResponse.json({
        success: false,
        message: 'Name, description, and permissions are required',
        error: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // 检查角色名是否已被其他角色使用
    const allRoles = [...Object.values(systemRoles), ...Array.from(customRoles.values())]
    const nameConflict = allRoles.find(role => role.name === name && role.id !== params.id)
    
    if (nameConflict) {
      return NextResponse.json({
        success: false,
        message: 'Role name already exists',
        error: 'ROLE_EXISTS'
      }, { status: 409 })
    }

    // 验证权限列表
    const validPermissions = getAllValidPermissions()
    const invalidPermissions = permissions.filter((perm: string) => 
      !validPermissions.includes(perm) && perm !== '*'
    )

    if (invalidPermissions.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid permissions detected',
        error: 'INVALID_PERMISSIONS',
        data: { invalidPermissions }
      }, { status: 400 })
    }

    // 更新角色
    const updatedRole: RoleDefinition = {
      ...existingRole,
      name,
      description,
      permissions,
      updatedAt: new Date()
    }

    customRoles.set(params.id, updatedRole)

    // 更新所有使用该角色的用户权限
    const users = userOperations.getAllUsers()
    const affectedUsers = users.filter(user => user.role === params.id)
    
    for (const user of affectedUsers) {
      userOperations.updateUser(user.id, {
        permissions
      })
    }

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'role_update',
      'admin_roles',
      true,
      request,
      {
        roleId: params.id,
        roleName: name,
        permissions,
        affectedUserCount: affectedUsers.length
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    })

  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!checker.hasPermission('admin:roles:write')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 查找角色
    const existingRole = systemRoles[params.id] || customRoles.get(params.id)
    
    if (!existingRole) {
      return NextResponse.json({
        success: false,
        message: 'Role not found',
        error: 'ROLE_NOT_FOUND'
      }, { status: 404 })
    }

    // 系统角色不能删除
    if (existingRole.isSystem) {
      return NextResponse.json({
        success: false,
        message: 'System roles cannot be deleted',
        error: 'SYSTEM_ROLE_READONLY'
      }, { status: 400 })
    }

    // 检查是否有用户正在使用该角色
    const users = userOperations.getAllUsers()
    const usersWithRole = users.filter(user => user.role === params.id)
    
    if (usersWithRole.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete role that is assigned to users',
        error: 'ROLE_IN_USE',
        data: { userCount: usersWithRole.length }
      }, { status: 400 })
    }

    // 删除角色
    customRoles.delete(params.id)

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'role_delete',
      'admin_roles',
      true,
      request,
      {
        roleId: params.id,
        roleName: existingRole.name
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    })

  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 获取所有有效权限列表
function getAllValidPermissions(): string[] {
  return [
    // 用户权限
    'users:read', 'users:write',
    
    // 管理员用户权限
    'admin:users:read', 'admin:users:write', 'admin:users:manage_status', 
    'admin:users:manage_roles', 'admin:users:manage_security', 'admin:users:export', 
    'admin:users:delete',
    
    // 角色权限
    'admin:roles:read', 'admin:roles:write',
    
    // 产品权限
    'products:read', 'products:write',
    
    // 订单权限
    'orders:read', 'orders:write',
    
    // 分析权限
    'analytics:read', 'admin:analytics:read',
    
    // 审计权限
    'admin:audit:read',
    
    // 个人资料权限
    'profile:read', 'profile:write'
  ]
}
