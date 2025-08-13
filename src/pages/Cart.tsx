import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Shield,
  CreditCard,
  Tag,
  Heart
} from 'lucide-react'
import { useCart, useAuth } from '../hooks'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface Coupon {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount?: number
}

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getSubtotal, getFinalAmount, appliedCoupon, applyCoupon, removeCoupon } = useCart()
  const { isAuthenticated } = useAuth()
  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const subtotal = getSubtotal()
  const savings = subtotal - getFinalAmount()
  const finalAmount = getFinalAmount()
  const shipping = finalAmount > 50000 ? 0 : 5000

  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setIsApplyingCoupon(true)
    try {
      // Mock coupon validation
      const mockCoupon: Coupon = {
        code: couponCode.toUpperCase(),
        type: 'PERCENTAGE',
        value: 10, // 10% discount
        minOrderAmount: 20000
      }

      const success = applyCoupon(mockCoupon)
      if (success) {
        toast.success('Coupon applied successfully!')
        setCouponCode('')
      } else {
        toast.error('Coupon cannot be applied. Check minimum order amount.')
      }
    } catch (error) {
      toast.error('Invalid coupon code')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    toast.success('Coupon removed')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-lg text-gray-600">Start shopping to add items to your cart.</p>
            <div className="mt-8">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/products"
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="mt-1 text-sm text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Cart Items</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.productId} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          className="w-20 h-20 rounded-md object-cover"
                          src={item.image || '/api/placeholder/120/120'}
                          alt={item.name}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          Electronics
                        </p>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.discountPrice || item.price)}
                          </span>
                          {item.discountPrice && parseFloat(item.discountPrice) < parseFloat(item.price) && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>

                        {/* Stock Warning */}
                        {item.stock <= 5 && item.stock > 0 && (
                          <div className="flex items-center mt-2">
                            <Badge variant="warning" className="text-xs">
                              Only {item.stock} left
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            onClick={() => handleQuantityUpdate(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency((parseFloat(item.discountPrice || item.price)) * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          className="p-2 text-gray-400 hover:text-red-600"
                          onClick={() => handleRemoveItem(item.productId)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 lg:mt-0 lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Promo Code</span>
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-800">{appliedCoupon.code}</span>
                        <Badge variant="success" className="text-xs">Applied</Badge>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        variant="outline"
                        size="sm"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Savings</span>
                      <span className="font-medium text-green-600">-{formatCurrency(savings)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(finalAmount + shipping)}
                    </span>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {shipping > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Free Shipping</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Add {formatCurrency(50000 - finalAmount)} more to get free shipping
                    </p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((finalAmount / 50000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Secure</span>
                  </div>
                  <div className="text-center">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
                  </div>
                  <div className="text-center">
                    <Heart className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Quality</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <Link to="/checkout" className="block">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login?redirect=/checkout" className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                          Login to Checkout
                        </Button>
                      </Link>
                      <p className="text-xs text-center text-gray-500">
                        or <Link to="/register" className="text-blue-600 hover:underline">create an account</Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommended Products */}
            <div className="mt-8 bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">You might also like</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <img
                        className="w-12 h-12 rounded-md object-cover"
                        src="/api/placeholder/60/60"
                        alt="Recommended product"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">Product Name</h4>
                        <p className="text-sm text-gray-600">₦25,000</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
