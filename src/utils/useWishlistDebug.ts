// Debug hook for wishlist functionality
export const useWishlistDebug = () => {
  // Simple debug utility - can be expanded later
  return {
    log: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Wishlist Debug] ${message}`, data);
      }
    }
  };
};