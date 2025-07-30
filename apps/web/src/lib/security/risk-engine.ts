// 风控引擎

import { RiskRule, RiskAssessment, RiskLevel, RiskAction, RiskRuleType } from '@/types/security'

// 风控规则配置
const riskRules: RiskRule[] = [
  // 注册风控规则
  {
    id: 'reg_001',
    name: '频繁注册检测',
    description: '检测同一IP短时间内频繁注册',
    type: RiskRuleType.REGISTRATION,
    enabled: true,
    priority: 1,
    conditions: [
      {
        field: 'ip_registration_count_1h',
        operator: 'gt',
        value: 3,
        weight: 0.8
      }
    ],
    action: RiskAction.BLOCK,
    threshold: 0.7,
    timeWindow: 60,
    cooldown: 60,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'reg_002',
    name: '可疑邮箱域名',
    description: '检测临时邮箱或可疑域名',
    type: RiskRuleType.REGISTRATION,
    enabled: true,
    priority: 2,
    conditions: [
      {
        field: 'email_domain',
        operator: 'in',
        value: ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'],
        weight: 0.9
      }
    ],
    action: RiskAction.CHALLENGE,
    threshold: 0.8,
    timeWindow: 0,
    cooldown: 0,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 登录风控规则
  {
    id: 'login_001',
    name: '异常登录地点',
    description: '检测异常登录地理位置',
    type: RiskRuleType.LOGIN,
    enabled: true,
    priority: 1,
    conditions: [
      {
        field: 'location_distance_km',
        operator: 'gt',
        value: 1000,
        weight: 0.6
      },
      {
        field: 'time_since_last_login_hours',
        operator: 'lt',
        value: 1,
        weight: 0.4
      }
    ],
    action: RiskAction.CHALLENGE,
    threshold: 0.5,
    timeWindow: 0,
    cooldown: 0,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'login_002',
    name: '暴力破解检测',
    description: '检测密码暴力破解尝试',
    type: RiskRuleType.LOGIN,
    enabled: true,
    priority: 1,
    conditions: [
      {
        field: 'failed_attempts_5m',
        operator: 'gte',
        value: 5,
        weight: 1.0
      }
    ],
    action: RiskAction.BLOCK,
    threshold: 0.9,
    timeWindow: 5,
    cooldown: 15,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 设备风控规则
  {
    id: 'device_001',
    name: '新设备检测',
    description: '检测从未见过的设备登录',
    type: RiskRuleType.DEVICE,
    enabled: true,
    priority: 3,
    conditions: [
      {
        field: 'device_first_seen',
        operator: 'eq',
        value: true,
        weight: 0.3
      }
    ],
    action: RiskAction.CHALLENGE,
    threshold: 0.3,
    timeWindow: 0,
    cooldown: 0,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 行为风控规则
  {
    id: 'behavior_001',
    name: '异常操作频率',
    description: '检测异常高频操作',
    type: RiskRuleType.BEHAVIOR,
    enabled: true,
    priority: 2,
    conditions: [
      {
        field: 'actions_per_minute',
        operator: 'gt',
        value: 30,
        weight: 0.7
      }
    ],
    action: RiskAction.REVIEW,
    threshold: 0.6,
    timeWindow: 1,
    cooldown: 5,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// 风控评估引擎
export class RiskEngine {
  private rules: RiskRule[]
  private assessmentHistory: Map<string, RiskAssessment[]>

  constructor() {
    this.rules = riskRules.filter(rule => rule.enabled)
    this.assessmentHistory = new Map()
  }

  // 评估风险
  async assessRisk(
    type: RiskRuleType,
    context: Record<string, any>,
    userId?: string
  ): Promise<RiskAssessment> {
    const applicableRules = this.rules.filter(rule => rule.type === type)
    const triggeredRules: any[] = []
    let totalScore = 0
    let maxScore = 0

    for (const rule of applicableRules) {
      const ruleResult = this.evaluateRule(rule, context)
      if (ruleResult.triggered) {
        triggeredRules.push(ruleResult)
        totalScore += ruleResult.score
      }
      maxScore += rule.conditions.reduce((sum, condition) => sum + condition.weight, 0)
    }

    // 计算风险分数 (0-1)
    const riskScore = maxScore > 0 ? Math.min(totalScore / maxScore, 1) : 0

    // 确定风险等级
    const riskLevel = this.calculateRiskLevel(riskScore)

    // 确定处理动作
    const action = this.determineAction(triggeredRules, riskScore)

    // 创建评估结果
    const assessment: RiskAssessment = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      riskLevel,
      riskScore,
      triggeredRules,
      action,
      reason: this.generateReason(triggeredRules),
      metadata: context,
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      location: context.location,
      deviceFingerprint: context.deviceFingerprint,
      createdAt: new Date()
    }

    // 记录评估历史
    if (userId) {
      const history = this.assessmentHistory.get(userId) || []
      history.push(assessment)
      this.assessmentHistory.set(userId, history.slice(-100)) // 保留最近100条记录
    }

    return assessment
  }

  // 评估单个规则
  private evaluateRule(rule: RiskRule, context: Record<string, any>) {
    const triggeredConditions: any[] = []
    let ruleScore = 0

    for (const condition of rule.conditions) {
      const conditionResult = this.evaluateCondition(condition, context)
      if (conditionResult.matched) {
        triggeredConditions.push(conditionResult)
        ruleScore += condition.weight
      }
    }

    const triggered = triggeredConditions.length > 0 && ruleScore >= rule.threshold

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      triggered,
      score: ruleScore,
      weight: rule.conditions.reduce((sum, c) => sum + c.weight, 0),
      conditions: triggeredConditions
    }
  }

  // 评估单个条件
  private evaluateCondition(condition: any, context: Record<string, any>) {
    const fieldValue = this.getFieldValue(condition.field, context)
    const expectedValue = condition.value
    let matched = false

    switch (condition.operator) {
      case 'eq':
        matched = fieldValue === expectedValue
        break
      case 'ne':
        matched = fieldValue !== expectedValue
        break
      case 'gt':
        matched = Number(fieldValue) > Number(expectedValue)
        break
      case 'gte':
        matched = Number(fieldValue) >= Number(expectedValue)
        break
      case 'lt':
        matched = Number(fieldValue) < Number(expectedValue)
        break
      case 'lte':
        matched = Number(fieldValue) <= Number(expectedValue)
        break
      case 'in':
        matched = Array.isArray(expectedValue) && expectedValue.includes(fieldValue)
        break
      case 'nin':
        matched = Array.isArray(expectedValue) && !expectedValue.includes(fieldValue)
        break
      case 'contains':
        matched = String(fieldValue).includes(String(expectedValue))
        break
      case 'regex':
        matched = new RegExp(expectedValue).test(String(fieldValue))
        break
      default:
        matched = false
    }

    return {
      field: condition.field,
      operator: condition.operator,
      expected: expectedValue,
      actual: fieldValue,
      matched
    }
  }

  // 获取字段值
  private getFieldValue(field: string, context: Record<string, any>): any {
    // 支持嵌套字段访问，如 'user.profile.age'
    const keys = field.split('.')
    let value = context

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return undefined
      }
    }

    return value
  }

  // 计算风险等级
  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 0.8) return RiskLevel.CRITICAL
    if (score >= 0.6) return RiskLevel.HIGH
    if (score >= 0.4) return RiskLevel.MEDIUM
    return RiskLevel.LOW
  }

  // 确定处理动作
  private determineAction(triggeredRules: any[], riskScore: number): RiskAction {
    // 如果有任何规则要求阻止，则阻止
    if (triggeredRules.some(rule => rule.action === RiskAction.BLOCK)) {
      return RiskAction.BLOCK
    }

    // 如果有规则要求挑战，则挑战
    if (triggeredRules.some(rule => rule.action === RiskAction.CHALLENGE)) {
      return RiskAction.CHALLENGE
    }

    // 如果有规则要求审核，则审核
    if (triggeredRules.some(rule => rule.action === RiskAction.REVIEW)) {
      return RiskAction.REVIEW
    }

    // 根据风险分数决定
    if (riskScore >= 0.8) return RiskAction.BLOCK
    if (riskScore >= 0.5) return RiskAction.CHALLENGE
    if (riskScore >= 0.3) return RiskAction.REVIEW

    return RiskAction.ALLOW
  }

  // 生成风险原因
  private generateReason(triggeredRules: any[]): string {
    if (triggeredRules.length === 0) {
      return 'No risk detected'
    }

    const reasons = triggeredRules.map(rule => rule.ruleName)
    return `Risk detected: ${reasons.join(', ')}`
  }

  // 获取用户风险历史
  getUserRiskHistory(userId: string): RiskAssessment[] {
    return this.assessmentHistory.get(userId) || []
  }

  // 添加新规则
  addRule(rule: RiskRule): void {
    this.rules.push(rule)
  }

  // 更新规则
  updateRule(ruleId: string, updates: Partial<RiskRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId)
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates, updatedAt: new Date() }
      return true
    }
    return false
  }

  // 禁用规则
  disableRule(ruleId: string): boolean {
    return this.updateRule(ruleId, { enabled: false })
  }

  // 启用规则
  enableRule(ruleId: string): boolean {
    return this.updateRule(ruleId, { enabled: true })
  }

  // 获取所有规则
  getRules(): RiskRule[] {
    return [...this.rules]
  }

  // 获取规则统计
  getRuleStats(): Record<string, any> {
    const totalRules = this.rules.length
    const enabledRules = this.rules.filter(rule => rule.enabled).length
    const rulesByType = this.rules.reduce((acc, rule) => {
      acc[rule.type] = (acc[rule.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalRules,
      enabledRules,
      disabledRules: totalRules - enabledRules,
      rulesByType
    }
  }
}

// 创建全局风控引擎实例
export const riskEngine = new RiskEngine()

// 风控中间件
export function createRiskMiddleware(type: RiskRuleType) {
  return async (context: Record<string, any>) => {
    const assessment = await riskEngine.assessRisk(type, context, context.userId)
    
    // 根据风险评估结果决定是否继续
    switch (assessment.action) {
      case RiskAction.BLOCK:
        throw new Error(`Access blocked due to security risk: ${assessment.reason}`)
      
      case RiskAction.CHALLENGE:
        // 返回需要额外验证的标识
        return {
          requiresChallenge: true,
          challengeType: 'captcha', // 或其他挑战类型
          assessment
        }
      
      case RiskAction.REVIEW:
        // 记录需要人工审核
        console.log(`Manual review required: ${assessment.reason}`)
        return { requiresReview: true, assessment }
      
      default:
        return { assessment }
    }
  }
}
