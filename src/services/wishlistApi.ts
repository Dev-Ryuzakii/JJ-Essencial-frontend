import { get, post, del } from './apiClient'
import type { PaginatedResponse } from './apiClient'

// Wishlist item structure
export interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: string
    discountPrice?: string
    images: string[]
    stock: number
    rating: number
    reviewCount: number
    category: {
      id: string
      name: string
      slug: string
    }
  }
  createdAt: string
}

// Add to wishlist request
export interface AddToWishlistData {
  productId: string
}

const wishlistApi = {
  /**
   * Get user wishlist
   * GET /api/v1/wishlist
   */
  getWishlist: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<WishlistItem>> => {
    const response = await get<PaginatedResponse<WishlistItem>>('/wishlist', {
      params: { page, limit }
    })
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to get wishlist')
    }
  },

  /**
   * Add item to wishlist
   * POST /api/v1/wishlist/items
   */
  addItem: async (data: AddToWishlistData): Promise<WishlistItem> => {
    const response = await post<WishlistItem>('/wishlist/items', data)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to add item to wishlist')
    }
  },

  /**
   * Remove item from wishlist
   * DELETE /api/v1/wishlist/items/:productId
   */
  removeItem: async (productId: string): Promise<void> => {
    const response = await del<null>(`/wishlist/items/${productId}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove item from wishlist')
    }
  },

  /**
   * Check if product is in wishlist
   * GET /api/v1/wishlist/check/:productId
   */
  checkItem: async (productId: string): Promise<{ inWishlist: boolean }> => {
    const response = await get<{ inWishlist: boolean }>(`/wishlist/check/${productId}`)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to check wishlist')
    }
  }
}

export default wishlistApi
