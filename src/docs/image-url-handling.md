# Image URL Handling in Wishlist

This document provides information about how to handle image URLs in the wishlist functionality.

## Problem Identified

The wishlist API returns image URLs in an unexpected format. Instead of direct URLs, the API returns JSON objects as strings, like this:

```json
{
  "id": "gna6sw88gajpgvt8y0n7c",
  "url": "https://rqvymrvqtkdzkeoaynfr.supabase.co/storage/v1/object/public/products/images/1755986206060-7g0385ll0sy.jpeg",
  "isMain": false,
  "sortOrder": 0
}
```

These JSON strings need to be parsed to extract the actual image URL.

## Solution

We've implemented the following fixes:

1. Enhanced `getImageUrl` function in `lib/utils.ts`:
   - Now detects and parses JSON string image objects
   - Extracts the direct URL from the JSON object
   - Fallbacks to default processing for regular URLs

2. Added processing in `wishlistApi.ts`:
   - Pre-processes image URLs before returning wishlist data
   - Converts JSON string image objects to direct URLs
   - Ensures the `images` property is always an array

3. Improved error handling in `Wishlist.tsx`:
   - Better error handling for image loading failures
   - Attempts to extract URLs from JSON strings when regular loading fails
   - Provides clear logging for debugging

## How to Test

1. Navigate to `/wishlist` to see if images are displaying correctly
2. Use the `/wishlist-test` route to see detailed information about the wishlist items
3. Use the `/image-test/[encoded-url]` route to test individual image URLs

## JSON Image Format

The wishlist API returns image objects with the following structure:

```typescript
interface ImageObject {
  id: string;       // Unique identifier for the image
  url: string;      // The direct URL to the image
  isMain: boolean;  // Whether this is the main/primary image
  sortOrder: number; // The display order for the image
}
```

When processing these images, we extract the `url` property and use it as the direct image source.
