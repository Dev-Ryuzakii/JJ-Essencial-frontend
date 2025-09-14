/**
 * Utility functions for handling images and placeholders
 */

/**
 * Creates a placeholder image component as inline SVG data URI
 * @param width - Image width (default: 400)
 * @param height - Image height (default: 400) 
 * @param text - Text to display (default: "No Image")
 * @returns Data URI for inline SVG placeholder
 */
export function createPlaceholderImage(
  width: number = 400, 
  height: number = 400, 
  text: string = "No Image"
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-family="system-ui" font-size="16" fill="#9ca3af">${text}</text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Handles image error by replacing with placeholder
 * @param event - Image error event
 * @param fallbackText - Text for placeholder (optional)
 */
export function handleImageError(event: Event, fallbackText?: string): void {
  const target = event.target as HTMLImageElement
  if (target) {
    const width = target.width || 400
    const height = target.height || 400
    target.src = createPlaceholderImage(width, height, fallbackText)
  }
}

/**
 * Creates a placeholder component as JSX element replacement
 * @param width - Width class (e.g., 'w-12')
 * @param height - Height class (e.g., 'h-12')
 * @param iconSize - Icon size class (e.g., 'w-6 h-6')
 * @returns HTML string for placeholder div
 */
export function createPlaceholderDiv(
  width: string = 'w-full',
  height: string = 'h-full',
  iconSize: string = 'w-8 h-8'
): string {
  return `
    <div class="${width} ${height} bg-gray-200 flex items-center justify-center">
      <svg class="${iconSize} text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
    </div>
  `
}

/**
 * Safe image source getter with fallback
 * @param src - Original image source
 * @param width - Width for placeholder
 * @param height - Height for placeholder
 * @returns Safe image source or placeholder
 */
export function getSafeImageSrc(
  src: string | undefined | null,
  width: number = 400,
  height: number = 400
): string {
  if (!src) {
    return createPlaceholderImage(width, height)
  }
  return src
}