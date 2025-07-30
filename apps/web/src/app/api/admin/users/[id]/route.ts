// 管理员单个用户管理API

import { NextRequest, NextResponse } from 'next/server'
import { UpdateUserRequest } from '@/types/user'
import { userOperations } from '@/data/users'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 获取单个用户详情
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

    if (!checker.hasPermission('admin:users:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取目标用户
    const targetUser = userOperations.getUserById(params.id)
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 数据隔离检查
    if (currentUser.role !== 'super_admin' && 
        currentUser.dealerId && 
        targetUser.dealerId !== currentUser.dealerId &&
        targetUser.id !== currentUser.id) {
      return NextResponse.json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    // 返回详细的用户信息
    const userDetail = {
      id: targetUser.id,
      email: targetUser.email,
      username: targetUser.username,
      profile: targetUser.profile,
      role: targetUser.role,
      permissions: targetUser.permissions,
      status: targetUser.status,
      emailVerified: targetUser.emailVerified,
      phoneVerified: targetUser.phoneVerified,
      phone: targetUser.phone,
      lastLoginAt: targetUser.lastLoginAt,
      lastActiveAt: targetUser.lastActiveAt,
      loginCount: targetUser.loginCount,
      failedLoginAttempts: targetUser.failedLoginAttempts,
      lockedUntil: targetUser.lockedUntil,
      dealerId: targetUser.dealerId,
      security: {
        twoFactorEnabled: targetUser.security.twoFactorEnabled,
        loginNotifications: targetUser.security.loginNotifications,
        sessionTimeout: targetUser.security.sessionTimeout,
        passwordLastChanged: targetUser.security.passwordLastChanged,
        trustedDevices: targetUser.security.trustedDevices
      },
      preferences: targetUser.preferences,
      metadata: targetUser.metadata,
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt
    }

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_user_detail',
      'read',
      true,
      request,
      { targetUserId: targetUser.id }
    )

    return NextResponse.json({
      success: true,
      data: userDetail
    })

  } catch (error) {
    console.error('Get admin user detail error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 更新用户信息
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

    if (!checker.hasPermission('admin:users:write')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取目标用户
    const targetUser = userOperations.getUserById(params.id)
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 数据隔离检查
    if (currentUser.role !== 'super_admin' && 
        currentUser.dealerId && 
        targetUser.dealerId !== currentUser.dealerId &&
        targetUser.id !== currentUser.id) {
      return NextResponse.json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    const body: UpdateUserRequest = await request.json()
    const updateData: any = {}

    // 处理基本信息更新
    if (body.profile) {
      updateData.profile = {
        ...targetUser.profile,
        ...body.profile
      }
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone
    }

    if (body.emailVerified !== undefined) {
      updateData.emailVerified = body.emailVerified
    }

    if (body.phoneVerified !== undefined) {
      updateData.phoneVerified = body.phoneVerified
    }

    // 处理角色和权限更新（需要更高权限）
    if (body.role && checker.hasPermission('admin:users:manage_roles')) {
      const { getEffectivePermissions } = await import('@/lib/auth/jwt')
      updateData.role = body.role
      updateData.permissions = getEffectivePermissions(body.role)
    }

    // 处理状态更新
    if (body.status && checker.hasPermission('admin:users:manage_status')) {
      updateData.status = body.status
    }

    // 处理经销商分配（仅超级管理员）
    if (body.dealerId !== undefined && currentUser.role === 'super_admin') {
      updateData.dealerId = body.dealerId
    }

    // 处理偏好设置
    if (body.preferences) {
      updateData.preferences = {
        ...targetUser.preferences,
        ...body.preferences
      }
    }

    // 处理安全设置
    if (body.security && checker.hasPermission('admin:users:manage_security')) {
      updateData.security = {
        ...targetUser.security,
        ...body.security
      }
    }

    // 处理管理员备注
    if (body.adminNotes !== undefined) {
      updateData.metadata = {
        ...targetUser.metadata,
        adminNotes: body.adminNotes,
        lastModifiedBy: currentUser.id,
        lastModifiedAt: new Date()
      }
    }

    // 更新用户
    const updatedUser = userOperations.updateUser(params.id, updateData)

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update user',
        error: 'UPDATE_FAILED'
      }, { status: 500 })
    }

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'user_update',
      'admin_users',
      true,
      request,
      {
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        changes: Object.keys(updateData)
      }
    )

    // 返回更新后的用户信息
    const safeUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      profile: updatedUser.profile,
      role: updatedUser.role,
      permissions: updatedUser.permissions,
      status: updatedUser.status,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      phone: updatedUser.phone,
      dealerId: updatedUser.dealerId,
      security: {
        twoFactorEnabled: updatedUser.security.twoFactorEnabled,
        loginNotifications: updatedUser.security.loginNotifications,
        sessionTimeout: updatedUser.security.sessionTimeout,
        passwordLastChanged: updatedUser.security.passwordLastChanged
      },
      preferences: updatedUser.preferences,
      metadata: updatedUser.metadata,
      updatedAt: updatedUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: safeUser
    })

  } catch (error) {
    console.error('Update admin user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 删除用户
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

    // 检查删除权限
    const context = createAccessContext(currentUser, { id: payload.sessionId }, request)
    const checker = new PermissionChecker(context)

    if (!checker.hasPermission('admin:users:delete')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取目标用户
    const targetUser = userOperations.getUserById(params.id)
    if (!targetUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 防止删除自己
    if (targetUser.id === currentUser.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete your own account',
        error: 'SELF_DELETE_FORBIDDEN'
      }, { status: 400 })
    }

    // 防止删除超级管理员（除非自己也是超级管理员）
    if (targetUser.role === 'super_admin' && currentUser.role !== 'super_admin') {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete super admin',
        error: 'SUPER_ADMIN_DELETE_FORBIDDEN'
      }, { status: 403 })
    }

    // 数据隔离检查
    if (currentUser.role !== 'super_admin' && 
        currentUser.dealerId && 
        targetUser.dealerId !== currentUser.dealerId) {
      return NextResponse.json({
        success: false,
        message: 'Access denied',
        error: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    // 删除用户
    const deleted = userOperations.deleteUser(params.id)

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete user',
        error: 'DELETE_FAILED'
      }, { status: 500 })
    }

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'user_delete',
      'admin_users',
      true,
      request,
      {
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        targetUserRole: targetUser.role
      }
    )

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete admin user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
