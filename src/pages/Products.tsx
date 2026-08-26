import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  XIcon,
  ChevronDownIcon 
} from 'lucide-react'
import { categoriesApi, productsApi } from '../lib/api'
import ProductCard from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'
import { parseProductImage } from '../lib/utils'
import type { Category, Product, ProductFilters } from '../types'

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filters state
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: parseFloat(searchParams.get('minPrice') || '0') || undefined,
    maxPrice: parseFloat(searchParams.get('maxPrice') || '0') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    featured: searchParams.get('featured') === 'true' || undefined,
    inStock: searchParams.get('inStock') === 'true' || undefined
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getAll()
        if (response.success) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null)
        setIsLoading(true)
        
        const params = {
          page: filters.page || 1,
          limit: filters.limit || 20,
          search: filters.search || '',
          category: filters.category || '',
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          sortBy: filters.sortBy || 'createdAt',
          sortOrder: filters.sortOrder || 'desc',
          featured: filters.featured,
          inStock: filters.inStock
        }

        // Remove undefined values
        const cleanParams: any = {}
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            cleanParams[key] = value
          }
        })

        const response: any = await productsApi.getAll(cleanParams)
        console.log('Products API response:', response) // Debug log
        
        // Handle different response formats
        let productsData = []
        let paginationData = {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: params.limit
        }
        
        if (response && response.success && response.data) {
          // Standard API response format
          productsData = response.data.items || response.data
          paginationData = response.data.meta || paginationData
        } else if (response && response.products) {
          // Backend specific format
          productsData = response.products
          paginationData = {
            currentPage: params.page,
            totalPages: Math.ceil((response.total || 0) / params.limit),
            totalItems: response.total || 0,
            itemsPerPage: params.limit
          }
        } else if (Array.isArray(response)) {
          // Direct array response
          productsData = response
        }
        
        // Parse images from JSON strings and ensure proper image URLs
        const processedProducts = productsData.map((product: any) => {
          let images = []
          
          if (product.images && Array.isArray(product.images)) {
            images = product.images.map((img: any) => {
              return parseProductImage(img)
            })
          }
          
          return {
            ...product,
            images: images.length > 0 ? images : ['/api/placeholder/400/400'],
            price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
            stock: product.stock || product.stockQuantity || 0,
            stockQuantity: product.stock || product.stockQuantity || 0,
            category: product.category || { id: '', name: 'Uncategorized', slug: 'uncategorized' },
            averageRating: product.averageRating || 0,
            reviewCount: product.reviewCount || 0,
            isFeatured: product.featured || false,
            isInWishlist: product.isInWishlist || false
          }
        })
        
        setProducts(processedProducts)
        setPagination(paginationData)
      } catch (error: any) {
        console.error('Failed to load products:', error)
        setError('Failed to load products. Please try again.')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [filters])

  // updates URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 0) {
        newParams.set(key, String(value))
      }
    })

    setSearchParams(newParams)
  }, [filters, setSearchParams])

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters((prev: ProductFilters) => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev: ProductFilters) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'averageRating-desc', label: 'Highest Rated' }
  ]

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {filters.search ? `Search Results for "${filters.search}"` : 'All Products'}
            </h1>
            {pagination && (
              <p className="text-gray-600 mt-2">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} products
              </p>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              )}
            >
              <GridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2"
            >
              <FilterIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {/* Active filters count */}
            {Object.values(filters).filter(v => v && v !== '' && v !== 0 && v !== 1 && v !== 20 && v !== 'createdAt' && v !== 'desc').length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {Object.values(filters).filter(v => v && v !== '' && v !== 0 && v !== 1 && v !== 20 && v !== 'createdAt' && v !== 'desc').length} active filter(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange('sortBy', sortBy)
                handleFilterChange('sortOrder', sortOrder)
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform lg:relative lg:inset-auto lg:w-64 lg:shadow-none lg:transform-none',
          isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || undefined)}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || undefined)}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.featured || false}
                    onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured products only
                  </span>
                </label>
              </div>

              {/* In Stock */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    In stock only
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isFilterOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            )}>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const page = i + 1
                  const isCurrentPage = page === pagination.currentPage
                  
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? 'primary' : 'outline'}
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  )
                })}
                
                {pagination.totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className="w-10"
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
