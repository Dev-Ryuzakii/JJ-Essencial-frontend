import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks'
import { 
  ShoppingBag, 
  Heart, 
  CreditCard, 
  Package, 
  Star, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Users,
  TrendingUp,
  Gift,
  MessageCircle
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { dashboardApi, ordersApi, wishlistApi } from '../services'
import type { DashboardStats } from '../services/dashboardApi'
import toast from 'react-hot-toast'

interface UserStats {
  totalOrders: number
  pendingOrders: number
  totalSpent: number
  wishlistItems: number
  reviewCount: number
}

interface OrderSummary {
  id: string
  orderNumber: string
  date: string
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  items: number
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviewCount: 0
  })
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    // Set appropriate greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    
    // Fetch user data, orders, and wishlist
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        // Start loading all data in parallel for better performance
        const [ordersResponse, wishlistResponse] = await Promise.all([
          // Fetch ALL user orders to calculate proper statistics
          ordersApi.getAll({ 
            limit: 1000, // Get all orders for proper calculation
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }),
          // Fetch wishlist items
          wishlistApi.list()
        ]);
        
        console.log('📊 Dashboard: Processing user statistics...');
        console.log('📋 Dashboard: Orders response:', ordersResponse);
        console.log('❤️ Dashboard: Wishlist response:', wishlistResponse);
        
        // Calculate user statistics from actual orders
        let userStats: UserStats = {
          totalOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          reviewCount: 0 // TODO: Add when reviews API is available
        };
        
        // Process orders data
        if (ordersResponse.success && ordersResponse.data && Array.isArray(ordersResponse.data)) {
          const orders = ordersResponse.data;
          
          // Calculate total orders
          userStats.totalOrders = orders.length;
          
          // Calculate pending orders
          userStats.pendingOrders = orders.filter(order => 
            order.status === 'PENDING' || order.status === 'PROCESSING'
          ).length;
          
          // Calculate total spent (only from delivered, shipped, or paid orders)
          userStats.totalSpent = orders
            .filter(order => {
              // Count orders that are confirmed/completed or have confirmed payment
              const isCompletedOrder = ['DELIVERED', 'SHIPPED'].includes(order.status);
              const isPaidOrder = order.paymentStatus === 'PAID';
              const isProcessingPaidOrder = order.status === 'PROCESSING' && isPaidOrder;
              
              return isCompletedOrder || isPaidOrder || isProcessingPaidOrder;
            })
            .reduce((total, order) => total + (order.totalAmount || 0), 0);
          
          console.log('📊 Dashboard: Calculated order stats:', {
            totalOrders: userStats.totalOrders,
            pendingOrders: userStats.pendingOrders,
            totalSpent: userStats.totalSpent
          });
          
          // Set recent orders for display (limit to 3 most recent)
          const recentOrdersList: OrderSummary[] = orders.slice(0, 3).map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            date: order.createdAt,
            status: order.status,
            total: order.totalAmount,
            items: (order.items || order.orderItems || []).length
          }));
          setRecentOrders(recentOrdersList);
          console.log('✅ Dashboard: Set', recentOrdersList.length, 'recent orders');
        } else {
          console.log('ℹ️ Dashboard: No orders found or response not successful');
          setRecentOrders([]);
        }
        
        // Process wishlist data
        if (Array.isArray(wishlistResponse)) {
          userStats.wishlistItems = wishlistResponse.length;
          
          // Set wishlist items for display (limit to 4 most recent)
          const wishlistDisplayItems: WishlistItem[] = wishlistResponse.slice(0, 4).map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.discountPrice || item.product.price,
            image: item.product.images?.[0] || ''
          }));
          setWishlistItems(wishlistDisplayItems);
          console.log('✅ Dashboard: Set', wishlistDisplayItems.length, 'wishlist display items');
        } else {
          console.log('ℹ️ Dashboard: No wishlist items found');
          setWishlistItems([]);
        }
        
        // Update stats state with calculated values
        setStats(userStats);
        console.log('✅ Dashboard: Final user stats:', userStats);

      } catch (error) {
        console.error('❌ Dashboard: Error fetching dashboard data:', error);
        
        // Set default stats to prevent showing undefined values
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          reviewCount: 0
        });
        setRecentOrders([]);
        setWishlistItems([]);
        
        // Only show error if it's not an authentication issue
        if (error && typeof error === 'object' && 'status' in error && error.status !== 401) {
          console.warn('Dashboard data fetch failed, but continuing with empty data');
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your dashboard.</p>
          <Link 
            to="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 sm:p-8 mb-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {greeting}, {user?.fullName?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-purple-100">
              Welcome back to your JJ Essential dashboard
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link 
              to="/profile" 
              className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors"
            >
              View Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-pink-100 p-3 rounded-lg mr-4">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Wishlist Items</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.wishlistItems}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : formatCurrency(stats.totalSpent)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg mr-4">
            <Package className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.pendingOrders}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link 
              to="/orders" 
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link 
                to="/products"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()} • {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wishlist Preview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Wishlist</h2>
            <Link 
              to="/wishlist" 
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No wishlist items</h3>
              <p className="text-gray-600 mb-6">Save products you love for later</p>
              <Link 
                to="/products"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wishlistItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="group border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100 mb-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          const parent = target.parentElement!
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                              </svg>
                            </div>
                          `
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h3>
                  <p className="text-purple-600 font-semibold text-sm">{formatCurrency(item.price)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/products"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Shop Products</p>
              <p className="text-sm text-gray-500">Browse our collection</p>
            </div>
          </Link>

          <Link
            to="/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Track Orders</p>
              <p className="text-sm text-gray-500">Check order status</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-500">Update your info</p>
            </div>
          </Link>

          <Link
            to="/support"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
          >
            <div className="bg-orange-100 p-3 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Get Support</p>
              <p className="text-sm text-gray-500">Create ticket & chat</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recommendations */}
      {stats.totalOrders === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to JJ Essential!</h3>
              <p className="text-gray-600 mb-4">
                Get started by exploring our premium kitchen and dining collection. 
                We have everything you need to create memorable culinary experiences.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/categories"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Browse Categories
                </Link>
                <Link
                  to="/products?featured=true"
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Featured Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

