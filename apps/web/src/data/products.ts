import {
  Product,
  ProductCategory,
  ProductStatus,
  ProductStats,
  productCategories
} from '@/types/products'

// 模拟商品数据
let products: Product[] = [
  {
    id: '1',
    name: '经典白色T恤',
    description: '100%纯棉材质，舒适透气，经典百搭款式。适合日常休闲穿着，简约设计永不过时。',
    summary: '100%纯棉经典白T恤，舒适百搭',
    category: 'clothing',
    status: 'published',
    brand: 'BasicWear',
    model: 'BW-T001',
    sku: 'BW-T001-WHITE',
    price: 89,
    originalPrice: 129,
    currency: 'CNY',
    stock: 150,
    minStock: 20,
    featuredImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&crop=center'
    ],
    slug: 'classic-white-tshirt',
    metaTitle: '经典白色T恤 - 100%纯棉舒适透气',
    metaDescription: '经典白色T恤，100%纯棉材质，舒适透气，简约百搭，适合日常穿着',
    keywords: ['T恤', '白色', '纯棉', '休闲', '百搭'],
    weight: 200,
    dimensions: {
      length: 70,
      width: 50,
      height: 2
    },
    publishedAt: new Date('2024-01-15'),
    author: 'admin',
    viewCount: 1250,
    salesCount: 89,
    favoriteCount: 45,
    rating: 4.5,
    reviewCount: 23,
    tags: ['基础款', '热销', '推荐'],
    featured: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: '时尚牛仔裤',
    description: '高品质牛仔布料，修身剪裁，展现完美身材曲线。经典蓝色，百搭实用，是衣橱必备单品。',
    summary: '修身剪裁牛仔裤，经典蓝色百搭',
    category: 'clothing',
    status: 'published',
    brand: 'DenimStyle',
    model: 'DS-J002',
    sku: 'DS-J002-BLUE',
    price: 299,
    originalPrice: 399,
    currency: 'CNY',
    stock: 80,
    minStock: 15,
    featuredImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&crop=center'
    ],
    slug: 'fashion-jeans',
    metaTitle: '时尚牛仔裤 - 修身剪裁经典蓝色',
    metaDescription: '时尚牛仔裤，修身剪裁，经典蓝色，高品质牛仔布料，百搭实用',
    keywords: ['牛仔裤', '修身', '蓝色', '时尚', '百搭'],
    weight: 600,
    dimensions: {
      length: 100,
      width: 40,
      height: 3
    },
    publishedAt: new Date('2024-01-20'),
    author: 'admin',
    viewCount: 890,
    salesCount: 56,
    favoriteCount: 32,
    rating: 4.3,
    reviewCount: 18,
    tags: ['时尚', '修身', '经典'],
    featured: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: '真皮手提包',
    description: '意大利进口真皮制作，手工精细缝制，优雅大方的设计。内部空间充足，多个隔层方便收纳。',
    summary: '意大利真皮手提包，优雅大方',
    category: 'bags',
    status: 'published',
    brand: 'LuxuryBags',
    model: 'LB-H003',
    sku: 'LB-H003-BLACK',
    price: 1299,
    originalPrice: 1599,
    currency: 'CNY',
    stock: 25,
    minStock: 5,
    featuredImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&crop=center'
    ],
    slug: 'leather-handbag',
    metaTitle: '真皮手提包 - 意大利进口优雅设计',
    metaDescription: '真皮手提包，意大利进口真皮，手工精制，优雅大方，多隔层设计',
    keywords: ['手提包', '真皮', '意大利', '优雅', '奢华'],
    weight: 800,
    dimensions: {
      length: 35,
      width: 15,
      height: 25
    },
    publishedAt: new Date('2024-01-25'),
    author: 'admin',
    viewCount: 650,
    salesCount: 23,
    favoriteCount: 67,
    rating: 4.8,
    reviewCount: 12,
    tags: ['奢华', '真皮', '手工'],
    featured: true,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '4',
    name: '运动跑鞋',
    description: '专业运动跑鞋，采用最新缓震技术，轻量化设计，提供卓越的舒适性和支撑性。适合各种运动场景。',
    summary: '专业运动跑鞋，缓震轻量',
    category: 'shoes',
    status: 'published',
    brand: 'SportMax',
    model: 'SM-R004',
    sku: 'SM-R004-WHITE',
    price: 599,
    originalPrice: 799,
    currency: 'CNY',
    stock: 120,
    minStock: 30,
    featuredImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&crop=center'
    ],
    slug: 'sport-running-shoes',
    metaTitle: '运动跑鞋 - 专业缓震轻量设计',
    metaDescription: '专业运动跑鞋，最新缓震技术，轻量化设计，舒适支撑，适合各种运动',
    keywords: ['跑鞋', '运动', '缓震', '轻量', '舒适'],
    weight: 400,
    dimensions: {
      length: 30,
      width: 12,
      height: 10
    },
    publishedAt: new Date('2024-02-01'),
    author: 'admin',
    viewCount: 1100,
    salesCount: 78,
    favoriteCount: 89,
    rating: 4.6,
    reviewCount: 34,
    tags: ['运动', '专业', '舒适'],
    featured: false,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '5',
    name: '时尚连衣裙',
    description: '优雅时尚连衣裙，采用高品质面料，修身剪裁，展现女性优雅气质。适合商务、约会等多种场合。',
    summary: '优雅时尚连衣裙，修身剪裁',
    category: 'clothing',
    status: 'published',
    brand: 'ElegantStyle',
    model: 'ES-D005',
    sku: 'ES-D005-BLACK',
    price: 399,
    originalPrice: 599,
    currency: 'CNY',
    stock: 45,
    minStock: 10,
    featuredImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop&crop=center'
    ],
    slug: 'elegant-dress',
    metaTitle: '时尚连衣裙 - 优雅修身剪裁',
    metaDescription: '时尚连衣裙，优雅修身，高品质面料，适合商务约会等多种场合',
    keywords: ['连衣裙', '时尚', '优雅', '修身', '商务'],
    weight: 300,
    dimensions: {
      length: 120,
      width: 60,
      height: 2
    },
    publishedAt: new Date('2024-02-05'),
    author: 'admin',
    viewCount: 2100,
    salesCount: 67,
    favoriteCount: 156,
    rating: 4.4,
    reviewCount: 45,
    tags: ['时尚', '优雅', '女装'],
    featured: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  }
]

// 商品CRUD操作
export function getAllProducts(): Product[] {
  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug)
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category)
}

export function getProductsByStatus(status: ProductStatus): Product[] {
  return products.filter(product => product.status === status)
}

export function getPublishedProducts(): Product[] {
  return products.filter(product => product.status === 'published')
    .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured && product.status === 'published')
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.summary?.toLowerCase().includes(lowercaseQuery) ||
    product.brand?.toLowerCase().includes(lowercaseQuery) ||
    product.keywords?.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
    product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'salesCount' | 'favoriteCount' | 'reviewCount'>): Product {
  const newProduct: Product = {
    ...productData,
    id: Date.now().toString(),
    viewCount: 0,
    salesCount: 0,
    favoriteCount: 0,
    reviewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  products.push(newProduct)
  return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = products.findIndex(product => product.id === id)
  if (index === -1) return null

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date()
  }

  return products[index]
}

export function deleteProduct(id: string): boolean {
  const index = products.findIndex(product => product.id === id)
  if (index === -1) return false

  products.splice(index, 1)
  return true
}

// 商品统计
export function getProductStats(): ProductStats {
  const total = products.length
  const published = products.filter(p => p.status === 'published').length
  const draft = products.filter(p => p.status === 'draft').length
  const archived = products.filter(p => p.status === 'archived').length
  const outOfStock = products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const lowStock = products.filter(p => p.stock <= (p.minStock || 10)).length

  return {
    total,
    published,
    draft,
    archived,
    outOfStock,
    totalValue,
    lowStock
  }
}

// 导出所有商品数据
export const allProducts = products
export { products, productCategories }
