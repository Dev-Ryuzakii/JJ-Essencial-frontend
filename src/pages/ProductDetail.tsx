import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  User,
  Calendar,
  Award,
  Package,
  Check,
  X,
  Info
} from 'lucide-react'
import { useCart, useAuth } from '../hooks'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import ProductCard from '../components/product/ProductCard'
import { formatCurrency, cn } from '../lib/utils'
import { productsApi, reviewsApi } from '../lib/api'
import toast from 'react-hot-toast'
import type { Product, Review } from '../types'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')
  const [isInWishlist, setIsInWishlist] = useState(false)

  useEffect(() => {
    if (id) {
      loadProductData(id)
    }
  }, [id])

  const loadProductData = async (productId: string) => {
    setIsLoading(true)
    try {
      // Load product details
      const productResponse = await productsApi.getById(productId)
      if (productResponse.success) {
        // Process images similar to Products page
        let processedProduct = { ...productResponse.data }
        
        if (processedProduct.images && Array.isArray(processedProduct.images)) {
          processedProduct.images = processedProduct.images.map((img: any) => {
            if (typeof img === 'string') {
              try {
                const parsed = JSON.parse(img)
                return parsed.url || img
              } catch {
                return img
              }
            }
            return img.url || img
          })
        } else {
          processedProduct.images = ['/api/placeholder/600/600']
        }
        
        setProduct(processedProduct)
        setIsInWishlist(processedProduct.isInWishlist || false)
      }

      // Load reviews (separate try-catch to not break product loading)
      try {
        const reviewsResponse = await reviewsApi.getByProduct(productId)
        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data)
        }
      } catch (reviewError) {
        console.warn('Failed to load reviews:', reviewError)
        // Continue without reviews - this is not critical
      }

      // Load related products
      if (productResponse.success && productResponse.data.category) {
        const relatedResponse = await productsApi.getAll({
          categoryId: productResponse.data.category.id,
          limit: 4,
          excludeId: productId
        })
        if (relatedResponse.success) {
          setRelatedProducts(relatedResponse.data.products)
        }
      }
    } catch (error) {
      console.error('Failed to load product data:', error)
      toast.error('Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsAddingToCart(true)
    try {
      addToCart(product, quantity)
      toast.success('Added to cart!')
    } catch (error) {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    
    try {
      if (isInWishlist) {
        // await wishlistApi.remove(product!.id)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        // await wishlistApi.add(product!.id)
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: url
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const previousImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const finalPrice = (typeof product.discountPrice === 'number' && product.discountPrice > 0) ? product.discountPrice : (product.price || 0)
  const productPrice = product.price || 0
  const hasDiscount = (typeof product.discountPrice === 'number' && product.discountPrice > 0) && product.discountPrice < productPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((productPrice - product.discountPrice!) / productPrice) * 100)
    : 0
  
  // Ensure stockQuantity is a valid number
  const stockQuantity = typeof product.stockQuantity === 'number' && !isNaN(product.stockQuantity) 
    ? product.stockQuantity 
    : (product.stockQuantity === undefined ? 999 : 0) // Default to 999 if undefined, 0 if explicitly set to invalid value
  const isOutOfStock = stockQuantity === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link 
              to={`/products?category=${product.category.id}`}
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.images.length > 0 ? (
              <>
                <img
                  src={
                    typeof product.images[currentImageIndex] === 'string' 
                      ? product.images[currentImageIndex]
                      : (product.images[currentImageIndex] as any)?.url || '/api/placeholder/600/600'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {hasDiscount && (
                    <Badge variant="error" size="sm">
                      -{discountPercentage}%
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="primary" size="sm">
                      Featured
                    </Badge>
                  )}
                  {isOutOfStock && (
                    <Badge variant="gray" size="sm">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    currentImageIndex === index 
                      ? 'border-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <img
                    src={
                      typeof image === 'string' 
                        ? image 
                        : (image as any)?.url || '/api/placeholder/80/80'
                    }
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            {product.category && (
              <Link 
                to={`/products?category=${product.category.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-5 h-5',
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-sm text-green-600">
                You save {formatCurrency(productPrice - finalPrice)} ({discountPercentage}% off)
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <Badge variant="error" size="md">
                Out of Stock
              </Badge>
            ) : stockQuantity <= 5 ? (
              <Badge variant="warning" size="md">
                Only {stockQuantity} left in stock
              </Badge>
            ) : (
              <Badge variant="success" size="md">
                In Stock
              </Badge>
            )}
          </div>

          {/* Quick Description */}
          <div>
            <p className="text-gray-600 leading-relaxed">
              {showFullDescription 
                ? product.description 
                : `${product.description.slice(0, 200)}${product.description.length > 200 ? '...' : ''}`
              }
            </p>
            {product.description.length > 200 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
              >
                {showFullDescription ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition-colors"
                  disabled={quantity >= stockQuantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlistToggle}
                className={cn(
                  'px-4',
                  isInWishlist && 'text-red-600 border-red-600 hover:bg-red-50'
                )}
              >
                <Heart className={cn('w-5 h-5', isInWishlist && 'fill-current')} />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="px-4"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Free Shipping</p>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">30-Day Returns</p>
                <p className="text-sm text-gray-600">Easy returns</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Warranty</p>
                <p className="text-sm text-gray-600">1-year warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex space-x-8 border-b border-gray-200">
          {[
            { key: 'description', label: 'Description' },
            { key: 'reviews', label: `Reviews (${reviews.length})` },
            { key: 'shipping', label: 'Shipping & Returns' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
              
              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{review.user.fullName}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'w-4 h-4',
                                      i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        
                        {/* Review Actions */}
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({review.helpfulCount || 0})</span>
                          </button>
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                            <Flag className="w-4 h-4" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Be the first to review this product</p>
                </div>
              )}
              
              {isAuthenticated && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button variant="outline">
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Free Standard Shipping</p>
                      <p className="text-sm text-gray-600">5-7 business days on orders over ₦50</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Express Shipping</p>
                      <p className="text-sm text-gray-600">2-3 business days for ₦15.99</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Overnight Shipping</p>
                      <p className="text-sm text-gray-600">Next business day for ₦29.99</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Returns & Exchanges</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">30-Day Returns</p>
                      <p className="text-sm text-gray-600">Return within 30 days for a full refund</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Free Return Shipping</p>
                      <p className="text-sm text-gray-600">We'll email you a prepaid return label</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Return Policy</p>
                      <p className="text-sm text-gray-600">Items must be in original condition and packaging</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
