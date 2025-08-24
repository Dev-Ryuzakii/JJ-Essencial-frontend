import { useEffect, useCallback } from 'react'
import { useWishlistStore } from '../store'
import toast from 'react-hot-toast'
import { useAuth } from './useAuth'

export const useWishlist = () => {
  const {
    items,
    isLoading,
    error,
    fetchWishlist: fetchWishlistStore,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  } = useWishlistStore()
  
  const { isAuthenticated } = useAuth()

  // Wrapper for fetchWishlist that checks authentication
  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      console.log('Fetching wishlist...')
      try {
        await fetchWishlistStore()
        console.log('Wishlist fetched successfully')
      } catch (error) {
        console.error('Error in useWishlist.fetchWishlist:', error)
        toast.error('Failed to fetch wishlist')
      }
    } else {
      console.log('Not fetching wishlist - user not authenticated')
    }
  }, [isAuthenticated, fetchWishlistStore])

  // Fetch wishlist on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  /**
   * Add a product to the wishlist
   * @param productId The ID of the product to add
   */
  const addToWishlistWithToast = async (productId: string) => {
    if (isInWishlist(productId)) {
      toast.success('Item is already in your wishlist')
      return true
    }
    
    const success = await addToWishlist(productId)
    if (success) {
      toast.success('Item added to wishlist')
      // Force refetch wishlist to ensure UI is updated
      await fetchWishlist()
    } else {
      toast.error(error || 'Failed to add item to wishlist')
    }
    return success
  }

  /**
   * Remove a product from the wishlist
   * @param productId The ID of the product to remove
   */
  const removeFromWishlistWithToast = async (productId: string) => {
    const success = await removeFromWishlist(productId)
    if (success) {
      toast.success('Item removed from wishlist')
    } else {
      toast.error(error || 'Failed to remove item from wishlist')
    }
    return success
  }

  /**
   * Toggle a product in the wishlist (add if not in wishlist, remove if in wishlist)
   * @param productId The ID of the product to toggle
   */
  const toggleWishlistItem = async (productId: string) => {
    if (isInWishlist(productId)) {
      return removeFromWishlistWithToast(productId)
    } else {
      return addToWishlistWithToast(productId)
    }
  }

  /**
   * Clear the entire wishlist
   */
  const clearWishlistWithToast = () => {
    clearWishlist()
    toast.success('Wishlist cleared')
  }

  return {
    // Data
    items,
    isLoading,
    error,
    wishlistCount: items && Array.isArray(items) ? items.length : 0,
    hasItems: items && Array.isArray(items) && items.length > 0,
    
    // Actions
    fetchWishlist,
    addToWishlist: addToWishlistWithToast,
    removeFromWishlist: removeFromWishlistWithToast,
    toggleWishlistItem,
    clearWishlist: clearWishlistWithToast,
    
    // Selectors
    isInWishlist
  }
}
