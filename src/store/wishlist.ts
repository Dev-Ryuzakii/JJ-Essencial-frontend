import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import wishlistApi from '../services/wishlistApi'
import type { WishlistItem } from '../services/wishlistApi'

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => void;
  
  // Selectors
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching wishlist from API...');
          const items = await wishlistApi.list();
          console.log('Wishlist items fetched from API:', items);
          
          if (!items || items.length === 0) {
            console.log('No wishlist items returned from API or empty array');
          }
          
          // Make sure to set isLoading: false even if items is undefined or null
          set({ 
            items: Array.isArray(items) ? items : [], 
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch wishlist', 
            isLoading: false,
            items: [] // Reset items on error to avoid stale data
          });
        }
      },
      
      addToWishlist: async (productId: string) => {
        try {
          console.log('Adding to wishlist:', productId);
          await wishlistApi.add(productId);
          
          // Refetch the wishlist to ensure we have the latest data with all product details
          try {
            console.log('Fetching updated wishlist after adding item...');
            const items = await wishlistApi.list();
            console.log('Updated wishlist after adding item:', items);
            
            if (!items || items.length === 0) {
              console.log('No items returned after adding to wishlist');
            }
            
            set({ items: Array.isArray(items) ? items : [] });
          } catch (listError) {
            console.error('Error fetching updated wishlist:', listError);
            // Don't update items if fetch fails, but still return success
          }
          
          return true;
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add item to wishlist'
          });
          return false;
        }
      },
      
      removeFromWishlist: async (productId: string) => {
        try {
          await wishlistApi.remove(productId);
          set(state => ({
            items: state.items.filter(item => item.product.id !== productId)
          }));
          return true;
        } catch (error) {
          console.error('Error removing from wishlist:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove item from wishlist'
          });
          return false;
        }
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      isInWishlist: (productId: string) => {
        const items = get().items;
        if (!items || !Array.isArray(items)) {
          console.log('isInWishlist: items is not an array', items);
          return false;
        }
        return items.some(item => 
          item && item.product && item.product.id === productId
        ) || false;
      }
    }),
    {
      name: 'wishlist-storage',
      // Disable persistence for wishlist items to avoid stale data
      partialize: (_state) => ({ }),
      version: 1,
    }
  )
);
