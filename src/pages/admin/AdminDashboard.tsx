import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Calendar,
  Star,
  MessageSquare,
  Globe,
  Activity
} from 'lucide-react'
import useAdminAuth from '../../hooks/useAdminAuth'
import dashboardApi from '../../services/dashboardApi'
import productsApi from '../../services/productsApi'
import ordersApi from '../../services/ordersApi'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency } from '../../lib/utils'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
  usersChange: number
  productsChange: number
}

interface RecentOrder {
  id: string
  customerName: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
}

interface TopProduct {
  id: string
  name: string
  sales: number
  revenue: number
  image: string
}

const AdminDashboard: React.FC = () => {
  const { adminUser } = useAdminAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    productsChange: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data from our dashboard API and other APIs
        const [
          dashboardStats, 
          productStats, 
          recentOrdersData, 
          topProductsData, 
          lowStockProductsData
        ] = await Promise.all([
          dashboardApi.getStats(),
          productsApi.getProductStats(),
          ordersApi.getRecentOrders(5),
          dashboardApi.getTopProducts('month'),
          dashboardApi.getLowStockProducts()
        ])
        
        // updates state with the fetched data
        setStats({
          totalRevenue: dashboardStats.revenue.current,
          totalOrders: dashboardStats.orders.current,
          totalUsers: dashboardStats.customers.current,
          totalProducts: productStats.totalProducts,
          // These values are calculated from the dashboard API
          revenueChange: calculatePercentageChange(dashboardStats.revenue.current, dashboardStats.revenue.previous),
          ordersChange: calculatePercentageChange(dashboardStats.orders.current, dashboardStats.orders.previous),
          usersChange: calculatePercentageChange(dashboardStats.customers.current, dashboardStats.customers.previous),
          productsChange: 3.1 // Mock value for products change
        })
        
        // Map recent orders to the expected format
        setRecentOrders(
          recentOrdersData.map(order => ({
            id: order.id,
            customerName: order.customer?.name || 'Customer',
            amount: order.totalAmount,
            status: order.status.toLowerCase() as any,
            date: new Date(order.createdAt).toISOString().split('T')[0]
          }))
        )
        
        // Map top products to the expected format
        setTopProducts(
          topProductsData.map(product => ({
            id: product.id,
            name: product.name,
            sales: product.orders,
            revenue: product.revenue,
            image: product.image || '/api/placeholder/50/50'
          }))
        )
        
        // Set low stock alerts
        setLowStockAlerts(
          lowStockProductsData.map(product => ({
            id: product.id,
            name: product.name,
            stock: product.quantity,
            threshold: product.lowStockThreshold
          }))
        )
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  // Calculate percentage change between current and previous values
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return parseFloat((((current - previous) / previous) * 100).toFixed(1))
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'processing':
        return 'info'
      case 'shipped':
        return 'primary'
      case 'delivered':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const StatCard: React.FC<{
    title: string
    value: string | number
    change: number
    icon: React.ReactNode
    color: string
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {typeof value === 'number' && title.includes('Revenue') 
              ? formatCurrency(value) 
              : value.toLocaleString()
            }
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last month</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {adminUser?.fullName || 'Admin'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's what's happening with your store today
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            change={stats.revenueChange}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.ordersChange}
            icon={<ShoppingBag className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change={stats.usersChange}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            change={stats.productsChange}
            icon={<Package className="w-6 h-6 text-white" />}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/orders">
                    View All
                  </Link>
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(order.status)} size="sm">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/admin/products">
                    View All Products
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/products"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Manage Products</h3>
                <p className="text-sm text-gray-500">Add, edit, or remove products</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Order Management</h3>
                <p className="text-sm text-gray-500">View and process orders</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-500">Manage customer accounts</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">View sales and reports</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Alerts Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockAlerts.length > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Low Stock Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {lowStockAlerts.length} products are running low on stock and need restocking.
                    </p>
                    <div className="mt-2 space-y-1">
                      {lowStockAlerts.slice(0, 3).map(product => (
                        <div key={product.id} className="text-xs text-yellow-700">
                          • {product.name}: {product.stock} items left (threshold: {product.threshold})
                        </div>
                      ))}
                      {lowStockAlerts.length > 3 && (
                        <div className="text-xs text-yellow-700 font-medium">
                          • And {lowStockAlerts.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">System updates</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    New features have been added to the admin panel. Check the changelog.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
