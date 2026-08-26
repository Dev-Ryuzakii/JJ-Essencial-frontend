import React, { useState, useEffect } from 'react'
import {
  Filter,
  Search,
  RefreshCw,
  Package,
  XCircle,
  Eye,
  X,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  ShoppingBag
} from 'lucide-react'
import adminOrdersApi, { 
  type AdminOrder, 
  type AdminOrderFilter, 
  type OrderStatus 
} from '../../services/adminOrdersApi'

export default function OrderManagement() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AdminOrderFilter>({
    status: undefined,
    paymentStatus: undefined,
    startDate: undefined,
    endDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })

  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // Debounced fetch function to prevent rapid API calls
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }
    
    // Set a new timeout to debounce the API call
    const timeout = setTimeout(() => {
      fetchOrders()
    }, 300) // 300ms debounce
    
    setFetchTimeout(timeout)
    
    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [pagination.page, filters, searchTerm])

  // Retry function for handling rate limiting
  const retryAfterDelay = (delay: number) => {
    setIsRetrying(true)
    setTimeout(() => {
      setRetryCount(prev => prev + 1)
      fetchOrders()
      setIsRetrying(false)
    }, delay)
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filterParams: AdminOrderFilter = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      // Add search term if present
      if (searchTerm.trim()) {
        filterParams.search = searchTerm.trim()
      }
      
      console.log('Fetching orders with params:', filterParams)
      
      const response = await adminOrdersApi.getOrders(filterParams)
      
      setOrders(response.items || [])
      setPagination(prev => ({
        ...prev,
        total: response.meta?.totalItems || 0,
        totalPages: response.meta?.totalPages || 0
      }))
      
      setError(null)
      setRetryCount(0) // Reset retry count on success
    } catch (err: any) {
      let errorMessage = 'Failed to fetch orders. Please try again.'
      
      console.error('Error fetching orders:', err)
      
      // Handle rate limiting (429 error)
      if (err.statusCode === 429 || (err.message && err.message.includes('Too Many Requests'))) {
        if (retryCount < 3) { // Max 3 retries
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff: 1s, 2s, 4s
          errorMessage = `Rate limit exceeded. Retrying in ${delay/1000} seconds... (Attempt ${retryCount + 1}/3)`
          setError(errorMessage)
          retryAfterDelay(delay)
          return // Don't set loading to false, keep trying
        } else {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.'
        }
      } else if (err.message && Array.isArray(err.message)) {
        errorMessage = `Validation error: ${err.message.join(', ')}`
      } else if (typeof err.message === 'string') {
        errorMessage = err.message
      } else if (err.error) {
        errorMessage = err.error
      }
      
      setError(errorMessage)
      setOrders([])
    } finally {
      if (!isRetrying) {
        setLoading(false)
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset pagination and let the useEffect handle the fetch
    setPagination(prev => ({ ...prev, page: 1 }))
    // The useEffect will trigger fetchOrders automatically
  }

  const handleFilterChange = (name: string, value: string) => {
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, page: 1 }))
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
  }

  const handleupdatesOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await adminOrdersApi.updatesOrderStatus(orderId, { 
        status,
        notifyCustomer: true 
      })
      
      // updates local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
    } catch (error) {
      console.error('Failed to updates order status:', error)
    }
  }

  const handleViewOrder = async (order: AdminOrder) => {
    try {
      setLoadingOrderDetail(true)
      console.log('Showing order details for:', order.id, order)
      
      // Use the existing order data directly since it already contains all needed information
      // The list endpoint provides complete order details
      setSelectedOrder(order)
      setShowOrderDetail(true)
    } catch (error) {
      console.error('Error showing order details:', error)
      // Fallback to using the order data we already have
      setSelectedOrder(order)
      setShowOrderDetail(true)
    } finally {
      setLoadingOrderDetail(false)
    }
  }

  const closeOrderDetail = () => {
    setSelectedOrder(null)
    setShowOrderDetail(false)
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `₦${num.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: OrderStatus) => {
    const statusColors: Record<OrderStatus, string> = {
      'PENDING': '#ffc107',
      'CONFIRMED': '#17a2b8',
      'PROCESSING': '#6f42c1',
      'SHIPPED': '#28a745',
      'DELIVERED': '#007bff',
      'CANCELLED': '#dc3545',
      'RETURNED': '#fd7e14',
      'REFUNDED': '#6c757d'
    }
    return statusColors[status] || '#6c757d'
  }

  const clearFilters = () => {
    // Reset to page 1 when clearing filters
    setPagination(prev => ({ ...prev, page: 1 }))
    setFilters({
      status: undefined,
      paymentStatus: undefined,
      startDate: undefined,
      endDate: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    })
    setSearchTerm('')
  }

  // Super simplified modal for debugging
  const OrderDetailModal = ({ order, onClose }: { order: AdminOrder; onClose: () => void }) => {
    console.log('Modal rendering with order:', order);
    
    if (!order) {
      return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-red-600">Error: Missing order data</h3>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Close</button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Order Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Customer</h3>
              <p>Name: {order.customer?.fullName || 'N/A'}</p>
              <p>Email: {order.customer?.email || 'N/A'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Order</h3>
              <p>ID: {order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: {formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
          
          <div className="mt-6 text-right">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Truck className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Status</h4>
                </div>
                <div className="flex flex-col space-y-2">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white w-fit"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                  <span className={`text-sm font-medium ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' :
                    order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                    order.paymentStatus === 'FAILED' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    Payment: {order.paymentStatus || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Order Date</h4>
                </div>
                <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                {order.updatesdAt && order.updatesdAt !== order.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">updatesd: {formatDate(order.updatesdAt)}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Payment Method</h4>
                </div>
                <p className="text-gray-600 capitalize">{order.paymentMethod?.replace('_', ' ') || 'N/A'}</p>
                {order.paymentId && (
                  <p className="text-xs text-gray-500 mt-1 font-mono break-all">ID: {order.paymentId}</p>
                )}
              </div>

              {/* Items Count */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <ShoppingBag className="w-5 h-5 text-orange-600 mr-2" />
                  <h4 className="font-semibold text-gray-700">Items</h4>
                </div>
                <p className="text-2xl font-bold text-orange-600">{order.items?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Total Quantity: {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-800">Customer Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="font-medium">{order.customer?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-blue-600 break-all">{order.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                    <span>{order.customer?.phone || 'N/A'}</span>
                  </div>
                  {order.customer && (
                    <div className="pt-2 border-t border-blue-200">
                      <div className="text-xs text-blue-700">
                        <div>Total Orders: {order.customer.totalOrders || 'N/A'}</div>
                        <div>Total Spent: {order.customer.totalSpent ? formatCurrency(order.customer.totalSpent) : 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-800">Shipping Address</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                  {order.shippingAddress?.company && (
                    <p className="text-gray-600">{order.shippingAddress.company}</p>
                  )}
                  <p>{order.shippingAddress?.addressLine1 || 'No address provided'}</p>
                  {order.shippingAddress?.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city || ''}{order.shippingAddress?.city && order.shippingAddress?.state ? ', ' : ''}{order.shippingAddress?.state || ''} {order.shippingAddress?.postalCode || ''}
                  </p>
                  <p>{order.shippingAddress?.country || 'N/A'}</p>
                  {order.shippingAddress?.phone && (
                    <p className="flex items-center mt-2">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      {order.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ShoppingBag className="w-5 h-5 text-gray-600 mr-2" />
                Order Items ({order.items?.length || 0})
              </h4>
              
              {!order.items || order.items.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No items found for this order</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                {item.product?.image && (
                                  <img
                                    className="w-12 h-12 rounded-lg object-cover mr-4 flex-shrink-0"
                                    src={item.product.image}
                                    alt={item.product?.name || 'Product'}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://via.placeholder.com/48x48/e5e7eb/6b7280?text=No+Image';
                                    }}
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {item.product?.name || 'Unknown Product'}
                                  </div>
                                  {item.product?.isActive === false && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                                      Product Inactive
                                    </span>
                                  )}
                                  {item.product?.stock !== undefined && item.product.stock <= 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.product?.sku || 'N/A'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.price)}
                              {item.discount && parseFloat(item.discount) > 0 && (
                                <div className="text-xs text-red-600">-{formatCurrency(item.discount)}</div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{item.quantity}</span>
                              {item.product?.stock !== undefined && (
                                <div className="text-xs text-gray-500">Stock: {item.product.stock}</div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              {item.finalPrice ? formatCurrency(item.finalPrice) : formatCurrency(parseFloat(item.price) * item.quantity)}
                            </td>
                          </tr>
                        ))}
                        
                        {/* Order Total Row */}
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={4} className="px-4 py-3 text-right text-sm text-gray-900">
                            Order Total:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">
                            {formatCurrency(order.totalAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Order Notes</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">updates Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleupdatesOrderStatus(order.id, e.target.value as OrderStatus)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RETURNED">Returned</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b-2 border-gray-200 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="text-sm sm:text-lg text-gray-600 font-semibold">
          Total Orders: {pagination.total}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Orders
            </label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID or customer name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-0 sm:space-x-2">
            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                setRetryCount(0)
                fetchOrders()
              }}
              disabled={loading || isRetrying}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || isRetrying) ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RETURNED">Returned</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Payment Status</option>
                <option value="PENDING">Payment Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`border rounded-md p-4 mb-6 ${
          error.includes('Rate limit') || error.includes('Too Many Requests') || error.includes('Retrying')
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex">
            <XCircle className={`h-5 w-5 ${
              error.includes('Rate limit') || error.includes('Too Many Requests') || error.includes('Retrying')
                ? 'text-yellow-400' 
                : 'text-red-400'
            }`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                error.includes('Rate limit') || error.includes('Too Many Requests') || error.includes('Retrying')
                  ? 'text-yellow-800' 
                  : 'text-red-800'
              }`}>
                {error.includes('Rate limit') || error.includes('Too Many Requests') || error.includes('Retrying')
                  ? 'Rate Limit Notice'
                  : 'Error loading orders'
                }
              </h3>
              <div className={`mt-2 text-sm ${
                error.includes('Rate limit') || error.includes('Too Many Requests') || error.includes('Retrying')
                  ? 'text-yellow-700' 
                  : 'text-red-700'
              }`}>
                {error}
                {(error.includes('Rate limit') || error.includes('Too Many Requests')) && (
                  <div className="mt-2">
                    <p className="text-xs">This helps prevent server overload. The system will automatically retry.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        /* No Orders State */
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || Object.values(filters).some(v => v !== undefined) 
              ? 'No orders match your current filters.' 
              : 'No orders exist yet.'}
          </p>
          {(searchTerm || Object.values(filters).some(v => v !== undefined)) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* Orders Table */
        <>
          {/* Mobile Card View (Hidden on larger screens) */}
          <div className="block lg:hidden space-y-4 mb-6">
            {orders && orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block mb-1">
                      #{order.id.substring(0, 8)}...
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer?.fullName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Status and Payment */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.paymentStatus || 'N/A'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {order.items?.length || 0} items
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => handleupdatesOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>
            )) || []}
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden lg:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[160px]">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders && orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            #{order.id.substring(0, 8)}...
                          </div>
                          {order.orderNumber && (
                            <div className="text-gray-500 mt-1">
                              {order.orderNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer?.fullName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          order.paymentStatus === 'PAID' ? 'text-green-600' :
                          order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                          order.paymentStatus === 'FAILED' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {order.paymentStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <select
                            value={order.status}
                            onChange={(e) => handleupdatesOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="RETURNED">Returned</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )) || []}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                  {pagination.total > 0 && (
                    <> ({pagination.total} total orders)</>
                  )}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNumber = i + 1
                    const isCurrentPage = pageNumber === pagination.page
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isCurrentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <>
          {console.log('Rendering OrderDetailModal with:', { showOrderDetail, selectedOrder })}
          <OrderDetailModal
            order={selectedOrder}
            onClose={closeOrderDetail}
          />
        </>
      )}

      {/* Order Detail Loading Modal */}
      {loadingOrderDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Order Details</h3>
                <p className="text-sm text-gray-600">Please wait while we fetch the order information...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}