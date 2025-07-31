// 用户数据存储

import { User, UserRole, UserStatus } from '@/types/user'

// 模拟用户数据
export const users: User[] = [
  {
    id: 'user_001',
    email: 'admin@yxlp.com',
    emailVerified: true,
    phone: '+86-13800138000',
    phoneVerified: true,
    username: 'admin',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.vKzFm', // password: admin123
    profile: {
      firstName: '系统',
      lastName: '管理员',
      displayName: '超级管理员',
      avatar: '/avatars/admin.jpg',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'prefer_not_to_say',
      bio: '平台超级管理员，负责系统整体管理和维护',
      company: 'YXLP Platform',
      jobTitle: 'System Administrator',
      addresses: [
        {
          id: 'addr_001',
          type: 'business',
          isDefault: true,
          firstName: '系统',
          lastName: '管理员',
          company: 'YXLP Platform',
          addressLine1: '北京市朝阳区建国门外大街1号',
          city: '北京',
          state: '北京市',
          postalCode: '100001',
          country: 'CN',
          phone: '+86-13800138000'
        }
      ]
    },
    role: UserRole.SUPER_ADMIN,
    permissions: [
      // 商品权限
      'product:view', 'product:create', 'product:update', 'product:delete',
      // 订单权限
      'order:view', 'order:update', 'order:delete',
      // 用户权限
      'user:view', 'user:update', 'user:delete', 'user:management',
      // 新闻权限
      'news:view', 'news:create', 'news:update', 'news:delete',
      // 数据分析权限
      'analytics:view', 'analytics:export',
      // 系统权限
      'system:settings'
    ],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      theme: 'light',
      notifications: {
        email: {
          marketing: false,
          orderUpdates: true,
          securityAlerts: true,
          systemNotifications: true
        },
        sms: {
          orderUpdates: true,
          securityAlerts: true,
          marketingPromotions: false
        },
        push: {
          orderUpdates: true,
          chatMessages: true,
          promotions: false
        }
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
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
      backupCodes: ['ABC123', 'DEF456', 'GHI789'],
      trustedDevices: [],
      loginNotifications: true,
      sessionTimeout: 480, // 8 hours
      passwordLastChanged: new Date('2024-01-01'),
      securityQuestions: [
        {
          id: 'sq_001',
          question: '您的第一个宠物的名字是什么？',
          answerHash: '$2b$12$encrypted_answer_hash'
        }
      ]
    },
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date('2024-01-15T09:00:00Z'),
    lastActiveAt: new Date('2024-01-15T10:30:00Z'),
    loginCount: 156,
    failedLoginAttempts: 0,
    metadata: {
      source: 'system',
      notes: '系统初始管理员账户'
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    createdBy: 'system'
  },
  {
    id: 'user_002',
    email: 'dealer@example.com',
    emailVerified: true,
    phone: '+86-13900139000',
    phoneVerified: true,
    username: 'dealer_admin',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.vKzFm', // password: dealer123
    profile: {
      firstName: '张',
      lastName: '经理',
      displayName: '张经理',
      avatar: '/avatars/dealer.jpg',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      bio: '资深经销商，专注服装批发业务',
      company: '时尚服装批发有限公司',
      jobTitle: '总经理',
      addresses: [
        {
          id: 'addr_002',
          type: 'business',
          isDefault: true,
          firstName: '张',
          lastName: '经理',
          company: '时尚服装批发有限公司',
          addressLine1: '广州市白云区服装批发市场A区101号',
          city: '广州',
          state: '广东省',
          postalCode: '510000',
          country: 'CN',
          phone: '+86-13900139000'
        }
      ],
      verification: {
        status: 'verified',
        businessLicense: 'BL202401001',
        taxId: 'TAX123456789',
        legalRepresentative: '张经理',
        documents: [
          {
            id: 'doc_001',
            type: 'business_license',
            url: '/documents/business_license_001.pdf',
            status: 'approved',
            uploadedAt: new Date('2024-01-02')
          }
        ],
        verifiedAt: new Date('2024-01-03'),
        verifiedBy: 'user_001'
      }
    },
    role: UserRole.DEALER_ADMIN,
    permissions: [
      'products:read', 'products:write',
      'orders:read', 'orders:write',
      'analytics:read',
      'users:read', 'users:write'
    ],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      theme: 'light',
      notifications: {
        email: {
          marketing: true,
          orderUpdates: true,
          securityAlerts: true,
          systemNotifications: true
        },
        sms: {
          orderUpdates: true,
          securityAlerts: true,
          marketingPromotions: true
        },
        push: {
          orderUpdates: true,
          chatMessages: true,
          promotions: true
        }
      },
      privacy: {
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowSearchByEmail: true,
        allowSearchByPhone: true,
        dataProcessingConsent: true,
        marketingConsent: true,
        analyticsConsent: true
      }
    },
    security: {
      twoFactorEnabled: false,
      trustedDevices: [],
      loginNotifications: true,
      sessionTimeout: 240, // 4 hours
      passwordLastChanged: new Date('2024-01-02')
    },
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date('2024-01-15T08:30:00Z'),
    lastActiveAt: new Date('2024-01-15T09:45:00Z'),
    loginCount: 89,
    failedLoginAttempts: 0,
    dealerId: 'dealer_001',
    metadata: {
      source: 'registration',
      businessType: 'wholesale',
      annualRevenue: '1000000-5000000'
    },
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-15T09:45:00Z')
  },
  {
    id: 'user_003',
    email: 'staff@example.com',
    emailVerified: true,
    phone: '+86-13700137000',
    phoneVerified: true,
    username: 'dealer_staff',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.vKzFm', // password: staff123
    profile: {
      firstName: '李',
      lastName: '小姐',
      displayName: '李小姐',
      avatar: '/avatars/staff.jpg',
      dateOfBirth: new Date('1992-08-20'),
      gender: 'female',
      bio: '经销商业务员，负责客户服务和订单处理',
      company: '时尚服装批发有限公司',
      jobTitle: '业务员',
      addresses: []
    },
    role: UserRole.DEALER_STAFF,
    permissions: [
      'products:read',
      'orders:read', 'orders:write'
    ],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      theme: 'light',
      notifications: {
        email: {
          marketing: false,
          orderUpdates: true,
          securityAlerts: true,
          systemNotifications: false
        },
        sms: {
          orderUpdates: true,
          securityAlerts: true,
          marketingPromotions: false
        },
        push: {
          orderUpdates: true,
          chatMessages: true,
          promotions: false
        }
      },
      privacy: {
        profileVisibility: 'contacts_only',
        showOnlineStatus: true,
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
      sessionTimeout: 240, // 4 hours
      passwordLastChanged: new Date('2024-01-05')
    },
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date('2024-01-15T09:00:00Z'),
    lastActiveAt: new Date('2024-01-15T10:15:00Z'),
    loginCount: 45,
    failedLoginAttempts: 0,
    dealerId: 'dealer_001',
    dealerRole: 'staff',
    metadata: {
      source: 'invitation',
      invitedBy: 'user_002'
    },
    createdAt: new Date('2024-01-05T14:00:00Z'),
    updatedAt: new Date('2024-01-15T10:15:00Z'),
    createdBy: 'user_002'
  },
  {
    id: 'user_004',
    email: 'customer@example.com',
    emailVerified: true,
    phone: '+86-13600136000',
    phoneVerified: false,
    username: 'customer_001',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL8.vKzFm', // password: customer123
    profile: {
      firstName: '王',
      lastName: '女士',
      displayName: '王女士',
      avatar: '/avatars/customer.jpg',
      dateOfBirth: new Date('1988-12-10'),
      gender: 'female',
      bio: '时尚爱好者，喜欢购买优质服装',
      addresses: [
        {
          id: 'addr_003',
          type: 'shipping',
          isDefault: true,
          firstName: '王',
          lastName: '女士',
          addressLine1: '上海市浦东新区陆家嘴金融中心',
          addressLine2: '世纪大道100号',
          city: '上海',
          state: '上海市',
          postalCode: '200120',
          country: 'CN',
          phone: '+86-13600136000'
        }
      ]
    },
    role: UserRole.END_USER,
    permissions: [
      'products:read',
      'orders:read', 'orders:write'
    ],
    preferences: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '12h',
      theme: 'auto',
      notifications: {
        email: {
          marketing: true,
          orderUpdates: true,
          securityAlerts: true,
          systemNotifications: false
        },
        sms: {
          orderUpdates: true,
          securityAlerts: false,
          marketingPromotions: true
        },
        push: {
          orderUpdates: true,
          chatMessages: false,
          promotions: true
        }
      },
      privacy: {
        profileVisibility: 'private',
        showOnlineStatus: false,
        allowSearchByEmail: false,
        allowSearchByPhone: false,
        dataProcessingConsent: true,
        marketingConsent: true,
        analyticsConsent: true
      }
    },
    security: {
      twoFactorEnabled: false,
      trustedDevices: [],
      loginNotifications: false,
      sessionTimeout: 120, // 2 hours
      passwordLastChanged: new Date('2024-01-10')
    },
    status: UserStatus.ACTIVE,
    lastLoginAt: new Date('2024-01-14T20:30:00Z'),
    lastActiveAt: new Date('2024-01-14T21:45:00Z'),
    loginCount: 23,
    failedLoginAttempts: 0,
    metadata: {
      source: 'registration',
      referrer: 'google_ads',
      customerSegment: 'premium'
    },
    createdAt: new Date('2024-01-10T16:30:00Z'),
    updatedAt: new Date('2024-01-14T21:45:00Z')
  }
]

// 用户数据操作函数
export const userOperations = {
  // 获取所有用户
  getAllUsers: (): User[] => {
    return users
  },

  // 根据ID获取用户
  getUserById: (id: string): User | undefined => {
    return users.find(user => user.id === id)
  },

  // 根据邮箱获取用户
  getUserByEmail: (email: string): User | undefined => {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase())
  },

  // 根据用户名获取用户
  getUserByUsername: (username: string): User | undefined => {
    return users.find(user => user.username.toLowerCase() === username.toLowerCase())
  },

  // 根据手机号获取用户
  getUserByPhone: (phone: string): User | undefined => {
    return users.find(user => user.phone === phone)
  },

  // 创建用户
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    users.push(newUser)
    return newUser
  },

  // 更新用户
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) return null

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    }
    return users[userIndex]
  },

  // 删除用户
  deleteUser: (id: string): boolean => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex === -1) return false

    users.splice(userIndex, 1)
    return true
  },

  // 验证用户凭据
  validateCredentials: (identifier: string, password: string): User | null => {
    const user = users.find(u => 
      u.email.toLowerCase() === identifier.toLowerCase() || 
      u.username.toLowerCase() === identifier.toLowerCase()
    )
    
    if (!user) return null
    
    // 这里应该使用 bcrypt 比较密码
    // 为了演示，我们简化处理
    return user
  }
}

// 导出默认数据
export default users
