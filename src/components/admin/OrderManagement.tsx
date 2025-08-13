import React, { useState, useEffect } from 'react'
import {
  Filter,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Package,
  X,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ShoppingBag
} from 'lucide-react'
import ordersApi, { Order, OrderFilter, OrderStatus } from '../../services/ordersApi'

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState<OrderFilter>({
    status: undefined,
    fromDate: undefined,
    toDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    fetchOrders()
  }, [page, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filterParams = {
        ...filters,
        search: searchTerm || undefined,
        page,
        limit: 10
      }
      
      const response = await ordersApi.getOrders(filterParams)
      
      setOrders(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      setError('Failed to fetch orders. Please try again.')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFilters({
      ...filters,
      [name]: value === '' ? undefined : value
    })
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(order => order.id))
    }
  }

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  const handleViewOrderDetails = (order: Order) => {
    setCurrentOrder(order)
    setShowDetailsModal(true)
  }

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersApi.updateOrderStatus(orderId, status)
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
      
      // If we're viewing the details of this order, update that too
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder({ ...currentOrder, status })
      }
    } catch (err) {
      console.error('Error updating order status:', err)
      setError('Failed to update order status. Please try again.')
    }
  }

  const handleBulkUpdateStatus = async (status: OrderStatus) => {
    if (selectedOrders.length === 0) return
    
    try {
      await ordersApi.bulkUpdateOrderStatus(selectedOrders, status)
      
      // Update local state
      setOrders(orders.map(order => 
        selectedOrders.includes(order.id) ? { ...order, status } : order
      ))
      
      setSelectedOrders([])
    } catch (err) {
      console.error('Error updating orders:', err)
      setError('Failed to update orders. Please try again.')
    }
  }

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 mr-1" />
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 mr-1" />
      case 'SHIPPED':
        return <Truck className="h-4 w-4 mr-1" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 mr-1" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <ShoppingBag className="h-4 w-4 mr-1" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>
      
      {/* Action Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearch} className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders by ID or customer..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </form>
          
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {selectedOrders.length} selected
              </span>
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('PROCESSING')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
                Mark Processing
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('SHIPPED')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Truck className="h-4 w-4 mr-2 text-indigo-500" />
                Mark Shipped
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('DELIVERED')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Mark Delivered
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from-date"
                name="fromDate"
                value={filters.fromDate || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
            
            <div>
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to-date"
                name="toDate"
                value={filters.toDate || ''}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="number"
                  id="min-amount"
                  name="minAmount"
                  value={filters.minAmount || ''}
                  onChange={handleFilterChange}
                  placeholder="0.00"
                  className="pl-7 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="number"
                  id="max-amount"
                  name="maxAmount"
                  value={filters.maxAmount || ''}
                  onChange={handleFilterChange}
                  placeholder="999.99"
                  className="pl-7 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort-by"
                  name="sortBy"
                  value={filters.sortBy || 'createdAt'}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="createdAt">Order Date</option>
                  <option value="totalAmount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <select
                  name="sortOrder"
                  value={filters.sortOrder || 'desc'}
                  onChange={handleFilterChange}
                  className="block w-32 rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setFilters({
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })
                setSearchTerm('')
              }}
              className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFilters(false)
                setPage(1)
                fetchOrders()
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchOrders()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 flex flex-col justify-center items-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(value => value !== undefined) || searchTerm
                ? 'Try adjusting your filters to see more results'
                : 'There are no orders to display'}
            </p>
            {(Object.values(filters).some(value => value !== undefined) || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  })
                  setSearchTerm('')
                  fetchOrders()
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                      <div className="text-sm text-gray-500">{order.customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₦{order.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          type="button"
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Details
                        </button>
                        <div className="relative group">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                              disabled={order.status === 'PROCESSING'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              Mark as Processing
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                              disabled={order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              Mark as Shipped
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                              disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              Mark as Delivered
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                              disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              Cancel Order
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUp className="h-5 w-5 rotate-90" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageToShow = page - 2 + i;
                    if (page < 3) {
                      pageToShow = i + 1;
                    } else if (page > totalPages - 2) {
                      pageToShow = totalPages - 4 + i;
                    }
                    
                    if (pageToShow > 0 && pageToShow <= totalPages) {
                      return (
                        <button
                          key={pageToShow}
                          onClick={() => setPage(pageToShow)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageToShow
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Order Details Modal */}
      {showDetailsModal && currentOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Order Details - #{currentOrder.orderNumber}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Order Information</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">Order Date</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(currentOrder.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusBadgeColor(currentOrder.status)}`}>
                            {getStatusIcon(currentOrder.status)}
                            {currentOrder.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="text-sm font-medium text-gray-900">{currentOrder.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <p className="text-sm font-medium text-gray-900">{currentOrder.paymentStatus}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Actions</p>
                        <div className="flex space-x-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(currentOrder.id, 'PROCESSING')}
                            disabled={currentOrder.status === 'PROCESSING'}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className="h-4 w-4 mr-1 text-blue-500" />
                            Processing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(currentOrder.id, 'SHIPPED')}
                            disabled={currentOrder.status === 'SHIPPED' || currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED'}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Truck className="h-4 w-4 mr-1 text-indigo-500" />
                            Shipped
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(currentOrder.id, 'DELIVERED')}
                            disabled={currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED'}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Delivered
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(currentOrder.id, 'CANCELLED')}
                            disabled={currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED'}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900">{currentOrder.customer.name}</p>
                        <p className="text-sm text-gray-900">{currentOrder.customer.email}</p>
                        <p className="text-sm text-gray-900">{currentOrder.customer.phone}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Shipping Address</p>
                          <div className="text-sm text-gray-900">
                            <p>{currentOrder.shippingAddress.street}</p>
                            <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zip}</p>
                            <p>{currentOrder.shippingAddress.country}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Billing Address</p>
                          <div className="text-sm text-gray-900">
                            <p>{currentOrder.billingAddress.street}</p>
                            <p>{currentOrder.billingAddress.city}, {currentOrder.billingAddress.state} {currentOrder.billingAddress.zip}</p>
                            <p>{currentOrder.billingAddress.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={item.product.image || 'https://via.placeholder.com/40'}
                                    alt={item.product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.product.sku}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.quantity}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="mt-6 flex justify-end">
                  <div className="w-80 bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Subtotal</span>
                      <span className="text-sm font-medium text-gray-900">${currentOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Shipping</span>
                      <span className="text-sm font-medium text-gray-900">${currentOrder.shippingCost.toFixed(2)}</span>
                    </div>
                    {currentOrder.tax > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Tax</span>
                        <span className="text-sm font-medium text-gray-900">${currentOrder.tax.toFixed(2)}</span>
                      </div>
                    )}
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">Discount</span>
                        <span className="text-sm font-medium text-red-600">-${currentOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">${currentOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
