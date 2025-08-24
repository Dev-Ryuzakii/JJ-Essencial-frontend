declare global {
  interface Window {
    debugWishlist?: () => Promise<void>;
  }
}
