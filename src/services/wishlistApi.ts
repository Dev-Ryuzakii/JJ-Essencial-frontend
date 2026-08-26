import { get, post, del } from './apiClient';
import { getImageUrl } from '../lib/utils';

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    stock?: number;
    stockQuantity?: number;
    images: string[];
    averageRating?: number;
    reviewCount?: number;
    category?: {
      id: string;
      name: string;
    };
    createdAt?: string;
    updatesdAt?: string;
  };
  addedAt?: string;
}

// Helper to extract message from different response formats
const extractMessage = (response: any, defaultMessage: string): string => {
  if (!response) return defaultMessage;
  
  if (typeof response === 'object') {
    // Direct message property
    if (typeof response.message === 'string') {
      return response.message;
    }
    
    // Nested in data
    if (response.data && typeof response.data === 'object') {
      if (typeof response.data.message === 'string') {
        return response.data.message;
      }
    }
  }
  
  return defaultMessage;
};

const wishlistApi = {
  /**
   * Get user's wishlist
   * GET /wishlist
   */
  list: async (): Promise<WishlistItem[]> => {
    try {
      console.log('Calling wishlist API...');
      const response = await get<any>('/wishlist');
      console.log('Raw wishlist API response:', response);
      
      // Helper to process items
      const processItems = (items: any[]): WishlistItem[] => {
        if (!Array.isArray(items)) return [];
        
        return items.map(item => {
          // Process each item to ensure image URLs are valid
          if (item.product && item.product.images) {
            // Ensure images is always an array
            if (!Array.isArray(item.product.images)) {
              item.product.images = [];
            }
            
            // Try to parse each image URL if it's a JSON string
            item.product.images = item.product.images.map((img: any) => {
              if (typeof img === 'string' && img.startsWith('{') && img.endsWith('}')) {
                try {
                  const imgObj = JSON.parse(img);
                  if (imgObj.url) {
                    console.log(`Converting JSON image to direct URL: ${imgObj.url}`);
                    return imgObj.url;
                  }
                } catch (e) {
                  console.error('Failed to parse image JSON:', e);
                }
              }
              return img;
            });
            
            // Log image URLs for debugging
            console.log(`Product ${item.product.id} (${item.product.name}) has ${item.product.images.length} images`);
          } else if (item.product) {
            // Initialize empty images array if missing
            item.product.images = [];
          }
          
          return item;
        });
      };
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('Response is an array, returning processed array');
        return processItems(response);
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          console.log('Response has data array, returning processed response.data');
          return processItems(response.data);
        } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
          console.log('Response has nested data.data array, returning processed response.data.data');
          return processItems(response.data.data);
        }
      }
      
      console.warn('Could not extract wishlist items from response, returning empty array');
      return [];
    } catch (error) {
      console.error('Error in wishlistApi.list():', error);
      return [];
    }
  },

  /**
   * Add a product to wishlist
   * POST /wishlist
   */
  add: async (productId: string): Promise<{ message: string }> => {
    try {
      console.log('Adding to wishlist API, productId:', productId);
      const response = await post<any>('/wishlist', { productId });
      console.log('Add to wishlist response:', response);
      
      const message = extractMessage(response, 'Item added to wishlist');
      return { message };
    } catch (error) {
      console.error('Error in wishlistApi.add():', error);
      throw error;
    }
  },

  /**
   * Remove a product from wishlist
   * DELETE /wishlist/:productId
   */
  remove: async (productId: string): Promise<{ message: string }> => {
    try {
      console.log('Removing from wishlist API, productId:', productId);
      const response = await del<any>(`/wishlist/${productId}`);
      console.log('Remove from wishlist response:', response);
      
      const message = extractMessage(response, 'Item removed from wishlist');
      return { message };
    } catch (error) {
      console.error('Error in wishlistApi.remove():', error);
      throw error;
    }
  }
}

export default wishlistApi
