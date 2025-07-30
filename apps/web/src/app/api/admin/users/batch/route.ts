// 管理员用户批量操作API

import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/data/users'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { securityAuditLogger } from '@/lib/security/audit-logger'

interface BatchOperationRequest {
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'export' | 'unlock'
  userIds: string[]
  reason?: string
}

// 批量操作用户
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

    const body: BatchOperationRequest = await request.json()

    if (!body.action || !body.userIds || !Array.isArray(body.userIds)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        error: 'INVALID_REQUEST'
      }, { status: 400 })
    }

    // 检查操作权限
    const requiredPermissions: Record<string, string> = {
      'activate': 'admin:users:manage_status',
      'deactivate': 'admin:users:manage_status',
      'suspend': 'admin:users:manage_status',
      'delete': 'admin:users:delete',
      'export': 'admin:users:export',
      'unlock': 'admin:users:manage_status'
    }

    const requiredPermission = requiredPermissions[body.action]
    if (!requiredPermission || !checker.hasPermission(requiredPermission)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取目标用户
    const targetUsers = body.userIds.map(id => userOperations.getUserById(id)).filter(Boolean)
    
    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No valid users found',
        error: 'NO_USERS_FOUND'
      }, { status: 404 })
    }

    // 数据隔离检查
    const accessibleUsers = targetUsers.filter(user => {
      if (currentUser.role === 'super_admin') return true
      if (!currentUser.dealerId) return false
      return user.dealerId === currentUser.dealerId || user.id === currentUser.id
    })

    if (accessibleUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No accessible users found',
        error: 'ACCESS_DENIED'
      }, { status: 403 })
    }

    const results: Array<{ userId: string; success: boolean; error?: string }> = []

    // 执行批量操作
    switch (body.action) {
      case 'activate':
        for (const user of accessibleUsers) {
          try {
            userOperations.updateUser(user.id, { status: 'active' })
            results.push({ userId: user.id, success: true })
          } catch (error) {
            results.push({ userId: user.id, success: false, error: 'Update failed' })
          }
        }
        break

      case 'deactivate':
        for (const user of accessibleUsers) {
          try {
            if (user.id === currentUser.id) {
              results.push({ userId: user.id, success: false, error: 'Cannot deactivate self' })
              continue
            }
            userOperations.updateUser(user.id, { status: 'inactive' })
            results.push({ userId: user.id, success: true })
          } catch (error) {
            results.push({ userId: user.id, success: false, error: 'Update failed' })
          }
        }
        break

      case 'suspend':
        for (const user of accessibleUsers) {
          try {
            if (user.id === currentUser.id) {
              results.push({ userId: user.id, success: false, error: 'Cannot suspend self' })
              continue
            }
            if (user.role === 'super_admin' && currentUser.role !== 'super_admin') {
              results.push({ userId: user.id, success: false, error: 'Cannot suspend super admin' })
              continue
            }
            userOperations.updateUser(user.id, { status: 'suspended' })
            results.push({ userId: user.id, success: true })
          } catch (error) {
            results.push({ userId: user.id, success: false, error: 'Update failed' })
          }
        }
        break

      case 'unlock':
        for (const user of accessibleUsers) {
          try {
            userOperations.updateUser(user.id, { 
              lockedUntil: null,
              failedLoginAttempts: 0
            })
            results.push({ userId: user.id, success: true })
          } catch (error) {
            results.push({ userId: user.id, success: false, error: 'Update failed' })
          }
        }
        break

      case 'delete':
        for (const user of accessibleUsers) {
          try {
            if (user.id === currentUser.id) {
              results.push({ userId: user.id, success: false, error: 'Cannot delete self' })
              continue
            }
            if (user.role === 'super_admin' && currentUser.role !== 'super_admin') {
              results.push({ userId: user.id, success: false, error: 'Cannot delete super admin' })
              continue
            }
            const deleted = userOperations.deleteUser(user.id)
            results.push({ userId: user.id, success: deleted })
          } catch (error) {
            results.push({ userId: user.id, success: false, error: 'Delete failed' })
          }
        }
        break

      case 'export':
        // 导出用户数据
        const exportData = accessibleUsers.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: user.profile.displayName,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          lastLoginAt: user.lastLoginAt,
          loginCount: user.loginCount,
          dealerId: user.dealerId,
          createdAt: user.createdAt
        }))

        // 记录导出操作
        securityAuditLogger.logSensitiveOperation(
          currentUser.id,
          'users_export',
          'admin_users',
          true,
          request,
          {
            exportedUserCount: exportData.length,
            exportedUserIds: exportData.map(u => u.id)
          }
        )

        return NextResponse.json({
          success: true,
          message: 'Export completed',
          data: {
            users: exportData,
            exportedAt: new Date(),
            exportedBy: currentUser.id
          }
        })

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action',
          error: 'INVALID_ACTION'
        }, { status: 400 })
    }

    // 记录批量操作
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      `users_batch_${body.action}`,
      'admin_users',
      successCount > 0,
      request,
      {
        action: body.action,
        targetUserIds: body.userIds,
        successCount,
        failureCount,
        reason: body.reason,
        results
      }
    )

    return NextResponse.json({
      success: true,
      message: `Batch ${body.action} completed`,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      }
    })

  } catch (error) {
    console.error('Batch operation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 获取批量操作历史
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

    if (!checker.hasPermission('admin:audit:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取批量操作历史
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    const auditLogs = securityAuditLogger.getAuditLogs({
      action: 'users_batch_',
      startDate,
      endDate,
      limit: limit * page
    })

    // 筛选批量操作日志
    const batchLogs = auditLogs.filter(log => 
      log.action.startsWith('users_batch_')
    ).slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      success: true,
      data: {
        logs: batchLogs,
        pagination: {
          page,
          limit,
          total: batchLogs.length
        }
      }
    })

  } catch (error) {
    console.error('Get batch operation history error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
