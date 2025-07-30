'use client'

import { useState } from 'react'
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../hooks/useCart'
import { useTranslation } from '../../hooks/useTranslation'

interface AddToCartButtonProps {
  productId: string
  variantId: string
  quantity?: number
  customization?: Record<string, any>
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  showIcon?: boolean
  children?: React.ReactNode
}

export default function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  customization,
  disabled = false,
  className = '',
  size = 'md',
  variant = 'primary',
  showIcon = true,
  children,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const { addToCart } = useCart()
  const { t } = useTranslation()

  const handleAddToCart = async () => {
    if (disabled || isAdding) return

    try {
      setIsAdding(true)
      await addToCart(productId, variantId, quantity, customization)
      
      // Show success state
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      // Error is handled by the cart hook
    } finally {
      setIsAdding(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  }

  // Icon size based on button size
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={baseClasses}
      aria-label={t('product.addToCart')}
    >
      {isAdding ? (
        <>
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSize[size]} ${showIcon ? 'mr-2' : ''}`} />
          {children || t('product.adding')}
        </>
      ) : justAdded ? (
        <>
          {showIcon && <CheckIcon className={`${iconSize[size]} mr-2`} />}
          {children || t('product.added')}
        </>
      ) : (
        <>
          {showIcon && <ShoppingCartIcon className={`${iconSize[size]} mr-2`} />}
          {children || t('product.addToCart')}
        </>
      )}
    </button>
  )
}
