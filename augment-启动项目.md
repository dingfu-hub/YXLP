# 🤖 Augment AI 一键启动YXLP项目指令

## 📋 给Augment AI的完整启动指令

当团队成员使用Augment AI时，可以直接复制以下指令：

```
请帮我启动YXLP项目，执行以下步骤：

1. 检查Node.js版本是否>=18，如果不满足请提示用户升级
2. 运行 npm install 安装根目录依赖
3. 运行 cd apps/web && npm install && cd ../.. 安装前端依赖  
4. 运行 cd apps/api && npm install && cd ../.. 安装后端依赖
5. 检查并创建环境配置文件：
   - 如果不存在 apps/web/.env.local，创建基本配置：
     NEXT_PUBLIC_API_URL=http://localhost:3001
     NODE_ENV=development
   - 如果不存在 apps/api/.env.local，创建基本配置：
     NODE_ENV=development
     PORT=3001
     DATABASE_PATH=data/yxlp.db
     JWT_SECRET=yxlp_jwt_secret_key_2024
6. 创建数据目录 apps/web/data 和 apps/api/data
7. 运行 npm run dev 启动开发服务器
8. 提示用户访问 http://localhost:3000 查看前端，http://localhost:3000/admin 访问管理后台（账号：admin/admin123）

如果遇到任何错误，请检查并解决后继续执行。
```

## 🎯 简化版指令（推荐）

```
请帮我一键启动YXLP项目：运行 npm run quick-start 命令，如果失败则按照 项目启动指南.md 的步骤手动执行。启动成功后提示访问地址和默认账号。
```

## 🔧 故障排除指令

如果启动失败，可以使用：

```
YXLP项目启动失败，请帮我排查问题：
1. 检查Node.js版本
2. 清理依赖：npm run reset
3. 检查端口占用：netstat -ano | findstr :3000
4. 查看错误日志并解决
5. 重新启动项目
```

## 📝 使用说明

1. **团队成员**：直接复制上面的指令给Augment AI
2. **项目负责人**：可以把这个文档分享给团队
3. **Augment AI**：会自动执行所有步骤，无需人工干预

## 🎉 预期结果

执行成功后，团队成员应该能够：
- ✅ 访问 http://localhost:3000 看到前端页面
- ✅ 访问 http://localhost:3000/admin 进入管理后台
- ✅ 使用 admin/admin123 登录管理后台
- ✅ 开始正常开发工作

---

**🤖 专为Augment AI优化的启动流程！**
