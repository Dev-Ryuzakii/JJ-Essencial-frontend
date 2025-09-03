import React from 'react'
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
  LogOut
} from 'lucide-react'
import { useAuth, useCart } from '../hooks'
import { useUIStore } from '../store'
import { Button, Badge } from './ui'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
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

  const handleMobileNavigation = (href: string) => {
    // First close the menu
    closeMobileMenu()
    
    // Use a slightly longer delay to ensure the menu close animation completes
    setTimeout(() => {
      console.log(`Navigating to: ${href}`);
      navigate(href);
    }, 100)
  }

  const handleMobileLogout = () => {
    // First close the menu
    closeMobileMenu()
    
    // Use a slightly longer delay to ensure the menu close animation completes
    setTimeout(() => {
      console.log('Logging out user');
      logout();
    }, 100)
  }

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
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearch}
                className="p-2 flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCartModal}
                className="p-2 relative flex items-center justify-center"
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
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <hr className="my-2" />
                      <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
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
              <button
                type="button"
                onTouchStart={() => {/* Empty handler to improve touch response */}}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Mobile menu button clicked', { isMobileMenuOpen });
                  toggleMobileMenu();
                }}
                className="lg:hidden p-3 min-w-[48px] min-h-[48px] touch-manipulation active:scale-95 transition-transform flex items-center justify-center bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-md"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  outline: 'none',
                  userSelect: 'none'
                }}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

   {/* Mobile Menu Backdrop */}
{isMobileMenuOpen && (
  <div 
    className="lg:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
    onClick={closeMobileMenu}
    onTouchEnd={closeMobileMenu}
    style={{ 
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
    }}
  />
)}

{/* Mobile Menu */}
{isMobileMenuOpen && (
  <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg fixed top-0 left-0 right-0 z-50">
    <div className="px-4 pt-2 pb-3 space-y-1">
      {navigationItems.map((item) => (
        <button
          key={item.name}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMobileNavigation(item.href);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMobileNavigation(item.href);
          }}
          className="flex items-center justify-between w-full text-left px-4 py-3 min-h-[48px] text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors border-0 bg-transparent cursor-pointer"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <span className="flex-1 text-left">{item.name}</span>
          {item.icon && <item.icon className="w-5 h-5 ml-3 text-gray-400 flex-shrink-0" />}
        </button>
      ))}
      
      {isAuthenticated ? (
        <div className="pt-4 space-y-2 border-t border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-500 font-medium flex items-center">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{user?.fullName}</span>
          </div>
          {userMenuItems.map((item) => (
            <button
              key={item.name}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMobileNavigation(item.href);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMobileNavigation(item.href);
              }}
              className="flex items-center w-full text-left px-4 py-3 min-h-[48px] text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors border-0 bg-transparent cursor-pointer"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                userSelect: 'none'
              }}
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-left">{item.name}</span>
            </button>
          ))}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileLogout();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileLogout();
            }}
            className="flex items-center w-full text-left px-4 py-3 min-h-[48px] text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border-0 bg-transparent cursor-pointer"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      ) : (
        <div className="pt-4 space-y-3 border-t border-gray-200">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileNavigation('/login');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileNavigation('/login');
            }}
            className="w-full min-h-[48px] px-4 py-3 text-center text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            Login
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileNavigation('/register');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMobileNavigation('/register');
            }}
            className="w-full min-h-[48px] px-4 py-3 text-center text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  </div>
)}
    </>
  )
}
