# YXLP Platform - API 接口文档

## 📋 目录

1. [接口概述](#接口概述)
2. [认证机制](#认证机制)
3. [通用规范](#通用规范)
4. [认证接口](#认证接口)
5. [用户接口](#用户接口)
6. [产品接口](#产品接口)
7. [分类接口](#分类接口)
8. [购物车接口](#购物车接口)
9. [订单接口](#订单接口)
10. [支付接口](#支付接口)
11. [文件上传接口](#文件上传接口)
12. [搜索接口](#搜索接口)
13. [错误码说明](#错误码说明)

## 🎯 接口概述

### 基础信息
- **API 版本**: v1
- **基础 URL**: `https://api.yxlp.com/api`
- **开发环境**: `http://localhost:3001/api`
- **协议**: HTTPS (生产环境)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 接口特性
- RESTful 设计风格
- JWT Token 认证
- 请求限流保护
- 多语言支持
- 分页查询
- 实时搜索
- 文件上传

## 🔐 认证机制

### JWT Token 认证

所有需要认证的接口都需要在请求头中携带 JWT Token：

```http
Authorization: Bearer <access_token>
```

### Token 获取

通过登录接口获取 Token：

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

### Token 刷新

当 Access Token 过期时，使用 Refresh Token 获取新的 Token：

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### 权限级别

- **公开接口**: 无需认证
- **用户接口**: 需要用户登录
- **管理员接口**: 需要管理员权限
- **经销商接口**: 需要经销商权限

## 📝 通用规范

### 请求格式

```http
POST /api/endpoint
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
X-API-Version: v1

{
  "field1": "value1",
  "field2": "value2"
}
```

### 响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 分页参数

```http
GET /api/endpoint?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

- `page`: 页码，从 1 开始
- `limit`: 每页数量，最大 100
- `sortBy`: 排序字段
- `sortOrder`: 排序方向 (asc/desc)

### 多语言支持

```http
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

支持的语言：
- `en`: 英语
- `zh`: 中文
- `es`: 西班牙语
- `fr`: 法语
- `de`: 德语

## 🔑 认证接口

### 用户注册

```http
POST /api/auth/register
```

**请求参数:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "country": "US",
  "language": "en",
  "acceptTerms": true,
  "company": {
    "name": "Fashion Inc.",
    "registrationNumber": "123456789",
    "industry": "Fashion Retail",
    "website": "https://fashion.com"
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "avatar": null,
        "language": "en",
        "country": "US"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 900
    }
  }
}
```

### 用户登录

```http
POST /api/auth/login
```

**请求参数:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "avatar": "https://cdn.yxlp.com/avatars/user.jpg",
        "language": "en",
        "country": "US"
      }
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 900
    }
  }
}
```

### 刷新令牌

```http
POST /api/auth/refresh
```

**请求参数:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### 用户登出

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

### 忘记密码

```http
POST /api/auth/forgot-password
```

**请求参数:**
```json
{
  "email": "user@example.com"
}
```

### 重置密码

```http
POST /api/auth/reset-password
```

**请求参数:**
```json
{
  "token": "reset_token",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### 修改密码

```http
POST /api/auth/change-password
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### 邮箱验证

```http
POST /api/auth/verify-email
```

**请求参数:**
```json
{
  "token": "verification_token"
}
```

### 获取当前用户信息

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cdn.yxlp.com/avatars/user.jpg",
    "phone": "+1234567890",
    "country": "US",
    "language": "en",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  }
}
```

## 👤 用户接口

### 更新用户资料

```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "avatar": "https://cdn.yxlp.com/avatars/new-avatar.jpg",
  "preferences": {
    "language": "en",
    "currency": "USD",
    "timezone": "UTC",
    "notifications": {
      "email": {
        "marketing": true,
        "orderUpdates": true,
        "newsletter": false
      }
    }
  }
}
```

### 获取用户地址列表

```http
GET /api/users/addresses
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "shipping",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Fashion Inc.",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "city": "New York",
      "province": "NY",
      "country": "US",
      "zip": "10001",
      "phone": "+1234567890",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 添加用户地址

```http
POST /api/users/addresses
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "type": "shipping",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Fashion Inc.",
  "address1": "123 Main St",
  "address2": "Apt 4B",
  "city": "New York",
  "province": "NY",
  "country": "US",
  "zip": "10001",
  "phone": "+1234567890",
  "isDefault": false
}
```

## 🛍️ 产品接口

### 获取产品列表

```http
GET /api/products
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `categoryId`: 分类 ID
- `brand`: 品牌名称
- `status`: 产品状态 (active/inactive)
- `tags`: 标签数组
- `priceMin`: 最低价格
- `priceMax`: 最高价格
- `inStock`: 是否有库存 (true/false)
- `search`: 搜索关键词
- `sortBy`: 排序字段 (name/price/createdAt/popularity)
- `sortOrder`: 排序方向 (asc/desc)
- `language`: 语言代码 (默认: en)

**请求示例:**
```http
GET /api/products?page=1&limit=20&categoryId=uuid&priceMin=50&priceMax=200&inStock=true&sortBy=price&sortOrder=asc
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "sku": "SHIRT-001",
        "name": {
          "en": "Premium Cotton Business Shirt",
          "zh": "优质棉质商务衬衫"
        },
        "description": {
          "en": "High-quality cotton shirt perfect for business occasions",
          "zh": "高品质棉质衬衫，商务场合的完美选择"
        },
        "shortDescription": {
          "en": "Premium cotton business shirt",
          "zh": "优质棉质商务衬衫"
        },
        "brand": "YXLP Collection",
        "category": {
          "id": "uuid",
          "name": {
            "en": "Business Shirts",
            "zh": "商务衬衫"
          },
          "slug": {
            "en": "business-shirts",
            "zh": "shangwu-chenshan"
          }
        },
        "tags": ["cotton", "business", "formal"],
        "status": "active",
        "images": [
          {
            "id": "uuid",
            "url": "https://cdn.yxlp.com/products/shirt-1.jpg",
            "alt": {
              "en": "Premium Cotton Business Shirt - Front View",
              "zh": "优质棉质商务衬衫 - 正面视图"
            },
            "order": 0,
            "isMain": true
          }
        ],
        "variants": [
          {
            "id": "uuid",
            "sku": "SHIRT-001-WH-M",
            "name": {
              "en": "White / Medium",
              "zh": "白色 / 中号"
            },
            "attributes": [
              {
                "name": "color",
                "value": "white",
                "displayName": {
                  "en": "Color",
                  "zh": "颜色"
                },
                "displayValue": {
                  "en": "White",
                  "zh": "白色"
                }
              },
              {
                "name": "size",
                "value": "M",
                "displayName": {
                  "en": "Size",
                  "zh": "尺寸"
                },
                "displayValue": {
                  "en": "Medium",
                  "zh": "中号"
                }
              }
            ],
            "price": 89.99,
            "compareAtPrice": 129.99,
            "stock": 15,
            "isDefault": true,
            "status": "active"
          }
        ],
        "specifications": [
          {
            "id": "uuid",
            "name": {
              "en": "Material",
              "zh": "材质"
            },
            "value": {
              "en": "100% Premium Cotton",
              "zh": "100% 优质棉"
            },
            "group": "materials",
            "order": 0
          }
        ],
        "pricing": {
          "basePrice": 89.99,
          "currency": "USD",
          "minPrice": 89.99,
          "maxPrice": 89.99
        },
        "inventory": {
          "trackQuantity": true,
          "totalStock": 45,
          "isInStock": true
        },
        "stats": {
          "viewCount": 1250,
          "orderCount": 89,
          "averageRating": 4.8,
          "reviewCount": 127,
          "favoriteCount": 234
        },
        "seo": {
          "title": {
            "en": "Premium Cotton Business Shirt - YXLP Collection",
            "zh": "优质棉质商务衬衫 - YXLP系列"
          },
          "description": {
            "en": "High-quality cotton business shirt perfect for professional occasions",
            "zh": "高品质棉质商务衬衫，专业场合的完美选择"
          },
          "keywords": ["cotton", "business", "shirt", "professional"],
          "slug": {
            "en": "premium-cotton-business-shirt",
            "zh": "youzhimianzhishangwuchenshan"
          }
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 获取产品详情

```http
GET /api/products/{id}
```

**路径参数:**
- `id`: 产品 ID

**查询参数:**
- `language`: 语言代码 (默认: en)

**响应示例:**
```json
{
  "success": true,
  "data": {
    // 完整的产品信息，包含所有字段
    "id": "uuid",
    "sku": "SHIRT-001",
    // ... 其他字段同产品列表
    "relatedProducts": [
      // 相关产品列表
    ]
  }
}
```

### 根据 SKU 获取产品

```http
GET /api/products/sku/{sku}
```

**路径参数:**
- `sku`: 产品 SKU

### 根据 Slug 获取产品

```http
GET /api/products/slug/{slug}
```

**路径参数:**
- `slug`: 产品 Slug

**查询参数:**
- `language`: 语言代码 (默认: en)

### 获取推荐产品

```http
GET /api/products/featured
```

**查询参数:**
- `limit`: 数量限制 (默认: 8)
- `language`: 语言代码

### 获取热销产品

```http
GET /api/products/bestsellers
```

**查询参数:**
- `limit`: 数量限制 (默认: 8)
- `language`: 语言代码

### 获取新品

```http
GET /api/products/new-arrivals
```

**查询参数:**
- `limit`: 数量限制 (默认: 8)
- `language`: 语言代码

### 获取相关产品

```http
GET /api/products/{id}/related
```

**路径参数:**
- `id`: 产品 ID

**查询参数:**
- `limit`: 数量限制 (默认: 4)

### 创建产品 (管理员)

```http
POST /api/products
Authorization: Bearer <admin_token>
```

**请求参数:**
```json
{
  "sku": "SHIRT-002",
  "name": {
    "en": "Elegant Summer Dress",
    "zh": "优雅夏季连衣裙"
  },
  "description": {
    "en": "Beautiful summer dress made from premium materials",
    "zh": "采用优质材料制作的美丽夏季连衣裙"
  },
  "shortDescription": {
    "en": "Elegant summer dress",
    "zh": "优雅夏季连衣裙"
  },
  "categoryId": "uuid",
  "brand": "YXLP Collection",
  "tags": ["dress", "summer", "elegant"],
  "images": [
    {
      "url": "https://cdn.yxlp.com/products/dress-1.jpg",
      "alt": {
        "en": "Elegant Summer Dress - Front View",
        "zh": "优雅夏季连衣裙 - 正面视图"
      },
      "order": 0,
      "isMain": true
    }
  ],
  "specifications": [
    {
      "name": {
        "en": "Material",
        "zh": "材质"
      },
      "value": {
        "en": "100% Silk",
        "zh": "100% 真丝"
      },
      "group": "materials",
      "order": 0
    }
  ],
  "variants": [
    {
      "sku": "DRESS-001-PK-S",
      "name": {
        "en": "Pink / Small",
        "zh": "粉色 / 小号"
      },
      "attributes": [
        {
          "name": "color",
          "value": "pink",
          "displayName": {
            "en": "Color",
            "zh": "颜色"
          },
          "displayValue": {
            "en": "Pink",
            "zh": "粉色"
          }
        }
      ],
      "price": 129.99,
      "compareAtPrice": 179.99,
      "stock": 20,
      "isDefault": true,
      "status": "active"
    }
  ],
  "seo": {
    "title": {
      "en": "Elegant Summer Dress - YXLP Collection",
      "zh": "优雅夏季连衣裙 - YXLP系列"
    },
    "description": {
      "en": "Beautiful summer dress perfect for any occasion",
      "zh": "适合任何场合的美丽夏季连衣裙"
    },
    "keywords": ["dress", "summer", "elegant", "silk"],
    "slug": {
      "en": "elegant-summer-dress",
      "zh": "youyaxiajilianyiqun"
    }
  },
  "pricing": {
    "basePrice": 129.99,
    "currency": "USD"
  },
  "inventory": {
    "trackQuantity": true,
    "allowBackorder": false,
    "lowStockThreshold": 5
  },
  "shipping": {
    "weight": 0.5,
    "weightUnit": "kg",
    "dimensions": {
      "length": 30,
      "width": 25,
      "height": 5,
      "unit": "cm"
    },
    "freeShipping": false
  }
}
```

### 更新产品 (管理员)

```http
PUT /api/products/{id}
Authorization: Bearer <admin_token>
```

**路径参数:**
- `id`: 产品 ID

**请求参数:** (部分更新)
```json
{
  "name": {
    "en": "Updated Product Name",
    "zh": "更新的产品名称"
  },
  "status": "active",
  "pricing": {
    "basePrice": 99.99
  }
}
```

### 删除产品 (管理员)

```http
DELETE /api/products/{id}
Authorization: Bearer <admin_token>
```

**路径参数:**
- `id`: 产品 ID

## 📂 分类接口

### 获取分类列表

```http
GET /api/categories
```

**查询参数:**
- `language`: 语言代码 (默认: en)
- `includeInactive`: 是否包含非活跃分类 (默认: false)
- `tree`: 是否返回树形结构 (默认: false)

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": {
        "en": "Men's Clothing",
        "zh": "男装"
      },
      "slug": {
        "en": "mens-clothing",
        "zh": "nanzhuang"
      },
      "description": {
        "en": "High-quality men's clothing collection",
        "zh": "高品质男装系列"
      },
      "image": "https://cdn.yxlp.com/categories/mens-clothing.jpg",
      "parentId": null,
      "order": 1,
      "isActive": true,
      "productCount": 150,
      "children": [
        {
          "id": "uuid",
          "name": {
            "en": "Business Shirts",
            "zh": "商务衬衫"
          },
          "slug": {
            "en": "business-shirts",
            "zh": "shangwu-chenshan"
          },
          "parentId": "parent-uuid",
          "order": 1,
          "isActive": true,
          "productCount": 45
        }
      ],
      "seo": {
        "title": {
          "en": "Men's Clothing - Premium Quality Fashion",
          "zh": "男装 - 优质时尚"
        },
        "description": {
          "en": "Discover our premium men's clothing collection",
          "zh": "探索我们的优质男装系列"
        },
        "keywords": ["men", "clothing", "fashion", "premium"]
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 获取分类详情

```http
GET /api/categories/{id}
```

**路径参数:**
- `id`: 分类 ID

**查询参数:**
- `language`: 语言代码 (默认: en)

### 根据 Slug 获取分类

```http
GET /api/categories/slug/{slug}
```

**路径参数:**
- `slug`: 分类 Slug

**查询参数:**
- `language`: 语言代码 (默认: en)

### 获取分类产品

```http
GET /api/categories/{id}/products
```

**路径参数:**
- `id`: 分类 ID

**查询参数:** (同产品列表接口)

### 创建分类 (管理员)

```http
POST /api/categories
Authorization: Bearer <admin_token>
```

**请求参数:**
```json
{
  "name": {
    "en": "Women's Clothing",
    "zh": "女装"
  },
  "slug": {
    "en": "womens-clothing",
    "zh": "nvzhuang"
  },
  "description": {
    "en": "Elegant women's clothing collection",
    "zh": "优雅女装系列"
  },
  "parentId": null,
  "image": "https://cdn.yxlp.com/categories/womens-clothing.jpg",
  "order": 2,
  "isActive": true,
  "seo": {
    "title": {
      "en": "Women's Clothing - Elegant Fashion",
      "zh": "女装 - 优雅时尚"
    },
    "description": {
      "en": "Discover our elegant women's clothing collection",
      "zh": "探索我们的优雅女装系列"
    },
    "keywords": ["women", "clothing", "fashion", "elegant"]
  }
}
```

## 🛒 购物车接口

### 获取购物车

```http
GET /api/cart
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "variantId": "uuid",
        "product": {
          "id": "uuid",
          "name": {
            "en": "Premium Cotton Business Shirt",
            "zh": "优质棉质商务衬衫"
          },
          "brand": "YXLP Collection",
          "images": [
            {
              "url": "https://cdn.yxlp.com/products/shirt-1.jpg",
              "alt": {
                "en": "Premium Cotton Business Shirt",
                "zh": "优质棉质商务衬衫"
              }
            }
          ]
        },
        "variant": {
          "id": "uuid",
          "sku": "SHIRT-001-WH-M",
          "name": {
            "en": "White / Medium",
            "zh": "白色 / 中号"
          },
          "attributes": [
            {
              "name": "color",
              "value": "white",
              "displayValue": {
                "en": "White",
                "zh": "白色"
              }
            }
          ],
          "price": 89.99,
          "stock": 15
        },
        "quantity": 2,
        "unitPrice": 89.99,
        "compareAtPrice": 129.99,
        "totalPrice": 179.98,
        "customizations": [],
        "metadata": {
          "addedFrom": "product_page"
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "itemCount": 2,
      "uniqueItemCount": 1,
      "subtotal": 179.98,
      "discountAmount": 0,
      "taxAmount": 16.20,
      "shippingAmount": 0,
      "total": 196.18,
      "currency": "USD"
    },
    "discounts": [],
    "taxes": [
      {
        "name": "Sales Tax",
        "rate": 0.09,
        "amount": 16.20,
        "jurisdiction": "NY"
      }
    ],
    "shipping": {
      "method": null,
      "cost": 0,
      "freeShippingThreshold": 100,
      "qualifiesForFreeShipping": true
    },
    "metadata": {
      "currency": "USD",
      "language": "en",
      "country": "US"
    },
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 添加商品到购物车

```http
POST /api/cart/add
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": 2,
  "customizations": [
    {
      "name": "engraving",
      "value": "John Doe",
      "price": 10.00,
      "displayName": {
        "en": "Engraving",
        "zh": "雕刻"
      }
    }
  ],
  "metadata": {
    "addedFrom": "product_page",
    "utm": {
      "source": "google",
      "medium": "cpc",
      "campaign": "summer_sale"
    }
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "item": {
      // 购物车商品信息
    },
    "cart": {
      // 更新后的购物车信息
    }
  },
  "message": "商品已添加到购物车"
}
```

### 更新购物车商品

```http
PUT /api/cart/items/{itemId}
Authorization: Bearer <token>
```

**路径参数:**
- `itemId`: 购物车商品 ID

**请求参数:**
```json
{
  "quantity": 3,
  "customizations": [
    {
      "name": "engraving",
      "value": "Jane Doe",
      "price": 10.00
    }
  ]
}
```

### 删除购物车商品

```http
DELETE /api/cart/items/{itemId}
Authorization: Bearer <token>
```

**路径参数:**
- `itemId`: 购物车商品 ID

### 清空购物车

```http
DELETE /api/cart
Authorization: Bearer <token>
```

### 应用优惠券

```http
POST /api/cart/apply-coupon
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "code": "SAVE10"
}
```

### 移除优惠券

```http
DELETE /api/cart/coupons/{code}
Authorization: Bearer <token>
```

**路径参数:**
- `code`: 优惠券代码

### 设置配送方式

```http
POST /api/cart/shipping-method
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "method": "standard",
  "methodName": "Standard Shipping",
  "cost": 9.99,
  "estimatedDelivery": "2024-01-20T00:00:00Z"
}
```

## 📦 订单接口

### 获取订单列表

```http
GET /api/orders
Authorization: Bearer <token>
```

**查询参数:**
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `status`: 订单状态
- `paymentStatus`: 支付状态
- `fulfillmentStatus`: 履行状态
- `dateFrom`: 开始日期 (YYYY-MM-DD)
- `dateTo`: 结束日期 (YYYY-MM-DD)
- `sortBy`: 排序字段 (默认: createdAt)
- `sortOrder`: 排序方向 (默认: desc)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "orderNumber": "ORD-2024-001",
        "status": "confirmed",
        "paymentStatus": "paid",
        "fulfillmentStatus": "unfulfilled",
        "customer": {
          "id": "uuid",
          "email": "customer@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890",
          "isGuest": false
        },
        "items": [
          {
            "id": "uuid",
            "productId": "uuid",
            "variantId": "uuid",
            "product": {
              "name": {
                "en": "Premium Cotton Business Shirt",
                "zh": "优质棉质商务衬衫"
              },
              "image": "https://cdn.yxlp.com/products/shirt-1.jpg"
            },
            "variant": {
              "sku": "SHIRT-001-WH-M",
              "name": {
                "en": "White / Medium",
                "zh": "白色 / 中号"
              },
              "attributes": [
                {
                  "name": "color",
                  "value": "white",
                  "displayValue": {
                    "en": "White",
                    "zh": "白色"
                  }
                }
              ]
            },
            "quantity": 2,
            "unitPrice": 89.99,
            "totalPrice": 179.98
          }
        ],
        "summary": {
          "itemCount": 2,
          "subtotal": 179.98,
          "discountAmount": 18.00,
          "taxAmount": 14.58,
          "shippingAmount": 0,
          "total": 176.56,
          "currency": "USD"
        },
        "shippingAddress": {
          "firstName": "John",
          "lastName": "Doe",
          "company": "Fashion Inc.",
          "address1": "123 Main St",
          "address2": "Apt 4B",
          "city": "New York",
          "province": "NY",
          "country": "US",
          "zip": "10001",
          "phone": "+1234567890"
        },
        "shipping": {
          "method": "standard",
          "methodName": "Standard Shipping",
          "cost": 0,
          "estimatedDelivery": "2024-01-20T00:00:00Z",
          "trackingNumber": null,
          "carrier": null
        },
        "payment": {
          "method": "stripe",
          "methodName": "Credit Card",
          "currency": "USD",
          "paidAt": "2024-01-15T10:30:00Z"
        },
        "discounts": [
          {
            "id": "uuid",
            "code": "SAVE10",
            "type": "percentage",
            "value": 18.00,
            "description": "10% off your order"
          }
        ],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 获取订单详情

```http
GET /api/orders/{id}
Authorization: Bearer <token>
```

**路径参数:**
- `id`: 订单 ID

**响应示例:**
```json
{
  "success": true,
  "data": {
    // 完整的订单信息
    "id": "uuid",
    "orderNumber": "ORD-2024-001",
    // ... 其他字段同订单列表
    "statusHistory": [
      {
        "id": "uuid",
        "fromStatus": "pending",
        "toStatus": "confirmed",
        "note": "Payment confirmed",
        "updatedBy": "system",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "timeline": [
      {
        "event": "order_created",
        "title": "Order Created",
        "description": "Your order has been created successfully",
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "event": "payment_confirmed",
        "title": "Payment Confirmed",
        "description": "Payment has been processed successfully",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 创建订单

```http
POST /api/orders
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "cartId": "uuid",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Fashion Inc.",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "province": "NY",
    "country": "US",
    "zip": "10001",
    "phone": "+1234567890"
  },
  "billingAddress": {
    // 同 shippingAddress 结构
  },
  "shippingMethod": {
    "method": "standard",
    "methodName": "Standard Shipping",
    "cost": 9.99,
    "estimatedDelivery": "2024-01-20T00:00:00Z"
  },
  "paymentMethod": {
    "method": "stripe",
    "methodName": "Credit Card"
  },
  "notes": "Please handle with care",
  "metadata": {
    "source": "web",
    "utm": {
      "source": "google",
      "medium": "cpc"
    }
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "order": {
      // 创建的订单信息
    },
    "paymentIntent": {
      "clientSecret": "pi_xxx_secret_xxx",
      "amount": 17656,
      "currency": "usd"
    }
  },
  "message": "订单创建成功"
}
```

### 取消订单

```http
POST /api/orders/{id}/cancel
Authorization: Bearer <token>
```

**路径参数:**
- `id`: 订单 ID

**请求参数:**
```json
{
  "reason": "Changed my mind",
  "note": "Customer requested cancellation"
}
```

### 申请退款

```http
POST /api/orders/{id}/refund
Authorization: Bearer <token>
```

**路径参数:**
- `id`: 订单 ID

**请求参数:**
```json
{
  "amount": 176.56,
  "reason": "Defective product",
  "items": [
    {
      "itemId": "uuid",
      "quantity": 1,
      "reason": "Product damaged"
    }
  ],
  "note": "Product arrived damaged"
}
```

### 更新订单状态 (管理员)

```http
PUT /api/orders/{id}/status
Authorization: Bearer <admin_token>
```

**路径参数:**
- `id`: 订单 ID

**请求参数:**
```json
{
  "status": "shipped",
  "note": "Order has been shipped",
  "trackingNumber": "1Z999AA1234567890",
  "carrier": "UPS",
  "trackingUrl": "https://www.ups.com/track?tracknum=1Z999AA1234567890"
}
```

## 💳 支付接口

### 创建支付意图

```http
POST /api/payments/create-intent
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "orderId": "uuid",
  "paymentMethod": "stripe",
  "currency": "usd",
  "amount": 17656,
  "metadata": {
    "orderNumber": "ORD-2024-001"
  }
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 17656,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

### 确认支付

```http
POST /api/payments/confirm
Authorization: Bearer <token>
```

**请求参数:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": "pm_xxx"
}
```

### 支付 Webhook

```http
POST /api/payments/webhook/stripe
```

**请求头:**
```http
Stripe-Signature: t=xxx,v1=xxx
```

### 获取支付方式

```http
GET /api/payments/methods
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "stripe",
      "name": "Credit Card",
      "type": "card",
      "enabled": true,
      "currencies": ["USD", "EUR", "GBP"],
      "countries": ["US", "CA", "GB", "DE", "FR"],
      "fees": {
        "percentage": 2.9,
        "fixed": 0.30
      }
    },
    {
      "id": "paypal",
      "name": "PayPal",
      "type": "wallet",
      "enabled": true,
      "currencies": ["USD", "EUR", "GBP"],
      "countries": ["US", "CA", "GB", "DE", "FR"],
      "fees": {
        "percentage": 3.49,
        "fixed": 0.49
      }
    }
  ]
}
```

## 📁 文件上传接口

### 上传单个文件

```http
POST /api/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数:**
- `file`: 文件 (最大 10MB)
- `type`: 文件类型 (image/document/avatar)
- `folder`: 存储文件夹 (可选)

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "product-image.jpg",
    "originalName": "my-product.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "https://cdn.yxlp.com/uploads/products/product-image.jpg",
    "thumbnails": {
      "small": "https://cdn.yxlp.com/uploads/products/thumbs/small_product-image.jpg",
      "medium": "https://cdn.yxlp.com/uploads/products/thumbs/medium_product-image.jpg",
      "large": "https://cdn.yxlp.com/uploads/products/thumbs/large_product-image.jpg"
    },
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "jpeg"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 上传多个文件

```http
POST /api/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求参数:**
- `files`: 文件数组 (最多 10 个文件)
- `type`: 文件类型
- `folder`: 存储文件夹 (可选)

### 删除文件

```http
DELETE /api/upload/{id}
Authorization: Bearer <token>
```

**路径参数:**
- `id`: 文件 ID

### 获取文件信息

```http
GET /api/upload/{id}
Authorization: Bearer <token>
```

**路径参数:**
- `id`: 文件 ID

## 🔍 搜索接口

### 搜索产品

```http
GET /api/search/products
```

**查询参数:**
- `q`: 搜索关键词 (必需)
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `categoryId`: 分类 ID
- `brand`: 品牌
- `priceMin`: 最低价格
- `priceMax`: 最高价格
- `inStock`: 是否有库存
- `sortBy`: 排序字段 (relevance/price/name/rating)
- `sortOrder`: 排序方向 (asc/desc)
- `language`: 语言代码

**请求示例:**
```http
GET /api/search/products?q=cotton%20shirt&categoryId=uuid&priceMin=50&priceMax=200&sortBy=relevance
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "query": "cotton shirt",
    "items": [
      // 产品列表，格式同产品接口
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "aggregations": {
      "categories": [
        {
          "key": "business-shirts",
          "name": "Business Shirts",
          "count": 25
        }
      ],
      "brands": [
        {
          "key": "yxlp-collection",
          "name": "YXLP Collection",
          "count": 30
        }
      ],
      "priceRanges": [
        {
          "key": "0-50",
          "name": "$0 - $50",
          "count": 10
        },
        {
          "key": "50-100",
          "name": "$50 - $100",
          "count": 25
        }
      ]
    },
    "suggestions": [
      "cotton business shirt",
      "cotton casual shirt",
      "cotton dress shirt"
    ]
  }
}
```

### 搜索建议

```http
GET /api/search/suggestions
```

**查询参数:**
- `q`: 搜索关键词
- `limit`: 建议数量 (默认: 5)
- `language`: 语言代码

**响应示例:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "cotton shirt",
      "cotton dress",
      "cotton pants",
      "cotton jacket",
      "cotton t-shirt"
    ]
  }
}
```

### 热门搜索

```http
GET /api/search/trending
```

**查询参数:**
- `limit`: 数量限制 (默认: 10)
- `language`: 语言代码

**响应示例:**
```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "keyword": "summer dress",
        "count": 1250,
        "trend": "up"
      },
      {
        "keyword": "business shirt",
        "count": 980,
        "trend": "stable"
      }
    ]
  }
}
```

## ❌ 错误码说明

### HTTP 状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `422`: 数据验证失败
- `429`: 请求过于频繁
- `500`: 服务器内部错误

### 业务错误码

#### 认证相关 (AUTH_*)
- `AUTH_INVALID_CREDENTIALS`: 用户名或密码错误
- `AUTH_USER_NOT_FOUND`: 用户不存在
- `AUTH_USER_INACTIVE`: 用户账户未激活
- `AUTH_USER_LOCKED`: 用户账户被锁定
- `AUTH_TOKEN_EXPIRED`: Token 已过期
- `AUTH_TOKEN_INVALID`: Token 无效
- `AUTH_EMAIL_EXISTS`: 邮箱已存在
- `AUTH_EMAIL_NOT_VERIFIED`: 邮箱未验证
- `AUTH_PASSWORD_WEAK`: 密码强度不足

#### 产品相关 (PRODUCT_*)
- `PRODUCT_NOT_FOUND`: 产品不存在
- `PRODUCT_OUT_OF_STOCK`: 产品缺货
- `PRODUCT_INACTIVE`: 产品未激活
- `PRODUCT_SKU_EXISTS`: SKU 已存在
- `PRODUCT_VARIANT_NOT_FOUND`: 产品变体不存在

#### 订单相关 (ORDER_*)
- `ORDER_NOT_FOUND`: 订单不存在
- `ORDER_CANNOT_CANCEL`: 订单无法取消
- `ORDER_ALREADY_PAID`: 订单已支付
- `ORDER_PAYMENT_FAILED`: 订单支付失败
- `ORDER_INSUFFICIENT_STOCK`: 库存不足

#### 购物车相关 (CART_*)
- `CART_ITEM_NOT_FOUND`: 购物车商品不存在
- `CART_ITEM_OUT_OF_STOCK`: 购物车商品缺货
- `CART_EMPTY`: 购物车为空
- `CART_COUPON_INVALID`: 优惠券无效
- `CART_COUPON_EXPIRED`: 优惠券已过期

#### 支付相关 (PAYMENT_*)
- `PAYMENT_METHOD_INVALID`: 支付方式无效
- `PAYMENT_AMOUNT_MISMATCH`: 支付金额不匹配
- `PAYMENT_FAILED`: 支付失败
- `PAYMENT_CANCELLED`: 支付已取消
- `PAYMENT_REFUND_FAILED`: 退款失败

#### 文件相关 (FILE_*)
- `FILE_TOO_LARGE`: 文件过大
- `FILE_TYPE_NOT_ALLOWED`: 文件类型不允许
- `FILE_NOT_FOUND`: 文件不存在
- `FILE_UPLOAD_FAILED`: 文件上传失败

#### 验证相关 (VALIDATION_*)
- `VALIDATION_ERROR`: 数据验证失败
- `VALIDATION_REQUIRED_FIELD`: 必填字段缺失
- `VALIDATION_INVALID_FORMAT`: 格式不正确
- `VALIDATION_OUT_OF_RANGE`: 数值超出范围

#### 系统相关 (SYSTEM_*)
- `SYSTEM_MAINTENANCE`: 系统维护中
- `SYSTEM_OVERLOAD`: 系统负载过高
- `SYSTEM_DATABASE_ERROR`: 数据库错误
- `SYSTEM_EXTERNAL_SERVICE_ERROR`: 外部服务错误

### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "密码长度至少8位",
        "value": "***"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/register",
  "requestId": "req-uuid"
}
```

---

## 📞 技术支持

如有 API 使用问题，请联系：
- **邮箱**: api-support@yxlp.com
- **文档**: https://docs.yxlp.com/api
- **Postman 集合**: https://documenter.getpostman.com/view/yxlp-api

---

*最后更新时间: 2024年1月15日*
