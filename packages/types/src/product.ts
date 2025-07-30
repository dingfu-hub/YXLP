// 商品状态枚举
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

// 多语言文本
export interface MultiLanguageText {
  en: string
  zh: string
  es?: string
  fr?: string
  de?: string
  ja?: string
  ko?: string
  [key: string]: string | undefined
}

// 商品基础信息
export interface Product {
  id: string
  sku: string
  name: MultiLanguageText
  description: MultiLanguageText
  shortDescription?: MultiLanguageText
  categoryId: string
  category: Category
  brand?: string
  tags: string[]
  status: ProductStatus
  images: ProductImage[]
  specifications: ProductSpecification[]
  variants: ProductVariant[]
  seo: ProductSEO
  pricing: ProductPricing
  inventory: ProductInventory
  shipping: ProductShipping
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// 商品图片
export interface ProductImage {
  id: string
  url: string
  alt: MultiLanguageText
  order: number
  isMain: boolean
  variants?: string[] // 关联的变体 ID
}

// 商品规格
export interface ProductSpecification {
  id: string
  name: MultiLanguageText
  value: MultiLanguageText
  unit?: string
  order: number
  group?: string
}

// 商品变体（SKU）
export interface ProductVariant {
  id: string
  sku: string
  name: MultiLanguageText
  attributes: VariantAttribute[]
  price: number
  compareAtPrice?: number
  cost?: number
  stock: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  images: string[] // 图片 ID 数组
  isDefault: boolean
  status: ProductStatus
}

// 变体属性
export interface VariantAttribute {
  name: string // 如 'color', 'size'
  value: string // 如 'red', 'XL'
  displayName: MultiLanguageText
  displayValue: MultiLanguageText
}

// 商品 SEO 信息
export interface ProductSEO {
  title: MultiLanguageText
  description: MultiLanguageText
  keywords: string[]
  slug: MultiLanguageText
}

// 商品定价
export interface ProductPricing {
  basePrice: number
  currency: string
  priceRules: PriceRule[]
  taxClass?: string
}

// 价格规则
export interface PriceRule {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'bulk'
  value: number
  conditions: {
    userRole?: string[]
    minQuantity?: number
    maxQuantity?: number
    countries?: string[]
    startDate?: Date
    endDate?: Date
  }
}

// 库存信息
export interface ProductInventory {
  trackQuantity: boolean
  allowBackorder: boolean
  lowStockThreshold?: number
  locations: InventoryLocation[]
}

// 库存位置
export interface InventoryLocation {
  locationId: string
  locationName: string
  quantity: number
  reserved: number
  available: number
}

// 运输信息
export interface ProductShipping {
  weight: number
  weightUnit: 'kg' | 'lb'
  dimensions: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  shippingClass?: string
  freeShipping: boolean
  shippingRules: ShippingRule[]
}

// 运输规则
export interface ShippingRule {
  id: string
  name: string
  countries: string[]
  methods: string[]
  cost: number
  freeShippingThreshold?: number
}

// 商品分类
export interface Category {
  id: string
  name: MultiLanguageText
  slug: MultiLanguageText
  description?: MultiLanguageText
  parentId?: string
  children?: Category[]
  image?: string
  order: number
  isActive: boolean
  seo: {
    title: MultiLanguageText
    description: MultiLanguageText
    keywords: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// 商品创建 DTO
export interface CreateProductDto {
  name: MultiLanguageText
  description: MultiLanguageText
  shortDescription?: MultiLanguageText
  categoryId: string
  brand?: string
  tags: string[]
  images: Omit<ProductImage, 'id'>[]
  specifications: Omit<ProductSpecification, 'id'>[]
  variants: Omit<ProductVariant, 'id'>[]
  seo: ProductSEO
  pricing: ProductPricing
  inventory: ProductInventory
  shipping: ProductShipping
}

// 商品更新 DTO
export interface UpdateProductDto extends Partial<CreateProductDto> {
  status?: ProductStatus
}

// 商品查询参数
export interface ProductQueryParams {
  categoryId?: string
  brand?: string
  status?: ProductStatus
  tags?: string[]
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  search?: string
  language?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

// 商品搜索结果
export interface ProductSearchResult {
  products: Product[]
  total: number
  page: number
  limit: number
  filters: {
    categories: { id: string; name: string; count: number }[]
    brands: { name: string; count: number }[]
    priceRange: { min: number; max: number }
    attributes: { name: string; values: { value: string; count: number }[] }[]
  }
}
