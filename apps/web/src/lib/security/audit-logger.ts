// 安全审计日志系统

import { SecurityAuditLog, SecurityEvent, SecurityEventType, RiskLevel, GeoLocation } from '@/types/security'

// 审计日志存储（生产环境应使用数据库）
const auditLogs = new Map<string, SecurityAuditLog>()
const securityEvents = new Map<string, SecurityEvent>()

// 安全审计日志记录器
export class SecurityAuditLogger {
  private logBuffer: SecurityAuditLog[] = []
  private eventBuffer: SecurityEvent[] = []
  private batchSize = 100
  private flushInterval = 5000 // 5秒

  constructor() {
    // 定期刷新缓冲区
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  // 记录审计日志
  log(
    userId: string | undefined,
    action: string,
    resource: string,
    result: 'success' | 'failure' | 'blocked',
    metadata: Record<string, any> = {},
    request?: any
  ): SecurityAuditLog {
    const log: SecurityAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId: metadata.sessionId,
      action,
      resource,
      result,
      riskLevel: this.calculateRiskLevel(action, result, metadata),
      ipAddress: this.extractIP(request),
      userAgent: this.extractUserAgent(request),
      location: metadata.location,
      metadata,
      timestamp: new Date()
    }

    this.logBuffer.push(log)
    
    // 如果缓冲区满了，立即刷新
    if (this.logBuffer.length >= this.batchSize) {
      this.flush()
    }

    return log
  }

  // 记录安全事件
  logSecurityEvent(
    userId: string,
    type: SecurityEventType,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata: Record<string, any> = {},
    request?: any
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      description,
      severity,
      ipAddress: this.extractIP(request),
      userAgent: this.extractUserAgent(request),
      location: metadata.location,
      metadata,
      resolved: false,
      createdAt: new Date()
    }

    this.eventBuffer.push(event)
    
    // 高危事件立即处理
    if (severity === 'critical' || severity === 'high') {
      this.handleCriticalEvent(event)
    }

    return event
  }

  // 记录登录事件
  logLogin(
    userId: string,
    success: boolean,
    reason?: string,
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    const action = 'user_login'
    const result = success ? 'success' : 'failure'
    
    const log = this.log(userId, action, 'authentication', result, {
      ...metadata,
      failureReason: reason
    }, request)

    // 如果登录失败，记录安全事件
    if (!success) {
      this.logSecurityEvent(
        userId,
        SecurityEventType.MULTIPLE_FAILED_LOGINS,
        `Failed login attempt: ${reason}`,
        'medium',
        metadata,
        request
      )
    }

    return log
  }

  // 记录权限检查
  logPermissionCheck(
    userId: string,
    resource: string,
    action: string,
    allowed: boolean,
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    return this.log(
      userId,
      `permission_check:${action}`,
      resource,
      allowed ? 'success' : 'blocked',
      metadata,
      request
    )
  }

  // 记录数据访问
  logDataAccess(
    userId: string,
    resource: string,
    action: 'read' | 'write' | 'delete',
    success: boolean,
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    return this.log(
      userId,
      `data_${action}`,
      resource,
      success ? 'success' : 'failure',
      metadata,
      request
    )
  }

  // 记录敏感操作
  logSensitiveOperation(
    userId: string,
    operation: string,
    resource: string,
    success: boolean,
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    const log = this.log(
      userId,
      operation,
      resource,
      success ? 'success' : 'failure',
      { ...metadata, sensitive: true },
      request
    )

    // 敏感操作总是记录安全事件
    this.logSecurityEvent(
      userId,
      SecurityEventType.DATA_EXPORT,
      `Sensitive operation: ${operation} on ${resource}`,
      'high',
      metadata,
      request
    )

    return log
  }

  // 记录密码变更
  logPasswordChange(
    userId: string,
    success: boolean,
    method: 'self' | 'admin' | 'reset',
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    const log = this.log(
      userId,
      'password_change',
      'user_account',
      success ? 'success' : 'failure',
      { ...metadata, method },
      request
    )

    if (success) {
      this.logSecurityEvent(
        userId,
        SecurityEventType.PASSWORD_CHANGED,
        `Password changed via ${method}`,
        'medium',
        metadata,
        request
      )
    }

    return log
  }

  // 记录账户锁定
  logAccountLock(
    userId: string,
    reason: string,
    request?: any,
    metadata: Record<string, any> = {}
  ): SecurityAuditLog {
    const log = this.log(
      userId,
      'account_lock',
      'user_account',
      'success',
      { ...metadata, reason },
      request
    )

    this.logSecurityEvent(
      userId,
      SecurityEventType.ACCOUNT_LOCKED,
      `Account locked: ${reason}`,
      'high',
      metadata,
      request
    )

    return log
  }

  // 刷新缓冲区
  private flush(): void {
    // 保存审计日志
    for (const log of this.logBuffer) {
      auditLogs.set(log.id, log)
    }

    // 保存安全事件
    for (const event of this.eventBuffer) {
      securityEvents.set(event.id, event)
    }

    // 清空缓冲区
    this.logBuffer = []
    this.eventBuffer = []
  }

  // 处理关键事件
  private handleCriticalEvent(event: SecurityEvent): void {
    console.error('CRITICAL SECURITY EVENT:', event)
    
    // 这里可以添加更多处理逻辑：
    // - 发送告警邮件
    // - 触发自动响应
    // - 通知安全团队
    // - 自动阻止用户或IP
  }

  // 计算风险等级
  private calculateRiskLevel(
    action: string,
    result: string,
    metadata: Record<string, any>
  ): RiskLevel {
    // 失败的操作风险更高
    if (result === 'failure' || result === 'blocked') {
      return RiskLevel.MEDIUM
    }

    // 敏感操作风险较高
    if (metadata.sensitive || action.includes('delete') || action.includes('admin')) {
      return RiskLevel.HIGH
    }

    // 权限相关操作
    if (action.includes('permission') || action.includes('role')) {
      return RiskLevel.MEDIUM
    }

    return RiskLevel.LOW
  }

  // 提取IP地址
  private extractIP(request?: any): string {
    if (!request) return 'unknown'
    
    return request.headers?.['x-forwarded-for'] ||
           request.headers?.['x-real-ip'] ||
           request.connection?.remoteAddress ||
           request.ip ||
           'unknown'
  }

  // 提取User-Agent
  private extractUserAgent(request?: any): string {
    if (!request) return 'unknown'
    
    return request.headers?.['user-agent'] || 'unknown'
  }

  // 获取审计日志
  getAuditLogs(
    filters: {
      userId?: string
      action?: string
      resource?: string
      result?: string
      startDate?: Date
      endDate?: Date
      limit?: number
    } = {}
  ): SecurityAuditLog[] {
    let logs = Array.from(auditLogs.values())

    // 应用过滤器
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId)
    }
    if (filters.action) {
      logs = logs.filter(log => log.action.includes(filters.action))
    }
    if (filters.resource) {
      logs = logs.filter(log => log.resource === filters.resource)
    }
    if (filters.result) {
      logs = logs.filter(log => log.result === filters.result)
    }
    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!)
    }
    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!)
    }

    // 按时间倒序排列
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // 限制数量
    if (filters.limit) {
      logs = logs.slice(0, filters.limit)
    }

    return logs
  }

  // 获取安全事件
  getSecurityEvents(
    filters: {
      userId?: string
      type?: SecurityEventType
      severity?: string
      resolved?: boolean
      startDate?: Date
      endDate?: Date
      limit?: number
    } = {}
  ): SecurityEvent[] {
    let events = Array.from(securityEvents.values())

    // 应用过滤器
    if (filters.userId) {
      events = events.filter(event => event.userId === filters.userId)
    }
    if (filters.type) {
      events = events.filter(event => event.type === filters.type)
    }
    if (filters.severity) {
      events = events.filter(event => event.severity === filters.severity)
    }
    if (filters.resolved !== undefined) {
      events = events.filter(event => event.resolved === filters.resolved)
    }
    if (filters.startDate) {
      events = events.filter(event => event.createdAt >= filters.startDate!)
    }
    if (filters.endDate) {
      events = events.filter(event => event.createdAt <= filters.endDate!)
    }

    // 按时间倒序排列
    events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // 限制数量
    if (filters.limit) {
      events = events.slice(0, filters.limit)
    }

    return events
  }

  // 解决安全事件
  resolveSecurityEvent(
    eventId: string,
    resolvedBy: string,
    resolution?: string
  ): boolean {
    const event = securityEvents.get(eventId)
    if (event) {
      event.resolved = true
      event.resolvedAt = new Date()
      event.resolvedBy = resolvedBy
      if (resolution) {
        event.metadata.resolution = resolution
      }
      return true
    }
    return false
  }

  // 获取统计信息
  getStats(timeRange: { start: Date; end: Date }): Record<string, any> {
    const logs = this.getAuditLogs({
      startDate: timeRange.start,
      endDate: timeRange.end
    })

    const events = this.getSecurityEvents({
      startDate: timeRange.start,
      endDate: timeRange.end
    })

    return {
      totalLogs: logs.length,
      successfulActions: logs.filter(log => log.result === 'success').length,
      failedActions: logs.filter(log => log.result === 'failure').length,
      blockedActions: logs.filter(log => log.result === 'blocked').length,
      totalEvents: events.length,
      unresolvedEvents: events.filter(event => !event.resolved).length,
      criticalEvents: events.filter(event => event.severity === 'critical').length,
      highSeverityEvents: events.filter(event => event.severity === 'high').length,
      topActions: this.getTopActions(logs),
      topUsers: this.getTopUsers(logs),
      topIPs: this.getTopIPs(logs)
    }
  }

  // 获取最常见的操作
  private getTopActions(logs: SecurityAuditLog[]): Array<{ action: string; count: number }> {
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  // 获取最活跃的用户
  private getTopUsers(logs: SecurityAuditLog[]): Array<{ userId: string; count: number }> {
    const userCounts = logs.reduce((acc, log) => {
      if (log.userId) {
        acc[log.userId] = (acc[log.userId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  // 获取最活跃的IP
  private getTopIPs(logs: SecurityAuditLog[]): Array<{ ip: string; count: number }> {
    const ipCounts = logs.reduce((acc, log) => {
      acc[log.ipAddress] = (acc[log.ipAddress] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}

// 创建全局审计日志记录器实例
export const securityAuditLogger = new SecurityAuditLogger()

// 便捷函数
export const logLogin = securityAuditLogger.logLogin.bind(securityAuditLogger)
export const logPermissionCheck = securityAuditLogger.logPermissionCheck.bind(securityAuditLogger)
export const logDataAccess = securityAuditLogger.logDataAccess.bind(securityAuditLogger)
export const logSensitiveOperation = securityAuditLogger.logSensitiveOperation.bind(securityAuditLogger)
export const logPasswordChange = securityAuditLogger.logPasswordChange.bind(securityAuditLogger)
export const logAccountLock = securityAuditLogger.logAccountLock.bind(securityAuditLogger)
