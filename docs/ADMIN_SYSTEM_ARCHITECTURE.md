# 🏗️ YXLP 后台管理系统架构设计

## 📋 系统概览

### 技术栈
- **前端框架**: Next.js 14 + TypeScript
- **UI组件库**: Tailwind CSS + Headless UI
- **状态管理**: React Context + useState/useReducer
- **数据获取**: Next.js API Routes
- **身份验证**: JWT + HTTP-only Cookies
- **图表组件**: Chart.js / Recharts
- **表格组件**: React Table

### 系统特性
- 🔐 基于角色的权限控制 (RBAC)
- 📱 响应式设计，支持移动端
- 🎨 现代化UI设计
- 📊 实时数据统计
- 🔄 自动数据刷新
- 📤 数据导出功能

---

## 🗂️ 目录结构

```
apps/web/src/app/admin/
├── layout.tsx                 # 后台布局组件
├── page.tsx                   # 仪表板首页
├── login/
│   └── page.tsx              # 登录页面
├── dashboard/
│   └── page.tsx              # 数据仪表板
├── products/
│   ├── page.tsx              # 商品列表
│   ├── create/page.tsx       # 创建商品
│   ├── [id]/
│   │   ├── page.tsx          # 商品详情
│   │   └── edit/page.tsx     # 编辑商品
│   └── categories/
│       └── page.tsx          # 分类管理
├── orders/
│   ├── page.tsx              # 订单列表
│   └── [id]/page.tsx         # 订单详情
├── users/
│   ├── page.tsx              # 用户列表
│   └── [id]/page.tsx         # 用户详情
├── news/
│   ├── page.tsx              # 新闻列表
│   ├── create/page.tsx       # 创建新闻
│   └── [id]/edit/page.tsx    # 编辑新闻
├── analytics/
│   ├── page.tsx              # 数据分析
│   ├── sales/page.tsx        # 销售分析
│   └── users/page.tsx        # 用户分析
└── settings/
    ├── page.tsx              # 系统设置
    ├── profile/page.tsx      # 个人资料
    └── security/page.tsx     # 安全设置

components/admin/
├── layout/
│   ├── AdminLayout.tsx       # 主布局
│   ├── Sidebar.tsx           # 侧边栏
│   ├── Header.tsx            # 顶部导航
│   └── Breadcrumb.tsx        # 面包屑导航
├── dashboard/
│   ├── StatsCard.tsx         # 统计卡片
│   ├── Chart.tsx             # 图表组件
│   └── RecentActivity.tsx    # 最近活动
├── products/
│   ├── ProductTable.tsx      # 商品表格
│   ├── ProductForm.tsx       # 商品表单
│   └── ProductCard.tsx       # 商品卡片
├── orders/
│   ├── OrderTable.tsx        # 订单表格
│   ├── OrderStatus.tsx       # 订单状态
│   └── OrderTimeline.tsx     # 订单时间线
├── users/
│   ├── UserTable.tsx         # 用户表格
│   └── UserProfile.tsx       # 用户资料
├── news/
│   ├── NewsTable.tsx         # 新闻表格
│   ├── NewsEditor.tsx        # 新闻编辑器
│   └── NewsPreview.tsx       # 新闻预览
└── common/
    ├── DataTable.tsx         # 通用数据表格
    ├── Modal.tsx             # 模态框
    ├── Loading.tsx           # 加载组件
    ├── Pagination.tsx        # 分页组件
    └── SearchBox.tsx         # 搜索框
```

---

## 🔐 权限系统设计

### 角色定义
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',     // 超级管理员
  ADMIN = 'admin',                 // 管理员
  EDITOR = 'editor',               // 编辑员
  VIEWER = 'viewer'                // 查看员
}

enum Permission {
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
  
  // 系统权限
  SYSTEM_SETTINGS = 'system:settings',
  ANALYTICS_VIEW = 'analytics:view'
}
```

### 权限矩阵
| 角色 | 商品管理 | 订单管理 | 用户管理 | 新闻管理 | 数据分析 | 系统设置 |
|------|----------|----------|----------|----------|----------|----------|
| 超级管理员 | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 | ✅ 全部 |
| 管理员 | ✅ 全部 | ✅ 全部 | ✅ 查看/编辑 | ✅ 全部 | ✅ 全部 | ❌ 无 |
| 编辑员 | ✅ 查看/编辑 | ✅ 查看/编辑 | ✅ 查看 | ✅ 全部 | ✅ 查看 | ❌ 无 |
| 查看员 | ✅ 查看 | ✅ 查看 | ✅ 查看 | ✅ 查看 | ✅ 查看 | ❌ 无 |

---

## 🛣️ 路由结构

### 公开路由
- `/admin/login` - 登录页面

### 受保护路由 (需要登录)
- `/admin` - 仪表板首页
- `/admin/dashboard` - 数据仪表板
- `/admin/products/**` - 商品管理
- `/admin/orders/**` - 订单管理
- `/admin/users/**` - 用户管理
- `/admin/news/**` - 新闻管理
- `/admin/analytics/**` - 数据分析
- `/admin/settings/**` - 系统设置

### 路由守卫
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')
  const { pathname } = request.nextUrl
  
  // 检查是否为后台路由
  if (pathname.startsWith('/admin')) {
    // 登录页面允许访问
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // 其他页面需要验证token
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // 验证权限
    const hasPermission = checkPermission(token, pathname)
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/admin/unauthorized', request.url))
    }
  }
  
  return NextResponse.next()
}
```

---

## 📊 数据模型

### 管理员用户
```typescript
interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: Permission[]
  avatar?: string
  lastLoginAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### 会话管理
```typescript
interface AdminSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress: string
  userAgent: string
  createdAt: Date
}
```

---

## 🎨 UI设计规范

### 色彩系统
- **主色**: #3B82F6 (蓝色)
- **成功**: #10B981 (绿色)
- **警告**: #F59E0B (橙色)
- **错误**: #EF4444 (红色)
- **中性**: #6B7280 (灰色)

### 组件规范
- **卡片**: 白色背景，圆角8px，阴影
- **按钮**: 圆角6px，悬停效果
- **表格**: 斑马纹，悬停高亮
- **表单**: 统一的输入框样式

### 响应式断点
- **手机**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

---

## 🔄 状态管理

### Context结构
```typescript
// AdminContext
interface AdminContextType {
  user: AdminUser | null
  permissions: Permission[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkPermission: (permission: Permission) => boolean
}

// UIContext
interface UIContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}
```

---

## 📈 性能优化

### 代码分割
- 按路由分割代码
- 懒加载非关键组件
- 预加载常用页面

### 数据缓存
- API响应缓存
- 静态资源缓存
- 用户权限缓存

### 优化策略
- 虚拟滚动大列表
- 图片懒加载
- 防抖搜索
- 分页加载

---

## 🔒 安全考虑

### 身份验证
- JWT token存储在HTTP-only cookie
- Token自动刷新机制
- 多设备登录管理

### 权限控制
- 前端权限检查
- 后端API权限验证
- 敏感操作二次确认

### 数据安全
- 输入数据验证
- XSS防护
- CSRF防护
- SQL注入防护

---

## 📱 移动端适配

### 响应式设计
- 侧边栏在移动端收起
- 表格横向滚动
- 触摸友好的按钮尺寸

### 移动端优化
- 简化操作流程
- 优化加载速度
- 适配手势操作

---

**文档版本**: v1.0  
**创建日期**: 2024-03-15  
**更新日期**: 2024-03-15
