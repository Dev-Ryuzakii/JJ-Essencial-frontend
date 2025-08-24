import React, { useState, useEffect } from 'react'
import { useWishlist } from '../hooks/useWishlist'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { Heart, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { getImageUrl } from '../lib/utils' // Import the image URL utility
import { Link } from 'react-router-dom'
import { analyzeImageValue, extractDirectImageUrl } from '../utils/debugImage'

/**
 * A debug component for testing wishlist functionality
 * This component is only available in development mode
 */
const WishlistTest: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const { 
    items, 
    isLoading, 
    error, 
    fetchWishlist, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useWishlist()
  
  const [testProductId, setTestProductId] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const handleAddToWishlist = async () => {
    if (!testProductId) return
    
    setIsAdding(true)
    try {
      await addToWishlist(testProductId)
    } catch (error) {
      console.error('Test add to wishlist failed:', error)
    } finally {
      setIsAdding(false)
    }
  }
  
  const handleRemoveFromWishlist = async () => {
    if (!testProductId) return
    
    setIsRemoving(true)
    try {
      await removeFromWishlist(testProductId)
    } catch (error) {
      console.error('Test remove from wishlist failed:', error)
    } finally {
      setIsRemoving(false)
    }
  }
  
  // Get first product ID from items if available
  const getFirstProductId = () => {
    if (items && Array.isArray(items) && items.length > 0 && items[0]?.product?.id) {
      return items[0].product.id
    }
    return ''
  }
  
  // Add useEffect to log image URLs when items change
  useEffect(() => {
    if (items && Array.isArray(items) && items.length > 0) {
      console.log('Wishlist items found:', items.length);
      
      // Check each item for images
      items.forEach((item, index) => {
        if (item.product && item.product.images) {
          console.log(`Item ${index + 1} (${item.product.name}) images:`, item.product.images);
          
          if (item.product.images.length > 0) {
            // Use our image analysis utility
            const firstImage = item.product.images[0];
            analyzeImageValue(firstImage, `${item.product.name} first image`);
            
            // Extract direct URL
            const directUrl = extractDirectImageUrl(firstImage);
            if (directUrl) {
              console.log(`Direct URL for ${item.product.name}:`, directUrl);
            } else {
              console.warn(`Could not extract direct URL for ${item.product.name}`);
            }
          } else {
            console.log('  No images in array');
          }
        } else {
          console.log(`Item ${index + 1} has no product or images property`);
        }
      });
    } else {
      console.log('No wishlist items found or items is not an array:', items);
    }
  }, [items]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-500" />
          Wishlist Test Component
        </h1>
        
        {!isAuthenticated ? (
          <div className="bg-yellow-50 p-4 rounded-md flex items-start mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-700">Not logged in</p>
              <p className="text-yellow-600 text-sm">You need to log in to test wishlist functionality</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-md flex items-start mb-6">
            <Heart className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-green-700">Logged in as {user?.email || 'User'}</p>
              <p className="text-green-600 text-sm">You can test wishlist functionality</p>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current Wishlist Status</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><strong>Items:</strong> {items && Array.isArray(items) ? items.length : 'Not an array'}</p>
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => fetchWishlist()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Wishlist
            </Button>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                const firstId = getFirstProductId()
                if (firstId) {
                  setTestProductId(firstId)
                }
              }}
              disabled={!(items && Array.isArray(items) && items.length > 0)}
            >
              Use First Item ID
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Product ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testProductId}
              onChange={e => setTestProductId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter product ID to test"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a product ID to test adding/removing from wishlist
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Button 
            onClick={handleAddToWishlist}
            disabled={!testProductId || isAdding || !isAuthenticated}
            className="w-full"
          >
            {isAdding ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRemoveFromWishlist}
            disabled={!testProductId || isRemoving || !isAuthenticated}
            className="w-full"
          >
            {isRemoving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2 text-red-500 fill-current" />
                Remove from Wishlist
              </>
            )}
          </Button>
        </div>
        
        {testProductId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
            <p>
              <strong>In Wishlist:</strong>{' '}
              {isInWishlist(testProductId) ? (
                <span className="text-green-600 font-medium">Yes</span>
              ) : (
                <span className="text-gray-600">No</span>
              )}
            </p>
          </div>
        )}
        
        {items && Array.isArray(items) && items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Current Wishlist Items</h2>
            
            {/* Item images preview */}
            <div className="mb-4 flex flex-wrap gap-2">
              {items.map((item, index) => (
                item.product && item.product.images && item.product.images.length > 0 ? (
                  <div key={index} className="relative w-20 h-20 border border-gray-200 rounded overflow-hidden">
                    <img 
                      src={getImageUrl(item.product.images[0])} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                        console.log(`Image failed to load: ${item.product.images[0]}`);
                      }} 
                    />
                  </div>
                ) : (
                  <div key={index} className="relative w-20 h-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )
              ))}
            </div>
            
            {/* Item data */}
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(items, null, 2)}</pre>
            </div>
            
            {/* Image URLs */}
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Image URLs</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <ul className="text-xs space-y-2">
                  {items.map((item, index) => (
                    <li key={index}>
                      <strong>{item.product.name}:</strong>{' '}
                      {item.product.images && item.product.images.length > 0 ? (
                        <>
                          <span className="text-green-600">Has image</span>
                          <span className="block text-gray-500 break-all">
                            Raw URL: {item.product.images[0]}
                          </span>
                          <span className="block text-gray-500 break-all">
                            Processed URL: {getImageUrl(item.product.images[0])}
                          </span>
                          <span className="block text-gray-500 break-all">
                            Direct URL: {extractDirectImageUrl(item.product.images[0]) || 'Could not extract'}
                          </span>
                          <div className="mt-1">
                            <Link 
                              to={`/image-test/${encodeURIComponent(item.product.images[0])}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Test this image
                            </Link>
                          </div>
                        </>
                      ) : (
                        <span className="text-red-500">No images</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default WishlistTest
