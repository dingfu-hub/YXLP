// 管理员安全事件管理API

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { userOperations } from '@/data/users'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 获取安全事件列表
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

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId') || undefined
    const type = searchParams.get('type') as any || undefined
    const severity = searchParams.get('severity') || undefined
    const resolved = searchParams.get('resolved') === 'true' ? true : 
                    searchParams.get('resolved') === 'false' ? false : undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    // 获取安全事件
    const securityEvents = securityAuditLogger.getSecurityEvents({
      userId,
      type,
      severity,
      resolved,
      startDate,
      endDate,
      limit: limit * page
    })

    // 分页处理
    const total = securityEvents.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedEvents = securityEvents.slice(startIndex, startIndex + limit)

    // 获取用户信息映射
    const userIds = [...new Set(paginatedEvents.map(event => event.userId).filter(Boolean))]
    const users = userIds.map(id => userOperations.getUserById(id)).filter(Boolean)
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = {
        username: user.username,
        email: user.email,
        displayName: user.profile.displayName
      }
      return acc
    }, {} as Record<string, any>)

    // 增强事件信息
    const enhancedEvents = paginatedEvents.map(event => ({
      ...event,
      user: userMap[event.userId] || null
    }))

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_security_events',
      'read',
      true,
      request,
      { 
        filters: { userId, type, severity, resolved, startDate, endDate },
        resultCount: enhancedEvents.length 
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        events: enhancedEvents,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    })

  } catch (error) {
    console.error('Get security events error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 批量处理安全事件
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

    if (!checker.hasPermission('admin:audit:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    const body = await request.json()
    const { action, eventIds, resolution } = body

    if (!action || !Array.isArray(eventIds)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request format',
        error: 'INVALID_REQUEST'
      }, { status: 400 })
    }

    const results: Array<{ eventId: string; success: boolean; error?: string }> = []

    // 处理每个事件
    for (const eventId of eventIds) {
      try {
        if (action === 'resolve') {
          const resolved = securityAuditLogger.resolveSecurityEvent(
            eventId,
            currentUser.id,
            resolution
          )
          results.push({ eventId, success: resolved })
        } else {
          results.push({ eventId, success: false, error: 'Invalid action' })
        }
      } catch (error) {
        results.push({ eventId, success: false, error: 'Processing failed' })
      }
    }

    // 记录批量操作
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      `security_events_batch_${action}`,
      'admin_security_events',
      successCount > 0,
      request,
      {
        action,
        targetEventIds: eventIds,
        successCount,
        failureCount,
        resolution,
        results
      }
    )

    return NextResponse.json({
      success: true,
      message: `Batch ${action} completed`,
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
    console.error('Batch security events operation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
