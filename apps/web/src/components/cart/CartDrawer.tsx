'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ShoppingBagIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useCart } from '../../hooks/useCart'
import { useTranslation } from '../../hooks/useTranslation'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, isLoading, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart()
  const { t, formatCurrency } = useTranslation()

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItem(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }

  const handleCouponSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const code = formData.get('coupon') as string
    
    if (code.trim()) {
      try {
        await applyCoupon(code.trim())
        e.currentTarget.reset()
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          {t('cart.title')}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">{t('common.close')}</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : !cart || cart.items.length === 0 ? (
                            <div className="text-center py-12">
                              <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {t('cart.empty.title')}
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                {t('cart.empty.description')}
                              </p>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {cart.items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                      src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                                      alt={item.product.images[0]?.alt || item.product.name.en}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>
                                          <a href={`/products/${item.product.id}`}>
                                            {item.product.name.en || item.product.name.zh}
                                          </a>
                                        </h3>
                                        <p className="ml-4">
                                          {formatCurrency(item.totalPrice, cart.currency)}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {item.variant.name.en || item.variant.name.zh}
                                      </p>
                                      {item.variant.attributes && Object.keys(item.variant.attributes).length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500">
                                          {Object.entries(item.variant.attributes).map(([key, value]) => (
                                            <span key={key} className="mr-2">
                                              {key}: {String(value)}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center">
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </button>
                                        <span className="mx-2 min-w-[2rem] text-center">
                                          {item.quantity}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                          className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                                          disabled={!item.availability.inStock && item.quantity >= item.availability.quantity}
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <div className="flex">
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.id)}
                                          className="font-medium text-red-600 hover:text-red-500"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Availability warning */}
                                    {!item.availability.inStock && (
                                      <div className="mt-2 text-xs text-red-600">
                                        {t('cart.item.outOfStock')}
                                      </div>
                                    )}
                                    {item.availability.inStock && item.availability.quantity < 5 && (
                                      <div className="mt-2 text-xs text-orange-600">
                                        {t('cart.item.lowStock', { count: item.availability.quantity })}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Coupon Section */}
                      {cart && cart.items.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-6">
                          <form onSubmit={handleCouponSubmit} className="flex space-x-2">
                            <input
                              type="text"
                              name="coupon"
                              placeholder={t('cart.coupon.placeholder')}
                              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            <button
                              type="submit"
                              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                              {t('cart.coupon.apply')}
                            </button>
                          </form>

                          {/* Applied Coupons */}
                          {cart.appliedCoupons.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {cart.appliedCoupons.map((coupon) => (
                                <div key={coupon.code} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md">
                                  <div>
                                    <span className="text-sm font-medium text-green-800">
                                      {coupon.code}
                                    </span>
                                    <span className="ml-2 text-sm text-green-600">
                                      -{formatCurrency(coupon.amount, cart.currency)}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeCoupon(coupon.code)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cart && cart.items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        {/* Order Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('cart.summary.subtotal')}</span>
                            <span>{formatCurrency(cart.subtotal, cart.currency)}</span>
                          </div>
                          {cart.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>{t('cart.summary.discount')}</span>
                              <span>-{formatCurrency(cart.discountAmount, cart.currency)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('cart.summary.shipping')}</span>
                            <span>
                              {cart.shippingAmount === 0 
                                ? t('cart.summary.freeShipping')
                                : formatCurrency(cart.shippingAmount, cart.currency)
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{t('cart.summary.tax')}</span>
                            <span>{formatCurrency(cart.taxAmount, cart.currency)}</span>
                          </div>
                          <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-2">
                            <span>{t('cart.summary.total')}</span>
                            <span>{formatCurrency(cart.total, cart.currency)}</span>
                          </div>
                        </div>

                        {/* Validation Errors */}
                        {cart.validation && !cart.validation.isValid && (
                          <div className="mt-4 rounded-md bg-red-50 p-4">
                            <div className="text-sm text-red-800">
                              <ul className="list-disc list-inside space-y-1">
                                {cart.validation.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Validation Warnings */}
                        {cart.validation && cart.validation.warnings.length > 0 && (
                          <div className="mt-4 rounded-md bg-yellow-50 p-4">
                            <div className="text-sm text-yellow-800">
                              <ul className="list-disc list-inside space-y-1">
                                {cart.validation.warnings.map((warning, index) => (
                                  <li key={index}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Checkout Button */}
                        <div className="mt-6">
                          <a
                            href="/checkout"
                            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={onClose}
                          >
                            {t('cart.checkout')}
                          </a>
                        </div>

                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            {t('cart.continueShoppingPrefix')}{' '}
                            <button
                              type="button"
                              className="font-medium text-blue-600 hover:text-blue-500"
                              onClick={onClose}
                            >
                              {t('cart.continueShopping')}
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
