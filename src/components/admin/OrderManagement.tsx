import React, { useState, useEffect, useCallback } from 'react'
import {
  Filter,
  Search,
  RefreshCw,
  Package,
  XCircle,
  Eye,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Truck,
  ShoppingBag,
  Clipboard,
  UserCircle,
  Download,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
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

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500) // 500ms debounce delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, filters, debouncedSearchTerm])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filterParams: AdminOrderFilter = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      // Enhanced search functionality with comprehensive validation
      if (debouncedSearchTerm.trim()) {
        const trimmedSearch = debouncedSearchTerm.trim()
        
        // Detect search types
        const isFullUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedSearch)
        const isPartialUUID = /^[0-9a-f]{4,}$/i.test(trimmedSearch) && !isFullUUID
        const isOrderNumber = /^\d{6}$/.test(trimmedSearch) // 6-digit order number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedSearch)
        const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(trimmedSearch.replace(/[\s\-\(\)]/g, ''))
        const isPaymentRef = /^(PAY|TXN|REF|PY|TX)_?[A-Z0-9]{6,}/i.test(trimmedSearch)
        
        // Apply search validation rules from memory
        const isValidSearch = (
          (trimmedSearch.length >= 3 && !isPartialUUID) || // Regular text search (min 3 chars, no partial UUIDs)
          isFullUUID || // Complete UUIDs are allowed
          isOrderNumber || // 6-digit order numbers are allowed
          isEmail || // Email addresses are allowed
          isPaymentRef // Payment references are allowed
        )
        
        if (isValidSearch) {
          filterParams.search = trimmedSearch
          console.log('🔍 Admin Search: Valid search term:', trimmedSearch, {
            length: trimmedSearch.length,
            type: {
              fullUUID: isFullUUID,
              orderNumber: isOrderNumber,
              email: isEmail,
              phoneNumber: isPhoneNumber,
              paymentRef: isPaymentRef,
              textSearch: !isFullUUID && !isOrderNumber && !isEmail && !isPaymentRef
            }
          })
        } else {
          console.log('⚠️ Admin Search: Search term blocked (validation failed):', trimmedSearch, {
            length: trimmedSearch.length,
            isPartialUUID,
            reason: isPartialUUID ? 'Partial UUID causes 500 error' : 'Too short (min 3 chars)'
          })
          // Don't include search parameter for invalid searches
        }
      }
      
      console.log('Fetching orders with params:', filterParams)
      
      const response = await adminOrdersApi.getOrders(filterParams)
      
      console.log('Orders response:', response)
      setOrders(response.items || [])
      setPagination(prev => ({
        ...prev,
        total: response.meta?.totalItems || 0,
        totalPages: response.meta?.totalPages || 0
      }))
      
      setError(null)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      
      // Enhanced error handling for search-related issues
      if (err.response?.status === 500 && debouncedSearchTerm.trim()) {
        const searchTerm = debouncedSearchTerm.trim()
        console.error('🚨 Backend search error for term:', searchTerm)
        
        // Check if it's likely a partial UUID causing the error
        const isPartialUUID = /^[0-9a-f]{4,}$/i.test(searchTerm) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm)
        
        if (isPartialUUID) {
          setError(`Partial order ID "${searchTerm}" is not supported. Please use the complete order ID with hyphens, 6-digit order number, or search by customer name/email.`)
          toast.error('Partial order IDs not supported - use complete ID or customer details')
        } else if (searchTerm.length < 3) {
          setError(`Search term "${searchTerm}" is too short. Please use at least 3 characters.`)
          toast.error('Search term too short (minimum 3 characters)')
        } else {
          setError(`Search for "${searchTerm}" failed. Try searching by: Order ID, Order Number, Customer Name, Email, or Payment Reference.`)
          toast.error('Search query not recognized - try different search term')
        }
      } else {
        setError('Failed to fetch orders. Please try again.')
        toast.error('Failed to fetch orders')
      }
      
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    
    const trimmedSearch = searchTerm.trim()
    
    // Enhanced search validation and logging
    console.log('🔍 Admin Search: Manual search triggered for:', trimmedSearch)
    
    if (!trimmedSearch) {
      toast.error('Please enter a search term')
      return
    }
    
    // Comprehensive search type detection
    const isFullUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedSearch)
    const isPartialUUID = /^[0-9a-f]{4,}$/i.test(trimmedSearch) && !isFullUUID
    const isOrderNumber = /^\d{6}$/.test(trimmedSearch)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedSearch)
    const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(trimmedSearch.replace(/[\s\-\(\)]/g, ''))
    const isPaymentRef = /^(PAY|TXN|REF|PY|TX)_?[A-Z0-9]{6,}/i.test(trimmedSearch)
    
    // Validation based on memory specifications
    if (trimmedSearch.length < 3 && !isOrderNumber && !isFullUUID) {
      toast.error('Search term must be at least 3 characters (except for Order Numbers and UUIDs)')
      return
    }
    
    if (isPartialUUID) {
      toast.error('Partial order IDs cause server errors. Please enter the complete order ID, 6-digit order number, or search by customer details.')
      return
    }
    
    // Enhanced feedback for different search types
    if (isFullUUID) {
      console.log('🎯 Admin Search: Detected complete UUID format')
      toast('Searching for specific order by ID...', { icon: '🎯' })
    } else if (isOrderNumber) {
      console.log('🔢 Admin Search: Detected 6-digit order number')
      toast('Searching for order by number...', { icon: '🔢' })
    } else if (isEmail) {
      console.log('📧 Admin Search: Detected email address')
      toast('Searching orders by customer email...', { icon: '📧' })
    } else if (isPhoneNumber) {
      console.log('📞 Admin Search: Detected phone number')
      toast('Searching orders by phone number...', { icon: '📞' })
    } else if (isPaymentRef) {
      console.log('💳 Admin Search: Detected payment reference')
      toast('Searching orders by payment reference...', { icon: '💳' })
    } else {
      console.log('📝 Admin Search: General text search (name/details)')
      toast('Searching orders by customer name...', { icon: '👤' })
    }
    
    // Force immediate search by updating debounced term
    setDebouncedSearchTerm(trimmedSearch)
  }

  const handleFilterChange = (name: string, value: string) => {
    setPagination(prev => ({ ...prev, page: 1 }))
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }))
  }

  const handleViewOrder = (order: AdminOrder) => {
    console.log('View button clicked for order:', order.id)
    setSelectedOrder(order)
    setShowOrderDetail(true)
    // updates URL with order ID
    window.history.pushState({}, '', `/admin/orders/${order.id}`)
  }

  const closeOrderDetail = () => {
    setSelectedOrder(null)
    setShowOrderDetail(false)
    // Reset URL to orders list
    window.history.pushState({}, '', '/admin/orders')
  }

  const formatCurrency = (amount: string | number) => {
    if (amount === undefined || amount === null) return 'N/A'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Enhanced Order Detail Modal with prominent customer information and product images
  const OrderDetailModal = ({ order, onClose }: { order: AdminOrder; onClose: () => void }) => {
    console.log('Modal rendering with order:', order)
    const [copyMessage, setCopyMessage] = useState('')
    
    if (!order) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-red-600">Error: Missing order data</h3>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">Close</button>
          </div>
        </div>
      )
    }
    
    // Access customer data directly from order object
    const fullName = order.customer?.fullName || (order.customer?.email ? `Customer (${order.customer.email.split('@')[0]})` : 'Unknown Customer')
    const email = order.customer?.email || 'unknown@email.com'
    const phone = order.customer?.phone || 'N/A'
    const totalOrders = order.customer?.totalOrders || 1
    const totalSpent = order.customer?.totalSpent || order.totalAmount
    
    // Function to copy customer details to clipboard
    const copyCustomerDetails = () => {
      const customerText = `
Customer Name: ${fullName}
Email: ${email}
Phone: ${phone}
Order ID: ${order.id}
Order Number: ${order.orderNumber || order.id}
Order Date: ${formatDate(order.createdAt)}
Total Orders: ${totalOrders}
Total Spent: ${typeof totalSpent === 'string' ? formatCurrency(totalSpent) : formatCurrency(order.totalAmount)}
      `.trim()
      
      navigator.clipboard.writeText(customerText).then(() => {
        setCopyMessage('Customer details copied!')
        setTimeout(() => setCopyMessage(''), 3000)
      }).catch(err => {
        console.error('Failed to copy customer details:', err)
        setCopyMessage('Failed to copy')
        setTimeout(() => setCopyMessage(''), 3000)
      })
    }
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header with close button */}
          <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 border-b">
            <h2 className="text-xl font-bold flex items-center">
              <Package className="w-5 h-5 mr-2" /> 
              Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
            </h2>
            <button onClick={onClose} className="text-white hover:text-blue-100 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Prominent Customer Information Card */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center mb-3">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-blue-800">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold">{fullName || 'N/A'}</p>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg font-semibold text-blue-600">{email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-semibold">{phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-500">Total Orders</label>
                  <p className="text-lg font-semibold flex items-center">
                    <ShoppingBag className="w-4 h-4 text-blue-500 mr-2" />
                    {totalOrders || '1'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Spent</label>
                  <p className="text-lg font-semibold text-green-600 flex items-center">
                    <CreditCard className="w-4 h-4 text-green-500 mr-2" />
                    {totalSpent ? formatCurrency(totalSpent) : formatCurrency(order.totalAmount)}
                  </p>
                </div>
                
                {copyMessage && (
                  <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-md text-sm border border-green-200 shadow-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {copyMessage}
                    </div>
                  </div>
                )}
                
                {order.userId && (
                  <div className="flex flex-col space-y-2 mt-4">
                    <button className="px-4 py-2 text-sm text-white bg-blue-600 border border-blue-500 rounded hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 mr-2" /> View Customer Profile
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          // Create customer data for download
                          const customerData = {
                            id: order.userId,
                            name: fullName,
                            email: email,
                            phone: phone,
                            totalOrders: totalOrders,
                            totalSpent: totalSpent,
                            lastOrderDate: order.createdAt
                          }
                          // Convert to JSON string
                          const dataStr = JSON.stringify(customerData, null, 2)
                          // Create download link
                          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                          // Create download element and trigger
                          const exportName = `customer_${order.userId}.json`
                          const linkElement = document.createElement('a')
                          linkElement.setAttribute('href', dataUri)
                          linkElement.setAttribute('download', exportName)
                          linkElement.click()
                        }}
                        className="px-4 py-2 text-sm text-green-600 border border-green-300 rounded hover:bg-green-50 transition-colors flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" /> Download Data
                      </button>
                      <button 
                        onClick={copyCustomerDetails}
                        className="px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded hover:bg-purple-50 transition-colors flex items-center justify-center"
                      >
                        <Clipboard className="w-4 h-4 mr-2" /> Copy Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Order Details */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4 text-gray-700 flex items-center text-lg">
                <Package className="mr-2 h-5 w-5 text-blue-600" />
                Order Details
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Order ID:</span>
                  <p className="font-medium text-blue-800">{order.id}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Order Number:</span>
                  <p className="font-medium text-blue-800">{order.orderNumber || order.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Date:</span>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Status:</span>
                  <p className="font-medium">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Payment Status:</span>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : order.paymentStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <span className="text-gray-500 text-sm block mb-1">Payment Method:</span>
                  <p className="font-medium flex items-center">
                    <CreditCard className="w-4 h-4 text-gray-500 mr-1" />
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md col-span-2">
                  <span className="text-gray-500 text-sm block mb-1">Total Amount:</span>
                  <p className="font-medium text-green-600 text-2xl">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
              
              {/* Receipt viewing section */}
              {order.receiptUrl ? (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800">Payment Receipt</h4>
                      <p className="text-sm text-blue-600">Customer uploaded payment proof</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(order.receiptUrl, '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Receipt
                      </button>
                      {order.paymentStatus !== 'PAID' && (
                        <button
                          onClick={async () => {
                            try {
                              await adminOrdersApi.updatesPaymentStatus(order.id, {
                                paymentStatus: 'PAID',
                                note: 'Payment verified by admin after receipt review',
                                notifyCustomer: true
                              });
                              toast.success('Payment status updatesd to PAID');
                              // Refresh orders to show updatesd status
                              fetchOrders();
                              onClose();
                            } catch (error) {
                              console.error('Failed to updates payment status:', error);
                              toast.error('Failed to updates payment status');
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                order.paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-800">No Payment Receipt</h4>
                        <p className="text-sm text-yellow-600">Customer has not uploaded payment proof yet</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            
            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-medium mb-4 text-gray-700 flex items-center text-lg">
                  <Truck className="mr-2 h-5 w-5 text-blue-600" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-lg mb-2">{order.shippingAddress.fullName}</p>
                  <p className="mb-1">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p className="mb-1">{order.shippingAddress.addressLine2}</p>}
                  <p className="mb-1">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p className="mb-1">{order.shippingAddress.country}</p>
                  <p className="text-blue-600">{order.shippingAddress.phone}</p>
                </div>
              </div>
            )}
            
            {/* Order Items with Product Images */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-4 text-gray-700 flex items-center text-lg">
                <ShoppingBag className="mr-2 h-5 w-5 text-blue-600" />
                Items ({order.items?.length || 0})
              </h3>
              {order.items && order.items.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="py-4 flex items-center space-x-4 hover:bg-gray-50 px-3 rounded-md transition-colors">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images.find(img => img.isMain)?.url || item.product.images[0].url}
                            alt={item.product?.name || 'Product image'} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to package icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <p className="font-semibold text-blue-800 text-lg mb-1">{item.product?.name || 'Unknown Product'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="bg-blue-50 px-2 py-1 rounded-md">
                                Qty: <span className="font-semibold text-blue-700">{item.quantity}</span>
                              </span>
                              <span className="bg-green-50 px-2 py-1 rounded-md">
                                Unit: <span className="font-semibold text-green-700">{formatCurrency(item.price)}</span>
                              </span>
                              {item.product?.sku && (
                                <span className="bg-gray-50 px-2 py-1 rounded-md text-xs">
                                  SKU: <span className="font-mono text-gray-700">{item.product.sku}</span>
                                </span>
                              )}
                            </div>
                            {item.product?.stock !== undefined && (
                              <div className="mt-2 text-xs">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.product.stock > 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : item.product.stock > 0
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  Stock: {item.product.stock}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-bold text-green-600 text-lg">
                              {formatCurrency(parseFloat(item.price) * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Total Section */}
                  <div className="py-5 bg-gradient-to-r from-green-50 to-blue-50 px-4 rounded-lg mt-4 border border-green-100">
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-lg font-bold text-gray-800">Order Total</p>
                        <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                        {order.paymentStatus === 'PAID' && (
                          <p className="text-sm text-green-600 font-medium flex items-center justify-end mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Payment Confirmed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 text-center rounded-lg border-2 border-dashed border-gray-200">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No items found in this order</p>
                  <p className="text-gray-400 text-sm mt-1">This may indicate a data synchronization issue</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors shadow-sm"
            >
              Close
            </button>
            <button 
              onClick={() => {
                // Here you would add logic to print the order
                window.print()
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 flex items-center text-blue-800">
        <Package className="mr-2 text-blue-600" /> Order Management Dashboard
      </h1>
      
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Order ID (complete), Order Number (6 digits), Customer name, Email, Phone, Payment reference..."
                className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-500">
                <Search className="w-5 h-5" />
              </button>
              
              {/* Enhanced search hints and validation */}
              {searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-10 p-3">
                  <div className="text-xs text-gray-600">
                    {searchTerm.length < 3 && !/^\d{6}$/.test(searchTerm.trim()) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm.trim()) ? (
                      <div className="text-orange-600">
                        <p className="font-medium mb-1">⚠️ Search term too short</p>
                        <p>Please enter at least 3 characters (except for Order Numbers and UUIDs)</p>
                      </div>
                    ) : /^[0-9a-f]{4,}$/i.test(searchTerm.trim()) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchTerm.trim()) ? (
                      <div className="text-red-600">
                        <p className="font-medium mb-1">🚫 Partial order IDs cause errors</p>
                        <p>Use complete order ID (with hyphens), 6-digit order number, or search by customer details</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium mb-2">🔍 Search Types Supported:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="font-medium text-blue-600 mb-1">Order Details:</p>
                            <ul className="space-y-0.5">
                              <li>• Complete Order ID (UUID)</li>
                              <li>• 6-digit Order Number</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-green-600 mb-1">Customer Info:</p>
                            <ul className="space-y-0.5">
                              <li>• Customer Name</li>
                              <li>• Email Address</li>
                              <li>• Phone Number</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-purple-600 mb-1">Payment Info:</p>
                          <p className="text-xs">• Payment Reference (PAY_, TXN_, REF_, etc.)</p>
                        </div>
                        
                        {/* Dynamic feedback based on search term */}
                        {(() => {
                          const trimmed = searchTerm.trim()
                          const isFullUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)
                          const isOrderNumber = /^\d{6}$/.test(trimmed)
                          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
                          const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(trimmed.replace(/[\s\-\(\)]/g, ''))
                          const isPaymentRef = /^(PAY|TXN|REF|PY|TX)_?[A-Z0-9]{6,}/i.test(trimmed)
                          
                          if (isFullUUID) {
                            return <p className="mt-2 text-green-600 font-medium">✅ Complete Order ID detected</p>
                          } else if (isOrderNumber) {
                            return <p className="mt-2 text-green-600 font-medium">✅ 6-digit Order Number detected</p>
                          } else if (isEmail) {
                            return <p className="mt-2 text-blue-600 font-medium">📧 Email address detected</p>
                          } else if (isPhoneNumber) {
                            return <p className="mt-2 text-blue-600 font-medium">📞 Phone number detected</p>
                          } else if (isPaymentRef) {
                            return <p className="mt-2 text-purple-600 font-medium">💳 Payment reference detected</p>
                          } else if (trimmed.length >= 3) {
                            return <p className="mt-2 text-gray-600 font-medium">👤 Text search (customer name/details)</p>
                          }
                          return null
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" /> 
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button
            onClick={fetchOrders}
            className="flex items-center px-4 py-2 border rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" /> Refresh
          </button>
          
          {/* Quick Order Lookup Button */}
          <button
            onClick={() => {
              const orderId = prompt('Enter Order ID for direct lookup:')
              if (orderId?.trim()) {
                console.log('🔗 Admin: Direct order lookup for:', orderId.trim())
                setSearchTerm(orderId.trim())
                setPagination(prev => ({ ...prev, page: 1 }))
                toast('Looking up order...', { icon: '🔍' })
              }
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5 mr-2" />
            Quick Lookup
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="mb-6 p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
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
            
            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full border rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
              >
                <option value="">All Payment Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setFilters({
                  sortBy: 'createdAt',
                  sortOrder: 'DESC'
                })
                setSearchTerm('')
                setDebouncedSearchTerm('')
              }}
              className="flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50 hover:border-red-200 transition-colors mt-auto"
            >
              <XCircle className="w-4 h-4 mr-2" /> Clear Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Loading or Error States */}
      {loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <RefreshCw className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading orders...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100 shadow-sm">
          <XCircle className="w-10 h-10 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Orders Table for Desktop */}
      {!loading && !error && orders.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-medium">
                      #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {order.customer?.fullName || (order.customer?.email ? `Customer (${order.customer.email.split('@')[0]})` : 'Unknown Customer')}
                    </div>
                    <div className="text-sm text-blue-600">{order.customer?.email || 'unknown@email.com'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 inline-block">
                      {order.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1 px-3">
                      {order.paymentStatus === 'PAID' ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : (
                        order.paymentStatus
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('View button clicked for order:', order.id)
                          handleViewOrder(order)
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="View Order Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Orders List for Mobile */}
      {!loading && !error && orders.length > 0 && (
        <div className="md:hidden space-y-4 mb-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b">
                <div>
                  <span className="text-sm font-medium text-blue-800">
                    #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {order.status}
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm">
                  <strong className="text-gray-700">Customer:</strong> <span className="font-medium">
                    {order.customer?.fullName || (order.customer?.email ? `Customer (${order.customer.email.split('@')[0]})` : 'Unknown Customer')}
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  <strong className="text-gray-700">Email:</strong> {order.customer?.email || 'unknown@email.com'}
                </div>
                <div className="text-sm font-semibold text-green-600 mt-2">
                  <strong className="text-gray-700">Total:</strong> {formatCurrency(order.totalAmount)}
                </div>
                <div className="flex justify-end mt-4 border-t pt-4">
                  <button
                    onClick={() => {
                      console.log('Mobile view button clicked for order:', order.id)
                      handleViewOrder(order)
                    }}
                    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No Orders Found */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            There are no orders matching your search criteria. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={() => {
              setFilters({
                sortBy: 'createdAt',
                sortOrder: 'DESC'
              })
              setSearchTerm('')
              setDebouncedSearchTerm('')
              fetchOrders()
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Show All Orders
          </button>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium text-blue-700">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium text-blue-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium text-blue-700">{pagination.total}</span> orders
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => pagination.page > 1 && setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className={`px-4 py-2 rounded-md ${
                pagination.page <= 1 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 transition-colors'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => 
                pagination.page < pagination.totalPages && 
                setPagination(prev => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className={`px-4 py-2 rounded-md ${
                pagination.page >= pagination.totalPages 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-white bg-blue-600 hover:bg-blue-700 transition-colors'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={closeOrderDetail} 
        />
      )}
    </div>
  )
}