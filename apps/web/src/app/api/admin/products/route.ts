import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, parseAuthHeader, isTokenBlacklisted } from '@/lib/jwt'
import { findAdminById } from '@/data/admin-users'
import { 
  getAllProducts, 
  getProductsByCategory, 
  getProductsByStatus, 
  searchProducts, 
  createProduct,
  getProductStats
} from '@/data/products'
import { ProductListRequest, CreateProductRequest } from '@/types/products'

// 简化的管理员认证函数
async function authenticateAdmin(request: NextRequest) {
  console.log('开始商品管理认证')

  // 从 Cookie 或 Authorization header 获取 token
  let token = request.cookies.get('admin_token')?.value
  console.log('Cookie token:', token ? '存在' : '不存在')

  if (!token) {
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    token = parseAuthHeader(authHeader)
    console.log('Parsed token from header:', token ? '存在' : '不存在')
  }

  if (!token) {
    console.log('未找到token')
    return { error: 'Authentication required', status: 401 }
  }

  // 检查 token 是否在黑名单中
  if (isTokenBlacklisted(token)) {
    console.log('Token在黑名单中')
    return { error: 'Token has been revoked', status: 401 }
  }

  // 验证 token
  const payload = await verifyToken(token)
  console.log('Token验证结果:', payload ? '有效' : '无效')
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  console.log('Token payload:', payload)

  // 查找管理员用户
  const currentUser = findAdminById(payload.userId)
  console.log('查找管理员用户:', currentUser ? '找到' : '未找到')
  if (!currentUser) {
    return { error: 'Admin user not found', status: 404 }
  }

  console.log('管理员用户角色:', currentUser.role)

  // 检查用户是否激活
  if (!currentUser.isActive) {
    console.log('用户未激活')
    return { error: 'Account has been disabled', status: 403 }
  }

  // 检查权限 - 简化版本，只检查角色
  const allowedRoles = ['super_admin', 'admin', 'editor'] // 添加editor角色
  if (!allowedRoles.includes(currentUser.role)) {
    console.log('权限不足，当前角色:', currentUser.role, '允许的角色:', allowedRoles)
    return { error: 'Insufficient permissions', status: 403 }
  }

  console.log('认证成功，用户:', currentUser.name, '角色:', currentUser.role)
  return { user: currentUser, payload }
}

// 获取商品列表 - 管理员API
export async function GET(request: NextRequest) {
  try {
    console.log('=== 商品管理API GET请求开始 ===')

    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('认证成功，继续处理请求')
    const { user: currentUser } = authResult

    // 检查权限
    if (!currentUser.permissions.some(p => p.includes('product:view') || p.includes('product'))) {
      return NextResponse.json({
        success: false,
        message: '权限不足',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 获取商品数据
    let products = getAllProducts()

    // 应用过滤条件
    if (category && category !== 'all') {
      products = products.filter(product => product.category === category)
    }

    if (status && status !== 'all') {
      products = products.filter(product => product.status === status)
    }

    if (search && search.trim()) {
      const searchResults = searchProducts(search.trim())
      products = products.filter(product => 
        searchResults.some(result => result.id === product.id)
      )
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

    // 获取统计信息
    const stats = getProductStats()

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        total,
        page,
        limit,
        totalPages,
        stats
      }
    })

  } catch (error) {
    console.error('获取商品列表错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建商品 - 管理员API
export async function POST(request: NextRequest) {
  try {
    console.log('=== 创建商品API POST请求开始 ===')

    // 验证管理员认证
    const authResult = await authenticateAdmin(request)
    if ('error' in authResult) {
      console.log('创建商品认证失败:', authResult.error)
      return NextResponse.json({
        success: false,
        message: authResult.error,
        error: 'UNAUTHORIZED'
      }, { status: authResult.status })
    }

    console.log('创建商品认证成功')
    const { user: currentUser } = authResult

    // 检查权限
    if (!currentUser.permissions.some(p => p.includes('product:create') || p.includes('product'))) {
      return NextResponse.json({
        success: false,
        message: '权限不足',
        error: 'FORBIDDEN'
      }, { status: 403 })
    }

    const body: CreateProductRequest = await request.json()
    const { 
      name, 
      description, 
      summary, 
      category, 
      status = 'draft',
      brand,
      model,
      sku,
      price,
      originalPrice,
      currency = 'CNY',
      stock,
      minStock,
      featuredImage,
      images,
      videos,
      variants,
      attributes,
      specifications,
      metaTitle,
      metaDescription,
      keywords,
      weight,
      dimensions,
      tags,
      featured = false,
      publishedAt
    } = body

    // 验证必填字段
    if (!name || !description || !category || !sku || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: '商品名称、描述、分类、SKU、价格和库存为必填字段' },
        { status: 400 }
      )
    }

    // 生成slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)

    // 创建商品数据
    const productData = {
      name,
      description,
      summary: summary || description.substring(0, 150) + '...',
      category,
      status,
      brand,
      model,
      sku,
      price,
      originalPrice,
      currency,
      stock,
      minStock,
      featuredImage,
      images,
      videos,
      variants,
      attributes,
      specifications,
      slug,
      metaTitle,
      metaDescription,
      keywords,
      weight,
      dimensions,
      tags,
      featured,
      publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : undefined),
      author: user.name
    }

    const newProduct = createProduct(productData)

    return NextResponse.json(
      {
        message: '商品创建成功',
        data: newProduct
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('创建商品错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
