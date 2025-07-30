// RBAC (Role-Based Access Control) 权限控制系统

import { Role, Permission, PermissionCondition, AccessContext } from '@/types/auth'
import { UserRole } from '@/types/user'

// 权限定义
export const permissions: Permission[] = [
  // 用户管理权限
  {
    id: 'users:read',
    name: 'Read Users',
    description: '查看用户信息',
    resource: 'users',
    action: 'read'
  },
  {
    id: 'users:write',
    name: 'Write Users',
    description: '创建和编辑用户',
    resource: 'users',
    action: 'write'
  },
  {
    id: 'users:delete',
    name: 'Delete Users',
    description: '删除用户',
    resource: 'users',
    action: 'delete'
  },
  
  // 商品管理权限
  {
    id: 'products:read',
    name: 'Read Products',
    description: '查看商品信息',
    resource: 'products',
    action: 'read'
  },
  {
    id: 'products:write',
    name: 'Write Products',
    description: '创建和编辑商品',
    resource: 'products',
    action: 'write'
  },
  {
    id: 'products:delete',
    name: 'Delete Products',
    description: '删除商品',
    resource: 'products',
    action: 'delete'
  },
  
  // 订单管理权限
  {
    id: 'orders:read',
    name: 'Read Orders',
    description: '查看订单信息',
    resource: 'orders',
    action: 'read'
  },
  {
    id: 'orders:write',
    name: 'Write Orders',
    description: '创建和编辑订单',
    resource: 'orders',
    action: 'write'
  },
  {
    id: 'orders:delete',
    name: 'Delete Orders',
    description: '删除订单',
    resource: 'orders',
    action: 'delete'
  },
  
  // 数据分析权限
  {
    id: 'analytics:read',
    name: 'Read Analytics',
    description: '查看数据分析',
    resource: 'analytics',
    action: 'read'
  },
  {
    id: 'analytics:write',
    name: 'Write Analytics',
    description: '配置数据分析',
    resource: 'analytics',
    action: 'write'
  },
  
  // 系统管理权限
  {
    id: 'system:read',
    name: 'Read System',
    description: '查看系统信息',
    resource: 'system',
    action: 'read'
  },
  {
    id: 'system:write',
    name: 'Write System',
    description: '修改系统设置',
    resource: 'system',
    action: 'write'
  },
  {
    id: 'system:config',
    name: 'Configure System',
    description: '系统配置管理',
    resource: 'system',
    action: 'config'
  },
  
  // 个人资料权限
  {
    id: 'profile:read',
    name: 'Read Profile',
    description: '查看个人资料',
    resource: 'profile',
    action: 'read'
  },
  {
    id: 'profile:write',
    name: 'Write Profile',
    description: '编辑个人资料',
    resource: 'profile',
    action: 'write'
  }
]

// 角色定义
export const roles: Role[] = [
  {
    id: 'super_admin',
    name: UserRole.SUPER_ADMIN,
    displayName: '超级管理员',
    description: '拥有系统所有权限的超级管理员',
    level: 100,
    permissions: permissions, // 拥有所有权限
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dealer_admin',
    name: UserRole.DEALER_ADMIN,
    displayName: '经销商管理员',
    description: '经销商管理员，可以管理自己的业务',
    level: 80,
    permissions: permissions.filter(p => 
      ['users:read', 'users:write', 'products:read', 'products:write', 
       'orders:read', 'orders:write', 'analytics:read', 'profile:read', 'profile:write'].includes(p.id)
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dealer_staff',
    name: UserRole.DEALER_STAFF,
    displayName: '经销商员工',
    description: '经销商员工，有限的业务权限',
    level: 60,
    permissions: permissions.filter(p => 
      ['products:read', 'orders:read', 'orders:write', 'profile:read', 'profile:write'].includes(p.id)
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'end_user',
    name: UserRole.END_USER,
    displayName: '终端用户',
    description: '终端消费者，基本的购买权限',
    level: 40,
    permissions: permissions.filter(p => 
      ['products:read', 'orders:read', 'orders:write', 'profile:read', 'profile:write'].includes(p.id)
    ),
    isSystem: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

// 权限检查器类
export class PermissionChecker {
  private userRole: UserRole
  private userPermissions: string[]
  private context: AccessContext

  constructor(context: AccessContext) {
    this.userRole = context.user.role
    this.userPermissions = context.permissions.map(p => p.id)
    this.context = context
  }

  // 检查是否有特定权限
  hasPermission(permissionId: string): boolean {
    // 超级管理员拥有所有权限
    if (this.userRole === UserRole.SUPER_ADMIN) {
      return true
    }

    return this.userPermissions.includes(permissionId)
  }

  // 检查是否有资源访问权限
  canAccess(resource: string, action: string, conditions?: Record<string, any>): boolean {
    const permissionId = `${resource}:${action}`
    
    if (!this.hasPermission(permissionId)) {
      return false
    }

    // 检查条件约束
    if (conditions) {
      return this.checkConditions(resource, action, conditions)
    }

    return true
  }

  // 检查条件约束
  private checkConditions(resource: string, action: string, conditions: Record<string, any>): boolean {
    // 经销商数据隔离
    if (this.userRole === UserRole.DEALER_ADMIN || this.userRole === UserRole.DEALER_STAFF) {
      if (conditions.dealerId && this.context.user.dealerId !== conditions.dealerId) {
        return false
      }
    }

    // 用户只能访问自己的数据
    if (resource === 'profile' || resource === 'orders') {
      if (conditions.userId && this.context.user.id !== conditions.userId) {
        // 除非是管理员或有特殊权限
        if (this.userRole !== UserRole.SUPER_ADMIN && 
            this.userRole !== UserRole.DEALER_ADMIN) {
          return false
        }
      }
    }

    // 员工权限限制
    if (this.userRole === UserRole.DEALER_STAFF) {
      const restrictedActions = ['delete', 'admin', 'config']
      if (restrictedActions.includes(action)) {
        return false
      }
    }

    return true
  }

  // 获取用户可访问的资源列表
  getAccessibleResources(): string[] {
    const resources = new Set<string>()
    
    this.userPermissions.forEach(permissionId => {
      const [resource] = permissionId.split(':')
      resources.add(resource)
    })

    return Array.from(resources)
  }

  // 获取用户对特定资源的可执行操作
  getResourceActions(resource: string): string[] {
    const actions: string[] = []
    
    this.userPermissions.forEach(permissionId => {
      const [res, action] = permissionId.split(':')
      if (res === resource) {
        actions.push(action)
      }
    })

    return actions
  }

  // 检查是否是资源所有者
  isResourceOwner(resource: string, resourceData: Record<string, any>): boolean {
    // 用户自己的资料
    if (resource === 'profile' && resourceData.userId === this.context.user.id) {
      return true
    }

    // 用户自己的订单
    if (resource === 'orders' && resourceData.userId === this.context.user.id) {
      return true
    }

    // 经销商的数据
    if (this.context.user.dealerId && resourceData.dealerId === this.context.user.dealerId) {
      return true
    }

    return false
  }
}

// 权限装饰器工厂
export function requirePermission(permissionId: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const context = this.getAccessContext?.() || args[0]?.context
      
      if (!context) {
        throw new Error('Access context not available')
      }

      const checker = new PermissionChecker(context)
      
      if (!checker.hasPermission(permissionId)) {
        throw new Error(`Permission denied: ${permissionId}`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 角色装饰器工厂
export function requireRole(...allowedRoles: UserRole[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const context = this.getAccessContext?.() || args[0]?.context
      
      if (!context) {
        throw new Error('Access context not available')
      }

      if (!allowedRoles.includes(context.user.role)) {
        throw new Error(`Role not allowed: ${context.user.role}`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 工具函数
export function getRoleByName(roleName: UserRole): Role | undefined {
  return roles.find(role => role.name === roleName)
}

export function getPermissionById(permissionId: string): Permission | undefined {
  return permissions.find(permission => permission.id === permissionId)
}

export function getUserPermissions(userRole: UserRole): Permission[] {
  const role = getRoleByName(userRole)
  return role?.permissions || []
}

export function hasRolePermission(userRole: UserRole, permissionId: string): boolean {
  const userPermissions = getUserPermissions(userRole)
  return userPermissions.some(permission => permission.id === permissionId)
}

// 权限继承检查
export function isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
  const roleLevel1 = getRoleByName(role1)?.level || 0
  const roleLevel2 = getRoleByName(role2)?.level || 0
  return roleLevel1 > roleLevel2
}

// 创建访问上下文
export function createAccessContext(
  user: any,
  session: any,
  request: any
): AccessContext {
  const userPermissions = getUserPermissions(user.role)
  
  return {
    user,
    session,
    permissions: userPermissions,
    ipAddress: request.ip || request.connection?.remoteAddress || 'unknown',
    userAgent: request.headers?.['user-agent'] || 'unknown',
    timestamp: new Date()
  }
}

// 权限验证中间件
export function createPermissionMiddleware(requiredPermission: string) {
  return (context: AccessContext) => {
    const checker = new PermissionChecker(context)
    
    if (!checker.hasPermission(requiredPermission)) {
      throw new Error(`Insufficient permissions: ${requiredPermission}`)
    }
    
    return true
  }
}

// 批量权限检查
export function checkMultiplePermissions(
  context: AccessContext,
  permissions: string[],
  requireAll: boolean = true
): boolean {
  const checker = new PermissionChecker(context)
  
  if (requireAll) {
    return permissions.every(permission => checker.hasPermission(permission))
  } else {
    return permissions.some(permission => checker.hasPermission(permission))
  }
}
