import React from 'react'
import { Link } from 'react-router-dom'
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
  LogOut
} from 'lucide-react'
import { useAuth, useCart } from '../hooks'
import { useUIStore } from '../store'
import { Button, Badge } from './ui'

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { getCartCount } = useCart()
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    toggleSearch,
    toggleCartModal
  } = useUIStore()

  const cartCount = getCartCount()

  const navigationItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'Categories', href: '/categories' },
    { name: 'Trades', href: '/trades' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const userMenuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
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
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JJ</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  Essencial
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
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
                className="p-2"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCartModal}
                className="p-2 relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 flex items-center space-x-2"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block text-sm">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                  </Button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <hr className="my-2" />
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="lg:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {item.name}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <div className="pt-4 space-y-2">
                <Link to="/login" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMobileMenu}>
                  <Button variant="primary" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
