// 管理员用户数据
import { AdminUser, UserRole, getRolePermissions } from '@/types/admin'

// 模拟管理员用户数据
export const adminUsers: AdminUser[] = [
  {
    id: '0',
    username: 'admin',
    name: '系统管理员',
    role: UserRole.SUPER_ADMIN,
    permissions: getRolePermissions(UserRole.SUPER_ADMIN),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastLoginAt: new Date('2024-03-15T10:30:00'),
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
    updatedAt: new Date('2024-03-15T10:30:00')
  },
  {
    id: '1',
    username: 'superadmin',
    name: '超级管理员',
    role: UserRole.SUPER_ADMIN,
    permissions: getRolePermissions(UserRole.SUPER_ADMIN),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastLoginAt: new Date('2024-03-15T10:30:00'),
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00'),
    updatedAt: new Date('2024-03-15T10:30:00')
  },
  {
    id: '2',
    username: 'admin01',
    name: '管理员01',
    role: UserRole.ADMIN,
    permissions: getRolePermissions(UserRole.ADMIN),
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    lastLoginAt: new Date('2024-03-14T16:45:00'),
    isActive: true,
    createdAt: new Date('2024-01-15T00:00:00'),
    updatedAt: new Date('2024-03-14T16:45:00')
  },
  {
    id: '3',
    username: 'admin02',
    name: '管理员02',
    role: UserRole.ADMIN,
    permissions: getRolePermissions(UserRole.ADMIN),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastLoginAt: new Date('2024-03-15T09:15:00'),
    isActive: true,
    createdAt: new Date('2024-02-01T00:00:00'),
    updatedAt: new Date('2024-03-15T09:15:00')
  }
]

// 模拟密码数据 (实际应用中应该加密存储)
export const adminPasswords: Record<string, string> = {
  'admin': 'Admin123!',
  'superadmin': 'Admin123456!',
  'admin01': 'Admin123456!',
  'admin02': 'Admin123456!'
}

// 根据用户名查找管理员
export function findAdminByUsername(username: string): AdminUser | undefined {
  return adminUsers.find(user => user.username === username && user.isActive)
}

// 验证管理员密码
export function validateAdminPassword(username: string, password: string): boolean {
  return adminPasswords[username] === password
}

// 根据ID查找管理员
export function findAdminById(id: string): AdminUser | undefined {
  return adminUsers.find(user => user.id === id && user.isActive)
}

// 更新管理员最后登录时间
export function updateLastLoginTime(userId: string): void {
  const user = adminUsers.find(u => u.id === userId)
  if (user) {
    user.lastLoginAt = new Date()
    user.updatedAt = new Date()
  }
}

// 生成JWT token的payload
export function generateTokenPayload(user: AdminUser) {
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions
  }
}
