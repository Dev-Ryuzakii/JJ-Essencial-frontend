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
      console.log('Calling categoriesApi.getAll()...')
      const response = await categoriesApi.getAll()
      console.log('Categories API response:', response) // Debug log
      console.log('Response type:', typeof response)
      console.log('Response keys:', response ? Object.keys(response) : 'null/undefined')
      
      // Check if response exists and has success property and data
      if (response && response.success && Array.isArray(response.data)) {
        console.log('Processing', response.data.length, 'categories')
        // Transform categories and add mock stats for demo
        const categoriesWithStats: CategoryWithStats[] = response.data.map((category: Category) => ({
          ...category,
          productCount: Math.floor(Math.random() * 50) + 10, // Mock product count
          featuredProducts: [
            {
              id: '1',
              name: 'Featured Product 1',
              price: Math.floor(Math.random() * 50000) + 10000,
              image: '/api/placeholder/200/200'
            },
            {
              id: '2',
              name: 'Featured Product 2',
              price: Math.floor(Math.random() * 50000) + 10000,
              image: '/api/placeholder/200/200'
            }
          ]
        }))
        setCategories(categoriesWithStats)
      } else {
        console.error('Invalid response format:', response)
        toast.error('Failed to load categories')
        
        // Fallback: Show some dummy categories for testing
        const dummyCategories: CategoryWithStats[] = [
          {
            id: '1',
            name: 'Kitchen Appliances',
            slug: 'kitchen-appliances',
            description: 'Essential kitchen equipment',
            productCount: 15,
            createdAt: new Date().toISOString(),
            updatesdAt: new Date().toISOString(),
            isFeatured: true,
            imageUrl: '/api/placeholder/400/300',
            featuredProducts: [
              { id: '1', name: 'Air Fryer', price: 45000, image: '/api/placeholder/200/200' },
              { id: '2', name: 'Blender', price: 35000, image: '/api/placeholder/200/200' }
            ]
          }
        ]
        setCategories(dummyCategories)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
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
          return b.productCount - a.productCount
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

      {/* All Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h2>
                <p className="text-gray-600">
                  Browse all {filteredCategories.length} categories
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-64"
                  />
                </div>

                {/* Sort */}
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="products">Sort by Product Count</option>
                  <option value="featured">Sort by Featured</option>
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

            {/* Categories Grid/List */}
            {filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-6'
              )}>
                {filteredCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name)
                  
                  if (viewMode === 'list') {
                    return (
                      <div key={category.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                                {category.isFeatured && (
                                  <Badge variant="primary" size="sm">Featured</Badge>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">{category.description}</p>
                              <p className="text-sm text-gray-500">{category.productCount} products</p>
                            </div>
                          </div>
                          <Button asChild variant="outline">
                            <Link to={`/products?category=${category.id}`}>
                              View Products
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={category.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      {/* Category Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <IconComponent className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        )}
                        
                        {category.isFeatured && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="primary">Featured</Badge>
                          </div>
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">{category.productCount} products</span>
                          <span className="text-sm text-purple-600 font-medium">View all →</span>
                        </div>

                        {/* Featured Products Preview */}
                        {category.featuredProducts && category.featuredProducts.length > 0 && (
                          <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">Featured Products</p>
                            <div className="flex space-x-3">
                              {category.featuredProducts.slice(0, 2).map((product) => (
                                <div key={product.id} className="flex-1">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-16 object-cover rounded-lg mb-2"
                                  />
                                  <p className="text-xs text-gray-600 truncate">{product.name}</p>
                                  <p className="text-xs font-medium text-gray-900">{formatCurrency(product.price)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link
                          to={`/products?category=${category.id}`}
                          className="block w-full mt-4"
                        >
                          <Button variant="outline" className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                            Browse Category
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Our team is here to help you find the perfect products for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="text-purple-600 bg-white hover:bg-gray-100" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-purple-600" asChild>
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Categories
