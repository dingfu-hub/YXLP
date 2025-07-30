// 管理员用户管理API

import { NextRequest, NextResponse } from 'next/server'
import { UserQueryParams, UserListResponse, CreateUserRequest } from '@/types/user'
import { userOperations } from '@/data/users'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { securityAuditLogger } from '@/lib/security/audit-logger'

// 简化的管理员认证函数
async function authenticateAdmin(request: NextRequest) {
  console.log('开始管理员认证')

  // 从 Cookie 或 Authorization header 获取 token
  let token = request.cookies.get('admin_token')?.value
  console.log('Cookie token:', token ? '存在' : '不存在')

  if (!token) {
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    token = parseAuthHeader(authHeader)
    console.log('Parsed token from header:', token ? '存在' : '不存在')
  }

  if (!token) {
    console.log('未找到token')
    return { error: 'Authentication required', status: 401 }
  }

  // 检查 token 是否在黑名单中
  if (isTokenBlacklisted(token)) {
    console.log('Token在黑名单中')
    return { error: 'Token has been revoked', status: 401 }
  }

  // 验证 token
  const payload = await verifyToken(token)
  console.log('Token验证结果:', payload ? '有效' : '无效')
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  console.log('Token payload:', payload)

  // 查找管理员用户
  const currentUser = findAdminById(payload.userId)
  console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
  if (!currentUser) {
    return { error: 'Admin user not found', status: 404 }
  }

  console.log('管理员用户角色:', currentUser.role)

  // 检查用户是否激活
  if (!currentUser.isActive) {
    console.log('用户未激活')
    return { error: 'Account has been disabled', status: 403 }
  }

  // 检查权限 - 简化版本，只检查角色
  const allowedRoles = ['super_admin', 'admin', 'editor'] // 添加editor角色
  if (!allowedRoles.includes(currentUser.role)) {
    console.log('权限不足，当前角色:', currentUser.role, '允许的角色:', allowedRoles)
    return { error: 'Insufficient permissions', status: 403 }
  }

  console.log('认证成功，用户:', currentUser.name, '角色:', currentUser.role)

  return { user: currentUser, payload }
}

// 获取用户列表（管理员专用）
export async function GET(request: NextRequest) {
  try {
    console.log('=== 用户管理API GET请求开始 ===')

    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        error: authResult.error === 'Authentication required' ? '未授权' : authResult.error
      }, { status: authResult.status })
    }

    console.log('认证成功，继续处理请求')

    const { user: currentUser } = authResult

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams
    const queryParams: UserQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      dealerId: searchParams.get('dealerId') || undefined,
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc'
    }

    // 获取所有用户
    let users = userOperations.getAllUsers()

    // 管理员数据隔离：超级管理员可以看到所有用户，其他管理员只能看到自己经销商的用户
    if (currentUser.role !== 'super_admin' && currentUser.dealerId) {
      users = users.filter(user => 
        user.dealerId === currentUser.dealerId || user.id === currentUser.id
      )
    }

    // 应用筛选
    if (queryParams.search) {
      const searchLower = queryParams.search.toLowerCase()
      users = users.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.profile.firstName.toLowerCase().includes(searchLower) ||
        user.profile.lastName.toLowerCase().includes(searchLower) ||
        (user.profile.displayName?.toLowerCase().includes(searchLower))
      )
    }

    if (queryParams.role) {
      users = users.filter(user => user.role === queryParams.role)
    }

    if (queryParams.status) {
      users = users.filter(user => user.status === queryParams.status)
    }

    if (queryParams.dealerId) {
      users = users.filter(user => user.dealerId === queryParams.dealerId)
    }

    // 排序
    users.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (queryParams.sortBy) {
        case 'username':
          aValue = a.username
          bValue = b.username
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'lastLoginAt':
          aValue = a.lastLoginAt || new Date(0)
          bValue = b.lastLoginAt || new Date(0)
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (queryParams.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // 分页
    const total = users.length
    const totalPages = Math.ceil(total / queryParams.limit)
    const startIndex = (queryParams.page - 1) * queryParams.limit
    const paginatedUsers = users.slice(startIndex, startIndex + queryParams.limit)

    // 返回管理员视图的用户信息（包含更多详细信息）
    const adminUsers = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
        company: user.profile.company,
        jobTitle: user.profile.jobTitle,
        bio: user.profile.bio,
        website: user.profile.website
      },
      role: user.role,
      permissions: user.permissions,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      phone: user.phone,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      loginCount: user.loginCount,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      dealerId: user.dealerId,
      security: {
        twoFactorEnabled: user.security.twoFactorEnabled,
        loginNotifications: user.security.loginNotifications,
        sessionTimeout: user.security.sessionTimeout,
        passwordLastChanged: user.security.passwordLastChanged,
        trustedDevices: user.security.trustedDevices.length
      },
      preferences: user.preferences,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    const response: UserListResponse = {
      users: adminUsers,
      total,
      page: queryParams.page,
      limit: queryParams.limit,
      totalPages
    }

    // 记录数据访问
    securityAuditLogger.logDataAccess(
      currentUser.id,
      'admin_users',
      'read',
      true,
      request,
      { 
        query: queryParams,
        resultCount: adminUsers.length 
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        users: response.users,
        total: response.total,
        pagination: {
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages
        }
      }
    })

  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 创建用户（管理员专用）
export async function POST(request: NextRequest) {
  try {
    console.log('=== 创建用户API POST请求开始 ===')

    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('创建用户认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('创建用户认证成功')

    const { user: currentUser } = authResult

    const body: CreateUserRequest = await request.json()
    console.log('创建用户请求体:', JSON.stringify(body, null, 2))

    // 验证只能创建管理员用户
    const allowedRoles = ['super_admin', 'admin']
    console.log('允许的角色:', allowedRoles)
    console.log('请求的角色:', body.role)
    if (!allowedRoles.includes(body.role)) {
      console.log('角色验证失败')
      return NextResponse.json({
        success: false,
        message: '只能创建管理员用户，普通用户请通过客户端注册',
        error: 'INVALID_ROLE'
      }, { status: 400 })
    }

    // 验证必填字段
    const requiredFields = ['username', 'password', 'role']
    console.log('验证必填字段:', requiredFields)
    for (const field of requiredFields) {
      console.log(`检查字段 ${field}:`, body[field])
      if (!body[field]) {
        console.log(`字段 ${field} 验证失败`)
        return NextResponse.json({
          success: false,
          message: `${field} 为必填字段`,
          error: 'VALIDATION_ERROR'
        }, { status: 400 })
      }
    }

    // 验证密码强度 - 基本检查
    if (body.password.length < 8) {
      return NextResponse.json({
        success: false,
        error: '密码强度不足'
      }, { status: 400 })
    }

    // 检查密码复杂度
    const hasUpperCase = /[A-Z]/.test(body.password)
    const hasLowerCase = /[a-z]/.test(body.password)
    const hasNumbers = /\d/.test(body.password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(body.password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json({
        success: false,
        error: '密码强度不足'
      }, { status: 400 })
    }



    // 验证用户名格式（只允许字母、数字、下划线）
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(body.username)) {
      return NextResponse.json({
        success: false,
        message: '用户名只能包含字母、数字和下划线',
        error: 'INVALID_USERNAME'
      }, { status: 400 })
    }



    // 检查用户名是否已存在
    const existingUserByUsername = userOperations.getUserByUsername(body.username)
    if (existingUserByUsername) {
      return NextResponse.json({
        success: false,
        error: '用户名已存在'
      }, { status: 409 })
    }

    // 验证密码
    const { validatePassword, hashPassword } = await import('@/lib/auth/password')
    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Password does not meet requirements',
        error: 'WEAK_PASSWORD',
        data: {
          errors: passwordValidation.errors,
          suggestions: passwordValidation.suggestions
        }
      }, { status: 400 })
    }

    // 哈希密码
    const passwordHash = await hashPassword(body.password)

    // 创建用户数据
    const { getEffectivePermissions } = await import('@/lib/auth/jwt')
    const newUserData = {
      email: `${body.username.toLowerCase()}@admin.local`, // 生成默认邮箱
      emailVerified: true, // 管理员账户默认已验证
      phone: '',
      phoneVerified: false,
      username: body.username.toLowerCase(),
      passwordHash,
      profile: {
        firstName: '',
        lastName: '',
        displayName: body.profile?.displayName || body.username,
        company: '',
        jobTitle: '',
        bio: '',
        website: '',
        addresses: []
      },
      role: body.role,
      permissions: getEffectivePermissions(body.role),
      preferences: body.preferences || {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        currency: 'CNY',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        theme: 'light',
        notifications: {
          email: { marketing: false, orderUpdates: true, securityAlerts: true, systemNotifications: false },
          sms: { orderUpdates: true, securityAlerts: true, marketingPromotions: false },
          push: { orderUpdates: true, chatMessages: false, promotions: false }
        },
        privacy: {
          profileVisibility: 'private',
          showOnlineStatus: false,
          allowSearchByEmail: false,
          allowSearchByPhone: false,
          dataProcessingConsent: true,
          marketingConsent: false,
          analyticsConsent: true
        }
      },
      security: {
        twoFactorEnabled: false,
        trustedDevices: [],
        loginNotifications: true,
        sessionTimeout: 240,
        passwordLastChanged: new Date()
      },
      status: body.status || 'active' as any,
      loginCount: 0,
      failedLoginAttempts: 0,
      dealerId: body.dealerId || currentUser.dealerId,
      metadata: {
        source: 'admin_creation',
        createdBy: currentUser.id,
        adminNotes: body.adminNotes || ''
      }
    }

    // 创建用户
    const createdUser = userOperations.createUser(newUserData)

    // 记录敏感操作
    securityAuditLogger.logSensitiveOperation(
      currentUser.id,
      'user_create',
      'admin_users',
      true,
      request,
      {
        targetUserId: createdUser.id,
        targetUserEmail: createdUser.email,
        targetUserRole: createdUser.role
      }
    )

    // 返回安全的用户信息
    const safeUser = {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      profile: createdUser.profile,
      role: createdUser.role,
      permissions: createdUser.permissions,
      status: createdUser.status,
      emailVerified: createdUser.emailVerified,
      phoneVerified: createdUser.phoneVerified,
      dealerId: createdUser.dealerId,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        user: safeUser
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Create admin user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
