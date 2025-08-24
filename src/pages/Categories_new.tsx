import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Search, Grid, List, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { categoriesApi } from '../lib/api'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'
import type { Category } from '../types'

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const response = await categoriesApi.getAll()
      
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.error('Invalid response format:', response)
        toast.error('Failed to load categories')
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getCategoryIcon = (categoryName: string) => {
    // Simple emoji mapping for categories
    const icons: { [key: string]: string } = {
      'blender': '🍹',
      'pot': '🍲', 
      'air fryer': '🍟',
      'kitchen': '🍳',
      'appliance': '⚡',
      'cooking': '👨‍🍳',
      'baking': '🧁',
      'coffee': '☕',
      'tea': '🍵',
      'default': '📦'
    }
    
    const name = categoryName.toLowerCase()
    for (const [key, icon] of Object.entries(icons)) {
      if (name.includes(key)) return icon
    }
    return icons.default
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Browse Categories</h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover our wide range of premium kitchen appliances and dining essentials, 
              organized for your convenience.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Quality Products</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Wide Selection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Search and Controls */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-4 py-3 transition-all duration-200',
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-4 py-3 transition-all duration-200',
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-6">
                <p className="text-gray-600">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} found
                </p>
              </div>
            </div>

            {/* Categories Display */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-20">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No categories found</h3>
                <p className="text-gray-600 mb-8">Try adjusting your search criteria or browse all categories</p>
                <Button onClick={() => setSearchQuery('')} variant="primary">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                  : 'space-y-4'
              )}>
                {filteredCategories.map((category) => {
                  const categoryIcon = getCategoryIcon(category.name)
                  
                  if (viewMode === 'list') {
                    return (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.id}`}
                        className="block"
                      >
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                                {categoryIcon}
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                                {category.description && (
                                  <p className="text-gray-600 mb-2">{category.description}</p>
                                )}
                                <p className="text-sm text-blue-600 font-medium">
                                  {category.productCount || 0} products
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      </Link>
                    )
                  }

                  // Grid view
                  return (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="block group"
                    >
                      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                        
                        {/* Category Image/Icon */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {categoryIcon}
                            </div>
                          )}
                          
                          {/* Product count badge */}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            {category.productCount || 0} items
                          </div>
                        </div>

                        {/* Category Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-medium text-sm">
                              Browse Products
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Categories
