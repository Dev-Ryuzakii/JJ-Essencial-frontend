import { get, post, put, del } from './apiClient'

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

// updates cart item request
export interface updatesCartItemData {
  quantity: number
}

const cartApi = {
  /**
   * Get cart items
   * GET /api/v1/cart
   */
  getCart: async (): Promise<CartResponse> => {
    const response = await get<CartResponse>('/cart')
    return response.data
  },

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  addItem: async (data: AddToCartData): Promise<CartItem> => {
    const response = await post<CartItem>('/cart/items', data)
    return response.data
  },

  /**
   * updates cart item quantity
   * PUT /api/v1/cart/items/:id
   */
  updatesItem: async (id: string, data: updatesCartItemData): Promise<CartItem> => {
    const response = await put<CartItem>(`/cart/items/${id}`, data)
    return response.data
  },

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:id
   */
  removeItem: async (id: string): Promise<void> => {
    await del<null>(`/cart/items/${id}`)
  },

  /**
   * Clear entire cart
   * DELETE /api/v1/cart
   */
  clearCart: async (): Promise<void> => {
    await del<null>('/cart')
  }
}

export default cartApi
