// 管理员安全审计API

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { userOperations } from '@/data/users'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 获取审计日志
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') || undefined
    const resource = searchParams.get('resource') || undefined
    const result = searchParams.get('result') || undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    // 获取审计日志
    const auditLogs = securityAuditLogger.getAuditLogs({
      userId,
      action,
      resource,
      result,
      startDate,
      endDate,
      limit: limit * page
    })

    // 分页处理
    const total = auditLogs.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedLogs = auditLogs.slice(startIndex, startIndex + limit)

    // 获取用户信息映射
    const userIds = [...new Set(paginatedLogs.map(log => log.userId).filter(Boolean))]
    const users = userIds.map(id => userOperations.getUserById(id!)).filter(Boolean)
    const userMap = users.reduce((acc, user) => {
      acc[user.id] = {
        username: user.username,
        email: user.email,
        displayName: user.profile.displayName
      }
      return acc
    }, {} as Record<string, any>)

    // 增强日志信息
    const enhancedLogs = paginatedLogs.map(log => ({
      ...log,
      user: log.userId ? userMap[log.userId] : null
    }))

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_audit_logs',
      'read',
      true,
      request,
      { 
        filters: { userId, action, resource, result, startDate, endDate },
        resultCount: enhancedLogs.length 
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        logs: enhancedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    })

  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 获取审计统计
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
    const { startDate, endDate } = body

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // 获取统计数据
    const stats = securityAuditLogger.getStats({ start, end })

    // 获取安全事件
    const securityEvents = securityAuditLogger.getSecurityEvents({
      startDate: start,
      endDate: end,
      limit: 100
    })

    // 分析安全事件
    const eventsByType = securityEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventsBySeverity = securityEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 获取最近的高危事件
    const criticalEvents = securityEvents
      .filter(event => event.severity === 'critical' || event.severity === 'high')
      .slice(0, 10)
      .map(event => {
        const user = event.userId ? userOperations.getUserById(event.userId) : null
        return {
          ...event,
          user: user ? {
            username: user.username,
            email: user.email,
            displayName: user.profile.displayName
          } : null
        }
      })

    const auditStats = {
      overview: {
        totalLogs: stats.totalLogs,
        successfulActions: stats.successfulActions,
        failedActions: stats.failedActions,
        blockedActions: stats.blockedActions,
        totalEvents: stats.totalEvents,
        unresolvedEvents: stats.unresolvedEvents,
        criticalEvents: stats.criticalEvents,
        highSeverityEvents: stats.highSeverityEvents
      },
      trends: {
        topActions: stats.topActions,
        topUsers: stats.topUsers,
        topIPs: stats.topIPs
      },
      security: {
        eventsByType,
        eventsBySeverity,
        recentCriticalEvents: criticalEvents
      },
      timeRange: {
        start,
        end
      }
    }

    return NextResponse.json({
      success: true,
      data: auditStats
    })

  } catch (error) {
    console.error('Get audit stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
