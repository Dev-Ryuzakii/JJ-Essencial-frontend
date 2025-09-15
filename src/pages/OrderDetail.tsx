import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RotateCcw,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ExternalLink,
  AlertCircle,
  Copy
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, cn } from '../lib/utils'
import { ordersApi } from '../services'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '../services/ordersApi'

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'tracking' | 'invoice'>('details')

  useEffect(() => {
    if (id) {
      loadOrderDetail(id)
    }
  }, [id])

  const loadOrderDetail = async (orderId: string) => {
    setIsLoading(true)
    try {
      console.log('🔍 OrderDetail: Loading order details for ID:', orderId)
      console.log('🔍 OrderDetail: API Base URL:', import.meta.env.VITE_API_BASE_URL || 'https://jj-essencial.onrender.com/api/v1')
      
      const response = await ordersApi.getById(orderId)
      
      console.log('📦 OrderDetail: API response:', response)
      
      if (response.success) {
        console.log('✅ OrderDetail: Successfully loaded order details')
        setOrder(response.data)
      } else {
        console.warn('⚠️ OrderDetail: API returned unsuccessful response:', response)
        toast.error('Order not found')
        navigate('/orders')
      }
    } catch (error: any) {
      console.error('❌ OrderDetail: Failed to load order:', error)
      
      // Add more detailed error logging to diagnose API issues
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      })
      
      let errorMessage = 'Failed to load order details. Please try again later.'
      
      if (error.response?.status === 404) {
        errorMessage = 'Order not found. This order may not exist or you may not have permission to view it.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to view order details.'
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view this order.'
      }
      
      toast.error(errorMessage)
      
      // Don't immediately navigate away, give user a chance to try again
      setTimeout(() => {
        navigate('/orders')
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5" />
      case 'PROCESSING':
        return <Package className="w-5 h-5" />
      case 'SHIPPED':
        return <Truck className="w-5 h-5" />
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5" />
      case 'RETURNED':
        return <RotateCcw className="w-5 h-5" />
      case 'REFUNDED':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: OrderStatus): "warning" | "primary" | "success" | "error" | "gray" => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'PROCESSING':
        return 'gray'
      case 'SHIPPED':
        return 'primary'
      case 'DELIVERED':
        return 'success'
      case 'CANCELLED':
        return 'error'
      case 'RETURNED':
        return 'gray'
      case 'REFUNDED':
        return 'error'
      default:
        return 'gray'
    }
  }

  const getTrackingSteps = (status: OrderStatus) => {
    const allSteps = [
      { key: 'PENDING', label: 'Order Placed', icon: Package },
      { key: 'PROCESSING', label: 'Processing', icon: Clock },
      { key: 'SHIPPED', label: 'Shipped', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
    ]

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    const currentIndex = statusOrder.indexOf(status)
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }))
  }

  const handleDownloadInvoice = async () => {
    if (!order) return
    
    try {
      const invoice = await ordersApi.getOrderInvoice(order.id)
      if (invoice.pdfUrl) {
        window.open(invoice.pdfUrl, '_blank')
        toast.success('Opening invoice...')
      } else {
        toast.error('Invoice not available')
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await ordersApi.cancelOrder(order.id)
        toast.success('Order cancelled successfully')
        loadOrderDetail(order.id)
      } catch (error) {
        console.error('Failed to cancel order:', error)
        toast.error('Failed to cancel order')
      }
    }
  }

  const handleTrackingClick = () => {
    if (order?.trackingNumber) {
      // You could integrate with shipping providers here
      toast('Opening tracking information...', { icon: 'ℹ️' })
    } else {
      toast('Tracking information not available yet', { icon: '⚠️' })
    }
  }

  const copyOrderNumber = () => {
    if (order) {
      // ✅ Use backend orderNumber with fallback per memory specification
      const displayOrderNumber = order.orderNumber || order.id.slice(-6).toUpperCase()
      navigator.clipboard.writeText(displayOrderNumber)
      toast.success('Order number copied!')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
        <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button asChild>
              <Link to="/orders">Back to Orders</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                if (id) {
                  console.log('🔄 OrderDetail: Retry loading order:', id)
                  loadOrderDetail(id)
                }
              }}
            >
              Try Again
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Order ID: {id || 'Unknown'}
          </p>
        </div>
      </div>
    )
  }

  // ✅ Use backend orderNumber with fallback per memory specification
  const displayOrderNumber = order.orderNumber || order.id.slice(-6).toUpperCase()
  const trackingSteps = getTrackingSteps(order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/orders')}>
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Orders
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-gray-900">Order #{displayOrderNumber}</h1>
                  <button
                    onClick={copyOrderNumber}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy order number"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={getStatusColor(order.status)} size="md">
                <span className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status.toLowerCase()}</span>
                </span>
              </Badge>
              
              {order.status === 'PENDING' && (
                <Button variant="outline" onClick={handleCancelOrder}>
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                {[
                  { key: 'details', label: 'Order Details', icon: Package },
                  { key: 'tracking', label: 'Tracking', icon: Truck },
                  { key: 'invoice', label: 'Invoice', icon: Download }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2',
                      activeTab === tab.key
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'details' && (
                <div className="space-y-8">
                  {/* Order Items */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Items Ordered</h3>
                    <div className="space-y-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-6 pb-6 border-b border-gray-200 last:border-b-0">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/80/80?text=No+Image'}
                            alt={item.product.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'https://via.placeholder.com/80/80?text=No+Image'
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.product.name}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>SKU: {item.product.sku}</p>
                              <p>Quantity: {item.quantity}</p>
                              {item.product.attributes && Object.keys(item.product.attributes).length > 0 && (
                                <p>
                                  {Object.entries(item.product.attributes).map(([key, value]) => 
                                    `${key}: ${value}`
                                  ).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(item.finalPrice)}</p>
                            {item.price !== item.finalPrice && (
                              <p className="text-sm text-gray-500 line-through">{formatCurrency(item.price)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">
                              {order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between font-semibold text-lg">
                              <span className="text-gray-900">Total</span>
                              <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Addresses and Payment */}
                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-gray-900 mb-1">
                                {order.shippingAddress?.fullName || 'Customer'}
                              </p>
                              <p>{order.shippingAddress?.addressLine1 || order.deliveryAddressText || 'Address not available'}</p>
                              {order.shippingAddress?.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>
                                {order.shippingAddress?.city || order.deliveryCity || 'City'}, {order.shippingAddress?.state || order.deliveryState || 'State'} {order.shippingAddress?.postalCode || order.deliveryPostal || ''}
                              </p>
                              <p>{order.shippingAddress?.country || order.deliveryCountry || 'Country'}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Phone className="w-4 h-4" />
                                <span>{order.shippingAddress?.phone || order.deliveryPhone || 'Phone not available'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900 font-medium">{order.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tracking' && (
                <div className="space-y-8">
                  {/* Order Status Timeline */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h3>
                    <div className="relative">
                      {trackingSteps.map((step, index) => (
                        <div key={step.key} className="relative flex items-center pb-8 last:pb-0">
                          {index < trackingSteps.length - 1 && (
                            <div className={cn(
                              'absolute left-6 top-12 w-0.5 h-12',
                              step.completed ? 'bg-green-500' : 'bg-gray-300'
                            )} />
                          )}
                          <div className={cn(
                            'relative z-10 w-12 h-12 rounded-full flex items-center justify-center',
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : step.active
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                          )}>
                            <step.icon className="w-6 h-6" />
                          </div>
                          <div className="ml-6">
                            <h4 className={cn(
                              'font-medium',
                              step.completed || step.active ? 'text-gray-900' : 'text-gray-500'
                            )}>
                              {step.label}
                            </h4>
                            {step.completed && step.key === order.status && (
                              <p className="text-sm text-gray-600 mt-1">
                                Updated on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking Information */}
                  {order.trackingNumber && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Tracking Information</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Tracking Number</p>
                              <p className="text-gray-600">{order.trackingNumber}</p>
                            </div>
                            <Button variant="outline" onClick={handleTrackingClick}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Track Package
                            </Button>
                          </div>
                          
                          {order.estimatedDelivery && (
                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Estimated delivery:</span>
                                <span className="font-medium text-gray-900">
                                  {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Support */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Need Help?</h3>
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Get Support for Your Order</h4>
                          <p className="text-blue-800 text-sm mb-4">
                            Have questions about your order? Create a support ticket and chat with our team.
                          </p>
                          <div className="space-x-3">
                            <Link to="/support">
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Get Support
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'invoice' && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Invoice</h3>
                    <p className="text-gray-600 mb-8">
                      Download or view your order invoice
                    </p>
                    
                    <div className="space-y-4">
                      <Button onClick={handleDownloadInvoice}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice (PDF)
                      </Button>
                      
                      <div className="text-sm text-gray-500">
                        <p>Invoice #: INV-{displayOrderNumber}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Billing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Bill To:</p>
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Payment Method:</p>
                        <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              {order.status === 'DELIVERED' && (
                <>
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reorder Items
                  </Button>
                  <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </>
              )}
              
              <Link to="/support">
                <Button variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              
              <Button variant="outline" onClick={handleDownloadInvoice}>
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              
              {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && order.trackingNumber && (
                <Button variant="outline" onClick={handleTrackingClick}>
                  <Truck className="w-4 h-4 mr-2" />
                  Track Package
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
