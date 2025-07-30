'use client'

import { useState } from 'react'
import Link from 'next/link'
import { productCategories, products } from '@/data/products'

export default function CategoriesPage() {
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')

  // 计算实际的产品数量
  const getCategoryProductCount = (categoryId: string) => {
    if (!products || !Array.isArray(products)) return 0
    return products.filter(p => categoryId === 'all' || p.category === categoryId).length
  }

  // 获取分类的热门产品
  const getCategoryHotProducts = (categoryId: string, limit = 3) => {
    if (!products || !Array.isArray(products)) return []
    return products
      .filter(p => categoryId === 'all' || p.category === categoryId)
      .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      .slice(0, limit)
  }

  // 季节筛选
  const seasons = [
    { id: 'all', name: '全部季节' },
    { id: 'spring', name: '春季' },
    { id: 'summer', name: '夏季' },
    { id: 'autumn', name: '秋季' },
    { id: 'winter', name: '冬季' }
  ]

  // 性别筛选
  const genders = [
    { id: 'all', name: '全部' },
    { id: 'male', name: '男装' },
    { id: 'female', name: '女装' },
    { id: 'unisex', name: '中性' }
  ]

  // 筛选后的分类
  const filteredCategories = (productCategories || []).filter(category => {
    if (category.id === 'all') return false // 不显示"全部商品"分类

    if (!products || !Array.isArray(products)) return true // 如果没有产品数据，显示所有分类
    const categoryProducts = products.filter(p => p.category === category.id)

    // 简化筛选逻辑，因为产品数据中暂时没有season和gender字段
    const seasonMatch = selectedSeason === 'all' || categoryProducts.length > 0
    const genderMatch = selectedGender === 'all' || categoryProducts.length > 0

    return seasonMatch && genderMatch
  })
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
              <Link href="/products" className="text-gray-600 hover:text-gray-900">产品中心</Link>
              <Link href="/categories" className="text-blue-600 font-medium">产品分类</Link>
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

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">服装分类</h1>
          <p className="text-gray-600">精选优质服装，满足您的时尚需求</p>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-6">
            {/* 季节筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">季节</label>
              <div className="flex flex-wrap gap-2">
                {seasons.map(season => (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedSeason === season.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 性别筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
              <div className="flex flex-wrap gap-2">
                {genders.map(gender => (
                  <button
                    key={gender.id}
                    onClick={() => setSelectedGender(gender.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedGender === gender.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {gender.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 分类网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map(category => {
            const productCount = getCategoryProductCount(category.id)
            const hotProducts = getCategoryHotProducts(category.id)

            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* 分类头部 */}
                <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-5xl">{category.icon}</span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">{productCount} 件</span>
                  </div>
                </div>

                {/* 分类信息 */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                    <Link
                      href={`/products?category=${category.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      查看全部 →
                    </Link>
                  </div>

                  {/* 子分类 */}
                  {category.children && category.children.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 4).map(subCategory => (
                          <Link
                            key={subCategory.id}
                            href={`/products?category=${category.id}&subcategory=${subCategory.id}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded transition-colors"
                          >
                            {subCategory.name}
                          </Link>
                        ))}
                        {category.children.length > 4 && (
                          <span className="text-gray-500 text-xs px-2 py-1">
                            +{category.children.length - 4} 更多
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 热门产品预览 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">热门商品</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {hotProducts.map(product => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="group"
                        >
                          <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={product.featuredImage || product.images?.[0] || '/api/placeholder/100/100'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/api/placeholder/100/100?text=' + encodeURIComponent(product.name)
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate" title={product.name}>
                            {product.name}
                          </p>
                          <p className="text-xs font-medium text-red-600">¥{product.price}</p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* 查看分类按钮 */}
                  <Link
                    href={`/products?category=${category.id}`}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors block"
                  >
                    浏览 {category.name}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* 购物指南 */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">购物指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">品质保证</h3>
              <p className="text-gray-600 text-sm">所有商品均经过严格质检，确保品质优良</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">价格优惠</h3>
              <p className="text-gray-600 text-sm">定期促销活动，让您享受更多优惠</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">快速配送</h3>
              <p className="text-gray-600 text-sm">全国包邮，48小时内发货</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
