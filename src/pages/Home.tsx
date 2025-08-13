import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from 'lucide-react'
import { useProducts } from '../hooks'
import { productsApi, categoriesApi } from '../lib/api'
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
        const featuredResponse = await productsApi.getAll({
          page: 1,
          limit: 8,
          featured: true
        })
        
        if (featuredResponse.success) {
          setFeaturedProducts(featuredResponse.data.products)
        }

        // Load new arrivals
        const newArrivalsResponse = await productsApi.getAll({
          page: 1,
          limit: 8,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        if (newArrivalsResponse.success) {
          setNewArrivals(newArrivalsResponse.data.products)
        }

        // Load categories
        const categoriesResponse = await categoriesApi.getAll()
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data.slice(0, 6))
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
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore our carefully curated categories designed to meet all your lifestyle needs
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group text-center"
                >
                  <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4 overflow-hidden group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                        <span className="text-3xl font-bold text-white">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                    {category.name}
                  </h3>
                </Link>
              ))}
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
      )}

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
