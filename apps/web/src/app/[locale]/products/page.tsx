'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Grid, List, Star, ShoppingCart, Heart, Eye } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import Header from '@/components/layout/Header'

interface ProductsPageProps {
  params: {
    locale: string
  }
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  isHot?: boolean
  isNew?: boolean
  discount?: number
}

export default function ProductsPage({ params }: ProductsPageProps) {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('default')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 模拟产品数据
  const products: Product[] = [
    {
      id: '1',
      name: t('products.casualShirt.name', { defaultValue: '休闲衬衫' }),
      price: 299.00,
      originalPrice: 399.00,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      rating: 4.5,
      reviews: 128,
      category: 'clothing',
      isHot: true,
      discount: 25
    },
    {
      id: '2',
      name: t('products.smartphone.name', { defaultValue: '运动鞋' }),
      price: 599.00,
      originalPrice: 799.00,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center',
      rating: 4.0,
      reviews: 89,
      category: 'shoes',
      isNew: true,
      discount: 25
    },
    {
      id: '3',
      name: t('products.luxuryBag.name', { defaultValue: '奢侈手提包' }),
      price: 1299.00,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
      rating: 4.8,
      reviews: 256,
      category: 'bags',
      isHot: true
    }
  ]

  const categories = [
    { id: 'all', name: t('categories.all', { defaultValue: '全部商品' }), count: 5 },
    { id: 'clothing', name: t('categories.clothing', { defaultValue: '服装' }), count: 2 },
    { id: 'shoes', name: t('categories.shoes', { defaultValue: '鞋类' }), count: 1 },
    { id: 'bags', name: t('categories.bags', { defaultValue: '包类' }), count: 1 },
    { id: 'accessories', name: t('categories.accessories', { defaultValue: '配饰' }), count: 1 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{t('products.categories', { defaultValue: '商品分类' })}</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-400">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={t('products.searchPlaceholder', { defaultValue: '搜索产品、品牌...' })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="default">{t('products.sort.default', { defaultValue: '默认排序' })}</option>
                    <option value="price-low">{t('products.sort.priceLow', { defaultValue: '价格从低到高' })}</option>
                    <option value="price-high">{t('products.sort.priceHigh', { defaultValue: '价格从高到低' })}</option>
                    <option value="rating">{t('products.sort.rating', { defaultValue: '评分最高' })}</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                    >
                      <List className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                    {product.isHot && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                        {t('products.labels.hot', { defaultValue: '热销' })}
                      </span>
                    )}
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs rounded">
                        {t('products.labels.new', { defaultValue: '新品' })}
                      </span>
                    )}
                    {product.discount && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 text-xs rounded">
                        -{product.discount}%
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>

                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">¥{product.price.toFixed(2)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">¥{product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        {t('products.addToCart', { defaultValue: '加入购物车' })}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
