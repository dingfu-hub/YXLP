// 管理员用户统计API

import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/data/users'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 获取用户统计数据
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

    if (!checker.hasPermission('admin:users:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 获取所有用户
    let users = userOperations.getAllUsers()

    // 数据隔离：非超级管理员只能看到自己经销商的用户
    if (currentUser.role !== 'super_admin' && currentUser.dealerId) {
      users = users.filter(user => 
        user.dealerId === currentUser.dealerId || user.id === currentUser.id
      )
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 基础统计
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.status === 'active').length
    const inactiveUsers = users.filter(user => user.status === 'inactive').length
    const suspendedUsers = users.filter(user => user.status === 'suspended').length
    const pendingUsers = users.filter(user => user.status === 'pending_verification').length

    // 验证状态统计
    const emailVerifiedUsers = users.filter(user => user.emailVerified).length
    const phoneVerifiedUsers = users.filter(user => user.phoneVerified).length
    const twoFactorEnabledUsers = users.filter(user => user.security.twoFactorEnabled).length

    // 角色分布
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 经销商分布（仅超级管理员可见）
    const dealerDistribution = currentUser.role === 'super_admin' 
      ? users.reduce((acc, user) => {
          const dealerId = user.dealerId || 'no_dealer'
          acc[dealerId] = (acc[dealerId] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      : {}

    // 注册趋势（最近30天）
    const registrationTrend = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = users.filter(user => {
        const userDate = user.createdAt.toISOString().split('T')[0]
        return userDate === dateStr
      }).length
      registrationTrend.push({ date: dateStr, count })
    }

    // 活跃度统计
    const recentlyActive = users.filter(user => 
      user.lastActiveAt && user.lastActiveAt > sevenDaysAgo
    ).length

    const dailyActive = users.filter(user => 
      user.lastActiveAt && user.lastActiveAt > oneDayAgo
    ).length

    // 登录统计
    const totalLogins = users.reduce((sum, user) => sum + user.loginCount, 0)
    const averageLogins = totalUsers > 0 ? Math.round(totalLogins / totalUsers * 100) / 100 : 0

    // 安全统计
    const lockedUsers = users.filter(user => 
      user.lockedUntil && user.lockedUntil > now
    ).length

    const usersWithFailedAttempts = users.filter(user => 
      user.failedLoginAttempts > 0
    ).length

    // 最近注册用户
    const recentRegistrations = users
      .filter(user => user.createdAt > thirtyDaysAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.profile.displayName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }))

    // 最近活跃用户
    const recentlyActiveUsers = users
      .filter(user => user.lastActiveAt)
      .sort((a, b) => (b.lastActiveAt?.getTime() || 0) - (a.lastActiveAt?.getTime() || 0))
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.profile.displayName,
        role: user.role,
        lastActiveAt: user.lastActiveAt,
        loginCount: user.loginCount
      }))

    // 获取安全事件统计
    const securityStats = securityAuditLogger.getStats({
      start: thirtyDaysAgo,
      end: now
    })

    const stats = {
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        pendingUsers,
        emailVerifiedUsers,
        phoneVerifiedUsers,
        twoFactorEnabledUsers
      },
      distribution: {
        roles: roleDistribution,
        dealers: dealerDistribution
      },
      activity: {
        dailyActive,
        recentlyActive,
        totalLogins,
        averageLogins
      },
      security: {
        lockedUsers,
        usersWithFailedAttempts,
        securityEvents: securityStats.totalEvents,
        criticalEvents: securityStats.criticalEvents
      },
      trends: {
        registrations: registrationTrend
      },
      recent: {
        registrations: recentRegistrations,
        activeUsers: recentlyActiveUsers
      }
    }

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_user_stats',
      'read',
      true,
      request,
      { statsGenerated: true }
    )

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 获取用户活动分析
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

    if (!checker.hasPermission('admin:analytics:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    const body = await request.json()
    const { startDate, endDate, groupBy = 'day' } = body

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // 获取用户数据
    let users = userOperations.getAllUsers()

    // 数据隔离
    if (currentUser.role !== 'super_admin' && currentUser.dealerId) {
      users = users.filter(user => 
        user.dealerId === currentUser.dealerId || user.id === currentUser.id
      )
    }

    // 获取审计日志
    const auditLogs = securityAuditLogger.getAuditLogs({
      startDate: start,
      endDate: end
    })

    // 分析用户活动
    const activityAnalysis = {
      userGrowth: [],
      loginActivity: [],
      roleChanges: [],
      securityEvents: []
    }

    // 用户增长分析
    const timeGroups = generateTimeGroups(start, end, groupBy)
    
    for (const timeGroup of timeGroups) {
      const newUsers = users.filter(user => 
        user.createdAt >= timeGroup.start && user.createdAt < timeGroup.end
      ).length

      activityAnalysis.userGrowth.push({
        period: timeGroup.label,
        newUsers,
        totalUsers: users.filter(user => user.createdAt < timeGroup.end).length
      })
    }

    // 登录活动分析
    const loginLogs = auditLogs.filter(log => log.action === 'user_login')
    
    for (const timeGroup of timeGroups) {
      const logins = loginLogs.filter(log => 
        log.timestamp >= timeGroup.start && log.timestamp < timeGroup.end
      )

      const uniqueUsers = new Set(logins.map(log => log.userId)).size
      
      activityAnalysis.loginActivity.push({
        period: timeGroup.label,
        totalLogins: logins.length,
        uniqueUsers,
        successfulLogins: logins.filter(log => log.result === 'success').length,
        failedLogins: logins.filter(log => log.result === 'failure').length
      })
    }

    return NextResponse.json({
      success: true,
      data: activityAnalysis
    })

  } catch (error) {
    console.error('Get user activity analysis error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 生成时间分组
function generateTimeGroups(start: Date, end: Date, groupBy: string) {
  const groups = []
  const current = new Date(start)

  while (current < end) {
    const groupStart = new Date(current)
    let groupEnd: Date
    let label: string

    switch (groupBy) {
      case 'hour':
        groupEnd = new Date(current.getTime() + 60 * 60 * 1000)
        label = current.toISOString().substring(0, 13) + ':00'
        break
      case 'day':
        groupEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000)
        label = current.toISOString().split('T')[0]
        break
      case 'week':
        groupEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000)
        label = `Week of ${current.toISOString().split('T')[0]}`
        break
      case 'month':
        groupEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1)
        label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
        break
      default:
        groupEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000)
        label = current.toISOString().split('T')[0]
    }

    groups.push({
      start: groupStart,
      end: groupEnd,
      label
    })

    current.setTime(groupEnd.getTime())
  }

  return groups
}
