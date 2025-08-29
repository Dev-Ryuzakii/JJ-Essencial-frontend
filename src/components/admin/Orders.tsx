import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle,
  Download,
  FileText,
  ShoppingBag,
  Mail
} from 'lucide-react'
import adminOrdersApi from '../../services/adminOrdersApi'
import type { AdminOrder, OrderStatus, AdminOrderFilter } from '../../services/adminOrdersApi'

// Status badge component for order status
const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="h-4 w-4 mr-1" /> },
    'PROCESSING': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <RefreshCw className="h-4 w-4 mr-1" /> },
    'SHIPPED': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: <Truck className="h-4 w-4 mr-1" /> },
    'DELIVERED': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
    'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="h-4 w-4 mr-1" /> }
  }
  
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  )
}

// Payment status badge component
const PaymentStatusBadge = ({ status }: { status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' }) => {
  const statusConfig = {
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
    'FAILED': { bg: 'bg-red-100', text: 'text-red-800' },
    'REFUNDED': { bg: 'bg-purple-100', text: 'text-purple-800' }
  }
  
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  )
}

export default function Orders() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filters, setFilters] = useState<OrderFilter>({
    search: '',
    status: undefined,
    fromDate: undefined,
    toDate: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  })

  // Fetch orders on initial load and when filters change
  useEffect(() => {
    fetchOrders()
  }, [currentPage, sortField, sortOrder, debouncedSearchQuery])

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedFilters = {
        ...filters,
        search: debouncedSearchQuery,
        sortBy: sortField,
        sortOrder: sortOrder,
        page: currentPage
      }
      
      const response = await adminOrdersApi.getOrders(updatedFilters)
      setOrders(response.data)
      setTotalOrders(response.total)
      setTotalPages(Math.ceil(response.total / filters.limit!))
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleFilterSubmit = (newFilters: Partial<OrderFilter>) => {
    setFilters({ ...filters, ...newFilters })
    setCurrentPage(1)
    setIsFilterOpen(false)
    fetchOrders()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleBulkStatusUpdate = async (status: OrderStatus) => {
    if (window.confirm(`Are you sure you want to mark ${selectedOrders.length} orders as ${status}?`)) {
      try {
        await adminOrdersApi.bulkUpdateOrders(selectedOrders, { status })
        setSelectedOrders([])
        fetchOrders()
      } catch (err) {
        console.error(`Error updating orders to ${status}:`, err)
        setError(`Failed to update orders to ${status}. Please try again.`)
      }
    }
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(order => order.id))
    }
  }

  const toggleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId))
    } else {
      setSelectedOrders([...selectedOrders, orderId])
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Manage customer orders, track status, and process payments</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => fetchOrders()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/admin/orders/export"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Link>
        </div>
      </div>

      {/* Action and filter bar */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order #, customer name, or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <div className="dropdown relative">
              <button
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <div className="dropdown-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </a>
                </div>
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Selected Customers
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                id="status"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as OrderStatus | undefined })}
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
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="fromDate"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.fromDate || ''}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value || undefined })}
              />
            </div>
            
            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.toDate || ''}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value || undefined })}
              />
            </div>
            
            <div>
              <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                id="minAmount"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.minAmount || ''}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            
            <div>
              <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                id="maxAmount"
                className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filters.maxAmount || ''}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    status: undefined,
                    fromDate: undefined,
                    toDate: undefined,
                    minAmount: undefined,
                    maxAmount: undefined,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    page: 1,
                    limit: 10
                  })
                  setSearchQuery('')
                  setIsFilterOpen(false)
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                onClick={() => handleFilterSubmit(filters)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected items actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-indigo-50 rounded-lg shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <CheckCircle className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="text-sm font-medium text-indigo-800">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('PROCESSING')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mark Processing
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('SHIPPED')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Truck className="h-4 w-4 mr-2" />
              Mark Shipped
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('DELIVERED')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Delivered
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('CANCELLED')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center p-10">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading orders...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedOrders.length === orders.length && orders.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('orderNumber')}>
                        Order #
                        {sortField === 'orderNumber' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('customer.name')}>
                        Customer
                        {sortField === 'customer.name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                        Date
                        {sortField === 'createdAt' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center cursor-pointer" onClick={() => handleSort('totalAmount')}>
                        Total
                        {sortField === 'totalAmount' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{order.customer.fullName}</div>
                            <div className="text-xs text-gray-500 ml-1">({order.customer.email})</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/admin/orders/${order.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View order"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/admin/orders/edit/${order.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit order"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete order #${order.orderNumber}?`)) {
                                  adminOrdersApi.cancelOrder(order.id, 'Deleted by admin')
                                    .then(() => fetchOrders())
                                    .catch(err => {
                                      console.error('Error deleting order:', err)
                                      setError('Failed to delete order. Please try again.')
                                    })
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete order"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center">
                          <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="mb-1">No orders found</p>
                          <p className="text-xs text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * filters.limit! + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * filters.limit!, totalOrders)}
                    </span>{' '}
                    of <span className="font-medium">{totalOrders}</span> orders
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      // Show first, last, current, and pages around current
                      if (
                        i + 1 === 1 ||
                        i + 1 === totalPages ||
                        (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        )
                      } else if (
                        (i + 1 === currentPage - 2 && currentPage > 3) ||
                        (i + 1 === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={i}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
