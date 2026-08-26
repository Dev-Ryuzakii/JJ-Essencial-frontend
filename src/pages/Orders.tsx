import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  RotateCcw,
  MessageCircle,
  Calendar,
  CreditCard,
  ChevronRight,
  Star,
  AlertCircle,
  X
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, cn, parseProductImage } from '../lib/utils'
import ordersApi, { type Order as ApiOrder, type OrderStatus } from '../services/ordersApi'
import toast from 'react-hot-toast'

// updatesd interface to match the API structure
interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  createdAt: string
  items: {
    id: string
    product: {
      id: string
      name: string
      image?: string
      sku: string
      attributes?: Record<string, string>
    }
    quantity: number
    price: number
    finalPrice: number
  }[]
  subtotal: number
  shippingCost: number
  tax: number
  totalAmount: number
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }
  paymentMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter, dateFilter])

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      // Debug: Check if user is authenticated
      const token = localStorage.getItem('access_token')
      console.log('🔑 Orders Page: Auth token exists:', !!token)
      if (token) {
        console.log('🔑 Orders Page: Token length:', token.length)
      }
      
      console.log('📋 Orders Page: Loading orders...')
      const response = await ordersApi.getAll({
        page: 1,
        limit: 50, // Get more orders for better UX
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      console.log('📦 Orders Page: API response:', response)
      console.log('🔍 Orders Page: Individual order IDs:', response.data.map((order: any) => ({ id: order.id, status: order.status })))
      
      // Transform API response to match our interface
      const transformedOrders: Order[] = response.data.map((apiOrder: ApiOrder) => {
        // ✅ Use backend orderNumber with fallback for existing orders per memory specification
        const displayOrderNumber = apiOrder.orderNumber || apiOrder.id.slice(-6).toUpperCase();
        
        return {
          id: apiOrder.id,
          orderNumber: displayOrderNumber, // ✅ Use backend orderNumber or generate fallback
          status: apiOrder.status,
          createdAt: apiOrder.createdAt,
          items: (apiOrder.items || apiOrder.orderItems || []).map(item => ({
            id: item.id,
            product: {
              id: item.product?.id || '',
              name: item.product?.name || 'Unknown Product',
              image: item.product?.images?.[0] || '', // Use first image from array
              sku: item.product?.sku || '',
              attributes: item.product?.attributes || {}
            },
            quantity: item.quantity,
            price: item.price,
            finalPrice: item.finalPrice || item.price
          })),
          subtotal: apiOrder.subtotal || 0,
          shippingCost: apiOrder.shippingCost || 0,
          tax: apiOrder.tax || 0,
          totalAmount: apiOrder.totalAmount,
          shippingAddress: {
            fullName: apiOrder.shippingAddress?.fullName || apiOrder.user?.fullName || 'N/A',
            addressLine1: apiOrder.shippingAddress?.addressLine1 || apiOrder.deliveryAddressText || 'N/A',
            addressLine2: apiOrder.shippingAddress?.addressLine2 || '',
            city: apiOrder.shippingAddress?.city || apiOrder.deliveryCity || 'N/A',
            state: apiOrder.shippingAddress?.state || apiOrder.deliveryState || 'N/A',
            postalCode: apiOrder.shippingAddress?.postalCode || apiOrder.deliveryPostal || 'N/A',
            country: apiOrder.shippingAddress?.country || apiOrder.deliveryCountry || 'N/A',
            phone: apiOrder.shippingAddress?.phone || apiOrder.deliveryPhone || 'N/A'
          },
          paymentMethod: apiOrder.paymentMethod || 'N/A',
          trackingNumber: apiOrder.trackingNumber,
          estimatedDelivery: apiOrder.estimatedDelivery
        };
      })
      
      console.log('✅ Orders Page: Successfully transformed', transformedOrders.length, 'orders')
      
      // If no orders found, provide helpful information
      if (transformedOrders.length === 0) {
        console.log('ℹ️ Orders Page: No orders found for this user')
        toast('No orders found. Start shopping to see your orders here!', { icon: '🛒' })
      }
      
      setOrders(transformedOrders)
    } catch (error: any) {
      console.error('❌ Orders Page: Failed to load orders:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load orders'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case '3months':
          filterDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate)
      }
    }

    setFilteredOrders(filtered)
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PROCESSING':
        return <Package className="w-4 h-4" />
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />
      case 'RETURNED':
        return <RotateCcw className="w-4 h-4" />
      case 'REFUNDED':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
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

  const handleReorder = async () => {
    try {
      // Add items to cart logic - this would typically call a cart API
      // For now, we'll show a success message
      toast.success('Items added to cart!')
    } catch (error) {
      console.error('Failed to reorder:', error)
      toast.error('Failed to add items to cart')
    }
  }

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const invoice = await ordersApi.getOrderInvoice(order.id)
      if (invoice.pdfUrl) {
        // Open the PDF in a new tab
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

  const handleCreateTestOrder = async () => {
    try {
      console.log('🗺️ Creating test order for debugging...')
      
      // Create a test order using the orders API
      const testOrderData = {
        items: [
          {
            productId: 'test-product-1',
            quantity: 1
          }
        ],
        deliveryAddress: {
          phone: '+1234567890',
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Nigeria'
        },
        orderNotes: 'Test order created for debugging'
      }
      
      const response = await ordersApi.create(testOrderData)
      console.log('✅ Test order created:', response)
      
      toast.success('Test order created! Refreshing orders...')
      
      // Reload orders
      loadOrders()
    } catch (error) {
      console.error('❌ Failed to create test order:', error)
      toast.error('Failed to create test order. Check console for details.')
    }
  }

  const handleUseWorkingToken = () => {
    // Use the working token from your curl test
    const workingToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OWU1OGQxMi1hNjFhLTRmYzUtYmRiYS03MjUyNTM5OTBmYjYiLCJlbWFpbCI6ImZhbGFkZXJhc2FxMjJAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTc3OTkzNDMsImV4cCI6MTc1ODQwNDE0M30.0Y-lLAE8u5kKaicVhzHg1CABqqe8_UogDocvSilqd1I"
    
    localStorage.setItem('access_token', workingToken)
    toast.success('Token updatesd! Refreshing orders...')
    
    // Reload orders with new token
    loadOrders()
  }

  const handleTrackOrder = (order: Order) => {
    if (order.trackingNumber) {
      // Open tracking page or modal
      toast('Opening tracking information...', { icon: 'ℹ️' })
      // You could navigate to a tracking page or open tracking URL
      // if (order.trackingUrl) {
      //   window.open(order.trackingUrl, '_blank')
      // }
    } else {
      toast('Tracking information not available yet', { icon: '⚠️' })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Debug Test Order Button - Only show in development */}
          {import.meta.env.DEV && (
            <>
              {/* <Button 
                variant="outline" 
                onClick={handleUseWorkingToken}
                className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                🔑 Use Working Token
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCreateTestOrder}
                className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                🧪 Create Test Order
              </Button> */}
            </>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setDateFilter('all')
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No orders found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {orders.length === 0 
              ? "You haven't placed any orders yet. Start shopping!"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {orders.length === 0 && (
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order {order.orderNumber}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant={getStatusColor(order.status)} size="sm">
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status.toLowerCase()}</span>
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )}
                    >
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        expandedOrder === order.id && 'rotate-90'
                      )} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={parseProductImage(item.product.image)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            const parent = target.parentElement!
                            parent.innerHTML = `
                              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                                </svg>
                              </div>
                            `
                          }}
                        />
                      </div>
                      {index === 2 && order.items.length > 3 && (
                        <span className="text-sm text-gray-500">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" size="sm" onClick={() => handleReorder()}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reorder
                      </Button>
                    )}
                    
                    {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && order.trackingNumber && (
                      <Button variant="outline" size="sm" onClick={() => handleTrackOrder(order)}>
                        <Truck className="w-4 h-4 mr-2" />
                        Track Package
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order)}>
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link 
                        to={`/orders/${order.id}`}
                        onClick={() => {
                          console.log('🔗 Orders Page: Navigating to order detail:', {
                            orderId: order.id,
                            orderNumber: order.orderNumber,
                            status: order.status
                          })
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                    
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Items Ordered</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={parseProductImage(item.product.image)}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  const parent = target.parentElement!
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                                      </svg>
                                    </div>
                                  `
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                              <div className="text-sm text-gray-600">
                                <p>SKU: {item.product.sku}</p>
                                <p>Qty: {item.quantity}</p>
                                {item.product.attributes && Object.keys(item.product.attributes).length > 0 && (
                                  <p>
                                    {Object.entries(item.product.attributes).map(([key, value]) => 
                                      `${key}: ${value}`
                                    ).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.finalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="space-y-2 text-sm">
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
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping & Payment Info */}
                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Tracking Information */}
                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Tracking Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Tracking: {order.trackingNumber}
                              </span>
                            </div>
                            {order.estimatedDelivery && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Need Help?</h3>
            <p className="text-sm text-blue-800 mt-1">
              Have questions about your order? Our customer support team is here to help.
            </p>
            <div className="mt-3 space-x-3">
              <Link to="/support">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Order FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
