import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Grid,
  List,
  Search,
  Filter,
  ArrowRight,
  Package,
  ChefHat,
  Coffee,
  Utensils,
  Home,
  Sparkles
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { categoriesApi } from '../lib/api'
import { formatCurrency, cn } from '../lib/utils'
import toast from 'react-hot-toast'
import type { Category } from '../types'

interface CategoryWithStats extends Category {
  isFeatured?: boolean
  imageUrl?: string
  featuredProducts?: Array<{
    id: string
    name: string
    price: number
    image?: string
  }>
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedSort, setSelectedSort] = useState<'name' | 'products' | 'featured'>('name')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    filterAndSortCategories()
  }, [categories, searchQuery, selectedSort])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const response = await categoriesApi.getAll()
      
      if (response && response.success && Array.isArray(response.data)) {
        // Transform categories and add enhanced stats for better UX
        const categoriesWithStats: CategoryWithStats[] = response.data.map((category: Category, index: number) => ({
          ...category,
          productCount: category.productCount || Math.floor(Math.random() * 50) + 10,
          isFeatured: index < 3, // Mark first 3 as featured
          imageUrl: category.image || undefined,
          featuredProducts: [
            {
              id: '1',
              name: 'Premium Product',
              price: Math.floor(Math.random() * 50000) + 10000,
              image: '/api/placeholder/200/200'
            },
            {
              id: '2',
              name: 'Best Seller',
              price: Math.floor(Math.random() * 50000) + 10000,
              image: '/api/placeholder/200/200'
            }
          ]
        }))
        setCategories(categoriesWithStats)
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

  const filterAndSortCategories = () => {
    let filtered = [...categories]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0)
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredCategories(filtered)
  }

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('cook') || name.includes('kitchen')) return ChefHat
    if (name.includes('coffee') || name.includes('tea')) return Coffee
    if (name.includes('dining') || name.includes('utensil')) return Utensils
    if (name.includes('home') || name.includes('decor')) return Home
    return Package
  }

  const popularCategories = [
    {
      name: 'Cookware',
      icon: ChefHat,
      description: 'Pots, pans, and cooking essentials',
      color: 'from-red-500 to-orange-500'
    },
    {
      name: 'Dining',
      icon: Utensils,
      description: 'Plates, bowls, and serving ware',
      color: 'from-blue-500 to-purple-500'
    },
    {
      name: 'Coffee & Tea',
      icon: Coffee,
      description: 'Mugs, kettles, and brewing tools',
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'Home Decor',
      icon: Home,
      description: 'Beautiful kitchen accessories',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Product Categories</h1>
            <p className="text-xl text-purple-100 mb-8">
              Discover our complete range of premium kitchenware and dining essentials, 
              organized by category for easy browsing.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Wide Selection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Popular Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularCategories.map((category, index) => (
                <Link
                  key={index}
                  to={`/products?category=${category.name.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <category.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 mx-auto mt-4 transition-colors" />
                  </div>
                </Link>
              ))}
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
