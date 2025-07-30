import { NextRequest, NextResponse } from 'next/server'
import { getProductById, updateProduct } from '@/data/products'

// 获取单个商品详情 - 公共API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = getProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    // 只返回已发布的商品
    if (product.status !== 'published') {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    // 增加浏览量
    updateProduct(params.id, {
      viewCount: product.viewCount + 1
    })

    // 转换为公共格式
    const publicProduct = {
      id: parseInt(product.id),
      name: product.name,
      summary: product.summary,
      description: product.description,
      category: product.category,
      brand: product.brand || '未知品牌',
      model: product.model,
      sku: product.sku,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      stock: product.stock,
      inStock: product.stock > 0,
      image: product.featuredImage || '/api/placeholder/400/400',
      images: product.images || [],
      videos: product.videos || [],
      variants: product.variants || [],
      specifications: product.specifications || {},
      attributes: product.attributes || {},
      rating: product.rating || 0,
      reviewCount: product.reviewCount,
      salesCount: product.salesCount,
      favoriteCount: product.favoriteCount,
      viewCount: product.viewCount + 1, // 返回更新后的浏览量
      tags: product.tags || [],
      featured: product.featured,
      publishDate: product.publishedAt 
        ? product.publishedAt.toISOString().split('T')[0] 
        : product.createdAt.toISOString().split('T')[0],
      slug: product.slug,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      keywords: product.keywords || [],
      weight: product.weight,
      dimensions: product.dimensions
    }

    return NextResponse.json(
      {
        message: '获取商品详情成功',
        data: publicProduct
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
    console.error('获取商品详情错误:', error)
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
