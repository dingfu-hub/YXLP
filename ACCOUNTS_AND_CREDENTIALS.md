# 🔐 YXLP 服装电商平台 - 账号与数据库信息

## 📋 项目概览
- **项目名称**: YXLP 专业服装电商平台
- **项目类型**: Next.js + TypeScript 服装电商网站
- **开发环境**: Windows 11
- **本地端口**: http://localhost:3000

---

## 🌐 网站访问信息

### 主要页面
- **主页**: http://localhost:3000
- **产品中心**: http://localhost:3000/products
- **产品分类**: http://localhost:3000/categories  
- **新闻资讯**: http://localhost:3000/news
- **合作伙伴**: http://localhost:3000/distributors

### 管理后台 (待开发)
- **后台地址**: http://localhost:3000/admin
- **管理员账号**: admin@yxlp.com
- **管理员密码**: Admin123456!

---

## 👤 用户账号信息

### 测试用户账号
```
用户类型: 普通用户
邮箱: user@yxlp.com
密码: User123456!
手机: 13800138001
姓名: 张三
```

```
用户类型: VIP用户
邮箱: vip@yxlp.com
密码: Vip123456!
手机: 13800138002
姓名: 李四
```

```
用户类型: 商家用户
邮箱: merchant@yxlp.com
密码: Merchant123456!
手机: 13800138003
姓名: 王五
公司: 时尚服装有限公司
```

### 管理员账号
```
用户类型: 超级管理员
邮箱: admin@yxlp.com
密码: Admin123456!
手机: 13800138000
姓名: 系统管理员
```

```
用户类型: 内容管理员
邮箱: editor@yxlp.com
密码: Editor123456!
手机: 13800138004
姓名: 内容编辑
```

---

## 🗄️ 数据库信息

### 本地开发数据库 (SQLite)
```
数据库类型: SQLite
数据库文件: ./data/yxlp.db
连接字符串: sqlite:./data/yxlp.db
```

### 生产环境数据库 (MySQL - 待配置)
```
主机地址: localhost
端口: 3306
数据库名: yxlp_production
用户名: yxlp_user
密码: YxlpDb2024!
字符集: utf8mb4
```

### 测试环境数据库 (MySQL - 待配置)
```
主机地址: localhost
端口: 3306
数据库名: yxlp_test
用户名: yxlp_test_user
密码: YxlpTestDb2024!
字符集: utf8mb4
```

---

## 🔑 第三方服务账号

### 图片服务 (Unsplash)
```
服务商: Unsplash
API Key: (当前使用免费API，无需密钥)
使用说明: 用于产品图片和新闻配图
API文档: https://unsplash.com/developers
```

### 邮件服务 (待配置)
```
服务商: 阿里云邮件推送
Access Key ID: [待配置]
Access Key Secret: [待配置]
发送域名: mail.yxlp.com
```

### 短信服务 (待配置)
```
服务商: 阿里云短信服务
Access Key ID: [待配置]
Access Key Secret: [待配置]
签名: 【YXLP服装】
模板ID: SMS_123456789
```

### 支付服务 (待配置)
```
支付宝:
App ID: [待配置]
私钥: [待配置]
公钥: [待配置]

微信支付:
商户号: [待配置]
API密钥: [待配置]
证书路径: [待配置]
```

---

## 📊 数据统计

### 产品数据
- **总商品数量**: 5,000 件
- **商品分类**: 8 个主要分类
- **品牌数量**: 35 个知名品牌
- **价格区间**: ¥39 - ¥2,000

### 新闻数据
- **总文章数**: 58 篇
- **文章分类**: 7 个专业分类
- **作者团队**: 10 位编辑和时尚达人
- **内容标签**: 17 个不同标签

### 用户数据 (模拟)
- **注册用户**: 15,000+ 用户
- **活跃用户**: 8,500+ 用户
- **VIP用户**: 1,200+ 用户
- **商家用户**: 150+ 商家

---

## 🛠️ 开发环境配置

### 环境变量 (.env.local)
```bash
# 数据库配置
DATABASE_URL="sqlite:./data/yxlp.db"

# JWT密钥
JWT_SECRET="yxlp_jwt_secret_key_2024"

# 邮件配置
MAIL_HOST="smtp.aliyun.com"
MAIL_PORT="465"
MAIL_USER="noreply@yxlp.com"
MAIL_PASS="[待配置]"

# 短信配置
SMS_ACCESS_KEY_ID="[待配置]"
SMS_ACCESS_KEY_SECRET="[待配置]"

# 支付配置
ALIPAY_APP_ID="[待配置]"
ALIPAY_PRIVATE_KEY="[待配置]"
WECHAT_PAY_MERCHANT_ID="[待配置]"
WECHAT_PAY_API_KEY="[待配置]"

# 图片上传
UPLOAD_PATH="./public/uploads"
MAX_FILE_SIZE="5MB"

# 其他配置
SITE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@yxlp.com"
```

---

## 🔒 安全信息

### API 密钥
```
内部API密钥: yxlp_internal_api_key_2024
外部API密钥: yxlp_external_api_key_2024
Webhook密钥: yxlp_webhook_secret_2024
```

### 加密信息
```
密码加密: bcrypt (rounds: 12)
会话密钥: yxlp_session_secret_2024
Cookie密钥: yxlp_cookie_secret_2024
```

---

## 📝 重要说明

### 安全提醒
⚠️ **重要**: 此文件包含敏感信息，请妥善保管
- 不要将此文件提交到公共代码仓库
- 定期更换密码和API密钥
- 生产环境使用强密码和加密连接

### 使用说明
1. 开发环境可直接使用上述账号信息
2. 生产环境部署前需要更新所有密码
3. 第三方服务需要实际申请和配置
4. 数据库连接信息需要根据实际环境调整

### 联系信息
- **技术负责人**: [您的姓名]
- **联系邮箱**: [您的邮箱]
- **联系电话**: [您的电话]

---

## 📅 更新记录

| 日期 | 更新内容 | 更新人 |
|------|----------|--------|
| 2024-03-15 | 创建账号信息文档 | 系统管理员 |
| 2024-03-15 | 添加测试账号和数据库配置 | 系统管理员 |

---

**最后更新**: 2024年3月15日  
**文档版本**: v1.0  
**项目状态**: 开发中
