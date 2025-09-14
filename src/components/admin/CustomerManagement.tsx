import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Eye,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import adminUsersApi, { type AdminUser } from '../../services/adminUsersApi'

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUser | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Pagination and filters
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Edit form data
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    role: '',
    phone: '',
    isActive: true
  })

  useEffect(() => {
    fetchCustomers()
  }, [page, searchTerm, roleFilter, statusFilter, sortBy, sortOrder])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        role: (roleFilter as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        sortBy,
        sortOrder
      }
      
      const response = await adminUsersApi.getUsers(params)
      console.log('CustomerManagement: Raw response:', response);
      
      let customersData: AdminUser[] = [];
      
      // Handle new PaginatedResponse structure
      if (response && response.items && Array.isArray(response.items)) {
        customersData = response.items;
        setTotalPages(response.meta?.totalPages || 1)
        setTotalCustomers(response.meta?.totalItems || response.items.length)
      }
      // Handle direct array response (legacy fallback)
      else if (Array.isArray(response)) {
        customersData = response;
        setTotalPages(1)
        setTotalCustomers(response.length)
      }
      // Handle unexpected structure
      else {
        console.error('Unexpected response structure:', response);
        throw new Error('Invalid response structure from API')
      }
      
      // Transform and ensure proper data structure
      const transformedCustomers = customersData.map((customer: any) => ({
        ...customer,
        fullName: customer.fullName || customer.full_name || 'Unknown Customer',
        totalOrders: customer.totalOrders || customer.total_orders || 0,
        totalSpent: customer.totalSpent || customer.total_spent || 0,
        phone: customer.phone || '',
        username: customer.username || customer.email?.split('@')[0] || '',
        isActive: customer.isActive !== undefined ? customer.isActive : true,
        emailVerified: customer.emailVerified || customer.email_verified || false
      }));
      
      console.log('CustomerManagement: Transformed customers:', transformedCustomers.slice(0, 2));
      setCustomers(transformedCustomers);
    } catch (err) {
      setError('Failed to fetch customers. Please try again.')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCustomers()
  }

  const handleViewCustomer = async (customerId: string) => {
    try {
      const customerDetail = await adminUsersApi.getUser(customerId)
      
      // Transform the customer detail data similar to the main list
      // Cast to any to handle potential backend field name variations
      const rawCustomer = customerDetail as any;
      const transformedCustomer: AdminUser = {
        ...customerDetail,
        fullName: customerDetail.fullName || rawCustomer.full_name || 'Unknown Customer',
        totalOrders: customerDetail.totalOrders || rawCustomer.total_orders || 0,
        totalSpent: customerDetail.totalSpent || rawCustomer.total_spent || 0,
        phone: customerDetail.phone || '',
        username: customerDetail.username || customerDetail.email?.split('@')[0] || '',
        isActive: customerDetail.isActive !== undefined ? customerDetail.isActive : true,
        emailVerified: customerDetail.emailVerified || rawCustomer.email_verified || false
      };
      
      console.log('Customer detail transformed:', transformedCustomer);
      setSelectedCustomer(transformedCustomer)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Error fetching customer details:', err)
      setError('Failed to fetch customer details.')
    }
  }

  const handleEditCustomer = (customer: AdminUser) => {
    setEditFormData({
      fullName: customer.fullName || 'Unknown',
      role: customer.role || 'USER',
      phone: customer.phone || '',
      isActive: customer.isActive !== undefined ? customer.isActive : true
    })
    setSelectedCustomer(customer)
    setShowEditModal(true)
  }

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer) return

    try {
      const updatedCustomer = await adminUsersApi.updateUserStatus(selectedCustomer.id, {
        isActive: editFormData.isActive
      })
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id ? updatedCustomer : customer
      ))
      setShowEditModal(false)
      setSelectedCustomer(null)
    } catch (err) {
      console.error('Error updating customer:', err)
      setError('Failed to update customer.')
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return
    
    try {
      await adminUsersApi.deleteUser(customerId)
      setCustomers(customers.filter(customer => customer.id !== customerId))
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError('Failed to delete customer.')
    }
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Management</h1>
        <p className="text-gray-600">Manage your customers and their accounts</p>
      </div>
      
      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers by name or email..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="fullName-asc">Name A-Z</option>
              <option value="fullName-desc">Name Z-A</option>
              <option value="totalSpent-desc">Highest Spending</option>
              <option value="totalSpent-asc">Lowest Spending</option>
            </select>
            
            <button
              type="button"
              onClick={() => fetchCustomers()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading customers...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchCustomers()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No customers have been registered yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {customer.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={customer.avatar}
                                alt={customer.fullName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-medium">
                                  {customer.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.fullName || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{customer.email || 'No email'}</div>
                            {customer.phone && (
                              <div className="text-xs text-gray-400">{customer.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.username || 'No username'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{customer.totalOrders || 0}</span>
                        {(customer.totalOrders || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            {(customer.totalOrders || 0) === 1 ? '1 order' : `${customer.totalOrders} orders`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-medium">{formatCurrency(customer.totalSpent || 0)}</span>
                        {(customer.totalOrders || 0) > 0 && (
                          <div className="text-xs text-gray-500">
                            Avg: {formatCurrency(((customer.totalSpent || 0) / (customer.totalOrders || 1)))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleViewCustomer(customer.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * 10, totalCustomers)}</span> of{' '}
                    <span className="font-medium">{totalCustomers}</span> customers
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = page - 2 + i
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {selectedCustomer.avatar ? (
                        <img
                          src={selectedCustomer.avatar}
                          alt={selectedCustomer.fullName || 'Customer'}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-2xl text-indigo-700 font-medium">
                            {selectedCustomer.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {selectedCustomer.fullName || 'Unknown Customer'}
                        </h4>
                        <p className="text-gray-600">{selectedCustomer.email || 'No email'}</p>
                        {selectedCustomer.username && (
                          <p className="text-sm text-gray-500">@{selectedCustomer.username}</p>
                        )}
                        <div className="mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            selectedCustomer.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {selectedCustomer.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedCustomer.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{selectedCustomer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Joined {formatDate(selectedCustomer.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedCustomer.isActive ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.isActive ? 'Active Account' : 'Inactive Account'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Customer Statistics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCustomer.totalOrders || 0}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">Total Orders</div>
                        {(selectedCustomer.totalOrders || 0) > 0 && (
                          <div className="text-xs text-blue-500 mt-1">
                            {selectedCustomer.totalOrders === 1 ? 'First-time customer' : 'Returning customer'}
                          </div>
                        )}
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(selectedCustomer.totalSpent || 0)}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Total Spent</div>
                        {(selectedCustomer.totalSpent || 0) > 0 && (
                          <div className="text-xs text-green-500 mt-1">
                            Lifetime value
                          </div>
                        )}
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="text-xl font-bold text-purple-600">
                          {(selectedCustomer.totalOrders || 0) > 0 
                            ? formatCurrency((selectedCustomer.totalSpent || 0) / (selectedCustomer.totalOrders || 1))
                            : formatCurrency(0)
                          }
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Avg Order Value</div>
                        {(selectedCustomer.totalOrders || 0) > 0 && (
                          <div className="text-xs text-purple-500 mt-1">
                            Per transaction
                          </div>
                        )}
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="text-lg font-bold text-orange-600">
                          {selectedCustomer.lastLoginAt ? formatDate(selectedCustomer.lastLoginAt) : 'Never'}
                        </div>
                        <div className="text-sm text-orange-600 font-medium">Last Login</div>
                        <div className="text-xs text-orange-500 mt-1">
                          {selectedCustomer.lastLoginAt ? 'Recent activity' : 'No login recorded'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced User Activity Section */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Account Information</h5>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Email Verified:</span>
                          <span className={`ml-2 font-medium ${
                            selectedCustomer.emailVerified ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedCustomer.emailVerified ? 'Yes' : 'No'}
                            {selectedCustomer.emailVerified && ' ✓'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Account Status:</span>
                          <span className={`ml-2 font-medium ${
                            selectedCustomer.isActive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Customer ID:</span>
                          <span className="ml-2 text-gray-600 font-mono text-xs">
                            {selectedCustomer.id}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-gray-700">Account Created:</span>
                          <span className="ml-2 text-gray-600">
                            {formatDate(selectedCustomer.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {formatDate(selectedCustomer.updatedAt)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">User Role:</span>
                          <span className="ml-2 text-gray-600 font-medium">
                            {selectedCustomer.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Summary */}
                {(selectedCustomer.totalOrders || 0) > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Customer Summary</h5>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>{selectedCustomer.fullName}</strong> has been a customer since{' '}
                        <strong>{formatDate(selectedCustomer.createdAt)}</strong> and has placed{' '}
                        <strong>{selectedCustomer.totalOrders} order{selectedCustomer.totalOrders !== 1 ? 's' : ''}</strong>{' '}
                        with a total value of <strong>{formatCurrency(selectedCustomer.totalSpent || 0)}</strong>.
                        {(selectedCustomer.totalOrders || 0) > 1 && (
                          <span>
                            {' '}The average order value is{' '}
                            <strong>{formatCurrency((selectedCustomer.totalSpent || 0) / (selectedCustomer.totalOrders || 1))}</strong>.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false)
                    handleEditCustomer(selectedCustomer)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <form onSubmit={handleUpdateCustomer}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Edit Customer</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Editing details for {selectedCustomer.fullName || 'Unknown Customer'}
                  </p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      placeholder="Enter customer's full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Users can shop and place orders. Admins have management access.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter phone number (optional)"
                    />
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({...editFormData, isActive: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm text-gray-900">
                      <span className="font-medium">Active Account</span>
                      <p className="text-xs text-gray-500">
                        {editFormData.isActive 
                          ? 'Customer can log in and place orders' 
                          : 'Customer account is suspended'
                        }
                      </p>
                    </label>
                  </div>

                  {/* Customer Info Summary */}
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Customer Summary</h4>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div>Email: {selectedCustomer.email}</div>
                      <div>Total Orders: {selectedCustomer.totalOrders || 0}</div>
                      <div>Total Spent: {formatCurrency(selectedCustomer.totalSpent || 0)}</div>
                      <div>Member Since: {formatDate(selectedCustomer.createdAt)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Update Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
