import { categoriesApi, productsApi } from './api'
import type { Category } from '../types'

// Simple in-memory cache for categories with real product counts
class CategoriesCache {
  private categories: Category[] | null = null
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private fetchPromise: Promise<Category[]> | null = null

  async getCategories(): Promise<Category[]> {
    const now = Date.now()
    
    // Return cached data if still valid
    if (this.categories && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.categories
    }

    // If there's already a fetch in progress, wait for it
    if (this.fetchPromise) {
      return this.fetchPromise
    }

    // Start new fetch
    this.fetchPromise = this.fetchFromAPI()
    
    try {
      const result = await this.fetchPromise
      this.categories = result
      this.lastFetch = now
      return result
    } finally {
      this.fetchPromise = null
    }
  }

  private async fetchFromAPI(): Promise<Category[]> {
    try {
      const response = await categoriesApi.getAll()
      if (response.success && Array.isArray(response.data)) {
        const categories = response.data
        
        // Fetch real product counts for each category
        const categoriesWithCounts = await Promise.all(
          categories.map(async (category) => {
            try {
              // For now, use existing productCount to avoid API errors
              // TODO: Fix API endpoint for filtering products by category
              return {
                ...category,
                productCount: category.productCount || 0
              }
              
              /* Disabled until API issue is fixed
              // Add small delay to prevent rate limiting
              await new Promise(resolve => setTimeout(resolve, Math.random() * 200))
              
              const productsResponse = await productsApi.getAll({
                categoryId: category.id,
                limit: 1 // We only need the total count, not the actual products
              })
              
              let productCount = 0
              if (productsResponse.success && productsResponse.data) {
                // Check multiple possible response formats
                productCount = productsResponse.data.meta?.totalItems || 
                              (productsResponse.data.items ? productsResponse.data.items.length : 0) ||
                              (category.productCount || 0)
              } else {
                productCount = category.productCount || 0
              }
              
              return {
                ...category,
                productCount
              }
              */
            } catch (error) {
              console.warn(`Failed to fetch product count for category ${category.name}:`, error)
              // Fall back to existing count or 0
              return {
                ...category,
                productCount: category.productCount || 0
              }
            }
          })
        )
        
        return categoriesWithCounts
      }
      return []
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      // Return cached data if available, even if expired
      return this.categories || []
    }
  }

  // Clear cache (useful for admin update)
  clearCache(): void {
    this.categories = null
    this.lastFetch = 0
    this.fetchPromise = null
  }
}

export const categoriesCache = new CategoriesCache()
