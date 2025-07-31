// 商品分类
export type ProductCategory =
  | 'clothing'      // 服装
  | 'accessories'   // 配饰
  | 'shoes'         // 鞋类
  | 'bags'          // 包包
  | 'underwear'     // 内衣
  | 'sportswear'    // 运动服装
  | 'formal'        // 正装
  | 'casual'        // 休闲装
  | 'outerwear'     // 外套
  | 'other'         // 其他

// 商品状态
export type ProductStatus = 
  | 'draft'         // 草稿
  | 'published'     // 已发布
  | 'archived'      // 已归档
  | 'out_of_stock'  // 缺货

// 商品尺寸
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'Free'

// 商品颜色
export interface ProductColor {
  name: string      // 颜色名称
  code: string      // 颜色代码 (hex)
}

// 商品规格/变体
export interface ProductVariant {
  id: string
  sku: string       // 商品编码
  size?: ProductSize
  color?: ProductColor
  price: number     // 价格
  originalPrice?: number // 原价
  stock: number     // 库存
  images?: string[] // 该变体的图片
}

// 商品实体
export interface Product {
  id: string
  name: string
  description: string
  summary?: string
  category: ProductCategory
  status: ProductStatus
  
  // 基础信息
  brand?: string
  model?: string
  sku: string       // 主SKU
  
  // 价格信息
  price: number     // 基础价格
  originalPrice?: number // 原价
  currency: string  // 货币单位
  
  // 库存信息
  stock: number     // 总库存
  minStock?: number // 最低库存警告
  
  // 媒体文件
  featuredImage?: string
  images?: string[]
  videos?: string[]
  
  // 商品规格
  variants?: ProductVariant[]
  
  // 商品属性
  attributes?: Record<string, any> // 自定义属性
  specifications?: Record<string, string> // 规格参数
  
  // SEO相关
  slug: string
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  
  // 销售信息
  weight?: number   // 重量(克)
  dimensions?: {    // 尺寸(厘米)
    length: number
    width: number
    height: number
  }
  
  // 发布信息
  publishedAt?: Date
  author?: string
  
  // 统计信息
  viewCount: number
  salesCount: number
  favoriteCount: number
  rating?: number   // 平均评分
  reviewCount: number
  
  // 标签和分类
  tags?: string[]
  featured: boolean // 是否推荐
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
}

// 商品分类信息
export interface ProductCategoryInfo {
  id: ProductCategory
  name: string
  description?: string
  icon?: string
  parentId?: ProductCategory
}

// 商品筛选条件
export interface ProductFilters {
  category?: ProductCategory
  status?: ProductStatus
  priceRange?: {
    min: number
    max: number
  }
  brand?: string
  inStock?: boolean
  featured?: boolean
  tags?: string[]
}

// API请求/响应类型
export interface ProductListRequest {
  page?: number
  limit?: number
  category?: ProductCategory
  status?: ProductStatus
  search?: string
  sortBy?: 'createdAt' | 'publishedAt' | 'price' | 'name' | 'salesCount' | 'rating'
  sortOrder?: 'asc' | 'desc'
  filters?: ProductFilters
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateProductRequest {
  name: string
  description: string
  summary?: string
  category: ProductCategory
  status?: ProductStatus
  brand?: string
  model?: string
  sku: string
  price: number
  originalPrice?: number
  currency?: string
  stock: number
  minStock?: number
  featuredImage?: string
  images?: string[]
  videos?: string[]
  variants?: Omit<ProductVariant, 'id'>[]
  attributes?: Record<string, any>
  specifications?: Record<string, string>
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  featured?: boolean
  publishedAt?: Date
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string
}

// 商品统计信息
export interface ProductStats {
  total: number
  published: number
  draft: number
  archived: number
  outOfStock: number
  totalValue: number
  lowStock: number
}

// 商品导入/导出
export interface ProductImportData {
  products: CreateProductRequest[]
  categories?: ProductCategoryInfo[]
}

export interface ProductExportData {
  products: Product[]
  categories: ProductCategoryInfo[]
  exportedAt: Date
}

// 商品分类常量
export const productCategories: ProductCategoryInfo[] = [
  { id: 'clothing', name: '服装', description: '各类服装产品', icon: '👕' },
  { id: 'accessories', name: '配饰', description: '时尚配饰', icon: '👜' },
  { id: 'shoes', name: '鞋类', description: '各种鞋类产品', icon: '👠' },
  { id: 'bags', name: '包包', description: '手提包、背包等', icon: '🎒' },
  { id: 'underwear', name: '内衣', description: '内衣内裤等贴身衣物', icon: '👙' },
  { id: 'sportswear', name: '运动服装', description: '运动服、健身服等', icon: '🏃' },
  { id: 'formal', name: '正装', description: '西装、礼服等正式服装', icon: '🤵' },
  { id: 'casual', name: '休闲装', description: '休闲服装、日常穿着', icon: '👔' },
  { id: 'outerwear', name: '外套', description: '夹克、大衣、羽绒服等', icon: '🧥' },
  { id: 'other', name: '其他', description: '其他商品', icon: '📦' }
]

// 商品状态常量
export const productStatuses = [
  { id: 'draft', name: '草稿', color: 'gray' },
  { id: 'published', name: '已发布', color: 'green' },
  { id: 'archived', name: '已归档', color: 'yellow' },
  { id: 'out_of_stock', name: '缺货', color: 'red' }
] as const
