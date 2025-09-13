import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlayIcon,
  Package,
  ChefHat,
  Coffee,
  Utensils,
  Home as HomeIcon
} from 'lucide-react'
import { productsApi } from '../lib/api'
import { categoriesCache } from '../lib/categoriesCache'
import { parseProductImage } from '../lib/utils'
import ProductCard from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import type { Product, Category } from '../types'
import Slide1 from '../assets/photo_5800847259238256447_y.jpg'
import Slide2 from '../assets/photo_5800847259238256568_y.jpg'
import Slide3 from '../assets/photo_5987733685857799978_x.jpg'
import Slide4 from '../assets/photo_6039807656060896978_y.jpg'
import Slide5 from '../assets/photo_5989844619334110150_x.jpg'
import Slide6 from '../assets/photo_6001549706590801306_x.jpg'

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Slider state and data
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  const sliderData = [
    {
      id: 1,
      image: Slide1,
      title: 'Premium Cookware Collection',
      subtitle: 'Professional Grade Kitchen Essentials',
      description: 'Elevate your culinary experience with our premium non-stick cookware set. Featuring durable ceramic coating, ergonomic handles, and elegant design perfect for modern kitchens.',
      cta: 'Shop Cookware',
      ctaLink: '/products?category=kitchen',
      overlay: 'from-black/70 via-black/50 to-black/20'
    },
    {
      id: 2,
      image: Slide2,
      title: 'Travel in Style',
      subtitle: 'Premium Travel & Storage Solutions',
      description: 'Discover our vibrant collection of foldable travel bags and organizers. Available in multiple colors with spacious compartments for all your travel and storage needs.',
      cta: 'Explore Collection',
      ctaLink: '/products?category=travel',
      overlay: 'from-blue-900/70 via-blue-800/50 to-blue-600/20'
    },
    {
      id: 3,
      image: Slide3,
      title: 'Organize Your Space',
      subtitle: 'Smart Storage & Organization',
      description: 'Transform your home with our innovative closet organizers and storage solutions. Create the perfect organized space with our stylish and functional storage systems.',
      cta: 'Get Organized',
      ctaLink: '/products?category=storage',
      overlay: 'from-purple-900/70 via-purple-800/50 to-purple-600/20'
    },
    {
      id: 4,
      image: Slide4,
      title: 'Kitchen Innovation',
      subtitle: 'Modern Kitchen Accessories',
      description: 'Upgrade your kitchen with our space-saving dish drying racks and modern accessories. Designed for efficiency, style, and everyday convenience in your kitchen.',
      cta: 'Shop Kitchen',
      ctaLink: '/products?category=kitchen-accessories',
      overlay: 'from-green-900/70 via-green-800/50 to-green-600/20'
    },
    {
      id: 5,
      image: Slide5,
      title: 'Luxury Living',
      subtitle: 'Premium Furniture & Decor',
      description: 'Create your dream space with our curated collection of luxury marble side tables and premium furniture. Timeless design meets modern functionality for sophisticated living.',
      cta: 'Discover More',
      ctaLink: '/products?category=furniture',
      overlay: 'from-amber-900/70 via-amber-800/50 to-amber-600/20'
    },
    {
      id: 6,
      image: Slide6,
      title: 'Bathroom Essentials',
      subtitle: 'Smart Bathroom Organization',
      description: 'Maximize your bathroom space with our wall-mounted storage organizers and accessories. Perfect for keeping your bathroom tidy and stylishly organized.',
      cta: 'Shop Bathroom',
      ctaLink: '/products?category=bathroom',
      overlay: 'from-teal-900/70 via-teal-800/50 to-teal-600/20'
    }
  ]

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true)
        
        // Load featured products
        const featuredResponse: any = await productsApi.getAll({
          page: 1,
          limit: 8,
          featured: true
        })
        
        // Handle different response formats and process images
        let featuredData = []
        if (featuredResponse && featuredResponse.success && featuredResponse.data) {
          featuredData = featuredResponse.data.items || featuredResponse.data
        } else if (featuredResponse && featuredResponse.products) {
          featuredData = featuredResponse.products
        } else if (Array.isArray(featuredResponse)) {
          featuredData = featuredResponse
        }
        
        // Process images
        const processedFeatured = featuredData.map((product: any) => {
          let images = []
          if (product.images && Array.isArray(product.images)) {
            images = product.images.map((img: any) => parseProductImage(img))
          }
          
          return {
            ...product,
            images: images.length > 0 ? images : ['/api/placeholder/400/400'],
            price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
            stock: product.stock || product.stockQuantity || 0,
            category: product.category || { id: '', name: 'Uncategorized', slug: 'uncategorized' },
            averageRating: product.averageRating || 0,
            reviewCount: product.reviewCount || 0
          }
        })
        
        setFeaturedProducts(processedFeatured)

        // Load new arrivals
        const newArrivalsResponse: any = await productsApi.getAll({
          page: 1,
          limit: 8,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        // Handle different response formats and process images
        let newArrivalsData = []
        if (newArrivalsResponse && newArrivalsResponse.success && newArrivalsResponse.data) {
          newArrivalsData = newArrivalsResponse.data.items || newArrivalsResponse.data
        } else if (newArrivalsResponse && newArrivalsResponse.products) {
          newArrivalsData = newArrivalsResponse.products
        } else if (Array.isArray(newArrivalsResponse)) {
          newArrivalsData = newArrivalsResponse
        }
        
        // Process images for new arrivals
        const processedNewArrivals = newArrivalsData.map((product: any) => {
          let images = []
          if (product.images && Array.isArray(product.images)) {
            images = product.images.map((img: any) => parseProductImage(img))
          }
          
          return {
            ...product,
            images: images.length > 0 ? images : ['/api/placeholder/400/400'],
            price: typeof product.price === 'string' ? product.price : product.price?.toString() || '0',
            stock: product.stock || product.stockQuantity || 0,
            category: product.category || { id: '', name: 'Uncategorized', slug: 'uncategorized' },
            averageRating: product.averageRating || 0,
            reviewCount: product.reviewCount || 0
          }
        })
        
        setNewArrivals(processedNewArrivals)

        // Load categories with their existing product counts
        await new Promise(resolve => setTimeout(resolve, Math.random() * 300)) // Small delay
        const allCategories = await categoriesCache.getCategories()
        
        if (Array.isArray(allCategories)) {
          // Take the first 6 categories for home page display
          // Use the productCount that comes from the categories API
          const categoriesWithCounts = allCategories.slice(0, 6).map(category => ({
            ...category,
            productCount: category.productCount || 0
          }))
          setCategories(categoriesWithCounts)
        }

      } catch (error) {
        console.error('Failed to load home data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHomeData()
  }, [])

  // Auto-play slider effect
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [currentSlide, isAutoPlaying, sliderData.length])

  // Slider navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Hero Slider Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="relative w-full h-full">
          {/* Slider Images */}
          {sliderData.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
              </div>
            </div>
          ))}

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center z-10">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                {sliderData.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`transition-all duration-1000 ease-in-out ${
                      index === currentSlide
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-8'
                    }`}
                    style={{
                      display: index === currentSlide ? 'block' : 'none'
                    }}
                  >
                    <div className="text-white space-y-6">
                      <div className="space-y-2">
                        <p className="text-lg md:text-xl font-medium text-white/90 tracking-wide">
                          {slide.subtitle}
                        </p>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                          {slide.title}
                        </h1>
                      </div>
                      
                      <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                        {slide.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button
                          asChild
                          size="lg"
                          className="bg-white text-gray-900 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <Link to={slide.ctaLink}>
                            {slide.cta}
                            <ArrowRightIcon className="ml-2 w-5 h-5" />
                          </Link>
                        </Button>
                        
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                        >
                          <Link to="/products">
                            View All Products
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
          >
            <ChevronLeftIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 group"
          >
            <ChevronRightIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {sliderData.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="absolute top-8 right-8 z-20 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
          >
            <PlayIcon className={`w-5 h-5 transition-transform ${isAutoPlaying ? 'rotate-0' : 'rotate-90'}`} />
          </button>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      {/* {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our carefully curated categories designed to meet all your kitchen and dining needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                // Smart icon mapping for categories
                const getCategoryIcon = (name: string) => {
                  const categoryName = name.toLowerCase()
                  if (categoryName.includes('cook') || categoryName.includes('kitchen')) return ChefHat
                  if (categoryName.includes('coffee') || categoryName.includes('tea')) return Coffee
                  if (categoryName.includes('dining') || categoryName.includes('utensil')) return Utensils
                  if (categoryName.includes('home') || categoryName.includes('decor')) return HomeIcon
                  return Package
                }

                const getCategoryColor = (index: number) => {
                  const colors = [
                    'from-red-500 to-orange-500',
                    'from-blue-500 to-purple-500', 
                    'from-green-500 to-teal-500',
                    'from-purple-500 to-pink-500',
                    'from-yellow-500 to-orange-500',
                    'from-indigo-500 to-purple-500'
                  ]
                  return colors[index % colors.length]
                }

                const IconComponent = getCategoryIcon(category.name)
                const colorClass = getCategoryColor(index)

                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative p-6 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{category.description || 'Discover our premium collection'}</p>
                      <p className="text-sm text-purple-600 font-medium">{category.productCount || 0} products</p>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 mx-auto mt-4 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 hover:scale-105 transition-all duration-300"
              >
                <Link to="/categories">
                  View All Categories
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )} */}

      {/* Enhanced Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our hand-picked selection of premium products that define quality and style
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group">
                  <ProductCard
                    product={product}
                    variant="featured"
                    className="transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-2xl"
                  />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                asChild 
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105"
              >
                <Link to="/products?featured=true">
                  View All Featured
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-x-32 -translate-y-32 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-100 to-yellow-100 rounded-full translate-x-48 translate-y-48 opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                New Arrivals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Be the first to discover our latest collection of trending products and exclusive items
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <ProductCard
                    product={product}
                    className="transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-2xl animate-fade-in-up"
                  />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Link to="/products?sort=newest">
                  View All New Arrivals
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
