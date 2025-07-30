'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { productCategories } from '@/types/products'

// 公共产品接口（从API返回的格式）
interface PublicProduct {
  id: number
  name: string
  summary?: string
  description: string
  category: string
  brand: string
  model?: string
  sku: string
  price: number
  originalPrice?: number
  currency: string
  stock: number
  inStock: boolean
  image: string
  images: string[]
  videos?: string[]
  variants?: any[]
  specifications?: Record<string, string>
  attributes?: Record<string, any>
  rating: number
  reviewCount: number
  salesCount: number
  favoriteCount: number
  viewCount: number
  tags: string[]
  featured: boolean
  publishDate: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // 获取商品详情
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/products/${params.id}`)

        if (!response.ok) {
          throw new Error('商品不存在或已下架')
        }

        const result = await response.json()
        setProduct(result.data)

      } catch (error) {
        console.error('获取商品详情错误:', error)
        setError(error instanceof Error ? error.message : '获取商品详情失败')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }

  // 获取分类标签
  const getCategoryLabel = (categoryId: string) => {
    const category = productCategories.find(cat => cat.id === categoryId)
    return category?.name || categoryId
  }

  // 处理数量变化
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Y</span>
                </div>
                <span className="font-heading font-bold text-xl text-gray-900">YXLP</span>
              </Link>
              <Link href="/products" className="text-blue-600 hover:text-blue-800">
                返回产品列表
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{error ? '加载失败' : '产品不存在'}</h1>
            <p className="text-gray-600 mb-8">{error || '请求的产品可能已被删除或不存在'}</p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回产品列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const allImages = [product.image, ...product.images].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="font-heading font-bold text-xl text-gray-900">YXLP</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">首页</Link>
              <Link href="/products" className="text-blue-600 font-medium">产品中心</Link>
              <Link href="/categories" className="text-gray-600 hover:text-gray-900">产品分类</Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900">新闻资讯</Link>
              <Link href="/distributors" className="text-gray-600 hover:text-gray-900">合作伙伴</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">登录</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">注册</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 面包屑导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">首页</Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700">产品中心</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 产品详情 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* 产品图片 */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={allImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwSDMwMFYzMDBIMjAwVjIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
                  }}
                />
              </div>

              {/* 缩略图 */}
              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 产品信息 */}
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">{product.brand}</span>
                  {product.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                      推荐
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}% 折扣
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.summary && (
                  <p className="text-gray-600 mb-4">{product.summary}</p>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({product.reviewCount} 评价)</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">已售 {product.salesCount}</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">浏览 {product.viewCount}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                        <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                          省 {formatPrice(product.originalPrice - product.price)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 产品描述 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">产品描述</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* 产品规格 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">材质:</span>
                  <span className="ml-2 text-gray-900">{product.material}</span>
                </div>
                <div>
                  <span className="text-gray-500">季节:</span>
                  <span className="ml-2 text-gray-900">{product.season}</span>
                </div>
                <div>
                  <span className="text-gray-500">库存:</span>
                  <span className="ml-2 text-gray-900">{product.inStock ? '有库存' : '缺货'}</span>
                </div>
                <div>
                  <span className="text-gray-500">分类:</span>
                  <span className="ml-2 text-gray-900">{product.category}</span>
                </div>
              </div>

              {/* 颜色选择 */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">颜色</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-12 h-12 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: 
                            color === '黑色' ? '#000' :
                            color === '白色' ? '#fff' :
                            color === '红色' ? '#ef4444' :
                            color === '蓝色' ? '#3b82f6' :
                            color === '绿色' ? '#10b981' :
                            color === '黄色' ? '#f59e0b' :
                            color === '紫色' ? '#8b5cf6' :
                            color === '粉色' ? '#ec4899' :
                            color === '灰色' ? '#6b7280' :
                            '#6b7280'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">已选择: {selectedColor}</p>
                </div>
              )}

              {/* 尺寸选择 */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">尺寸</h3>
                  <div className="flex gap-3">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          selectedSize === size
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 数量选择 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">数量</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 购买按钮 */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  立即购买
                </button>
                <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  加入购物车
                </button>
              </div>

              {/* 服务保障 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">服务保障</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>正品保证，假一赔十</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>7天无理由退换</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>全国包邮，48小时发货</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>专业客服，贴心服务</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 推荐商品 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map(relatedProduct => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEgxMjBWMTIwSDgwVjgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                        }}
                      />
                      {relatedProduct.discount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{relatedProduct.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{relatedProduct.brand}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-600">{relatedProduct.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">¥{relatedProduct.price}</span>
                        {relatedProduct.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">¥{relatedProduct.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
