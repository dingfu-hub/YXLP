import { NextRequest, NextResponse } from 'next/server'
import { getPublishedProducts, getProductsByCategory, searchProducts } from '@/data/products'
import { ProductCategory } from '@/types/products'

// 公共商品API - 不需要认证
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as ProductCategory | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const featured = searchParams.get('featured') === 'true'

    // 获取已发布的商品
    let products = getPublishedProducts()

    // 按分类筛选
    if (category && category !== 'all') {
      products = products.filter(product => product.category === category)
    }

    // 搜索筛选
    if (search && search.trim()) {
      const searchResults = searchProducts(search.trim())
      products = products.filter(product => 
        searchResults.some(result => result.id === product.id) &&
        product.status === 'published'
      )
    }

    // 推荐商品筛选
    if (featured) {
      products = products.filter(product => product.featured)
    }

    // 排序
    products.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a]
      let bValue: any = b[sortBy as keyof typeof b]

      // 处理日期类型
      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      // 处理字符串类型
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      }
    })

    // 分页
    const total = products.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = products.slice(startIndex, endIndex)

    // 转换为公共格式
    const publicProducts = paginatedProducts.map(product => ({
      id: parseInt(product.id),
      name: product.name,
      summary: product.summary,
      description: product.description,
      category: product.category,
      brand: product.brand || '未知品牌',
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      stock: product.stock,
      inStock: product.stock > 0,
      image: product.featuredImage || '/api/placeholder/400/400',
      images: product.images || [],
      rating: product.rating || 0,
      reviewCount: product.reviewCount,
      salesCount: product.salesCount,
      tags: product.tags || [],
      featured: product.featured,
      publishDate: product.publishedAt 
        ? product.publishedAt.toISOString().split('T')[0] 
        : product.createdAt.toISOString().split('T')[0],
      slug: product.slug,
      specifications: product.specifications,
      weight: product.weight,
      dimensions: product.dimensions
    }))

    return NextResponse.json(
      {
        message: '获取商品列表成功',
        data: {
          products: publicProducts,
          total,
          page,
          limit,
          totalPages
        }
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )

  } catch (error) {
    console.error('获取商品列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 处理 OPTIONS 请求 (CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
