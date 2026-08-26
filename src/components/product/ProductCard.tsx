import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon, 
  EyeIcon,
  ShareIcon,
  BadgeCheckIcon
} from 'lucide-react'
import { useCart, useAuth } from '../../hooks'
import { cn, formatCurrency, calculateDiscountPercentage, parseProductImage } from '../../lib/utils'
import { wishlistApi } from '../../lib/api'
import toast from 'react-hot-toast'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  className?: string
  variant?: 'default' | 'compact' | 'featured'
  showQuickView?: boolean
  onQuickView?: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  variant = 'default',
  showQuickView = true,
  onQuickView
}) => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(product.isInWishlist || false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const isOutOfStock = (product.stock || product.stockQuantity || 0) === 0
  const isLowStock = (product.stock || product.stockQuantity || 0) > 0 && (product.stock || product.stockQuantity || 0) <= 5
  const hasDiscount = product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.price)
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.price) - parseFloat(product.discountPrice!)) / parseFloat(product.price)) * 100)
    : 0

  const finalPrice = product.discountPrice || product.price

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isOutOfStock) {
      toast.error('Product is out of stock')
      return
    }

    addToCart(product)
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }

    try {
      if (isInWishlist) {
        await wishlistApi.remove(product.id)
        setIsInWishlist(false)
        toast.success('Removed from wishlist')
      } else {
        await wishlistApi.add(product.id)
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to updates wishlist')
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.origin + `/products/${product.id}`
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      const url = window.location.origin + `/products/${product.id}`
      navigator.clipboard.writeText(url)
      toast.success('Product link copied to clipboard!')
    }
  }

  const cardClassName = cn(
    'group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
    'border border-gray-200 hover:border-gray-300',
    {
      'h-auto': variant === 'default',
      'h-64 flex': variant === 'compact',
      'h-auto border-2 border-blue-200 shadow-lg': variant === 'featured'
    },
    className
  )

  if (variant === 'compact') {
    return (
      <div className={cardClassName}>
        <div className="relative w-1/3 flex-shrink-0">
          <Link to={`/products/${product.id}`}>
            {!imageError ? (
              <img
                src={
                  product.images?.[0]?.url || 
                  product.images?.[0] || 
                  '/api/placeholder/150/150'
                }
                alt={product.name}
                className="w-full h-full object-cover rounded-l-lg"
                onLoad={() => setIsImageLoading(false)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-l-lg">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </Link>
          
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <Link to={`/products/${product.id}`}>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < Math.floor(product.averageRating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                'mt-2 w-full py-1 px-3 rounded text-sm font-medium transition-colors',
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClassName}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Link to={`/products/${product.id}`}>
          {!imageError ? (
            <img
              src={parseProductImage(product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Low Stock
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
          {(product.isFeatured || product.featured) && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
              <BadgeCheckIcon className="w-3 h-3" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {import.meta.env.VITE_ENABLE_WISHLIST === 'true' && (
            <button
              onClick={handleWishlistToggle}
              className={cn(
                'p-2 rounded-full shadow-md transition-colors',
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:text-red-500'
              )}
            >
              <HeartIcon className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
            </button>
          )}
          
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="p-2 bg-white text-gray-600 hover:text-blue-500 rounded-full shadow-md transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleShare}
            className="p-2 bg-white text-gray-600 hover:text-green-500 rounded-full shadow-md transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Overlay for out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link 
            to={`/products?category=${product.category.id}`}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {product.category.name}
          </Link>
        )}

        {/* Title */}
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-1 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < Math.floor(product.averageRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(finalPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-orange-600 font-medium">
              Only {product.stock || product.stockQuantity || 0} left
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'mt-3 w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors',
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <ShoppingCartIcon className="w-4 h-4" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  )
}

export default ProductCard
