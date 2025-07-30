# 内裤工厂企业网站系统 (yxlp-qiye)

本项目是一个前后端分离的企业网站系统，旨在为内裤工厂提供产品展示、在线销售、客户管理等功能。

## 技术栈

- **后端**: Java, Spring Boot, Spring Data JPA, MySQL
- **前端**: Vue.js, Vite, Vue Router, Pinia
- **数据库**: MySQL

## 项目结构

```
qiye/
├── backend/      # 后端 Spring Boot 项目
├── yxlpUi/       # 前端 Vue.js 项目 (yxlpUi 是你命名的文件夹)
├── 需求.md       # 项目需求文档
└── README.md     # 本文件
```

## 快速开始

在开始之前，请确保你已经安装了以下环境：

- JDK 17 或更高版本
- Maven
- Node.js 18 或更高版本
- MySQL 数据库

### 1. 启动后端服务

首先，请确保你的 MySQL 数据库正在运行，并根据 `backend/src/main/resources/application.properties` 文件中的配置创建好数据库（或确保配置了 `createDatabaseIfNotExist=true`）。

```bash
# 进入后端项目目录
cd backend

# 启动 Spring Boot 应用
./mvnw spring-boot:run
```

服务启动后，后端 API 将在 `http://localhost:8080` 上可用。

### 2. 启动前端服务

```bash
# 进入前端项目目录
cd yxlpUi

# (如果尚未操作) 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务启动后，你可以在浏览器中访问 `http://localhost:5173` (或终端提示的地址) 来查看前端页面。