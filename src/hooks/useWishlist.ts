import { useState, useEffect, useRef } from 'react';
import wishlistApi from '../services/wishlistApi';
import type { WishlistItem } from '../services/wishlistApi';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const lastLoadTime = useRef<number>(0);
  const loadingRef = useRef(false);

  const loadWishlist = async (force = false) => {
    if (!isAuthenticated) return;
    
    // Prevent concurrent calls and rate limiting
    const now = Date.now();
    if (!force && (loadingRef.current || (now - lastLoadTime.current < 1000))) {
      console.log('Skipping wishlist load - too soon or already loading');
      return;
    }
    
    try {
      loadingRef.current = true;
      setLoading(true);
      lastLoadTime.current = now;
      const wishlistItems = await wishlistApi.list();
      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      // Only show toast if it's not a rate limit error
      if (!error || typeof error !== 'object' || !('statusCode' in error) || error.statusCode !== 429) {
        toast.error('Failed to load wishlist');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      await wishlistApi.add(productId);
      toast.success('Added to wishlist');
      loadWishlist(true); // Force reload after adding
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      toast.success('Removed from wishlist');
      loadWishlist(true); // Force reload after removing
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  return {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loadWishlist
  };
};