'use client'

import { useState } from 'react'
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react'

export default function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Products', count: 1247 },
    { id: 'shirts', name: 'Shirts', count: 324 },
    { id: 'dresses', name: 'Dresses', count: 189 },
    { id: 'pants', name: 'Pants', count: 267 },
    { id: 'jackets', name: 'Jackets', count: 156 },
    { id: 'accessories', name: 'Accessories', count: 311 }
  ]

  const products = [
    {
      id: 1,
      name: "Premium Cotton Business Shirt",
      category: "shirts",
      price: 24.99,
      originalPrice: 34.99,
      rating: 4.8,
      reviews: 127,
      image: "👔",
      badge: "Best Seller",
      colors: ['#000000', '#FFFFFF', '#0066CC', '#CC0000'],
      inStock: true
    },
    {
      id: 2,
      name: "Elegant Summer Dress",
      category: "dresses",
      price: 45.99,
      originalPrice: 65.99,
      rating: 4.9,
      reviews: 89,
      image: "👗",
      badge: "New Arrival",
      colors: ['#FF69B4', '#000000', '#FFFFFF', '#8A2BE2'],
      inStock: true
    },
    {
      id: 3,
      name: "Professional Blazer",
      category: "jackets",
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.7,
      reviews: 203,
      image: "🧥",
      badge: "Premium",
      colors: ['#000000', '#2F4F4F', '#8B4513'],
      inStock: true
    },
    {
      id: 4,
      name: "Casual Denim Jeans",
      category: "pants",
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.6,
      reviews: 156,
      image: "👖",
      badge: "Popular",
      colors: ['#4169E1', '#000000', '#696969'],
      inStock: false
    },
    {
      id: 5,
      name: "Designer Handbag",
      category: "accessories",
      price: 129.99,
      originalPrice: 199.99,
      rating: 4.9,
      reviews: 78,
      image: "👜",
      badge: "Limited",
      colors: ['#8B4513', '#000000', '#DC143C'],
      inStock: true
    },
    {
      id: 6,
      name: "Luxury Silk Scarf",
      category: "accessories",
      price: 34.99,
      originalPrice: 49.99,
      rating: 4.8,
      reviews: 92,
      image: "🧣",
      badge: "Trending",
      colors: ['#FF1493', '#4169E1', '#32CD32', '#FFD700'],
      inStock: true
    }
  ]

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory)

  const getBadgeColor = (badge: string) => {
    const colors = {
      'Best Seller': 'bg-green-500',
      'New Arrival': 'bg-blue-500',
      'Premium': 'bg-purple-500',
      'Popular': 'bg-orange-500',
      'Limited': 'bg-red-500',
      'Trending': 'bg-pink-500'
    }
    return colors[badge as keyof typeof colors] || 'bg-gray-500'
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our premium collection of clothing and accessories. 
            Each product is carefully selected for quality, style, and value.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.name}
              <span className="ml-2 text-sm opacity-75">({category.count})</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>
                
                {/* Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 ${getBadgeColor(product.badge)} text-white text-xs font-semibold rounded-full`}>
                  {product.badge}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Colors */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-600">Colors:</span>
                  <div className="flex space-x-1">
                    {product.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-semibold">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  disabled={!product.inStock}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    product.inStock
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200">
            View All Products ({categories.find(c => c.id === 'all')?.count})
          </button>
        </div>
      </div>
    </section>
  )
}
