import { get, post, del } from './apiClient';

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

const wishlistApi = {
  /**
   * Get user's wishlist
   * GET /wishlist
   */
  list: async (): Promise<WishlistItem[]> => {
    const response = await get<{ data: WishlistItem[] }>('/wishlist');
    return response.data.data;
  },

  /**
   * Add a product to wishlist
   * POST /wishlist
   */
  add: async (productId: string): Promise<{ message: string }> => {
    const response = await post<{ message: string }>('/wishlist', { productId });
    return response.data;
  },

  /**
   * Remove a product from wishlist
   * DELETE /wishlist/:productId
   */
  remove: async (productId: string): Promise<{ message: string }> => {
    const response = await del<{ message: string }>(`/wishlist/${productId}`);
    return response.data;
  }
}

export default wishlistApi
