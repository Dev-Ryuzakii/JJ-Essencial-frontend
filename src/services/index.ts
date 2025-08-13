// API Services Index
// Centralized export for all API services

// Client API services
export { default as apiClient } from './apiClient'

// Authentication APIs
export { default as authApi } from './authApi'

// Dashboard APIs
export { default as dashboardApi } from './dashboardApi'

// Product APIs
export { default as productsApi } from './productsApi'

// Category APIs
export { default as categoriesApi } from './categoriesApi'

// Order APIs
export { default as ordersApi } from './ordersApi'

// Review APIs
export { default as reviewsApi } from './reviewsApi'

// Cart APIs
export { default as cartApi } from './cartApi'

// Wishlist APIs
export { default as wishlistApi } from './wishlistApi'

// Support APIs
export { default as supportApi } from './supportApi'

// Address APIs
export { default as addressesApi } from './addressesApi'

// Notification APIs
export { default as notificationsApi } from './notificationsApi'

// Upload APIs
export { default as uploadApi } from './uploadApi'

// Admin APIs - Comprehensive administrative functionality
export { default as adminApi } from './adminApi'

// Specialized Admin APIs - For direct access to specific admin functionality
export { default as adminUsersApi } from './adminUsersApi'
export { default as adminProductsApi } from './adminProductsApi'
export { default as adminOrdersApi } from './adminOrdersApi'
export { default as adminCategoriesApi } from './adminCategoriesApi'
export { default as adminReviewsApi } from './adminReviewsApi'
export { default as adminAnalyticsApi } from './adminAnalyticsApi'

// Re-export commonly used types (avoiding conflicts)
export type { ApiResponse, ApiError, PaginatedResponse } from './adminApi'
export type { Order, OrderStatus, PaymentStatus } from './ordersApi'
export type { Product } from './productsApi'
export type { Category } from './categoriesApi'
export type { CartItem } from './cartApi'

// API Types - Common interfaces and types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse
} from './adminApi';

/**
 * Usage Examples:
 * 
 * // Import main admin API (includes all functionality)
 * import { adminApi } from '@/services';
 * 
 * // Import specific admin APIs for focused functionality  
 * import { adminUsersApi, adminProductsApi } from '@/services';
 * 
 * // Import client APIs
 * import { authApi, productsApi, ordersApi } from '@/services';
 * 
 * // Import types
 * import type { ApiResponse, AdminUser, AdminProduct } from '@/services';
 */
