import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  BarChart2,
  ChevronDown,
  CreditCard,
  HelpCircle,
  Shield,
  Star,
  MessageCircle
} from 'lucide-react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import LOGO from '../../assets/LOGO.png'

interface AdminLayoutProps {
  children?: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { adminUser, logout } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Get notification count from API
  useEffect(() => {
    // This would be replaced with an actual API call
    const getNotificationCount = async () => {
      try {
        // Simulating API call
        setTimeout(() => {
          setNotificationCount(3)
        }, 1000)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    
    getNotificationCount()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActivePath = (fullPath: string) => {
    // Handle exact match for dashboard
    if (fullPath === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin' || location.pathname === '/admin/'
    }
    // For other paths, check if current path starts with the menu path
    return location.pathname.startsWith(fullPath)
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: Tag
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: Tag
    },
    {
      name: 'Customers',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Payments',
      path: '/admin/payments',
      icon: CreditCard
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: Star
    },
    {
      name: 'Support',
      path: '/admin/support',
      icon: MessageCircle
    },
    {
      name: 'Analytics',
      path: '/admin/reports',
      icon: BarChart2
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ]
  
  const secondaryNavItems = [
    {
      name: 'Help Center',
      path: '/admin/help',
      icon: HelpCircle
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col z-40 w-72 max-w-xs bg-white">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img src={LOGO} alt="JJ Essential" className="w-10 h-10 rounded-full" />
              <span className="ml-2 text-xl font-semibold text-gray-800">Admin</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-2 flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${
                    isActivePath(item.path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActivePath(item.path)
                      ? 'text-indigo-600'
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              ))}
              
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Support
                </h3>
                <div className="mt-2 space-y-1">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {adminUser?.fullName?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {adminUser?.fullName || 'Admin User'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 bg-white">
            <img src={LOGO} alt="JJ Essential" className="w-10 h-10 rounded-full" />
            <span className="ml-2 text-xl font-semibold text-gray-800">Admin</span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-2 flex-1 px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md group ${
                    isActivePath(item.path)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActivePath(item.path)
                      ? 'text-indigo-600'
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              ))}
              
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Support
                </h3>
                <div className="mt-2 space-y-1">
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
                    >
                      <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    {adminUser?.fullName?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {adminUser?.fullName || 'Admin User'}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-xs font-medium text-gray-500 group-hover:text-gray-700"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Search orders, products, users..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <button
                        className="text-xs text-indigo-600 hover:text-indigo-500"
                        onClick={() => {/* Mark all as read */}}
                      >
                        Mark all as read
                      </button>
                    </div>
                    {/* Sample notifications */}
                    <div className="max-h-96 overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 border-l-4 border-indigo-500">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">New order received</p>
                          <span className="text-xs text-gray-500">10m ago</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">Order #12345 has been placed for ₦149,999</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">Payment confirmed</p>
                          <span className="text-xs text-gray-500">1h ago</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">Payment for order #12340 has been confirmed</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">Support ticket assigned</p>
                          <span className="text-xs text-gray-500">3h ago</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">You've been assigned to ticket #234 - Order Issue</p>
                      </div>
                    </div>
                    <div className="block w-full px-4 py-2 text-center text-sm font-medium text-indigo-600 border-t border-gray-100">
                      View all notifications
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <div>
                  <button
                    className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {adminUser?.fullName?.charAt(0) || 'A'}
                    </div>
                    <span className="ml-2 text-sm text-gray-700 hidden md:block">{adminUser?.fullName || 'Admin User'}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400 hidden md:block" />
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      to="/admin/security"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Security
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}

