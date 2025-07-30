'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  totalPrice: number
  product: {
    id: string
    name: { en: string; zh: string }
    images: Array<{ url: string; alt: string }>
    sku: string
  }
  customization?: Record<string, any>
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered'
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  total: number
  currency: string
  items: OrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    province: string
    country: string
    zip: string
    phone?: string
  }
  shipping?: {
    method: string
    carrier: string
    service: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: string
  }
  createdAt: string
  updatedAt: string
  estimatedDeliveryAt?: string
  shippedAt?: string
  deliveredAt?: string
}

interface OrderSummaryProps {
  orderId: string
  showActions?: boolean
  onCancel?: (orderId: string) => void
  onTrack?: (orderId: string) => void
}

export default function OrderSummary({ 
  orderId, 
  showActions = true, 
  onCancel, 
  onTrack 
}: OrderSummaryProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const canCancel = (order: Order) => {
    return ['pending', 'confirmed'].includes(order.status)
  }

  const handleCancel = async () => {
    if (!order || !onCancel) return

    if (window.confirm('Are you sure you want to cancel this order?')) {
      onCancel(order.id)
    }
  }

  const handleTrack = () => {
    if (!order || !onTrack) return
    onTrack(order.id)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error || 'Order not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h2>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                <span className="capitalize">{order.paymentStatus.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.images[0]?.alt || item.product.name.en}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.product.name.en || item.product.name.zh}
                </h4>
                <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                {item.customization && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(item.customization).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.price, order.currency)} × {item.quantity}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.totalPrice, order.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(order.subtotal, order.currency)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">-{formatCurrency(order.discountAmount, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{formatCurrency(order.shippingAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatCurrency(order.taxAmount, order.currency)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h4>
            <div className="text-sm text-gray-600">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
            </div>
          </div>
          
          {order.shipping && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Shipping Details</h4>
              <div className="text-sm text-gray-600">
                <p>{order.shipping.carrier} - {order.shipping.service}</p>
                {order.shipping.trackingNumber && (
                  <p>
                    Tracking: 
                    {order.shipping.trackingUrl ? (
                      <a 
                        href={order.shipping.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        {order.shipping.trackingNumber}
                      </a>
                    ) : (
                      <span className="ml-1">{order.shipping.trackingNumber}</span>
                    )}
                  </p>
                )}
                {order.estimatedDeliveryAt && (
                  <p>Estimated delivery: {formatDate(order.estimatedDeliveryAt)}</p>
                )}
                {order.shippedAt && (
                  <p>Shipped: {formatDate(order.shippedAt)}</p>
                )}
                {order.deliveredAt && (
                  <p>Delivered: {formatDate(order.deliveredAt)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {order.shipping?.trackingNumber && (
                <button
                  onClick={handleTrack}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Track Package
                </button>
              )}
              
              {canCancel(order) && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(order.updatedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
