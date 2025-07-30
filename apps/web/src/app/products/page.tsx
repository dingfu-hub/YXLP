'use client'

import { useState, useEffect, useMemo } from 'react'
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
  price: number
  originalPrice?: number
  currency: string
  stock: number
  inStock: boolean
  image: string
  images: string[]
  rating: number
  reviewCount: number
  salesCount: number
  tags: string[]
  featured: boolean
  publishDate: string
  slug: string
  specifications?: Record<string, string>
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('publishedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 24

  // 获取商品数据
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder
      })

      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchTerm.trim()) params.append('search', searchTerm.trim())

      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('获取商品数据失败')
      }

      const result = await response.json()
      setProducts(result.data?.products || [])
      setTotal(result.data?.total || 0)
      setTotalPages(result.data?.totalPages || 1)

    } catch (error) {
      console.error('获取商品数据错误:', error)
      setError(error instanceof Error ? error.message : '获取商品数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取所有品牌
  const allBrands = useMemo(() => {
    const brands = [...new Set(products.map(p => p.brand))].sort()
    return brands
  }, [products])

  // 客户端筛选（在API返回的结果基础上进一步筛选）
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand)

      return matchesPrice && matchesBrand && product.inStock
    })
  }, [products, priceRange, selectedBrands])

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1)
    fetchProducts()
  }

  // 处理分类选择
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  // 处理排序
  const handleSortChange = (newSortBy: string, newSortOrder: string = 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  // 处理品牌筛选
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  // 清除所有筛选
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setPriceRange([0, 5000])
    setSelectedBrands([])
    setCurrentPage(1)
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }

  // 获取分类标签
  const getCategoryLabel = (categoryId: string) => {
    const category = productCategories.find(cat => cat.id === categoryId)
    return category?.name || categoryId
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchProducts()
  }, [currentPage, selectedCategory, searchTerm, sortBy, sortOrder])

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortOptions = [
    { id: 'publishedAt', name: '最新发布', order: 'desc' },
    { id: 'price', name: '价格从低到高', order: 'asc' },
    { id: 'price', name: '价格从高到低', order: 'desc' },
    { id: 'rating', name: '评分最高', order: 'desc' },
    { id: 'salesCount', name: '销量最高', order: 'desc' }
  ]

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

      {/* 主要内容区域 - 左右布局 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 左侧筛选栏 */}
          <div className="w-80 flex-shrink-0">
            {/* 页面标题 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">产品中心</h1>
              <p className="text-gray-600">发现您喜爱的时尚单品</p>
            </div>

            {/* 搜索框 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索产品、品牌..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 分类导航 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">商品分类</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>🛍️</span>
                    <span>全部商品</span>
                  </span>
                  <span className="text-sm opacity-75">
                    {total}
                  </span>
                </button>

                {productCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* 价格筛选 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">价格区间</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="最低价"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="最高价"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    [0, 100, '100元以下'],
                    [100, 500, '100-500元'],
                    [500, 1000, '500-1000元'],
                    [1000, 2000, '1000-2000元'],
                    [2000, 5000, '2000元以上']
                  ].map(([min, max, label]) => (
                    <button
                      key={label}
                      onClick={() => setPriceRange([min as number, max as number])}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 品牌筛选 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">品牌</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {allBrands.slice(0, 20).map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      ({products.filter(p => p.brand === brand).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧主内容区 */}
          <div className="flex-1 min-w-0">
            {/* 工具栏 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    共找到 <span className="font-semibold text-gray-900">{filteredProducts.length}</span> 件商品
                  </span>
                  {selectedCategory !== 'all' && (
                    <span className="text-sm text-blue-600">
                      {productCategories.find(c => c.id === selectedCategory)?.name}
                      {selectedSubCategory && ` > ${productCategories.find(c => c.id === selectedCategory)?.children?.find(s => s.id === selectedSubCategory)?.name}`}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* 视图切换 */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* 排序 */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-')
                      handleSortChange(newSortBy, newSortOrder)
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option, index) => (
                      <option key={index} value={`${option.id}-${option.order}`}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 产品列表 */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  重试
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-gray-500">没有找到符合条件的商品</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  清除筛选条件
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="relative h-64 bg-gray-200 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE3NVYxNzVIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
                          }}
                        />
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            推荐
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.brand}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold text-red-600">{formatPrice(product.price)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>已售 {product.salesCount}</span>
                          <span>库存 {product.stock}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProducts.map(product => (
                  <Link key={product.id} href={`/products/${product.id}`} className="group block">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NCA1NEg3NFY3NEg1NFY1NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{product.brand}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm text-gray-600">{product.rating}</span>
                                </div>
                                {product.discount && (
                                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                                    -{product.discount}%
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {product.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>已售 {product.sales}</span>
                                <span>材质: {product.material}</span>
                                <span>季节: {product.season}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl font-bold text-red-600">¥{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-gray-500 line-through">¥{product.originalPrice}</span>
                                )}
                              </div>
                              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                立即购买
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    上一页
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
