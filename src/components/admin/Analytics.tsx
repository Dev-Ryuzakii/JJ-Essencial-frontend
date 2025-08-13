import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users,
  ShoppingCart,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import adminApi, { 
  AnalyticsDashboardDto, 
  SalesReportDto, 
  InventoryReportDto,
  ReportFilters 
} from '../../services/adminApi'

export default function Analytics() {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardDto | null>(null)
  const [salesReport, setSalesReport] = useState<SalesReportDto | null>(null)
  const [inventoryReport, setInventoryReport] = useState<InventoryReportDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(false)
  const [inventoryLoading, setInventoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  })
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'inventory'>('dashboard')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport()
    } else if (activeTab === 'inventory') {
      fetchInventoryReport()
    }
  }, [activeTab, dateFilter])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await adminApi.analytics.getDashboard()
      setDashboardData(data)
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesReport = async () => {
    try {
      setSalesLoading(true)
      
      const filters: ReportFilters = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      }
      
      const data = await adminApi.analytics.getSalesReport(filters)
      setSalesReport(data)
    } catch (err) {
      console.error('Error fetching sales report:', err)
      setError('Failed to fetch sales report.')
    } finally {
      setSalesLoading(false)
    }
  }

  const fetchInventoryReport = async () => {
    try {
      setInventoryLoading(true)
      
      const filters: ReportFilters = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      }
      
      const data = await adminApi.analytics.getInventoryReport(filters)
      setInventoryReport(data)
    } catch (err) {
      console.error('Error fetching inventory report:', err)
      setError('Failed to fetch inventory report.')
    } finally {
      setInventoryLoading(false)
    }
  }

  const handleExportSalesReport = async () => {
    try {
      const blob = await adminApi.analytics.exportSalesReport({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        format: 'excel'
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `sales-report-${dateFilter.startDate}-to-${dateFilter.endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting sales report:', err)
      setError('Failed to export sales report.')
    }
  }

  const handleExportInventoryReport = async () => {
    try {
      const blob = await adminApi.analytics.exportInventoryReport({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        format: 'excel'
      })
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `inventory-report-${dateFilter.startDate}-to-${dateFilter.endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting inventory report:', err)
      setError('Failed to export inventory report.')
    }
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount))
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    } else if (change < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Monitor your business performance and insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: TrendingUp },
            { id: 'sales', name: 'Sales Report', icon: DollarSign },
            { id: 'inventory', name: 'Inventory Report', icon: Package }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Date Filter */}
      {activeTab !== 'dashboard' && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'sales' && (
              <button
                onClick={handleExportSalesReport}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Sales
              </button>
            )}
            {activeTab === 'inventory' && (
              <button
                onClick={handleExportInventoryReport}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading dashboard...</span>
            </div>
          ) : dashboardData ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(dashboardData.totalRevenue)}
                        </p>
                        <div className="flex items-center">
                          {getChangeIcon(dashboardData.revenueChange)}
                          <span className={`text-sm font-medium ml-1 ${getChangeColor(dashboardData.revenueChange)}`}>
                            {formatPercentage(dashboardData.revenueChange)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-semibold text-gray-900">{dashboardData.totalOrders}</p>
                        <div className="flex items-center">
                          {getChangeIcon(dashboardData.ordersChange)}
                          <span className={`text-sm font-medium ml-1 ${getChangeColor(dashboardData.ordersChange)}`}>
                            {formatPercentage(dashboardData.ordersChange)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">New Customers</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-semibold text-gray-900">{dashboardData.newCustomers}</p>
                        <div className="flex items-center">
                          {getChangeIcon(dashboardData.customersChange)}
                          <span className={`text-sm font-medium ml-1 ${getChangeColor(dashboardData.customersChange)}`}>
                            {formatPercentage(dashboardData.customersChange)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-500">Products Sold</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-semibold text-gray-900">{dashboardData.productsSold}</p>
                        <div className="flex items-center">
                          {getChangeIcon(dashboardData.productsSoldChange)}
                          <span className={`text-sm font-medium ml-1 ${getChangeColor(dashboardData.productsSoldChange)}`}>
                            {formatPercentage(dashboardData.productsSoldChange)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <span className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{product.quantitySold} sold</p>
                          <p className="text-sm text-gray-500">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-gray-600" />}
                            {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-gray-600" />}
                            {activity.type === 'user' && <Users className="h-4 w-4 text-gray-600" />}
                            {activity.type === 'product' && <Package className="h-4 w-4 text-gray-600" />}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
              <p className="text-gray-500">Unable to load dashboard data</p>
            </div>
          )}
        </div>
      )}

      {/* Sales Report Tab */}
      {activeTab === 'sales' && (
        <div>
          {salesLoading ? (
            <div className="py-12 flex justify-center items-center">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading sales report...</span>
            </div>
          ) : salesReport ? (
            <div className="space-y-6">
              {/* Sales Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Sales</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(salesReport.summary.totalSales)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <ShoppingCart className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">{salesReport.summary.totalOrders}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Average Order</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(salesReport.summary.averageOrderValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales by Category */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Sales by Category</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units Sold
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.salesByCategory.map((category) => (
                        <tr key={category.categoryId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.categoryName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(category.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.orderCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.unitsSold}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Performing Products</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Units Sold
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salesReport.topProducts.map((product) => (
                        <tr key={product.productId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.unitsSold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.averagePrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">No sales data available</h3>
              <p className="text-gray-500">No sales found for the selected date range</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Report Tab */}
      {activeTab === 'inventory' && (
        <div>
          {inventoryLoading ? (
            <div className="py-12 flex justify-center items-center">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <span className="ml-2 text-gray-500">Loading inventory report...</span>
            </div>
          ) : inventoryReport ? (
            <div className="space-y-6">
              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Products</p>
                      <p className="text-2xl font-semibold text-gray-900">{inventoryReport.summary.totalProducts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Total Value</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {formatCurrency(inventoryReport.summary.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Low Stock</p>
                      <p className="text-2xl font-semibold text-yellow-600">{inventoryReport.summary.lowStockCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-red-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Out of Stock</p>
                      <p className="text-2xl font-semibold text-red-600">{inventoryReport.summary.outOfStockCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Products */}
              {inventoryReport.lowStockProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min Stock
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryReport.lowStockProducts.map((product) => (
                          <tr key={product.productId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                              <div className="text-sm text-gray-500">{product.sku}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                {product.currentStock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.minStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(product.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inventory by Category */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Inventory by Category</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryReport.inventoryByCategory.map((category) => (
                        <tr key={category.categoryId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.categoryName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.productCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {category.totalStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(category.totalValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-1">No inventory data available</h3>
              <p className="text-gray-500">Unable to load inventory report</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
