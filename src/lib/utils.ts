import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createPlaceholderImage } from '../utils/imageUtils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(num)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDatetime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

export function getImageUrl(url: string): string {
  if (!url) return createPlaceholderImage(400, 400)
  if (url.startsWith('http')) return url
  
  // Use the API base URL for uploads
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
  return `${apiBase}/uploads/${url}`
}

export function parseProductImage(image: any): string {
  if (!image) return createPlaceholderImage(400, 400)
  
  // If it's a string that looks like a JSON object, parse it
  if (typeof image === 'string') {
    // Try to parse as JSON first (this handles the URL-encoded JSON objects)
    if (image.startsWith('{') && image.endsWith('}')) {
      try {
        const parsed = JSON.parse(image)
        if (parsed.url) {
          // Ensure the URL uses the correct API path
          return parsed.url.startsWith('http') ? parsed.url : `/api/v1/uploads/${parsed.url}`
        }
        return createPlaceholderImage(400, 400)
      } catch {
        // If JSON parsing fails, treat as regular URL
        return image.startsWith('http') ? image : `/api/v1/uploads/${image}`
      }
    }
    // Regular string URL
    return image.startsWith('http') ? image : `/api/v1/uploads/${image}`
  }
  
  // If it's an object with url property
  if (typeof image === 'object' && image.url) {
    return image.url.startsWith('http') ? image.url : `/api/v1/uploads/${image.url}`
  }
  
  return createPlaceholderImage(400, 400)
}

export function calculateDiscountPercentage(
  originalPrice: number,
  discountPrice: number
): number {
  if (originalPrice <= 0 || discountPrice >= originalPrice) return 0
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
}

export function isValidImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
