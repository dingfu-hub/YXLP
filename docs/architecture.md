# 系统架构设计

## 整体架构

### 架构模式
采用**微服务架构**，结合**前后端分离**和**云原生**设计理念：

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Cloudflare)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Load Balancer                            │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
    ┌─────────┴─────────┐       ┌─────────┴─────────┐
    │   Frontend Apps   │       │   Backend APIs    │
    │                   │       │                   │
    │ ┌───────────────┐ │       │ ┌───────────────┐ │
    │ │   Web App     │ │       │ │   Auth API    │ │
    │ │  (Next.js)    │ │       │ │   (NestJS)    │ │
    │ └───────────────┘ │       │ └───────────────┘ │
    │                   │       │                   │
    │ ┌───────────────┐ │       │ ┌───────────────┐ │
    │ │  Admin Panel  │ │       │ │ Product API   │ │
    │ │  (Next.js)    │ │       │ │   (NestJS)    │ │
    │ └───────────────┘ │       │ └───────────────┘ │
    └───────────────────┘       │                   │
                                │ ┌───────────────┐ │
                                │ │  Order API    │ │
                                │ │   (NestJS)    │ │
                                │ └───────────────┘ │
                                │                   │
                                │ ┌───────────────┐ │
                                │ │   CMS API     │ │
                                │ │   (NestJS)    │ │
                                │ └───────────────┘ │
                                └───────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
          ┌─────────┴─────────┐ ┌─────────┴─────────┐ ┌─────────┴─────────┐
          │   PostgreSQL      │ │      Redis        │ │  Elasticsearch    │
          │   (Primary DB)    │ │     (Cache)       │ │    (Search)       │
          └───────────────────┘ └───────────────────┘ └───────────────────┘
```

## 技术选型详解

### 前端技术栈

#### Next.js 14+ 选择理由
- **SSR/SSG 支持**: 提升 SEO 和首屏加载速度
- **国际化内置支持**: 完善的 i18n 路由和内容管理
- **API Routes**: 可作为 BFF (Backend for Frontend)
- **图片优化**: 自动图片优化和懒加载
- **性能优化**: 自动代码分割和预加载

#### 状态管理: Zustand
```typescript
// 轻量级状态管理示例
interface UserStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}))
```

### 后端技术栈

#### NestJS 选择理由
- **模块化架构**: 清晰的模块划分和依赖注入
- **装饰器支持**: 简化路由、验证、权限控制
- **TypeScript 原生支持**: 类型安全和开发体验
- **丰富的生态**: 内置支持各种数据库、缓存、消息队列

#### 数据库设计

**PostgreSQL 主数据库**
- 强一致性事务支持
- 丰富的数据类型（JSON、数组等）
- 优秀的性能和扩展性

**Redis 缓存层**
- 会话存储
- 热点数据缓存
- 消息队列
- 分布式锁

**Elasticsearch 搜索引擎**
- 全文搜索
- 商品筛选
- 日志分析
- 实时聚合

## 模块架构设计

### 1. 认证授权模块 (AuthModule)

```typescript
// 用户实体设计
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  passwordHash: string

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole

  @Column({ type: 'jsonb', nullable: true })
  profile: UserProfile

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

// 权限控制装饰器
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  // 管理员专用接口
}
```

### 2. 商品管理模块 (ProductModule)

```typescript
// 商品实体关系设计
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'jsonb' })
  name: Record<string, string> // 多语言名称

  @Column({ type: 'jsonb' })
  description: Record<string, string> // 多语言描述

  @OneToMany(() => SKU, sku => sku.product)
  skus: SKU[]

  @ManyToOne(() => Category)
  category: Category
}

@Entity('skus')
export class SKU {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  size: string

  @Column()
  color: string

  @Column({ type: 'decimal' })
  price: number

  @Column({ type: 'integer' })
  stock: number

  @ManyToOne(() => Product)
  product: Product
}
```

### 3. 订单管理模块 (OrderModule)

```typescript
// 订单状态流转
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// 订单实体
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  orderNumber: string

  @ManyToOne(() => User)
  user: User

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[]

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus

  @Column({ type: 'decimal' })
  totalAmount: number

  @Column({ type: 'jsonb' })
  shippingAddress: Address

  @CreateDateColumn()
  createdAt: Date
}
```

## 安全架构

### 认证流程
1. **OAuth 2.0 + JWT**: 标准化认证授权
2. **多因素认证**: 重要操作二次验证
3. **会话管理**: Redis 存储会话状态
4. **权限控制**: RBAC 角色权限模型

### 数据安全
- **传输加密**: 全站 HTTPS
- **存储加密**: 敏感数据加密存储
- **访问控制**: 最小权限原则
- **审计日志**: 操作记录和追踪

### 防护措施
- **Rate Limiting**: API 访问频率限制
- **CORS 配置**: 跨域请求控制
- **SQL 注入防护**: ORM 参数化查询
- **XSS 防护**: 输入验证和输出编码

## 性能优化策略

### 前端优化
- **代码分割**: 按路由和组件分割
- **图片优化**: WebP 格式和懒加载
- **缓存策略**: 静态资源长期缓存
- **CDN 加速**: 全球内容分发

### 后端优化
- **数据库优化**: 索引优化和查询优化
- **缓存策略**: 多层缓存架构
- **连接池**: 数据库连接复用
- **异步处理**: 耗时任务异步化

### 基础设施优化
- **负载均衡**: 多实例负载分发
- **自动扩展**: 基于负载自动扩容
- **监控告警**: 实时性能监控
- **容灾备份**: 多地域部署

## 国际化架构

### 多语言支持
- **路由国际化**: `/en/products`, `/zh/products`
- **内容国际化**: 数据库多语言字段
- **时区处理**: 用户本地时区显示
- **货币支持**: 多币种价格展示

### SEO 优化
- **hreflang 标签**: 搜索引擎语言识别
- **结构化数据**: JSON-LD 格式
- **站点地图**: 多语言站点地图
- **元数据优化**: 多语言 meta 标签

## 监控和运维

### 监控体系
- **应用监控**: APM 性能监控
- **基础设施监控**: 服务器资源监控
- **业务监控**: 关键指标监控
- **日志聚合**: 集中化日志管理

### 部署策略
- **蓝绿部署**: 零停机部署
- **滚动更新**: 渐进式更新
- **回滚机制**: 快速回滚能力
- **健康检查**: 服务健康状态检测
