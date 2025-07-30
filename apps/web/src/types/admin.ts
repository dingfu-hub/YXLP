// 管理员系统类型定义

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin'
}

export enum Permission {
  // 商品权限
  PRODUCT_VIEW = 'product:view',
  PRODUCT_CREATE = 'product:create',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  
  // 订单权限
  ORDER_VIEW = 'order:view',
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',
  
  // 用户权限
  USER_VIEW = 'user:view',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // 新闻权限
  NEWS_VIEW = 'news:view',
  NEWS_CREATE = 'news:create',
  NEWS_UPDATE = 'news:update',
  NEWS_DELETE = 'news:delete',
  
  // 数据分析权限
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // 系统权限
  SYSTEM_SETTINGS = 'system:settings',
  USER_MANAGEMENT = 'user:management'
}

export interface AdminUser {
  id: string
  username: string
  name: string
  role: UserRole
  permissions: Permission[]
  avatar?: string
  lastLoginAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress: string
  userAgent: string
  createdAt: Date
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: AdminUser
  token: string
  expiresAt: Date
}

export interface AdminContextType {
  user: AdminUser | null
  permissions: Permission[]
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkPermission: (permission: Permission) => boolean
  refreshUser: () => Promise<void>
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // 所有权限
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.PRODUCT_DELETE,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.ORDER_DELETE,
    Permission.USER_VIEW,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.NEWS_VIEW,
    Permission.NEWS_CREATE,
    Permission.NEWS_UPDATE,
    Permission.NEWS_DELETE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.SYSTEM_SETTINGS,
    Permission.USER_MANAGEMENT
  ],
  [UserRole.ADMIN]: [
    // 普通管理员默认权限（可由超级管理员调整）
    Permission.PRODUCT_VIEW,
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.USER_VIEW,
    Permission.NEWS_VIEW,
    Permission.NEWS_CREATE,
    Permission.NEWS_UPDATE,
    Permission.ANALYTICS_VIEW
  ]
}

// 获取角色的权限
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

// 检查用户是否有特定权限
export function hasPermission(userPermissions: Permission[], permission: Permission): boolean {
  return userPermissions.includes(permission)
}

// 检查用户是否有任一权限
export function hasAnyPermission(userPermissions: Permission[], permissions: Permission[]): boolean {
  return permissions.some(permission => userPermissions.includes(permission))
}

// 检查用户是否有所有权限
export function hasAllPermissions(userPermissions: Permission[], permissions: Permission[]): boolean {
  return permissions.every(permission => userPermissions.includes(permission))
}

// 路由权限映射
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/admin': [],
  '/admin/dashboard': [Permission.ANALYTICS_VIEW],
  '/admin/products': [Permission.PRODUCT_VIEW],
  '/admin/products/create': [Permission.PRODUCT_CREATE],
  '/admin/orders': [Permission.ORDER_VIEW],
  '/admin/users': [Permission.USER_VIEW],
  '/admin/news': [Permission.NEWS_VIEW],
  '/admin/news/create': [Permission.NEWS_CREATE],
  '/admin/analytics': [Permission.ANALYTICS_VIEW],
  '/admin/settings': [Permission.SYSTEM_SETTINGS]
}

// 检查路由权限
export function checkRoutePermission(userPermissions: Permission[], route: string): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[route]
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true
  }
  return hasAnyPermission(userPermissions, requiredPermissions)
}

// 菜单项类型
export interface MenuItem {
  id: string
  label: string
  icon: string
  href: string
  permissions?: Permission[]
  children?: MenuItem[]
}

// 侧边栏菜单配置
export const SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'dashboard',
    label: '仪表板',
    icon: 'ChartBarIcon',
    href: '/admin/dashboard',
    permissions: [Permission.ANALYTICS_VIEW]
  },
  {
    id: 'products',
    label: '商品管理',
    icon: 'CubeIcon',
    href: '/admin/products',
    permissions: [Permission.PRODUCT_VIEW],
    children: [
      {
        id: 'products-list',
        label: '商品列表',
        icon: 'ListBulletIcon',
        href: '/admin/products',
        permissions: [Permission.PRODUCT_VIEW]
      },
      {
        id: 'products-create',
        label: '添加商品',
        icon: 'PlusIcon',
        href: '/admin/products/create',
        permissions: [Permission.PRODUCT_CREATE]
      },
      {
        id: 'products-categories',
        label: '分类管理',
        icon: 'TagIcon',
        href: '/admin/products/categories',
        permissions: [Permission.PRODUCT_VIEW]
      }
    ]
  },
  {
    id: 'orders',
    label: '订单管理',
    icon: 'ShoppingCartIcon',
    href: '/admin/orders',
    permissions: [Permission.ORDER_VIEW]
  },
  {
    id: 'users',
    label: '用户管理',
    icon: 'UsersIcon',
    href: '/admin/users',
    permissions: [Permission.USER_VIEW]
  },
  {
    id: 'news',
    label: '新闻管理',
    icon: 'NewspaperIcon',
    href: '/admin/news',
    permissions: [Permission.NEWS_VIEW],
    children: [
      {
        id: 'news-list',
        label: '新闻列表',
        icon: 'ListBulletIcon',
        href: '/admin/news',
        permissions: [Permission.NEWS_VIEW]
      },
      {
        id: 'news-sources',
        label: 'RSS源管理',
        icon: 'RssIcon',
        href: '/admin/news/sources',
        permissions: [Permission.NEWS_CREATE]
      },
      {
        id: 'news-collect',
        label: '新闻采集',
        icon: 'CloudArrowDownIcon',
        href: '/admin/news/collect',
        permissions: [Permission.NEWS_CREATE]
      },
      {
        id: 'news-schedule',
        label: '定时采集',
        icon: 'ClockIcon',
        href: '/admin/news/schedule',
        permissions: [Permission.NEWS_CREATE]
      },
      {
        id: 'news-polish',
        label: 'AI润色',
        icon: 'SparklesIcon',
        href: '/admin/news/polish',
        permissions: [Permission.NEWS_UPDATE]
      },
      {
        id: 'news-publish',
        label: '发布中心',
        icon: 'MegaphoneIcon',
        href: '/admin/news/publish',
        permissions: [Permission.NEWS_UPDATE]
      },
      {
        id: 'news-create',
        label: '手动发布',
        icon: 'PlusIcon',
        href: '/admin/news/create',
        permissions: [Permission.NEWS_CREATE]
      },
      {
        id: 'ai-config',
        label: 'AI配置',
        icon: 'CogIcon',
        href: '/admin/ai-config',
        permissions: [Permission.SYSTEM_SETTINGS]
      }
    ]
  },
  {
    id: 'analytics',
    label: '数据分析',
    icon: 'ChartPieIcon',
    href: '/admin/analytics',
    permissions: [Permission.ANALYTICS_VIEW],
    children: [
      {
        id: 'analytics-overview',
        label: '数据概览',
        icon: 'EyeIcon',
        href: '/admin/analytics',
        permissions: [Permission.ANALYTICS_VIEW]
      },
      {
        id: 'analytics-sales',
        label: '销售分析',
        icon: 'CurrencyDollarIcon',
        href: '/admin/analytics/sales',
        permissions: [Permission.ANALYTICS_VIEW]
      },
      {
        id: 'analytics-users',
        label: '用户分析',
        icon: 'UserGroupIcon',
        href: '/admin/analytics/users',
        permissions: [Permission.ANALYTICS_VIEW]
      }
    ]
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: 'CogIcon',
    href: '/admin/settings',
    permissions: [Permission.SYSTEM_SETTINGS],
    children: [
      {
        id: 'settings-general',
        label: '基本设置',
        icon: 'AdjustmentsHorizontalIcon',
        href: '/admin/settings',
        permissions: [Permission.SYSTEM_SETTINGS]
      },
      {
        id: 'settings-profile',
        label: '个人资料',
        icon: 'UserIcon',
        href: '/admin/settings/profile'
      },
      {
        id: 'settings-security',
        label: '安全设置',
        icon: 'ShieldCheckIcon',
        href: '/admin/settings/security'
      }
    ]
  }
]

// 过滤有权限的菜单项
export function filterMenuByPermissions(menu: MenuItem[], userPermissions: Permission[]): MenuItem[] {
  return menu.filter(item => {
    // 如果没有权限要求，则显示
    if (!item.permissions || item.permissions.length === 0) {
      return true
    }

    // 检查父菜单权限
    const hasParentAccess = hasAnyPermission(userPermissions, item.permissions)

    // 如果有子菜单，递归过滤
    let filteredChildren: MenuItem[] = []
    if (item.children) {
      filteredChildren = filterMenuByPermissions(item.children, userPermissions)
      item.children = filteredChildren
    }

    // 如果有父菜单权限，或者有任何子菜单权限，就显示
    return hasParentAccess || (filteredChildren && filteredChildren.length > 0)
  })
}
