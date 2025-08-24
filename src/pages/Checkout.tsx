import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle,
  Truck,
  Calendar,
  Shield,
  Gift,
  AlertCircle
} from 'lucide-react'
import { useCart, useAuth } from '../hooks'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface CheckoutForm {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  shippingMethod: 'standard' | 'express' | 'overnight'
  paymentMethod: 'card' | 'paypal' | 'apple_pay'
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  saveCard: boolean
  billingAddressSame: boolean
  specialInstructions: string
}

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, getFinalAmount, getSubtotal } = useCart()
  const { isAuthenticated, user } = useAuth()
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<CheckoutForm>({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
    phone: user?.phone || '',
    shippingMethod: 'standard',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false,
    billingAddressSame: true,
    specialInstructions: ''
  })

  const subtotal = getSubtotal()
  const total = getFinalAmount()
  const tax = total * 0.1
  
  const shippingCosts = {
    standard: 0,
    express: 15.99,
    overnight: 29.99
  }
  
  const shipping = shippingCosts[formData.shippingMethod]
  const finalTotal = total + tax + shipping

  const handleInputChange = (field: keyof CheckoutForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (currentStep: string): boolean => {
    switch (currentStep) {
      case 'shipping':
        return !!(
          formData.email &&
          formData.firstName &&
          formData.lastName &&
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zipCode &&
          formData.phone
        )
      case 'payment':
        if (formData.paymentMethod === 'card') {
          return !!(
            formData.cardNumber &&
            formData.expiryDate &&
            formData.cvv &&
            formData.nameOnCard
          )
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      setStep('review')
    }
  }

  const handleBack = () => {
    if (step === 'payment') {
      setStep('shipping')
    } else if (step === 'review') {
      setStep('payment')
    }
  }

  const handlePlaceOrder = async () => {
    if (!validateStep('payment')) {
      toast.error('Please check your payment information')
      return
    }

    setIsProcessing(true)
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Order placed successfully!')
      navigate('/orders/confirmation')
    } catch (error) {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
        <Button asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Shipping */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'shipping' ? 'bg-blue-600 text-white' : 
            ['payment', 'review'].includes(step) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {['payment', 'review'].includes(step) ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>1</span>
            )}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Shipping</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          ['payment', 'review'].includes(step) ? 'bg-green-600' : 'bg-gray-300'
        }`} />
        
        {/* Payment */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'payment' ? 'bg-blue-600 text-white' : 
            step === 'review' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {step === 'review' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>2</span>
            )}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
        </div>
        
        <div className={`w-16 h-0.5 ${
          step === 'review' ? 'bg-green-600' : 'bg-gray-300'
        }`} />
        
        {/* Review */}
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            <span>3</span>
          </div>
          <span className="ml-2 text-sm font-medium text-gray-900">Review</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">Complete your order</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <StepIndicator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Shipping Information */}
          {step === 'shipping' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+234 123 456 7890"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lagos State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
                <div className="space-y-4">
                  {[
                    { key: 'standard', name: 'Standard Delivery', time: '5-7 business days', price: 0 },
                    { key: 'express', name: 'Express Delivery', time: '2-3 business days', price: 15.99 },
                    { key: 'overnight', name: 'Overnight Delivery', time: 'Next business day', price: 29.99 }
                  ].map((method) => (
                    <label key={method.key} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.key}
                        checked={formData.shippingMethod === method.key}
                        onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.time}</p>
                          </div>
                          <span className="font-medium text-gray-900">
                            {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} disabled={!validateStep('shipping')}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h2>
              
              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { key: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                    { key: 'paypal', name: 'PayPal', icon: CreditCard },
                    { key: 'apple_pay', name: 'Apple Pay', icon: CreditCard }
                  ].map((method) => (
                    <label key={method.key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.key}
                        checked={formData.paymentMethod === method.key}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <method.icon className="ml-3 w-5 h-5 text-gray-400" />
                      <span className="ml-3 font-medium text-gray-900">{method.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={formData.nameOnCard}
                      onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.saveCard}
                      onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Save this card for future purchases
                    </label>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back to Shipping
                </Button>
                <Button onClick={handleNext} disabled={!validateStep('payment')}>
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Order Review */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Your Order</h2>
              
              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => {
                    if (!item) {
                      return null;
                    }
                    
                    return (
                      <div key={item.id || item.productId || 'unknown'} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={typeof item.image === 'string' ? item.image : '/api/placeholder/60/60'}
                          alt={item.name || 'Product'}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/60/60';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(((parseFloat(item.discountPrice || item.price) || 0) * (item.quantity || 1)))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
                <p className="text-sm text-gray-900">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.address}<br />
                  {formData.city}, {formData.state} {formData.zipCode}<br />
                  {formData.country}
                </p>
              </div>

              {/* Security Notice */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Secure Checkout</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back to Payment
                </Button>
                <Button 
                  onClick={handlePlaceOrder} 
                  disabled={isProcessing}
                  className="min-w-[150px]"
                >
                  {isProcessing ? 'Processing...' : `Place Order • ${formatCurrency(finalTotal)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  if (!item) {
                    return null;
                  }
                  
                  return (
                    <div key={item.id || item.productId || 'unknown'} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                          {item.quantity || 1}
                        </span>
                        <span className="text-gray-900 truncate">{item.name || 'Unknown Product'}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(((parseFloat(item.discountPrice || item.price) || 0) * (item.quantity || 1)))}
                      </span>
                    </div>
                  );
                })}
              </div>

              <hr className="my-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatCurrency(tax)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Free Returns within 30 days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Gift className="w-4 h-4 text-purple-600" />
                  <span>Gift wrapping available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
