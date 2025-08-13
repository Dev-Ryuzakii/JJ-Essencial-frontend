import { get, post, put, del } from './apiClient'
import type { ApiResponse } from './apiClient'

// Cart item structure
export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: string
    discountPrice?: string
    images: string[]
    stock: number
  }
  subtotal: string
}

// Cart summary structure
export interface CartSummary {
  itemCount: number
  subtotal: string
  tax: string
  total: string
}

// Cart response structure
export interface CartResponse {
  items: CartItem[]
  summary: CartSummary
}

// Add to cart request
export interface AddToCartData {
  productId: string
  quantity: number
}

// Update cart item request
export interface UpdateCartItemData {
  quantity: number
}

const cartApi = {
  /**
   * Get cart items
   * GET /api/v1/cart
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await get<ApiResponse<CartResponse>>('/cart')
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to get cart')
    }
  },

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  addItem: async (data: AddToCartData): Promise<CartItem> => {
    const response = await post<ApiResponse<CartItem>>('/cart/items', data)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to add item to cart')
    }
  },

  /**
   * Update cart item quantity
   * PUT /api/v1/cart/items/:id
   */
  updateItem: async (id: string, data: UpdateCartItemData): Promise<CartItem> => {
    const response = await put<ApiResponse<CartItem>>(`/cart/items/${id}`, data)
    
    if (response.success && response.data) {
      return response.data
    } else {
      throw new Error(response.message || 'Failed to update cart item')
    }
  },

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:id
   */
  removeItem: async (id: string): Promise<void> => {
    const response = await del<ApiResponse<null>>(`/cart/items/${id}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to remove item from cart')
    }
  },

  /**
   * Clear entire cart
   * DELETE /api/v1/cart
   */
  clearCart: async (): Promise<void> => {
    const response = await del<ApiResponse<null>>('/cart')
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to clear cart')
    }
  }
}

export default cartApi
