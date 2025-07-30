// 管理员角色管理API

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { securityAuditLogger } from '@/lib/security/audit-logger'
import { UserRole } from '@/types/user'

// 角色定义
interface RoleDefinition {
  id: string
  name: string
  description: string
  permissions: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

// 系统预定义角色
const systemRoles: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限，可以管理所有用户和设置',
    permissions: ['*'],
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
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
  {
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
  {
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
]

// 自定义角色存储（生产环境应使用数据库）
const customRoles = new Map<string, RoleDefinition>()

// 获取所有角色
export async function GET(request: NextRequest) {
  try {
    console.log('=== 角色管理API GET请求开始 ===')
    console.log('开始角色管理认证')

    // 验证管理员身份 - 使用cookie认证
    const token = request.cookies.get('admin_token')?.value
    console.log('Cookie token:', token ? '存在' : '不存在')

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const payload = await verifyToken(token)
    console.log('Token验证结果:', payload ? '有效' : '无效')
    if (payload) {
      console.log('Token payload:', payload)
    }

    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      }, { status: 401 })
    }

    const currentUser = findAdminById(payload.userId)
    console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    console.log('管理员用户角色:', currentUser.role)
    console.log('认证成功，用户:', currentUser.displayName, '角色:', currentUser.role)

    // 检查权限 - 只有超级管理员可以管理角色
    if (currentUser.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取所有角色
    const allRoles = [
      ...systemRoles,
      ...Array.from(customRoles.values())
    ]

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_roles',
      'read',
      true,
      request,
      { roleCount: allRoles.length }
    )

    return NextResponse.json({
      success: true,
      data: {
        roles: allRoles,
        total: allRoles.length
      }
    })

  } catch (error) {
    console.error('Get roles error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 创建自定义角色
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

    if (!checker.hasPermission('admin:roles:write')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
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

    // 生成角色ID
    const roleId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 检查角色名是否已存在
    const existingRole = [...systemRoles, ...Array.from(customRoles.values())]
      .find(role => role.name === name)
    
    if (existingRole) {
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

    // 创建新角色
    const newRole: RoleDefinition = {
      id: roleId,
      name,
      description,
      permissions,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    customRoles.set(roleId, newRole)

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'role_create',
      'admin_roles',
      true,
      request,
      {
        roleId,
        roleName: name,
        permissions
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    }, { status: 201 })

  } catch (error) {
    console.error('Create role error:', error)
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
