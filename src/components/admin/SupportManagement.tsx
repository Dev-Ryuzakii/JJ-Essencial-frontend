import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Filter, 
  Search, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User,
  RefreshCw,
  Eye,
  ArrowRight,
  X
} from 'lucide-react'
import adminSupportApi, { type AdminSupportTicket, type AdminSupportTicketDetail } from '../../services/adminSupportApi'

// updatesd interface to match backend response
interface SupportTicket {
  id: string
  subject: string
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  category?: string
  customer: {
    id?: string
    name: string
    email: string
    phone?: string
  }
  assignedTo?: string | null
  createdAt: string
  updatesdAt?: string
  lastMessage?: {
    content: string
    from: 'customer' | 'admin'
    timestamp: string
  } | null
  messageCount?: number
}


export default function SupportManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicketDetail | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Use the new API interface with proper parameters
      const response = await adminSupportApi.getTickets(1, 100, statusFilter, priorityFilter)
      
      // Debug the response structure
      console.log('AdminSupportApi response:', response);
      
      // Check if response has the expected structure
      if (!response || !response.chats || !Array.isArray(response.chats)) {
        throw new Error('Invalid response structure from server');
      }
      
      // Log a sample ticket to see its structure
      if (response.chats.length > 0) {
        console.log('Sample API ticket:', response.chats[0]);
      }
      
      // Transform API response to match component interface
      // The new API returns an object with chats array, not a direct array
      const transformedTickets: SupportTicket[] = response.chats.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        category: 'general', // Default category since API doesn't provide it
        customer: {
          id: (ticket.user as any).id || ticket.user.id,
          name: (ticket.user as any).full_name || (ticket.user as any).fullName || ticket.user.fullName,
          email: (ticket.user as any).email || ticket.user.email,
          // Extract phone if it exists in the API response
          phone: (ticket.user as any).phone || undefined
        },
        assignedTo: (ticket as any).assigned_to || ticket.assignedTo,
        createdAt: (ticket as any).created_at || ticket.createdAt,
        updatesdAt: (ticket as any).updatesd_at || ticket.updatesdAt,
        lastMessage: ticket.messages && ticket.messages.length > 0 ? {
          content: ticket.messages[ticket.messages.length - 1].message,
          from: ticket.messages[ticket.messages.length - 1].isAdmin ? 'admin' : 'customer',
          timestamp: ticket.messages[ticket.messages.length - 1].createdAt
        } : null,
        messageCount: ticket._count?.messages || ticket.messages?.length || 0
      }))
      
      // Apply search filter locally since the API doesn't support search yet
      const searchedTickets = searchTerm 
        ? transformedTickets.filter(ticket => 
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : transformedTickets
      
      setTickets(searchedTickets)
    } catch (err) {
      console.error('Error fetching tickets:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tickets'
      setError(`${errorMessage}. Backend server may not be running or endpoint may not be available yet.`)
      
      // For development purposes, show a message about backend availability
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        setError('Unable to connect to backend server. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets()
  }, [])

  // Reload tickets when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTickets()
    }, 500) // Debounce search
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, priorityFilter])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || ticket.status === statusFilter
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter
    const matchesCategory = !categoryFilter || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'CLOSED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'CLOSED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      // Handle various date formats
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }

  const getTicketStats = () => {
    const total = tickets.length
    const open = tickets.filter(t => t.status === 'OPEN').length
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
    const resolved = tickets.filter(t => t.status === 'CLOSED').length
    const urgent = tickets.filter(t => t.priority === 'HIGH').length

    return { total, open, inProgress, resolved, urgent }
  }

  const stats = getTicketStats()

  const viewTicketDetails = async (ticketId: string) => {
    try {
      setModalLoading(true)
      console.log('Fetching ticket details for ID:', ticketId)
      
      // Check if admin token exists
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token present:', !!adminToken);
      
      if (!adminToken) {
        setError('Admin authentication required. Please log in again.');
        return;
      }
      
      const ticketDetails = await adminSupportApi.getTicket(ticketId)
      setSelectedTicket(ticketDetails)
      setShowModal(true)
    } catch (err) {
      console.error('Error fetching ticket details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to load ticket details: ' + errorMessage);
      
      // If it's an auth error, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedTicket(null)
    setReplyMessage('')
  }

  const sendMessage = async (ticketId: string, message: string) => {
    if (!message.trim() || isSending) return
    
    try {
      setIsSending(true)
      await adminSupportApi.sendMessage(ticketId, { message })
      
      // Refresh ticket details to show the new message
      const updatesdTicket = await adminSupportApi.getTicket(ticketId)
      setSelectedTicket(updatesdTicket)
      setReplyMessage('')
      
      // Also refresh the tickets list
      fetchTickets()
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Failed to send message: ' + errorMessage)
      
      // If it's an auth error, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }
    } finally {
      setIsSending(false)
    }
  }

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedTicket?.messages])
  
  // Add debugging effect to log ticket data
  useEffect(() => {
    if (tickets.length > 0) {
      console.log('Ticket data sample:', tickets[0]);
      console.log('Ticket date values:', { 
        createdAt: tickets[0].createdAt, 
        updatesdAt: tickets[0].updatesdAt 
      });
    }
  }, [tickets]);
  
  // Add debugging effect to log selected ticket data
  useEffect(() => {
    if (selectedTicket) {
      console.log('Selected ticket data:', selectedTicket);
      console.log('Selected ticket date values:', { 
        createdAt: selectedTicket.createdAt, 
        updatesdAt: selectedTicket.updatesdAt 
      });
    }
  }, [selectedTicket]);
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Management</h1>
        <p className="text-gray-600">Manage customer support tickets and inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageCircle className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Open</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.open}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.inProgress}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.resolved}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Urgent</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.urgent}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets, customers..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          
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
            onClick={() => fetchTickets()}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Categories</option>
                <option value="order">Order</option>
                <option value="product">Product</option>
                <option value="shipping">Shipping</option>
                <option value="payment">Payment</option>
                <option value="account">Account</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('')
                  setPriorityFilter('')
                  setCategoryFilter('')
                  setSearchTerm('')
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading support tickets</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              {error.includes('backend') && (
                <div className="mt-3 text-sm text-red-600">
                  <p>To fix this issue:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Ensure the backend server is running on port 3000</li>
                    <li>Check that the admin support endpoints are implemented</li>
                    <li>Verify your admin authentication token is valid</li>
                  </ul>
                </div>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => fetchTickets()}
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tickets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-12 flex flex-col justify-center items-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || priorityFilter || categoryFilter
                ? 'Try adjusting your filters to see more results'
                : 'No support tickets available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last updatesd
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getStatusIcon(ticket.status)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ticket.customer.name}</div>
                          <div className="text-sm text-gray-500">{ticket.customer.email}</div>
                          {ticket.customer.phone && (
                            <div className="text-sm text-gray-500">{ticket.customer.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(ticket.priority)}`}>
                        {ticket.priority.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.category || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.updatesdAt || ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-end">
                        <button
                          type="button"
                          onClick={() => viewTicketDetails(ticket.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View ticket"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Reply to ticket"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {modalLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                <span className="ml-2 text-gray-500">Loading ticket details...</span>
              </div>
            ) : selectedTicket ? (
              <>
                <div className="flex justify-between items-center border-b px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Ticket #{selectedTicket.id}</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <p>Status: 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          selectedTicket.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                          selectedTicket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                      </p>
                      <p>Priority: 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          selectedTicket.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          selectedTicket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedTicket.priority}
                        </span>
                      </p>
                      <p>Created: {formatDate(selectedTicket.createdAt)}</p>
                      {selectedTicket.updatesdAt && <p>updatesd: {formatDate(selectedTicket.updatesdAt)}</p>}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">Name: {(selectedTicket.user as any).full_name || selectedTicket.user.fullName}</p>
                      <p className="text-gray-500">Email: {selectedTicket.user.email}</p>
                      {selectedTicket.user.phone && (
                        <p className="text-gray-500">Phone: {selectedTicket.user.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Messages</h4>
                    <div className="space-y-4 mb-4">
                      {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`border rounded-lg p-4 ${
                              message.isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                <User className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">
                                  {message.sender.fullName} {message.isAdmin && '(Support Staff)'}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No messages found</p>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Reply Form */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Reply to Customer</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply here..."
                          className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          disabled={isSending}
                        />
                        <div className="flex justify-end mt-3">
                          <button
                            type="button"
                            onClick={() => sendMessage(selectedTicket.id, replyMessage)}
                            disabled={isSending || !replyMessage.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSending ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              'Send Reply'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No ticket selected</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
