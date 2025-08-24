/**
 * Utility for debugging image URLs
 * This helps to understand the format of image URLs in the application
 */

/**
 * Extract direct URL from an image value
 * 
 * @param imageValue - Could be a direct URL string or a JSON string with a URL property
 * @returns The direct URL or null if can't extract
 */
export function extractDirectImageUrl(imageValue: unknown): string | null {
  if (!imageValue) return null;
  
  // Direct URL case
  if (typeof imageValue === 'string') {
    // Check if it's a JSON string
    if (imageValue.startsWith('{') && imageValue.endsWith('}')) {
      try {
        const imageObject = JSON.parse(imageValue);
        if (imageObject && typeof imageObject === 'object' && imageObject.url) {
          return imageObject.url;
        }
      } catch (error) {
        console.error('Failed to parse image JSON:', error);
      }
    } 
    // If it's already a URL, return it directly
    else if (imageValue.startsWith('http')) {
      return imageValue;
    }
  }
  
  // Object with URL property
  if (typeof imageValue === 'object' && imageValue !== null && 'url' in imageValue) {
    const url = (imageValue as any).url;
    if (typeof url === 'string') {
      return url;
    }
  }
  
  return null;
}

/**
 * Analyze an image value and log details about it
 * 
 * @param imageValue - Any value that might represent an image
 * @param label - Label for the log output
 * @returns The direct URL (if extractable) or null
 */
export function analyzeImageValue(imageValue: unknown, label = 'Image value'): string | null {
  console.group(`Image Analysis: ${label}`);
  console.log('Raw value:', imageValue);
  console.log('Type:', typeof imageValue);
  
  const directUrl = extractDirectImageUrl(imageValue);
  console.log('Extracted URL:', directUrl);
  
  if (typeof imageValue === 'string' && imageValue.startsWith('{')) {
    try {
      const parsed = JSON.parse(imageValue);
      console.log('Parsed JSON:', parsed);
    } catch (error) {
      console.log('Not valid JSON');
    }
  }
  
  console.groupEnd();
  return directUrl;
}

/**
 * Check if an image exists by actually loading it
 * 
 * @param url - The image URL to check
 * @returns Promise resolving to boolean indicating if image exists and can be loaded
 */
export function checkImageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Add to window for console debugging
declare global {
  interface Window {
    debugImage: {
      analyze: typeof analyzeImageValue;
      extract: typeof extractDirectImageUrl;
      check: typeof checkImageExists;
    };
  }
}

if (typeof window !== 'undefined') {
  window.debugImage = {
    analyze: analyzeImageValue,
    extract: extractDirectImageUrl,
    check: checkImageExists
  };
}
