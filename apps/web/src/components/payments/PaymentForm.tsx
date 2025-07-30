'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Wallet, Building2, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface PaymentMethod {
  id: string
  name: string
  type: string
  enabled: boolean
  description: string
  logo: string
  fees: {
    percentage: number
    fixed: number
  }
}

interface PaymentFormProps {
  orderId: string
  amount: number
  currency: string
  onSuccess?: (paymentId: string) => void
  onError?: (error: string) => void
}

export default function PaymentForm({ orderId, amount, currency, onSuccess, onError }: PaymentFormProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  })

  // Billing details state
  const [billingDetails, setBillingDetails] = useState({
    name: user?.firstName + ' ' + user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: user?.country || 'US',
    },
  })

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/payments/methods/available?country=${user?.country}&currency=${currency}`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.data)
        if (data.data.length > 0) {
          setSelectedMethod(data.data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      setError('Failed to load payment methods')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardInputChange = (field: string, value: string) => {
    setCardForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleBillingChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setBillingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setBillingDetails(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateCardForm = () => {
    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, '').length < 13) {
      return 'Please enter a valid card number'
    }
    if (!cardForm.expiryDate || cardForm.expiryDate.length < 5) {
      return 'Please enter a valid expiry date'
    }
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      return 'Please enter a valid CVV'
    }
    if (!cardForm.cardholderName.trim()) {
      return 'Please enter the cardholder name'
    }
    return null
  }

  const validateBillingDetails = () => {
    if (!billingDetails.name.trim()) return 'Please enter your name'
    if (!billingDetails.email.trim()) return 'Please enter your email'
    if (!billingDetails.address.line1.trim()) return 'Please enter your address'
    if (!billingDetails.address.city.trim()) return 'Please enter your city'
    if (!billingDetails.address.postalCode.trim()) return 'Please enter your postal code'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate form based on selected method
    if (selectedMethod === 'stripe') {
      const cardError = validateCardForm()
      if (cardError) {
        setError(cardError)
        return
      }
    }

    const billingError = validateBillingDetails()
    if (billingError) {
      setError(billingError)
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent
      const intentResponse = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderId,
          method: selectedMethod,
          amount,
          currency,
          description: `Payment for order ${orderId}`,
          metadata: {
            orderId,
            userId: user?.id,
          },
        }),
      })

      const intentData = await intentResponse.json()

      if (!intentResponse.ok) {
        throw new Error(intentData.message || 'Failed to create payment intent')
      }

      // Handle different payment methods
      if (selectedMethod === 'stripe') {
        await handleStripePayment(intentData)
      } else if (selectedMethod === 'paypal') {
        await handlePayPalPayment(intentData)
      } else {
        throw new Error('Unsupported payment method')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error instanceof Error ? error.message : 'Payment failed')
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripePayment = async (intentData: any) => {
    // In a real implementation, you would use Stripe Elements here
    // For now, we'll simulate the payment process
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Confirm payment
    const confirmResponse = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        paymentIntentId: intentData.paymentIntentId,
        billingDetails,
      }),
    })

    const confirmData = await confirmResponse.json()

    if (!confirmResponse.ok) {
      throw new Error(confirmData.message || 'Payment confirmation failed')
    }

    setSuccess('Payment completed successfully!')
    onSuccess?.(confirmData.id)
    
    // Redirect to success page
    setTimeout(() => {
      router.push(`/orders/${orderId}?payment=success`)
    }, 2000)
  }

  const handlePayPalPayment = async (intentData: any) => {
    // Redirect to PayPal approval URL
    if (intentData.approvalUrl) {
      window.location.href = intentData.approvalUrl
    } else {
      throw new Error('PayPal approval URL not received')
    }
  }

  const selectedMethodData = paymentMethods.find(method => method.id === selectedMethod)
  const totalFee = selectedMethodData ? (amount * selectedMethodData.fees.percentage / 100) + selectedMethodData.fees.fixed : 0
  const totalAmount = amount + totalFee

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading payment methods...</span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center flex-1">
                  <div className="flex-shrink-0 mr-3">
                    {method.type === 'card' && <CreditCard className="w-6 h-6 text-gray-600" />}
                    {method.type === 'wallet' && <Wallet className="w-6 h-6 text-gray-600" />}
                    {method.type === 'bank_transfer' && <Building2 className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Fee: {method.fees.percentage}% + ${method.fees.fixed}
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Card Details (for Stripe) */}
        {selectedMethod === 'stripe' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Card Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardForm.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardForm.expiryDate}
                  onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardForm.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardForm.cardholderName}
                onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Billing Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Billing Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={billingDetails.name}
                onChange={(e) => handleBillingChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={billingDetails.email}
                onChange={(e) => handleBillingChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={billingDetails.address.line1}
              onChange={(e) => handleBillingChange('address.line1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={billingDetails.address.city}
                onChange={(e) => handleBillingChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={billingDetails.address.postalCode}
                onChange={(e) => handleBillingChange('address.postalCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{currency} {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Fee</span>
              <span>{currency} {totalFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{currency} {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
          <Shield className="w-5 h-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Your payment information is encrypted and secure
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ${currency} ${totalAmount.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  )
}
