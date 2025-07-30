'use client'

import { useState } from 'react'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../hooks/useCart'
import CartDrawer from './CartDrawer'

interface CartIconProps {
  className?: string
  showBadge?: boolean
}

export default function CartIcon({ className = '', showBadge = true }: CartIconProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { cart, isLoading } = useCart()

  const itemCount = cart?.itemCount || 0

  return (
    <>
      <button
        type="button"
        className={`relative p-2 text-gray-400 hover:text-gray-500 ${className}`}
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Shopping cart with ${itemCount} items`}
      >
        <ShoppingBagIcon className="h-6 w-6" aria-hidden="true" />
        
        {showBadge && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        
        {isLoading && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </button>

      <CartDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  )
}
