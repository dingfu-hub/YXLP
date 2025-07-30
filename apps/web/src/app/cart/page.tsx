'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Heart, Tag } from 'lucide-react'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    productId: 'prod1',
    variantId: 'var1',
    product: {
      name: 'Premium Cotton Business Shirt',
      brand: 'YXLP Collection',
      image: '/placeholder-shirt.jpg',
      slug: 'premium-cotton-business-shirt'
    },
    variant: {
      name: 'White / Medium',
      attributes: [
        { name: 'color', value: 'white', displayValue: 'White' },
        { name: 'size', value: 'M', displayValue: 'Medium' }
      ],
      sku: 'SHIRT-001-WH-M'
    },
    quantity: 2,
    unitPrice: 89.99,
    compareAtPrice: 129.99,
    totalPrice: 179.98,
    inStock: true,
    maxQuantity: 15
  },
  {
    id: '2',
    productId: 'prod2',
    variantId: 'var2',
    product: {
      name: 'Elegant Summer Dress',
      brand: 'YXLP Collection',
      image: '/placeholder-dress.jpg',
      slug: 'elegant-summer-dress'
    },
    variant: {
      name: 'Pink / Large',
      attributes: [
        { name: 'color', value: 'pink', displayValue: 'Pink' },
        { name: 'size', value: 'L', displayValue: 'Large' }
      ],
      sku: 'DRESS-001-PK-L'
    },
    quantity: 1,
    unitPrice: 129.99,
    compareAtPrice: 179.99,
    totalPrice: 129.99,
    inStock: true,
    maxQuantity: 8
  }
]

const mockCartSummary = {
  subtotal: 309.97,
  discountAmount: 30.00,
  taxAmount: 27.90,
  shippingAmount: 0, // Free shipping
  total: 307.87,
  itemCount: 3,
  currency: 'USD'
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [promoCode, setPromoCode] = useState('')
  const [isPromoApplied, setIsPromoApplied] = useState(false)

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const quantity = Math.max(1, Math.min(newQuantity, item.maxQuantity))
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice
          }
        }
        return item
      })
    )
  }

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId))
  }

  const moveToWishlist = (itemId: string) => {
    // Move to wishlist logic
    removeItem(itemId)
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setIsPromoApplied(true)
      // Apply discount logic
    }
  }

  const removePromoCode = () => {
    setIsPromoApplied(false)
    setPromoCode('')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            href="/products"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({mockCartSummary.itemCount})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-2xl">
                            {item.product.name.includes('Shirt') ? '👔' : '👗'}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link
                                href={`/products/${item.product.slug}`}
                                className="hover:text-blue-600"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{item.product.brand}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.variant.attributes.map(attr => attr.displayValue).join(' / ')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {item.variant.sku}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveToWishlist(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Move to Wishlist"
                            >
                              <Heart className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-900">
                              ${item.unitPrice}
                            </span>
                            {item.compareAtPrice > item.unitPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.compareAtPrice}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-center min-w-[60px]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.maxQuantity}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <span className="text-lg font-semibold text-gray-900 min-w-[80px] text-right">
                              ${item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Stock Status */}
                        {item.inStock ? (
                          <p className="text-sm text-green-600 mt-2">✓ In Stock</p>
                        ) : (
                          <p className="text-sm text-red-600 mt-2">⚠ Out of Stock</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Promo Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isPromoApplied}
                    />
                    {isPromoApplied ? (
                      <button
                        onClick={removePromoCode}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={applyPromoCode}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {isPromoApplied && (
                    <div className="flex items-center space-x-2 mt-2 text-green-600">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">Promo code applied: SAVE10</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${mockCartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {mockCartSummary.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${mockCartSummary.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {mockCartSummary.shippingAmount === 0 ? 'Free' : `$${mockCartSummary.shippingAmount.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${mockCartSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${mockCartSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6">
                  Proceed to Checkout
                </button>

                {/* Security Badge */}
                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    🔒 Secure checkout with SSL encryption
                  </p>
                </div>

                {/* Shipping Info */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Free Shipping</h3>
                  <p className="text-sm text-gray-600">
                    Your order qualifies for free standard shipping (5-7 business days)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
