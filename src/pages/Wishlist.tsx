import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Package, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  Loader2,
  Star,
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useCart, useAuth } from '../hooks'
import { wishlistApi } from '../services'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number
    image?: string
    category?: {
      id: string
      name: string
    }
    stockQuantity: number
    averageRating?: number
    reviewCount?: number
  }
  addedAt: string
}

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    setLoading(true)
    try {
      const response = await wishlistApi.getItems({
        page: 1,
        limit: 50 // Get all wishlist items
      })
      
      if (response.success) {
        setWishlistItems(response.data.items)
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist items')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId))
    
    try {
      const response = await wishlistApi.removeItem(itemId)
      
      if (response.success) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== itemId))
        toast.success('Item removed from wishlist')
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
      toast.error('Failed to remove item from wishlist')
    } finally {
      setRemovingItems(prev => {
        const updated = new Set(prev)
        updated.delete(itemId)
        return updated
      })
    }
  }

  const handleAddToCart = async (product: WishlistItem['product']) => {
    try {
      addToCart(product, 1)
      toast.success('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const handleAddAllToCart = async () => {
    try {
      const inStockItems = wishlistItems.filter(item => item.product.stockQuantity > 0)
      
      if (inStockItems.length === 0) {
        toast.error('No items in stock to add to cart')
        return
      }

      for (const item of inStockItems) {
        addToCart(item.product, 1)
      }
      
      toast.success(`Added ${inStockItems.length} items to cart!`)
    } catch (error) {
      console.error('Error adding all to cart:', error)
      toast.error('Failed to add items to cart')
    }
  }

  const totalValue = wishlistItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price
    return sum + price
  }, 0)

  const inStockCount = wishlistItems.filter(item => item.product.stockQuantity > 0).length

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
          <Link 
            to="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/products" 
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Total estimated value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      {wishlistItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">{wishlistItems.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-lg font-semibold text-green-600">{inStockCount}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-lg font-semibold text-red-600">{wishlistItems.length - inStockCount}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleAddAllToCart}
                disabled={inStockCount === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Cart ({inStockCount})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product
            const finalPrice = product.discountPrice || product.price
            const hasDiscount = product.discountPrice && product.discountPrice < product.price
            const isOutOfStock = product.stockQuantity === 0
            const isRemoving = removingItems.has(product.id)

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(product.id)}
                  disabled={isRemoving}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-colors shadow-sm"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.image || '/api/placeholder/300/300'}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/api/placeholder/300/300'
                      }}
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    {hasDiscount && (
                      <Badge variant="error" size="sm">
                        {Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
                      </Badge>
                    )}
                    {isOutOfStock && (
                      <Badge variant="default" size="sm">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <div className="mb-2">
                    {product.category && (
                      <Link 
                        to={`/products?category=${product.category.id}`}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {product.category.name}
                      </Link>
                    )}
                  </div>
                  
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  {product.averageRating && product.reviewCount ? (
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.averageRating!)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        ({product.reviewCount})
                      </span>
                    </div>
                  ) : (
                    <div className="h-4 mb-3"></div> // Spacer for alignment
                  )}

                  {/* Price */}
                  <div className="mb-4">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>

                  {/* Added Date */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Continue Shopping */}
      {wishlistItems.length > 0 && (
        <div className="mt-12 text-center">
          <Link 
            to="/products"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Recommendations */}
      {wishlistItems.length > 0 && (
        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 text-center border border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Love your wishlist? Share it with friends!
            </h3>
            <p className="text-gray-600 mb-6">
              Let others know what you're hoping to get or create a gift guide for special occasions.
            </p>
            <Button variant="outline">
              Share Wishlist
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist
