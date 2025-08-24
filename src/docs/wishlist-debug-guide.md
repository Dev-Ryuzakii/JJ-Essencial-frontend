# Wishlist Debugging Guide

This document provides guidance on how to debug issues with the wishlist functionality.

## Common Issues

1. **Empty wishlist items even after adding products**
   - Check authentication status
   - Verify API responses
   - Check browser console for errors

2. **API response format issues**
   - The API may return different response formats
   - Check if the response is an array or has a `data` property

3. **Token issues**
   - Ensure the correct token is being used for API requests

## Debugging Tools

### Console Logging

The wishlist API has been enhanced with detailed logging:

- Each API call logs the request details
- Response data is logged to console
- Error handling provides clear error messages

### Browser Console Utilities

Run these in your browser console for debugging:

```javascript
// Check token status
window.checkTokenStatus()

// Force refresh wishlist data
window.debugWishlist()
```

### Response Format Handling

The wishlist API now handles multiple response formats:

1. Direct array response: `[item1, item2, ...]`
2. Data property containing array: `{ data: [item1, item2, ...] }`
3. Nested data: `{ data: { data: [item1, item2, ...] } }`

## TypeScript Types

The main types used by the wishlist are:

```typescript
// Item in the wishlist
export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    // Other product properties...
  };
  addedAt?: string;
}

// Store state
interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  // Actions and selectors...
}
```

## Implementation Details

The wishlist functionality uses a combination of:

1. **API Client** (`apiClient.ts`) - Handles HTTP requests with proper token
2. **Wishlist API** (`wishlistApi.ts`) - Provides methods for wishlist operations
3. **Wishlist Store** (`store/wishlist.ts`) - Manages wishlist state with Zustand
4. **Wishlist Hook** (`hooks/useWishlist.ts`) - Provides UI-friendly wishlist actions
5. **Wishlist Component** (`pages/Wishlist.tsx`) - Renders the wishlist UI

## Fixing Errors

If you encounter issues:

1. Check browser console for detailed error logs
2. Verify authentication by running `window.checkTokenStatus()`
3. Try manually refreshing with `window.debugWishlist()`
4. Inspect network requests to see what's being sent/received
5. Verify that API endpoints match expected URLs

## Recent Fixes

1. Enhanced API response handling for different formats
2. Added additional error checking and logging
3. Fixed infinite update loop in useWishlist hook
4. Added type safety checks for array operations
5. Improved null/undefined handling for wishlist items
