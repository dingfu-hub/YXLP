# 开发指南

## 项目概述

YXLP 是一个企业级服装出口电商平台，采用现代化的技术栈和微服务架构，支持 B2B 和 B2C 双模式交易。

## 技术栈

### 前端
- **Next.js 14+**: React 框架，支持 SSR/SSG
- **TypeScript**: 类型安全
- **Tailwind CSS**: 原子化 CSS 框架
- **Zustand**: 轻量级状态管理
- **React Hook Form**: 表单处理
- **SWR**: 数据获取和缓存
- **Framer Motion**: 动画库

### 后端
- **NestJS**: Node.js 框架
- **TypeScript**: 类型安全
- **PostgreSQL**: 主数据库
- **Redis**: 缓存和消息队列
- **Elasticsearch**: 搜索引擎
- **Bull**: 任务队列
- **Passport.js**: 认证中间件

### DevOps
- **Docker**: 容器化
- **Kubernetes**: 容器编排
- **GitHub Actions**: CI/CD
- **Cloudflare**: CDN 和安全

## 开发环境搭建

### 1. 环境要求

- Node.js 18+
- Docker & Docker Compose
- Git

### 2. 克隆项目

```bash
git clone <repository-url>
cd yxlp
```

### 3. 安装依赖

```bash
npm install
```

### 4. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 5. 启动开发环境

```bash
# 启动基础服务
npm run docker:up

# 启动后端 API
npm run dev:api

# 启动前端应用
npm run dev:web

# 启动管理后台
npm run dev:admin
```

### 6. 数据库初始化

```bash
# 运行数据库迁移
npm run db:migrate

# 填充种子数据
npm run db:seed
```

## 项目结构详解

```
yxlp/
├── apps/                           # 应用目录
│   ├── web/                        # 前端 Web 应用
│   │   ├── src/
│   │   │   ├── app/                # App Router 页面
│   │   │   ├── components/         # React 组件
│   │   │   ├── hooks/              # 自定义 Hooks
│   │   │   ├── lib/                # 工具库
│   │   │   ├── stores/             # Zustand 状态管理
│   │   │   └── types/              # 类型定义
│   │   ├── public/                 # 静态资源
│   │   └── package.json
│   ├── admin/                      # 管理后台
│   └── api/                        # 后端 API
│       ├── src/
│       │   ├── modules/            # 业务模块
│       │   ├── shared/             # 共享模块
│       │   ├── config/             # 配置文件
│       │   ├── database/           # 数据库相关
│       │   └── common/             # 通用组件
│       └── package.json
├── packages/                       # 共享包
│   ├── ui/                         # UI 组件库
│   ├── types/                      # TypeScript 类型
│   ├── utils/                      # 工具函数
│   └── config/                     # 配置文件
├── infrastructure/                 # 基础设施
│   ├── docker/                     # Docker 配置
│   ├── k8s/                        # Kubernetes 配置
│   └── terraform/                  # Terraform 配置
├── docs/                           # 文档
└── scripts/                        # 脚本文件
```

## 开发规范

### 1. 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 配置
- 使用 Conventional Commits 提交规范
- 组件和函数使用 PascalCase 命名
- 变量和方法使用 camelCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名

### 2. Git 工作流

```bash
# 创建功能分支
git checkout -b feature/user-authentication

# 提交代码
git add .
git commit -m "feat: add user authentication module"

# 推送分支
git push origin feature/user-authentication

# 创建 Pull Request
```

### 3. 提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型说明：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 4. 分支策略

- `main`: 主分支，用于生产环境
- `develop`: 开发分支，用于集成测试
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支
- `release/*`: 发布分支

## API 开发指南

### 1. 模块结构

```typescript
// 模块目录结构
src/modules/users/
├── controllers/
│   └── users.controller.ts
├── services/
│   └── users.service.ts
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── guards/
│   └── user-owner.guard.ts
└── users.module.ts
```

### 2. 控制器示例

```typescript
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '成功返回用户列表' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }
}
```

### 3. 服务层示例

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user')
    
    if (query.search) {
      queryBuilder.andWhere(
        'user.email ILIKE :search OR user.firstName ILIKE :search',
        { search: `%${query.search}%` }
      )
    }

    const [items, total] = await queryBuilder
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount()

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    }
  }
}
```

## 前端开发指南

### 1. 组件开发

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}) => {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
          'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 2. 状态管理

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (credentials) => {
    try {
      const response = await authApi.login(credentials)
      set({
        user: response.user,
        isAuthenticated: true,
      })
    } catch (error) {
      throw error
    }
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))
```

### 3. 数据获取

```typescript
// hooks/useProducts.ts
export const useProducts = (params?: ProductQueryParams) => {
  const { data, error, mutate } = useSWR(
    ['products', params],
    () => productsApi.getProducts(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    products: data?.items || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  }
}
```

## 测试指南

### 1. 单元测试

```typescript
// users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService
  let repository: Repository<User>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should find all users', async () => {
    const users = [{ id: '1', email: 'test@example.com' }]
    jest.spyOn(repository, 'find').mockResolvedValue(users as User[])

    const result = await service.findAll({})
    expect(result.items).toEqual(users)
  })
})
```

### 2. 集成测试

```typescript
// users.controller.e2e-spec.ts
describe('UsersController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items')
        expect(res.body).toHaveProperty('total')
      })
  })
})
```

## 部署指南

### 1. Docker 构建

```bash
# 构建镜像
docker build -t yxlp-api ./apps/api
docker build -t yxlp-web ./apps/web

# 运行容器
docker run -p 3001:3001 yxlp-api
docker run -p 3000:3000 yxlp-web
```

### 2. Kubernetes 部署

```bash
# 应用配置
kubectl apply -f infrastructure/k8s/

# 查看状态
kubectl get pods
kubectl get services
```

### 3. 生产环境检查清单

- [ ] 环境变量配置正确
- [ ] 数据库连接正常
- [ ] Redis 连接正常
- [ ] SSL 证书配置
- [ ] 域名解析正确
- [ ] 监控和日志配置
- [ ] 备份策略制定
- [ ] 安全扫描通过

## 常见问题

### 1. 数据库连接失败

检查数据库配置和网络连接：

```bash
# 检查数据库状态
docker ps | grep postgres

# 测试连接
psql -h localhost -p 5432 -U yxlp_user -d yxlp_db
```

### 2. Redis 连接失败

检查 Redis 配置：

```bash
# 检查 Redis 状态
docker ps | grep redis

# 测试连接
redis-cli -h localhost -p 6379 ping
```

### 3. 前端构建失败

清理缓存并重新安装依赖：

```bash
# 清理缓存
npm run clean
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request
5. 代码审查
6. 合并代码

## 联系方式

- 项目负责人: [Your Name]
- 邮箱: [your.email@example.com]
- 文档: [Documentation URL]
- 问题反馈: [Issues URL]
