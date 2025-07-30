import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { getProductById, updateProduct, deleteProduct } from '@/data/products'
import { UpdateProductRequest } from '@/types/products'

// 获取单个商品详情 - 管理员API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未提供认证信息' },
        { status: 401 }
      )
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json(
        { error: '无效的认证格式' },
        { status: 401 }
      )
    }

    // 检查token是否在黑名单中
    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('product:view')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const product = getProductById(params.id)
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: '获取商品详情成功',
        data: product
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('获取商品详情错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新商品 - 管理员API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未提供认证信息' },
        { status: 401 }
      )
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json(
        { error: '无效的认证格式' },
        { status: 401 }
      )
    }

    // 检查token是否在黑名单中
    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('product:update')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const product = getProductById(params.id)
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    const body: Partial<UpdateProductRequest> = await request.json()
    const updates: any = {}

    // 处理可更新的字段
    if (body.name !== undefined) {
      updates.name = body.name
      // 如果名称改变，重新生成slug
      updates.slug = body.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
    }

    if (body.description !== undefined) updates.description = body.description
    if (body.summary !== undefined) updates.summary = body.summary
    if (body.category !== undefined) updates.category = body.category
    if (body.status !== undefined) updates.status = body.status
    if (body.brand !== undefined) updates.brand = body.brand
    if (body.model !== undefined) updates.model = body.model
    if (body.sku !== undefined) updates.sku = body.sku
    if (body.price !== undefined) updates.price = body.price
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice
    if (body.currency !== undefined) updates.currency = body.currency
    if (body.stock !== undefined) updates.stock = body.stock
    if (body.minStock !== undefined) updates.minStock = body.minStock
    if (body.featuredImage !== undefined) updates.featuredImage = body.featuredImage
    if (body.images !== undefined) updates.images = body.images
    if (body.videos !== undefined) updates.videos = body.videos
    if (body.variants !== undefined) updates.variants = body.variants
    if (body.attributes !== undefined) updates.attributes = body.attributes
    if (body.specifications !== undefined) updates.specifications = body.specifications
    if (body.metaTitle !== undefined) updates.metaTitle = body.metaTitle
    if (body.metaDescription !== undefined) updates.metaDescription = body.metaDescription
    if (body.keywords !== undefined) updates.keywords = body.keywords
    if (body.weight !== undefined) updates.weight = body.weight
    if (body.dimensions !== undefined) updates.dimensions = body.dimensions
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.featured !== undefined) updates.featured = body.featured

    // 处理发布时间
    if (body.publishedAt !== undefined) {
      updates.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null
    } else if (body.status === 'published' && !product.publishedAt) {
      updates.publishedAt = new Date()
    }

    const updatedProduct = updateProduct(params.id, updates)
    if (!updatedProduct) {
      return NextResponse.json(
        { error: '更新商品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: '商品更新成功',
        data: updatedProduct
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('更新商品错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除商品 - 管理员API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie')
    if (!authHeader) {
      return NextResponse.json(
        { error: '未提供认证信息' },
        { status: 401 }
      )
    }

    const token = parseAuthHeader(authHeader)
    if (!token) {
      return NextResponse.json(
        { error: '无效的认证格式' },
        { status: 401 }
      )
    }

    // 检查token是否在黑名单中
    if (isTokenBlacklisted(token)) {
      return NextResponse.json(
        { error: '令牌已失效' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      )
    }

    const user = findAdminById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 401 }
      )
    }

    // 检查权限
    if (!user.permissions.includes('product:delete')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const product = getProductById(params.id)
    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      )
    }

    const deleted = deleteProduct(params.id)
    if (!deleted) {
      return NextResponse.json(
        { error: '删除商品失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: '商品删除成功'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('删除商品错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
