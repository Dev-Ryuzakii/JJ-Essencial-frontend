import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  User, 
  ShoppingCart, 
  Heart, 
  Menu, 
  X,
  Home,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  MessageCircle
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState({ fullName: 'John Doe' })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(3)

  // Mock functions to replace the hooks
  const logout = () => {
    setIsAuthenticated(false)
    console.log('User logged out')
  }
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  
  const toggleSearch = () => {
    console.log('Search toggled')
  }
  
  const toggleCartModal = () => {
    console.log('Cart toggled')
  }

  // Navigation handler that works reliably
  const navigateToRoute = (path: string) => {
    console.log(`Navigating to: ${path}`)
    closeMobileMenu()
    navigate(path)
  }

  // Logout handler
  const handleLogout = () => {
    console.log('Logging out user')
    closeMobileMenu()
    logout()
  }

  // Touch debug handler
  const handleTouchDebug = (e: React.TouchEvent, buttonName: string) => {
    e.preventDefault()
    console.log(`👆 ${buttonName.toUpperCase()} BUTTON TOUCHED`)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (!target.closest('[data-mobile-menu]') && !target.closest('[data-menu-toggle]')) {
          closeMobileMenu()
        }
      }

      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }
  }, [isMobileMenuOpen])

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Categories', href: '/categories', icon: ShoppingBag },
    { name: 'Trades', href: '/trades', icon: ShoppingBag },
    { name: 'About', href: '/about', icon: ShoppingBag },
    { name: 'Contact', href: '/contact', icon: ShoppingBag },
    { name: 'Support', href: '/support', icon: MessageCircle },
  ]

  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Support', href: '/support', icon: MessageCircle },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JJ</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  Essential
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {/* Support link for all users */}
              <Link
                to="/support"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Support
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={toggleSearch}
                className="p-2 flex items-center justify-center text-gray-600 hover:text-gray-900"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <button
                onClick={toggleCartModal}
                className="p-2 relative flex items-center justify-center text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center text-xs bg-red-500 text-white text-xs px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu - Desktop */}
              {isAuthenticated ? (
                <div className="relative group hidden lg:block">
                  <button
                    className="p-2 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-gray-700 hover:text-gray-900">
                      Login
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                data-menu-toggle
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-25" onClick={closeMobileMenu} />
          
          <div 
            data-mobile-menu
            className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JJ</span>
                </div>
                <span className="font-bold text-lg text-gray-900">Essential</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-1">
              {/* Main Navigation */}
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => navigateToRoute(item.href)}
                    onTouchStart={(e) => handleTouchDebug(e, item.name.toLowerCase())}
                    className="flex items-center justify-between w-full p-4 text-left text-gray-800 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all duration-150 group touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="flex items-center">
                      {IconComponent && (
                        <IconComponent className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                )
              })}

              {/* User Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center p-4 mb-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900 truncate">
                        {user?.fullName}
                      </span>
                    </div>

                    {userMenuItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => navigateToRoute(item.href)}
                        onTouchStart={(e) => handleTouchDebug(e, item.name.toLowerCase())}
                        className="flex items-center w-full p-4 text-left text-gray-700 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all duration-150 group touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-blue-600" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    ))}

                    <button
                      onClick={handleLogout}
                      onTouchStart={(e) => handleTouchDebug(e, 'logout')}
                      className="flex items-center w-full p-4 text-left text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all duration-150 group mt-2 touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <LogOut className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                  <button
                    onClick={() => navigateToRoute('/login')}
                    onTouchStart={(e) => handleTouchDebug(e, 'login')}
                    className="w-full p-4 text-center font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigateToRoute('/register')}
                    onTouchStart={(e) => handleTouchDebug(e, 'signup')}
                    className="w-full p-4 text-center font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 shadow-sm hover:shadow-md touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}