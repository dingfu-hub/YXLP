# YXLP 企业网站系统 - React 前端

## 项目概述

YXLP 是一个现代化的企业网站管理系统，提供完整的内容管理、用户管理、数据分析等功能。

## 核心功能

### 🏠 企业官网前台
- **首页展示**：企业介绍、产品展示、服务介绍
- **响应式设计**：适配各种设备和屏幕尺寸
- **SEO优化**：搜索引擎友好的页面结构

### 📊 管理后台
- **仪表板**：系统概览、数据统计、快速操作
- **内容管理**：新闻、文章、页面的增删改查
- **用户管理**：用户注册、权限管理、用户分析
- **数据分析**：访问统计、用户行为分析
- **系统设置**：网站配置、主题设置、SEO设置

## 技术栈

- **框架**：React 18 + TypeScript
- **路由**：React Router v6
- **样式**：Tailwind CSS
- **构建工具**：Create React App
- **状态管理**：React Hooks + Context API
- **HTTP客户端**：Fetch API

## 项目结构

```
src/
├── components/           # 组件
│   └── admin/           # 管理后台组件
├── pages/               # 页面
│   ├── HomePage.tsx     # 首页
│   └── admin/           # 管理后台页面
├── hooks/               # 自定义Hooks
├── services/            # API服务
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── App.tsx              # 根组件
├── index.tsx            # 应用入口
└── index.css            # 全局样式
```

## 开发指南

### 启动开发服务器
```bash
npm start
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm test
```

## 功能模块

### 1. 首页 (`/`)
- 企业介绍和展示
- 功能模块快速入口
- 响应式设计

### 2. 管理后台 (`/admin`)
- **仪表板** (`/admin/dashboard`) - 系统概览
- **内容管理** (`/admin/news`) - 新闻和文章管理
- **用户管理** (`/admin/users`) - 用户和权限管理
- **数据分析** (`/admin/analytics`) - 数据报表和分析
- **系统设置** (`/admin/settings`) - 系统配置

## 特性

### 响应式设计
- 移动端优先的设计理念
- 适配各种屏幕尺寸
- 触摸友好的交互

### 现代化UI
- 基于Tailwind CSS的现代设计
- 一致的视觉语言
- 直观的用户体验

### 模块化架构
- 组件化开发
- 可复用的UI组件
- 清晰的代码结构

### TypeScript支持
- 类型安全
- 更好的开发体验
- 减少运行时错误

## 部署

### 构建应用
```bash
npm run build
```

### 部署到静态服务器
构建完成后，将 `build` 文件夹的内容部署到任何静态文件服务器即可。

### 环境变量
在 `.env` 文件中配置环境变量：
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_TITLE=YXLP 企业网站系统
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

---

© 2024 YXLP 企业网站系统. 保留所有权利.
