// Base API client
export { default as apiClient } from './apiClient';

// Authentication API
export { default as authApi } from './authApi';
export type { UserProfile } from './authApi';

// Products API
export { default as productsApi } from './productsApi';
export type { Product, ProductDetails, ProductsQueryParams, Review, Category } from './productsApi';

// Orders API
export { default as ordersApi } from './ordersApi';
export type { Order, OrderDetails, CreateOrderData, OrdersQueryParams, DeliveryAddress, OrderItem } from './ordersApi';

// Categories API
export { default as categoriesApi } from './categoriesApi';
export type { Category as CategoryType } from './categoriesApi';

// Reviews API
export { default as reviewsApi } from './reviewsApi';
export type { Review as ReviewType, AddReviewData } from './reviewsApi';

// Addresses API
export { default as addressesApi } from './addressesApi';
export type { Address, AddAddressData } from './addressesApi';

// Wishlist API
export { default as wishlistApi } from './wishlistApi';
export type { WishlistItem } from './wishlistApi';

// Bank Transfer API
export { default as bankTransferApi } from './bankTransferApi';
export type { BankAccount, BankTransferData, ReceiptData } from './bankTransferApi';

// Dashboard API
export { default as dashboardApi } from './dashboardApi';
export type { 
  DashboardStats,
  RevenueData,
  OrdersData,
  TopProduct,
  LowStockProduct,
  PaymentMethodDistribution,
  CustomerDemographics,
  StatMetric,
  OrderStatusDistribution
} from './dashboardApi';

// Admin API - Comprehensive admin management
export { default as adminApi } from './adminApi';
export type { 
  AdminDashboardStats,
  AdminPaymentDto,
  AdminPaymentDetailDto,
  UpdatePaymentStatusDto,
  VerifyReceiptDto,
  AdminSupportChatDto,
  AdminSupportChatDetailDto,
  UpdateChatStatusDto,
  ReplySupportChatDto,
  BankAccountDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  SalesReportDto,
  InventoryReportDto
} from './adminApi';

// Specialized Admin APIs
export { 
  adminUsersApi,
  adminProductsApi,
  adminOrdersApi,
  adminCategoriesApi,
  adminReviewsApi,
  adminAnalyticsApi
} from './adminApi';

// Common types
export type { ApiResponse, PaginatedResponse } from './apiClient';
