import React, { useState, useEffect } from 'react'
import { 
  Search, 
  RefreshCw, 
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react'
import adminApi, { type AdminPaymentDto, type AdminPaymentDetailDto } from '../../services/adminApi'

export default function PaymentManagement() {
  const [payments, setPayments] = useState<AdminPaymentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentDetailDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showupdatesModal, setShowupdatesModal] = useState(false)
  
  // Pagination and filters
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [gatewayFilter, setGatewayFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  // Summary stats (using placeholder values for now)
  const paymentSummary = {
    totalTransactions: payments?.length || 0,
    pendingTransactions: payments?.filter(p => p.status === 'PENDING').length || 0,
    paidTransactions: payments?.filter(p => p.status === 'PAID').length || 0,
    failedTransactions: payments?.filter(p => p.status === 'FAILED').length || 0,
    totalAmount: '0.00' // Would need to calculate from actual payment amounts
  }

  // updates form data
  const [updatesFormData, setupdatesFormData] = useState<{
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | '';
    notes: string;
    updatesOrder: boolean;
  }>({
    status: '',
    notes: '',
    updatesOrder: true
  })

  useEffect(() => {
    fetchPayments()
  }, [page, searchTerm, statusFilter, gatewayFilter, dateRange])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        gateway: gatewayFilter || undefined,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      }
      
      const response = await adminApi.payments.getAll(params)
      setPayments(response.items || [])
      setTotalPages(response.pagination?.pages || 1)
      setTotalPayments(response.pagination?.total || 0)
      
      // Note: summary might not be available in the response structure
      // if (response.summary) {
      //   setPaymentSummary(response.summary)
      // }
    } catch (err) {
      setError('Failed to fetch payments. Please try again.')
      console.error('Error fetching payments:', err)
      setPayments([]) // Ensure payments is always an array
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPayments()
  }

  const handleViewPayment = async (paymentId: string) => {
    try {
      const paymentDetail = await adminApi.payments.getById(paymentId)
      setSelectedPayment(paymentDetail)
      setShowDetailModal(true)
    } catch (err) {
      console.error('Error fetching payment details:', err)
      setError('Failed to fetch payment details.')
    }
  }

  const handleupdatesPaymentStatus = (payment: AdminPaymentDto) => {
    setSelectedPayment(payment as AdminPaymentDetailDto)
    setupdatesFormData({
      status: (payment.status as 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED') || 'PENDING',
      notes: '',
      updatesOrder: true
    })
    setShowupdatesModal(true)
  }

  const handleSubmitStatusupdates = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayment || !updatesFormData.status) return

    try {
      // Create a proper updatesPaymentStatusDto object
      const updatesData = {
        status: updatesFormData.status as 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED',
        notes: updatesFormData.notes || undefined,
        updatesOrder: updatesFormData.updatesOrder
      }
      
      const updatesdPayment = await adminApi.payments.updatestatus(selectedPayment.id, updatesData)
      setPayments(payments.map(payment => 
        payment.id === selectedPayment.id ? updatesdPayment : payment
      ))
      setShowupdatesModal(false)
      setSelectedPayment(null)
      fetchPayments() // Refresh to get updatesd summary
    } catch (err) {
      console.error('Error updating payment status:', err)
      setError('Failed to updates payment status.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(parseFloat(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Management</h1>
        <p className="text-gray-600">Monitor and manage payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-900">{paymentSummary.totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-lg font-semibold text-green-600">{paymentSummary.paidTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-lg font-semibold text-yellow-600">{paymentSummary.pendingTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-lg font-semibold text-red-600">{paymentSummary.failedTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold">₦</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-lg font-semibold text-indigo-600">
                {formatCurrency(paymentSummary.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by reference or order ID..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Gateways</option>
              <option value="PAYSTACK">Paystack</option>
              <option value="STRIPE">Stripe</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            <button
              type="button"
              onClick={() => fetchPayments()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading payments...</span>
          </div>
        ) : error ? (
          <div className="py-12 flex justify-center items-center">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchPayments()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No payments found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No payments have been processed yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{payment.reference}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-1">#</span>
                          <span className="bg-blue-50 px-2 py-1 rounded text-xs font-medium text-blue-700">
                            Order: {payment.orderId.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.order.user.fullName}</div>
                        <div className="text-sm text-gray-500">{payment.order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {payment.gateway}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <button
                            onClick={() => handleViewPayment(payment.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => handleupdatesPaymentStatus(payment)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
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
                    <span className="font-medium">{Math.min(page * 10, totalPayments)}</span> of{' '}
                    <span className="font-medium">{totalPayments}</span> payments
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

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reference</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{selectedPayment.reference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Gateway</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.gateway}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1 flex items-center">
                      {getStatusIcon(selectedPayment.status)}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Order Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Order ID</label>
                      <p className="mt-1 text-sm font-mono text-blue-900 bg-white p-2 rounded">{selectedPayment.order.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Order Status</label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedPayment.order.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Order Total</label>
                      <p className="mt-1 text-lg font-semibold text-blue-900">{formatCurrency(selectedPayment.order.totalAmount || selectedPayment.amount)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Payment Gateway</label>
                      <p className="mt-1 text-sm text-blue-900">{selectedPayment.gateway}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-600">
                    💡 This payment is connected to the order above. Updating payment status will affect order processing.
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.order.user.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedPayment.order.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Gateway Data */}
                {selectedPayment.gatewayData && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Gateway Data</h4>
                    <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(selectedPayment.gatewayData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Receipts */}
                {selectedPayment.receipts && selectedPayment.receipts.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Receipts</h4>
                    <div className="space-y-2">
                      {selectedPayment.receipts.map((receipt) => (
                        <div key={receipt.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{receipt.originalName}</p>
                            <p className="text-xs text-gray-500">
                              Status: {receipt.verificationStatus} • Uploaded: {formatDate(receipt.createdAt)}
                            </p>
                          </div>
                          <a
                            href={receipt.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-500"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* updates Status Modal */}
      {showupdatesModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={() => setShowupdatesModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <form onSubmit={handleSubmitStatusupdates}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">updates Payment Status</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={updatesFormData.status}
                      onChange={(e) => setupdatesFormData({
                        ...updatesFormData, 
                        status: e.target.value as 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={updatesFormData.notes}
                      onChange={(e) => setupdatesFormData({...updatesFormData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add any notes about this status updates..."
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={updatesFormData.updatesOrder}
                      onChange={(e) => setupdatesFormData({...updatesFormData, updatesOrder: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      updates order status as well
                    </label>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowupdatesModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    updates Status
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
