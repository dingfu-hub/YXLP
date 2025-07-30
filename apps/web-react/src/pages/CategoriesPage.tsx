import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Image from '../components/common/Image';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  subcategories: string[];
  featured: boolean;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockCategories: Category[] = [
        {
          id: 'shirts',
          name: 'Shirts & Blouses',
          description: 'Professional and casual shirts for all occasions',
          image: '/api/placeholder/400/300?text=Shirts',
          productCount: 1250,
          subcategories: ['Dress Shirts', 'Casual Shirts', 'Polo Shirts', 'Blouses'],
          featured: true,
        },
        {
          id: 'pants',
          name: 'Pants & Trousers',
          description: 'Comfortable and stylish pants for work and leisure',
          image: '/api/placeholder/400/300?text=Pants',
          productCount: 890,
          subcategories: ['Dress Pants', 'Jeans', 'Chinos', 'Leggings'],
          featured: true,
        },
        {
          id: 'dresses',
          name: 'Dresses',
          description: 'Elegant dresses for every season and occasion',
          image: '/api/placeholder/400/300?text=Dresses',
          productCount: 650,
          subcategories: ['Cocktail Dresses', 'Casual Dresses', 'Maxi Dresses', 'Work Dresses'],
          featured: true,
        },
        {
          id: 'jackets',
          name: 'Jackets & Coats',
          description: 'Stylish outerwear for all weather conditions',
          image: '/api/placeholder/400/300?text=Jackets',
          productCount: 420,
          subcategories: ['Blazers', 'Winter Coats', 'Leather Jackets', 'Windbreakers'],
          featured: false,
        },
        {
          id: 'accessories',
          name: 'Accessories',
          description: 'Complete your look with our premium accessories',
          image: '/api/placeholder/400/300?text=Accessories',
          productCount: 780,
          subcategories: ['Bags', 'Belts', 'Scarves', 'Jewelry'],
          featured: false,
        },
        {
          id: 'shoes',
          name: 'Footwear',
          description: 'Comfortable and fashionable shoes for every step',
          image: '/api/placeholder/400/300?text=Shoes',
          productCount: 560,
          subcategories: ['Dress Shoes', 'Sneakers', 'Boots', 'Sandals'],
          featured: true,
        },
        {
          id: 'underwear',
          name: 'Underwear & Intimates',
          description: 'Premium quality undergarments and intimate wear',
          image: '/api/placeholder/400/300?text=Underwear',
          productCount: 340,
          subcategories: ['Bras', 'Panties', 'Boxers', 'Sleepwear'],
          featured: false,
        },
        {
          id: 'sportswear',
          name: 'Sportswear',
          description: 'Active wear for fitness and outdoor activities',
          image: '/api/placeholder/400/300?text=Sportswear',
          productCount: 290,
          subcategories: ['Gym Wear', 'Running Gear', 'Yoga Clothes', 'Swimming'],
          featured: false,
        },
      ];

      setCategories(mockCategories);
      setLoading(false);
    };

    loadCategories();
  }, []);

  const featuredCategories = categories.filter(cat => cat.featured);
  const regularCategories = categories.filter(cat => !cat.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Page Title */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="mt-2 text-gray-600">Browse our complete product categories</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Featured Categories Skeleton */}
            <div>
              <div className="bg-gray-300 h-8 w-48 rounded mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 h-6 rounded mb-2"></div>
                    <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Regular Categories Skeleton */}
            <div>
              <div className="bg-gray-300 h-8 w-48 rounded mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="bg-gray-300 h-32 rounded-lg mb-4"></div>
                    <div className="bg-gray-300 h-5 rounded mb-2"></div>
                    <div className="bg-gray-300 h-3 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Categories */}
            {featuredCategories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
                  <span className="text-sm text-gray-500">{featuredCategories.length} categories</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackText={category.name}
                          width={400}
                          height={192}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {category.productCount.toLocaleString()} products
                          </span>
                          <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                            <span className="text-sm font-medium mr-1">Explore</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Subcategories */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.slice(0, 3).map((sub, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {sub}
                              </span>
                            ))}
                            {category.subcategories.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{category.subcategories.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All Categories */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Categories</h2>
                <span className="text-sm text-gray-500">{categories.length} total categories</span>
              </div>

              {selectedView === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackText={category.name}
                          width={300}
                          height={128}
                        />
                        {category.featured && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {category.productCount.toLocaleString()} items
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.id}`}
                        className="group flex items-center p-6 hover:bg-gray-50 transition-colors"
                      >
                        <Image
                          src={category.image}
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                          fallbackText={category.name.charAt(0)}
                          width={64}
                          height={64}
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            {category.featured && (
                              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">
                            {category.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">
                              {category.productCount.toLocaleString()} products
                            </span>
                            <div className="flex space-x-2">
                              {category.subcategories.slice(0, 3).map((sub, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
