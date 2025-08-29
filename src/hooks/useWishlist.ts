import { useState, useEffect } from 'react';
import wishlistApi from '../services/wishlistApi';
import type { WishlistItem } from '../services/wishlistApi';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const wishlistItems = await wishlistApi.list();
      setItems(wishlistItems);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
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
      loadWishlist(); // Reload the wishlist
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistApi.remove(productId);
      toast.success('Removed from wishlist');
      loadWishlist(); // Reload the wishlist
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  useEffect(() => {
    loadWishlist();
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