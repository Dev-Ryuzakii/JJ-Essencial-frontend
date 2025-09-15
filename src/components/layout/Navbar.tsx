import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon, UserIcon, SearchIcon, MenuIcon, XIcon } from 'lucide-react'
import { useAuth, useCart } from '../../hooks'
import { useUIStore } from '../../store'
import { categoriesCache } from '../../lib/categoriesCache'
import { cn, formatCurrency } from '../../lib/utils'
import type { Category } from '../../types'
import LOGO from '../../assets/LOGO.png'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems, finalAmount } = useCart()
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    searchQuery,
    setSearchQuery 
  } = useUIStore()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Fetch categories on mount with delay to prevent rate limiting
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add a small delay to prevent concurrent requests
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))
        
        const allCategories = await categoriesCache.getCategories()
        setCategories(allCategories.slice(0, 6)) // Show only first 6 categories
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeMobileMenu])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      closeMobileMenu()
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      {/* <div className="bg-blue-600 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          {/* <div className="hidden md:flex items-center space-x-4">
            <span>📧 {import.meta.env.VITE_SUPPORT_EMAIL}</span>
            <span>📞 {import.meta.env.VITE_CONTACT_PHONE}</span>
          </div> 
          <div className="flex items-center space-x-4">
            {import.meta.env.VITE_ENABLE_TRADES === 'true' && (
              <Link to="/trades" className="hover:text-blue-200">
                Trade Products
              </Link>
            )}
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER?.replace('+', '')}`} 
               className="hover:text-blue-200">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div> */}

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={LOGO} alt="JJ Essential" className="w-10 h-10 rounded-full" />
            <span className="text-xl font-bold text-gray-900">
              {import.meta.env.VITE_APP_NAME || 'JJ Essential'}
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Wishlist */}
            {import.meta.env.VITE_ENABLE_WISHLIST === 'true' && isAuthenticated && (
              <Link to="/wishlist" className="relative hover:text-blue-600 transition-colors">
                <HeartIcon className="w-6 h-6" />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-blue-600 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
              >
                <UserIcon className="w-6 h-6" />
                {isAuthenticated && user && (
                  <span className="hidden lg:block">{user.fullName}</span>
                )}
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/auth/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-blue-600 transition-colors"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
            
            <Link to="/cart" className="relative hover:text-blue-600 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMobileMenu}
              className="hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Categories Bar */}
      <div className="hidden lg:block bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-3">
            <span className="font-medium text-gray-700">Categories:</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/categories"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg" ref={mobileMenuRef}>
          <div className="px-4 py-2 space-y-2">
            {/* Categories */}
            <div className="py-2">
              <span className="font-medium text-gray-700">Categories</span>
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="border-t pt-2 space-y-2">
              {import.meta.env.VITE_ENABLE_WISHLIST === 'true' && isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Wishlist
                </Link>
              )}
              
              {/* {import.meta.env.VITE_ENABLE_TRADES === 'true' && (
                <Link
                  to="/trades"
                  className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Trade Products
                </Link>
              )} */}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block text-gray-600 hover:text-blue-600 hover:bg-gray-50 py-2 px-2 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar