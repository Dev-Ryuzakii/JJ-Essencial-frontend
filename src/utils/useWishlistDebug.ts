import { useEffect } from 'react';
import { useWishlistStore } from '../store';
import { checkTokenStatus } from './debugToken';

/**
 * Custom hook for debugging wishlist issues
 * This hook logs information about the wishlist state and tokens
 */
export function useWishlistDebug() {
  const { items, isLoading, error, fetchWishlist } = useWishlistStore();

  // Only log when state changes, don't run this too often
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !isLoading) {
      console.group('Wishlist Debug Information');
      console.log('Wishlist items:', items);
      console.log('Items type:', items ? (Array.isArray(items) ? 'Array' : typeof items) : 'null/undefined');
      console.log('Items length:', items && Array.isArray(items) ? items.length : '(not an array)');
      console.log('Is loading:', isLoading);
      console.log('Error:', error);
      
      // Check token status
      const tokens = checkTokenStatus();
      console.log('Using auth token:', tokens.token || tokens.auth_token);
      
      if (items && Array.isArray(items) && items.length > 0) {
        console.log('First item sample:', items[0]);
      }
      
      console.groupEnd();
    }
  }, [isLoading]); // Only depend on isLoading, not items

  // Return a debug helper function
  return {
    debugRefetch: async () => {
      console.group('Manual Wishlist Refetch');
      console.log('Manually refetching wishlist...');
      
      try {
        // Check token before fetch
        const tokensBefore = checkTokenStatus();
        console.log('Using token for fetch:', tokensBefore.token || tokensBefore.auth_token);
        
        // Do the fetch
        await fetchWishlist();
        
        // Get current state after fetch
        const currentState = useWishlistStore.getState();
        console.log('Refetch complete');
        console.log('Current items:', currentState.items);
        console.log('Items type:', currentState.items ? (Array.isArray(currentState.items) ? 'Array' : typeof currentState.items) : 'null/undefined');
        console.log('Items length:', currentState.items && Array.isArray(currentState.items) ? currentState.items.length : '(not an array)');
        
        if (currentState.items && Array.isArray(currentState.items) && currentState.items.length > 0) {
          console.log('First item sample:', currentState.items[0]);
        } else {
          console.log('No items found in wishlist after refetch');
        }
      } catch (error) {
        console.error('Error during debug refetch:', error);
      }
      
      console.groupEnd();
    }
  };
}
