// Debug hook for wishlist functionality
export const useWishlistDebug = () => {
  // Simple debug utility - can be expanded later
  return {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Wishlist Debug] ${message}`, data);
      }
    },
    debugRefetch: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Wishlist Debug] Debug refetch called');
        // This could trigger a manual refetch in the future
        return Promise.resolve();
      }
    }
  };
};