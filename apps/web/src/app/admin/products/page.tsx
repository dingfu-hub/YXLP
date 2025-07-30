'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import { Product, ProductCategory, ProductStatus, productCategories, productStatuses } from '@/types/products'

// 商品分类选项
const categoryOptions = [
  { value: 'all', label: '全部分类' },
  ...productCategories.map(cat => ({ value: cat.id, label: cat.name }))
]

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  ...productStatuses.map(status => ({ value: status.id, label: status.name }))
]

export default function ProductListPage() {
  const { user } = useAdmin()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 筛选和分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // 批量操作
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showBatchActions, setShowBatchActions] = useState(false)
  
  // 统计信息
  const [stats, setStats] = useState<any>(null)

  // 获取商品列表
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder
      })
      
      if (category !== 'all') params.append('category', category)
      if (status !== 'all') params.append('status', status)
      if (search.trim()) params.append('search', search.trim())
      
      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('获取商品列表失败')
      }
      
      const result = await response.json()
      console.log('API响应:', result)
      setProducts(result.data?.products || [])
      setTotal(result.data?.total || 0)
      setTotalPages(result.data?.totalPages || 1)
      setStats(result.data?.stats || null)
      
    } catch (error) {
      console.error('获取商品列表错误:', error)
      setError(error instanceof Error ? error.message : '获取商品列表失败')
    } finally {
      setLoading(false)
    }
  }, [currentPage, category, status, search, sortBy, sortOrder])

  // 删除商品
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return
    
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('删除商品失败')
      }
      
      // 重新获取列表
      fetchProducts()
      
    } catch (error) {
      console.error('删除商品错误:', error)
      alert(error instanceof Error ? error.message : '删除商品失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedProducts.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedProducts.size} 个商品吗？`)) return
    
    try {
      const promises = Array.from(selectedProducts).map(id =>
        fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )
      
      await Promise.all(promises)
      setSelectedProducts(new Set())
      setShowBatchActions(false)
      fetchProducts()
      
    } catch (error) {
      console.error('批量删除错误:', error)
      alert('批量删除失败')
    }
  }

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  // 处理选择
  const handleSelectProduct = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedProducts(newSelected)
    setShowBatchActions(newSelected.size > 0)
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked && products) {
      setSelectedProducts(new Set(products.map(p => p.id)))
      setShowBatchActions(true)
    } else {
      setSelectedProducts(new Set())
      setShowBatchActions(false)
    }
  }

  // 格式化日期
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 格式化价格
  const formatPrice = (price: number, currency: string = 'CNY') => {
    return `¥${price.toFixed(2)}`
  }

  // 获取状态标签样式
  const getStatusBadge = (status: ProductStatus) => {
    const statusInfo = productStatuses.find(s => s.id === status)
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {statusInfo?.name || status}
      </span>
    )
  }

  // 获取分类标签
  const getCategoryLabel = (category: ProductCategory) => {
    const categoryInfo = productCategories.find(cat => cat.id === category)
    return categoryInfo?.name || category
  }

  // 获取库存状态
  const getStockStatus = (stock: number, minStock?: number) => {
    if (stock === 0) {
      return <span className="text-red-600 font-medium">缺货</span>
    } else if (stock <= (minStock || 10)) {
      return <span className="text-yellow-600 font-medium">库存不足</span>
    } else {
      return <span className="text-green-600 font-medium">正常</span>
    }
  }

  useEffect(() => {
    if (user) {
      fetchProducts()
    }
  }, [user, fetchProducts])

  if (!user) {
    return <div>请先登录</div>
  }

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600 mt-1">管理商品信息，包括价格、库存、分类等</p>
        </div>
        <div className="flex space-x-3">
          <a
            href="/admin/products/create"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            添加商品
          </a>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">总商品数</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-600">已发布</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">草稿</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.archived}</div>
            <div className="text-sm text-gray-600">已归档</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="text-sm text-gray-600">缺货</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
            <div className="text-sm text-gray-600">库存不足</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">¥{stats.totalValue?.toFixed(0) || 0}</div>
            <div className="text-sm text-gray-600">总价值</div>
          </div>
        </div>
      )}

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商品名称、品牌、SKU..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="min-w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">创建时间 ↓</option>
              <option value="createdAt-asc">创建时间 ↑</option>
              <option value="publishedAt-desc">发布时间 ↓</option>
              <option value="publishedAt-asc">发布时间 ↑</option>
              <option value="price-desc">价格 ↓</option>
              <option value="price-asc">价格 ↑</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="name-desc">名称 Z-A</option>
              <option value="salesCount-desc">销量 ↓</option>
              <option value="rating-desc">评分 ↓</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 批量操作 */}
      {showBatchActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              已选择 {selectedProducts.size} 个商品
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBatchDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                批量删除
              </button>
              <button
                onClick={() => {
                  setSelectedProducts(new Set())
                  setShowBatchActions(false)
                }}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商品列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">暂无商品数据</p>
            <a
              href="/admin/products/create"
              className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              添加第一个商品
            </a>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品信息
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      库存
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      统计
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.featuredImage || '/api/placeholder/48/48'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand} | SKU: {product.sku}
                            </div>
                            {product.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                推荐
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getCategoryLabel(product.category)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {formatPrice(product.price, product.currency)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice, product.currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {product.stock} 件
                        </div>
                        <div className="text-xs">
                          {getStockStatus(product.stock, product.minStock)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div>浏览: {product.viewCount}</div>
                        <div>销量: {product.salesCount}</div>
                        <div>评分: {product.rating?.toFixed(1) || '-'}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <a
                            href={`/admin/products/${product.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            编辑
                          </a>
                          <a
                            href={`/products/${product.id}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900"
                          >
                            预览
                          </a>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第 <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> 到{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 20, total)}
                        </span>{' '}
                        条，共 <span className="font-medium">{total}</span> 条记录
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          上一页
                        </button>

                        {/* 页码按钮 */}
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
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          下一页
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
