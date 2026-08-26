import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search as SearchIcon,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Clock,
  TrendingUp,
  Star,
  ChevronDown
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import ProductCard from '../components/product/ProductCard'
import { productsApi, categoriesApi } from '../services'
import { formatCurrency, cn } from '../lib/utils'
import toast from 'react-hot-toast'
import type { Product, Category } from '../types'

interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  categoryId?: string
  inStock?: boolean
  featured?: boolean
  rating?: number
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    'coffee mugs', 'cooking pots', 'dinner plates', 'kitchen knives',
    'serving bowls', 'wine glasses', 'cutting boards', 'baking sheets'
  ])

  useEffect(() => {
    loadCategories()
    loadRecentSearches()
  }, [])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchQuery) {
      const delayedSearch = setTimeout(() => {
        performSearch(searchQuery)
      }, 300)
      
      return () => clearTimeout(delayedSearch)
    } else {
      setProducts([])
      setTotalResults(0)
    }
  }, [searchQuery, filters, sortBy, currentPage])

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

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }

  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query)) {
      const updatesd = [query, ...recentSearches.slice(0, 4)]
      setRecentSearches(updatesd)
      localStorage.setItem('recentSearches', JSON.stringify(updatesd))
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await productsApi.search({
        query: query.trim(),
        page: currentPage,
        limit: 20,
        sortBy: sortBy === 'relevance' ? undefined : sortBy,
        ...filters
      })

      if (response.success) {
        setProducts(response.data.products)
        setTotalResults(response.data.total)
        saveRecentSearch(query.trim())
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
      setCurrentPage(1)
    }
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchParams({})
    setProducts([])
    setTotalResults(0)
  }

  const removeRecentSearch = (searchToRemove: string) => {
    const updatesd = recentSearches.filter(search => search !== searchToRemove)
    setRecentSearches(updatesd)
    localStorage.setItem('recentSearches', JSON.stringify(updatesd))
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Search Products</h1>
            
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search for products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-24 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Search Suggestions */}
            {!searchQuery && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Recent Searches
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <div key={index} className="flex items-center justify-between group">
                          <button
                            onClick={() => setSearchQuery(search)}
                            className="text-purple-600 hover:text-purple-700 flex-1 text-left"
                          >
                            {search}
                          </button>
                          <button
                            onClick={() => removeRecentSearch(search)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {(searchQuery || totalResults > 0) && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              {/* Results Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
                  </h2>
                  {totalResults > 0 && (
                    <p className="text-gray-600">
                      Showing {products.length} of {totalResults} results
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
                  {/* Filters Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'relative',
                      hasActiveFilters && 'border-purple-500 text-purple-600'
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                        !
                      </span>
                    )}
                  </Button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="price_asc">Price (Low to High)</option>
                    <option value="price_desc">Price (High to Low)</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest First</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'px-3 py-2 transition-colors',
                        viewMode === 'grid'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'px-3 py-2 transition-colors',
                        viewMode === 'list'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {filters.categoryId && (
                    <Badge variant="primary" className="flex items-center space-x-1">
                      <span>Category: {categories.find(c => c.id === filters.categoryId)?.name}</span>
                      <button onClick={() => handleFilterChange({ categoryId: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.minPrice && (
                    <Badge variant="primary" className="flex items-center space-x-1">
                      <span>Min: {formatCurrency(filters.minPrice)}</span>
                      <button onClick={() => handleFilterChange({ minPrice: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.maxPrice && (
                    <Badge variant="primary" className="flex items-center space-x-1">
                      <span>Max: {formatCurrency(filters.maxPrice)}</span>
                      <button onClick={() => handleFilterChange({ maxPrice: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.inStock && (
                    <Badge variant="success" className="flex items-center space-x-1">
                      <span>In Stock</span>
                      <button onClick={() => handleFilterChange({ inStock: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.featured && (
                    <Badge variant="warning" className="flex items-center space-x-1">
                      <span>Featured</span>
                      <button onClick={() => handleFilterChange({ featured: undefined })}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
              )}

              <div className="flex gap-8">
                {/* Filters Sidebar */}
                {showFilters && (
                  <div className="w-80 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear All
                          </Button>
                        )}
                      </div>

                      <div className="space-y-6">
                        {/* Category Filter */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                          <select
                            value={filters.categoryId || ''}
                            onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Range */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.minPrice || ''}
                              onChange={(e) => handleFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.maxPrice || ''}
                              onChange={(e) => handleFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.inStock || false}
                              onChange={(e) => handleFilterChange({ inStock: e.target.checked || undefined })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700">In Stock Only</span>
                          </label>
                        </div>

                        {/* Featured */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Special</h4>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.featured || false}
                              onChange={(e) => handleFilterChange({ featured: e.target.checked || undefined })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700">Featured Products</span>
                          </label>
                        </div>

                        {/* Rating */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                          <div className="space-y-2">
                            {[4, 3, 2, 1].map((rating) => (
                              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="rating"
                                  checked={filters.rating === rating}
                                  onChange={() => handleFilterChange({ rating })}
                                  className="border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex items-center space-x-1">
                                  {[...Array(rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                  ))}
                                  {[...Array(5 - rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-gray-300" />
                                  ))}
                                  <span className="text-gray-700">& up</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                <div className="flex-1">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-16">
                      <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery ? 'No results found' : 'Start searching'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery 
                          ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
                          : 'Enter a search term to find products'
                        }
                      </p>
                      {searchQuery && (
                        <Button onClick={clearFilters} variant="outline">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-6'
                    )}>
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          layout={viewMode}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalResults > products.length && (
                    <div className="mt-12 flex justify-center">
                      <Button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={isLoading}
                      >
                        Load More Products
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Search
