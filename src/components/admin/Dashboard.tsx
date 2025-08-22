import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  CreditCard,
  Box
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { adminApi, type AdminDashboardStats } from '../../services'

// Define OrderStatus type
type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

// Helper components
const StatsCard = ({ title, value, previousValue, icon, iconBgColor, iconColor }: { 
  title: string; 
  value: number | string; 
  previousValue: number; 
  icon: React.ReactNode; 
  iconBgColor: string;
  iconColor: string;
}) => {
  const percentChange = typeof value === 'number' && typeof previousValue === 'number'
    ? ((value - previousValue) / previousValue) * 100
    : 0
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {percentChange >= 0 ? (
          <div className="inline-flex items-center text-green-600 text-sm">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {percentChange.toFixed(1)}%
          </div>
        ) : (
          <div className="inline-flex items-center text-red-600 text-sm">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(percentChange).toFixed(1)}%
          </div>
        )}
        <span className="text-gray-500 text-sm ml-2">vs previous period</span>
      </div>
    </div>
  )
}

// Order status badge component
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week')

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch real dashboard data from backend
      const dashboardStats = await adminApi.getDashboardStats({
        period: timeframe,
        startDate: getStartDate(timeframe),
        endDate: new Date().toISOString()
      })
      setStats(dashboardStats)
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      if (err instanceof Error && err.message.includes('404')) {
        setError('Dashboard endpoint not yet implemented. Please wait for backend development.')
      } else {
        setError('Failed to fetch dashboard data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = (period: string) => {
    const now = new Date()
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      case 'week':
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        return weekStart.toISOString()
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        return monthStart.toISOString()
      case 'year':
        const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        return yearStart.toISOString()
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Define colors for charts
  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#8b5cf6', '#f97316', '#ec4899']

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="ml-2 text-gray-500">Loading dashboard data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No dashboard data available yet.</p>
          <p className="text-sm text-gray-400">Waiting for backend endpoints to be implemented.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back! Here's an overview of your store's performance.</p>
      </div>
      
      {/* Timeframe Selector */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-700 mr-2">Time Period:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setTimeframe('day')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'day'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 text-sm ${
                timeframe === 'year'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        <button
          onClick={() => fetchDashboardData()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      
      {/* Stats Cards */}
      {stats && stats.salesSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard 
            title="Total Sales" 
            value={stats.salesSummary?.totalSales || '$0.00'} 
            previousValue={parseFloat(stats.salesSummary?.comparisonPeriod?.totalSales || '0')}
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            iconBgColor="bg-green-50"
            iconColor="text-green-600"
          />
          
          <StatsCard 
            title="Orders" 
            value={formatNumber(stats.salesSummary?.orderCount || 0)} 
            previousValue={stats.salesSummary?.comparisonPeriod?.orderCount || 0}
            icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          
          <StatsCard 
            title="Total Users" 
            value={formatNumber(stats.userStats?.totalUsers || 0)} 
            previousValue={(stats.userStats?.totalUsers || 0) - (stats.userStats?.newUsers || 0)}
            icon={<Users className="h-6 w-6 text-indigo-600" />}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          
          <StatsCard 
            title="Products" 
            value={formatNumber(stats.productStats?.totalProducts || 0)} 
            previousValue={stats.productStats?.totalProducts || 0}
            icon={<Box className="h-6 w-6 text-purple-600" />}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      )}
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
            <div className="text-sm text-gray-500">
              Total: {stats?.salesSummary?.totalSales || '$0.00'}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.salesChart?.labels ? stats.salesChart.labels.map((label, index) => ({
                  label,
                  sales: stats.salesChart?.data?.[index] || 0
                })) : []}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Sales']}
                  labelFormatter={(label) => `Period: ${label}`}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Order Status Distribution</h3>
            <div className="text-sm text-gray-500">
              Total: {stats?.salesSummary?.orderCount ? formatNumber(stats.salesSummary.orderCount) : '0'}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.orderStats ? [
                    { name: 'Pending', value: stats.orderStats.pending || 0 },
                    { name: 'Paid', value: stats.orderStats.paid || 0 },
                    { name: 'Completed', value: stats.orderStats.completed || 0 },
                    { name: 'Cancelled', value: stats.orderStats.cancelled || 0 }
                  ] : []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats?.orderStats && [
                    { name: 'Pending', value: stats.orderStats.pending || 0 },
                    { name: 'Paid', value: stats.orderStats.paid || 0 },
                    { name: 'Completed', value: stats.orderStats.completed || 0 },
                    { name: 'Cancelled', value: stats.orderStats.cancelled || 0 }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
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
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                            #{order.id.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user?.fullName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.totalAmount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Recent Reviews */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
          <div className="space-y-4">
            {stats?.recentReviews && stats.recentReviews.length > 0 ? (
              stats.recentReviews.map((review) => (
                <div key={review.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {review.user?.fullName || 'Anonymous'}
                      </p>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {review.product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {review.title || review.comment || 'No review text'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <p>No recent reviews</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            <Link to="/admin/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all products
            </Link>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.productStats?.topSelling && stats.productStats.topSelling.length > 0 ? (
                    stats.productStats.topSelling.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/admin/products/${product.id}`} className="hover:text-indigo-600">
                              {product.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(product.totalSold || 0)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.revenue || '$0.00'}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No products data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Stock Status</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
              {stats?.productStats?.lowStock || 0} low stock
            </span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">In Stock</p>
                    <p className="text-lg font-bold text-green-600">
                      {stats ? (stats.productStats?.totalProducts || 0) - (stats.productStats?.lowStock || 0) - (stats.productStats?.outOfStock || 0) : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Low Stock</p>
                    <p className="text-lg font-bold text-yellow-600">{stats?.productStats?.lowStock || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Out of Stock</p>
                    <p className="text-lg font-bold text-red-600">{stats?.productStats?.outOfStock || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Box className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total</p>
                    <p className="text-lg font-bold text-blue-600">{stats?.productStats?.totalProducts || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            {stats?.productStats && (stats.productStats.lowStock || 0) > 0 && (
              <div className="mt-4">
                <Link 
                  to="/admin/products?filter=low-stock" 
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Low Stock Items
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
