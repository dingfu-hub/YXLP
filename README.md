# 🚀 YXLP 企业级服装出口电商平台

## 📖 项目简介

YXLP是一个现代化的企业级服装出口电商平台，集成了多语言新闻系统、产品管理、用户管理等核心功能。

## ⚡ 真正的一键启动

```bash
# 克隆项目后，运行这一条命令即可
npm run quick-start
```

**就这么简单！** 这个命令会自动完成所有设置并启动项目。

### 🤖 给Augment AI用户
直接告诉Augment AI：
```
请帮我启动YXLP项目：直接运行 npm run quick-start 命令。
```

## 📋 环境要求

- **Node.js** >= 18.0.0 ([下载地址](https://nodejs.org/))
- **Git** ([下载地址](https://git-scm.com/))

**不需要安装Docker、PostgreSQL等复杂服务！**

## 🌐 访问地址

启动成功后：
- **前端应用**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin  
- **API接口**: http://localhost:3001

## 🔑 默认账号

- 管理员: `admin` / `admin123`

## 📁 项目结构

```
yxlp/
├── apps/
│   ├── web/              # 前端应用 (Next.js)
│   │   ├── src/          # 源代码
│   │   ├── data/         # SQLite数据库
│   │   └── .env.local    # 环境配置
│   └── api/              # 后端API (NestJS)
│       ├── src/          # 源代码  
│       └── .env.local    # 环境配置
├── 项目启动指南.md        # 详细启动说明
├── 账号密码.md           # 各种账号信息
└── 反思文档.md           # 问题解决记录
```

## 🛠️ 开发命令

```bash
npm run dev          # 启动所有服务
npm run dev:web      # 只启动前端
npm run dev:api      # 只启动后端
npm run build        # 构建项目
npm run lint         # 代码检查
npm run reset        # 重置环境（遇到问题时使用）
```

## 🌟 核心功能

- ✅ **多语言新闻系统** - RSS采集 + AI翻译
- ✅ **用户管理系统** - 注册/登录/权限控制
- ✅ **产品管理系统** - 商品展示/分类管理
- ✅ **管理后台** - 数据管理/系统配置
- ✅ **国际化支持** - 中英文切换
- ✅ **响应式设计** - 支持移动端

## 🛠️ 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **后端**: NestJS + TypeORM + SQLite
- **数据库**: SQLite (单文件，无需安装)

## 🆘 遇到问题？

1. 查看 `项目启动指南.md` 详细说明
2. 运行 `npm run reset` 重置环境
3. 检查 Node.js 版本是否 >= 18
4. 联系项目负责人

---

**🎉 现在开始开发吧！**
