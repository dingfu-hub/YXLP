// 用户管理API

import { NextRequest, NextResponse } from 'next/server'
import { UserQueryParams, UserListResponse, CreateUserRequest } from '@/types/user'
import { userOperations } from '@/data/users'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/auth/jwt'
import { PermissionChecker, createAccessContext } from '@/lib/auth/rbac'

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证认证
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

    // 获取当前用户
    const currentUser = userOperations.getUserById(payload.userId)
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 创建访问上下文
    const context = createAccessContext(currentUser, { id: payload.sessionId }, request)
    const checker = new PermissionChecker(context)

    // 检查权限
    if (!checker.hasPermission('users:read')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

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

    // 数据隔离：经销商只能看到自己的用户
    if (currentUser.dealerId && currentUser.role !== 'super_admin') {
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

    // 移除敏感信息
    const safeUsers = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      profile: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        displayName: user.profile.displayName,
        avatar: user.profile.avatar,
        company: user.profile.company,
        jobTitle: user.profile.jobTitle
      },
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      loginCount: user.loginCount,
      dealerId: user.dealerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    const response: UserListResponse = {
      users: safeUsers,
      total,
      page: queryParams.page,
      limit: queryParams.limit,
      totalPages
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    // 验证认证
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

    // 获取当前用户
    const currentUser = userOperations.getUserById(payload.userId)
    if (!currentUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      }, { status: 404 })
    }

    // 创建访问上下文
    const context = createAccessContext(currentUser, { id: payload.sessionId }, request)
    const checker = new PermissionChecker(context)

    // 检查权限
    if (!checker.hasPermission('users:write')) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    const body: CreateUserRequest = await request.json()

    // 验证必填字段
    const requiredFields = ['email', 'username', 'password', 'role']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          message: `${field} is required`,
          error: 'VALIDATION_ERROR'
        }, { status: 400 })
      }
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = userOperations.getUserByEmail(body.email)
    if (existingUserByEmail) {
      return NextResponse.json({
        success: false,
        message: 'Email already exists',
        error: 'EMAIL_EXISTS'
      }, { status: 409 })
    }

    // 检查用户名是否已存在
    const existingUserByUsername = userOperations.getUserByUsername(body.username)
    if (existingUserByUsername) {
      return NextResponse.json({
        success: false,
        message: 'Username already exists',
        error: 'USERNAME_EXISTS'
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
      email: body.email.toLowerCase(),
      emailVerified: false,
      phone: body.phone,
      phoneVerified: false,
      username: body.username.toLowerCase(),
      passwordHash,
      profile: {
        firstName: body.profile?.firstName || '',
        lastName: body.profile?.lastName || '',
        displayName: body.profile?.displayName || `${body.profile?.firstName || ''} ${body.profile?.lastName || ''}`.trim(),
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
      status: 'active' as any,
      loginCount: 0,
      failedLoginAttempts: 0,
      dealerId: body.dealerId || currentUser.dealerId,
      metadata: {
        source: 'admin_creation',
        createdBy: currentUser.id
      }
    }

    // 创建用户
    const createdUser = userOperations.createUser(newUserData)

    // 返回安全的用户信息
    const safeUser = {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      profile: createdUser.profile,
      role: createdUser.role,
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
      data: safeUser
    }, { status: 201 })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
