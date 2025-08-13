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
import dashboardApi, { DashboardStats, RevenueData, OrdersData, TopProduct } from '../../services/dashboardApi'
import ordersApi, { OrderStatus } from '../../services/ordersApi'

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

// Status badges for orders
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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [ordersData, setOrdersData] = useState<OrdersData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week')

  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch stats
      const dashboardStats = await dashboardApi.getStats()
      setStats(dashboardStats)
      
      // Fetch revenue data
      const revenueData = await dashboardApi.getRevenueData(timeframe)
      setRevenueData(revenueData)
      
      // Fetch orders data
      const ordersData = await dashboardApi.getOrdersData(timeframe)
      setOrdersData(ordersData)
      
      // Fetch top products
      const topProducts = await dashboardApi.getTopProducts(timeframe)
      setTopProducts(topProducts)
      
      // Fetch recent orders (last 5)
      const ordersResponse = await ordersApi.getOrders({ 
        limit: 5, 
        page: 1, 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      })
      setRecentOrders(ordersResponse.items || [])
      
      // Get low stock products
      const lowStock = await dashboardApi.getLowStockProducts()
      setLowStockProducts(lowStock || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to fetch dashboard data. Please try again.')
    } finally {
      setLoading(false)
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
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard 
            title="Revenue" 
            value={formatCurrency(stats.revenue.current)} 
            previousValue={stats.revenue.previous}
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            iconBgColor="bg-green-50"
            iconColor="text-green-600"
          />
          
          <StatsCard 
            title="Orders" 
            value={formatNumber(stats.orders.current)} 
            previousValue={stats.orders.previous}
            icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          
          <StatsCard 
            title="Customers" 
            value={formatNumber(stats.customers.current)} 
            previousValue={stats.customers.previous}
            icon={<Users className="h-6 w-6 text-indigo-600" />}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          
          <StatsCard 
            title="Conversion Rate" 
            value={`${stats.conversionRate.current.toFixed(2)}%`} 
            previousValue={stats.conversionRate.previous}
            icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>
      )}
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
            <div className="text-sm text-gray-500">
              Total: {stats && formatCurrency(stats.revenue.current)}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
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
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelFormatter={(label) => `Period: ${label}`}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Orders Trend</h3>
            <div className="text-sm text-gray-500">
              Total: {stats && formatNumber(stats.orders.current)}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ordersData}
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
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Orders']}
                  labelFormatter={(label) => `Period: ${label}`}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
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
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <OrderStatusBadge status={order.status} />
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
        
        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: stats?.orderStatusDistribution?.pending || 0 },
                    { name: 'Processing', value: stats?.orderStatusDistribution?.processing || 0 },
                    { name: 'Shipped', value: stats?.orderStatusDistribution?.shipped || 0 },
                    { name: 'Delivered', value: stats?.orderStatusDistribution?.delivered || 0 },
                    { name: 'Cancelled', value: stats?.orderStatusDistribution?.cancelled || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {[
                    { name: 'Pending', value: stats?.orderStatusDistribution?.pending || 0 },
                    { name: 'Processing', value: stats?.orderStatusDistribution?.processing || 0 },
                    { name: 'Shipped', value: stats?.orderStatusDistribution?.shipped || 0 },
                    { name: 'Delivered', value: stats?.orderStatusDistribution?.delivered || 0 },
                    { name: 'Cancelled', value: stats?.orderStatusDistribution?.cancelled || 0 }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { name: 'Pending', color: COLORS[0], value: stats?.orderStatusDistribution?.pending || 0, icon: <Clock className="h-3 w-3" /> },
              { name: 'Processing', color: COLORS[1], value: stats?.orderStatusDistribution?.processing || 0, icon: <RefreshCw className="h-3 w-3" /> },
              { name: 'Shipped', color: COLORS[2], value: stats?.orderStatusDistribution?.shipped || 0, icon: <Truck className="h-3 w-3" /> },
              { name: 'Delivered', color: COLORS[3], value: stats?.orderStatusDistribution?.delivered || 0, icon: <CheckCircle className="h-3 w-3" /> },
              { name: 'Cancelled', color: COLORS[4], value: stats?.orderStatusDistribution?.cancelled || 0, icon: <XCircle className="h-3 w-3" /> }
            ].map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-600 mr-1">{item.name}:</span>
                  <span className="text-xs font-medium text-gray-900">{item.value}</span>
                </div>
              </div>
            ))}
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
                      Orders
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={product.image || 'https://via.placeholder.com/40'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                <Link to={`/admin/products/${product.id}`} className="hover:text-indigo-600">
                                  {product.name}
                                </Link>
                              </div>
                              <div className="text-sm text-gray-500">{product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatNumber(product.orders)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(product.revenue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatNumber(product.stock)}
                            {product.stock <= 10 && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
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
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
              {lowStockProducts?.length || 0} items
            </span>
          </div>
          <div className="space-y-4">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={product.image || 'https://via.placeholder.com/40'}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        SKU: {product.sku} | Threshold: {product.lowStockThreshold}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm font-bold text-red-600 mr-4">
                      {product.quantity} left
                    </div>
                    <Link 
                      to={`/admin/products/${product.id}`} 
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                <Box className="h-12 w-12 text-gray-400 mb-2" />
                <p>All products are well-stocked</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
