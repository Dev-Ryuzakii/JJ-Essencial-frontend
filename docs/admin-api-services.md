# Admin API Services Documentation

This document provides comprehensive documentation for the admin API services in the JJ Essential frontend application.

## Overview

The admin API layer provides complete administrative functionality through specialized services that handle different aspects of the e-commerce platform:

- **User Management** - Complete user administration with analytics
- **Product Management** - Inventory, catalog, and product lifecycle management  
- **Order Management** - Order processing, fulfillment, and tracking
- **Category Management** - Hierarchical category structure management
- **Review Management** - Review moderation and customer feedback
- **Analytics & Reporting** - Business intelligence and data insights

## Architecture

The admin API layer is organized into two main patterns:

### 1. Unified Admin API (`adminApi`)
A single comprehensive API that provides access to all administrative functionality:

```typescript
import { adminApi } from '@/services';

// Access specialized services through the main API
const users = await adminApi.users.getAll();
const products = await adminApi.products.getAll();
const analytics = await adminApi.analytics.getDashboardAnalytics();
```

### 2. Specialized Admin APIs
Individual APIs for focused functionality with enhanced features:

```typescript
import { 
  adminUsersApi, 
  adminProductsApi, 
  adminAnalyticsApi 
} from '@/services';

// Direct access to specialized functionality
const userAnalytics = await adminUsersApi.getUserAnalytics();
const productBulkUpdate = await adminProductsApi.bulkUpdateProducts(data);
const realTimeStats = await adminAnalyticsApi.getRealTimeStats();
```

## API Services

### 1. User Management (`adminUsersApi`)

Complete user administration with advanced features:

```typescript
// Get all users with filtering and pagination
const users = await adminUsersApi.getUsers({
  page: 1,
  limit: 20,
  search: 'john@example.com',
  role: 'CUSTOMER',
  isActive: true,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Get detailed user information
const userDetails = await adminUsersApi.getUser('user-id');

// Update user status and role
const updatedUser = await adminUsersApi.updateUser('user-id', {
  isActive: false,
  role: 'ADMIN',
  adminNote: 'Account suspended for review'
});

// Bulk operations
const bulkResult = await adminUsersApi.bulkUpdateUsers(['id1', 'id2'], {
  isActive: true,
  role: 'CUSTOMER'
});

// User analytics
const analytics = await adminUsersApi.getUserAnalytics('30days');
```

### 2. Product Management (`adminProductsApi`)

Comprehensive product catalog management:

```typescript
// Create product with image upload
const formData = new FormData();
formData.append('name', 'New Product');
formData.append('price', '99.99');
formData.append('stock', '100');
files.forEach(file => formData.append('images', file));

const product = await adminProductsApi.createProduct(formData);

// Inventory management
const stockUpdate = await adminProductsApi.updatetock('product-id', {
  quantity: 50,
  type: 'IN',
  reason: 'Restock from supplier',
  reference: 'PO-2024-001'
});

// Product analytics
const analytics = await adminProductsApi.getProductAnalytics({
  period: '30days',
  sortBy: 'revenue'
});

// Bulk operations
const bulkResult = await adminProductsApi.bulkUpdateProducts(['id1', 'id2'], {
  isActive: true,
  featured: true
});
```

### 3. Order Management (`adminOrdersApi`)

Advanced order processing and fulfillment:

```typescript
// Get orders with comprehensive filtering
const orders = await adminOrdersApi.getOrders({
  status: 'PENDING',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  minAmount: 100,
  maxAmount: 1000
});

// Update order status with tracking
const order = await adminOrdersApi.updateOrderStatus('order-id', {
  status: 'SHIPPED',
  location: 'Distribution Center',
  notes: 'Package dispatched via courier',
  estimatedDelivery: '2024-08-15'
});

// Process refunds
const refund = await adminOrdersApi.processRefund('order-id', {
  amount: 99.99,
  reason: 'Product defective',
  refundMethod: 'ORIGINAL_PAYMENT'
});

// Order analytics
const analytics = await adminOrdersApi.getOrderAnalytics({
  period: '30days',
  groupBy: 'day'
});
```

### 4. Category Management (`adminCategoriesApi`)

Hierarchical category structure management:

```typescript
// Create category with image
const formData = new FormData();
formData.append('name', 'Electronics');
formData.append('slug', 'electronics');
formData.append('parentId', 'parent-category-id');
formData.append('image', imageFile);

const category = await adminCategoriesApi.createCategory(formData);

// Manage category hierarchy
const reorderResult = await adminCategoriesApi.reorderCategories([
  { id: 'cat1', sortOrder: 1 },
  { id: 'cat2', sortOrder: 2 }
]);

// Validate category tree
const validation = await adminCategoriesApi.validateCategoryTree('root-id');

// Category analytics
const analytics = await adminCategoriesApi.getCategoryAnalytics();
```

### 5. Review Management (`adminReviewsApi`)

Review moderation and customer feedback management:

```typescript
// Get reviews with filtering
const reviews = await adminReviewsApi.getReviews({
  isVisible: true,
  rating: 5,
  productId: 'product-id',
  startDate: '2024-01-01'
});

// Moderate reviews
const review = await adminReviewsApi.updateReviewStatus('review-id', {
  isApproved: true,
  isVerified: true,
  adminNote: 'Review approved after verification'
});

// Add admin response
const response = await adminReviewsApi.addAdminResponse('review-id', {
  adminResponse: 'Thank you for your feedback. We appreciate your review.'
});

// Bulk moderation
const bulkResult = await adminReviewsApi.bulkUpdateReviews(['id1', 'id2'], {
  isVisible: true,
  isApproved: true
});

// Review analytics
const analytics = await adminReviewsApi.getReviewAnalytics('30days');
```

### 6. Analytics & Reporting (`adminAnalyticsApi`)

Comprehensive business intelligence and reporting:

```typescript
// Dashboard analytics
const dashboard = await adminAnalyticsApi.getDashboardAnalytics('30days');

// Sales analytics
const salesTrends = await adminAnalyticsApi.getRevenueTrends({
  period: '90days',
  groupBy: 'week',
  compareWith: 'previous_period'
});

// Customer insights
const customerData = await adminAnalyticsApi.getCustomerInsights('30days');

// Real-time statistics
const realTime = await adminAnalyticsApi.getRealTimeStats();

// Financial reporting
const financialReport = await adminAnalyticsApi.getFinancialReport({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  includeBreakdown: true
});

// Custom report generation
const customReport = await adminAnalyticsApi.generateCustomReport({
  name: 'Monthly Sales Report',
  type: 'sales',
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  },
  metrics: ['revenue', 'orders', 'customers'],
  format: 'pdf'
});

// Forecasting
const forecast = await adminAnalyticsApi.getForecastData({
  metric: 'revenue',
  period: '90days',
  confidence: 0.95
});
```

## Common Patterns

### Error Handling

All APIs use consistent error handling:

```typescript
try {
  const result = await adminUsersApi.getUsers();
  console.log('Success:', result);
} catch (error) {
  console.error('API Error:', error.message);
  // Handle specific error types
  if (error.status === 401) {
    // Handle unauthorized access
  } else if (error.status === 403) {
    // Handle forbidden access
  }
}
```

### Pagination

Most list endpoints support pagination:

```typescript
const result = await adminProductsApi.getProducts({
  page: 1,
  limit: 20
});

console.log('Items:', result.items);
console.log('Total:', result.pagination.total);
console.log('Has Next:', result.pagination.hasNext);
```

### File Uploads

File upload APIs use FormData:

```typescript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('images', file1);
formData.append('images', file2);

const product = await adminProductsApi.createProduct(formData);
```

### Export Functionality

Most services support data export:

```typescript
// Generate export URL
const exportUrl = adminAnalyticsApi.exportReport({
  type: 'sales',
  format: 'csv',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Download the export
window.open(exportUrl, '_blank');
```

## TypeScript Support

All APIs provide full TypeScript support with comprehensive type definitions:

```typescript
import type {
  AdminUser,
  AdminProduct,
  AdminOrder,
  AdminCategory,
  AdminReview,
  AdminAnalytics,
  PaginatedResponse,
  ApiResponse
} from '@/services';

// Type-safe API calls
const users: PaginatedResponse<AdminUser> = await adminUsersApi.getUsers();
const analytics: AdminAnalytics = await adminAnalyticsApi.getDashboardAnalytics();
```

## Best Practices

### 1. Use Specialized APIs for Enhanced Features
```typescript
// ✅ Good - Use specialized API for advanced features
import { adminUsersApi } from '@/services';
const analytics = await adminUsersApi.getUserAnalytics();

// ❌ Less optimal - Main API may not have all features
import { adminApi } from '@/services';
const users = await adminApi.users.getAll();
```

### 2. Implement Proper Loading States
```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await adminProductsApi.getProducts();
    setProducts(data.items);
  } catch (error) {
    console.error('Failed to load products:', error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Use Bulk Operations for Efficiency
```typescript
// ✅ Good - Bulk operation
await adminProductsApi.bulkUpdateProducts(productIds, update);

// ❌ Inefficient - Individual update
for (const id of productIds) {
  await adminProductsApi.updateProduct(id, update);
}
```

### 4. Leverage Analytics for Insights
```typescript
// Get comprehensive dashboard data
const dashboard = await adminAnalyticsApi.getDashboardAnalytics();

// Use real-time data for live update
const realTimeStats = await adminAnalyticsApi.getRealTimeStats();

// Generate reports for business intelligence
const report = await adminAnalyticsApi.generateCustomReport(config);
```

## Integration Examples

### Admin Dashboard Component
```typescript
import { adminAnalyticsApi } from '@/services';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    const loadDashboard = async () => {
      const data = await adminAnalyticsApi.getDashboardAnalytics('30days');
      setAnalytics(data);
    };
    
    loadDashboard();
  }, []);
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {analytics && (
        <div>
          <div>Total Revenue: {analytics.overview.totalRevenue}</div>
          <div>Total Orders: {analytics.overview.totalOrders}</div>
          {/* Render charts and analytics */}
        </div>
      )}
    </div>
  );
};
```

### Product Management Component
```typescript
import { adminProductsApi } from '@/services';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  
  const handleBulkUpdate = async (productIds: string[], update: any) => {
    try {
      await adminProductsApi.bulkUpdateProducts(productIds, update);
      // Refresh product list
      const refreshedProducts = await adminProductsApi.getProducts();
      setProducts(refreshedProducts.items);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };
  
  const handleStockUpdate = async (productId: string, stockData: any) => {
    try {
      await adminProductsApi.updatetock(productId, stockData);
      // Update local state
    } catch (error) {
      console.error('Stock update failed:', error);
    }
  };
  
  return (
    <div>
      {/* Product management UI */}
    </div>
  );
};
```

This documentation provides a comprehensive guide to using the admin API services effectively in your React application. All APIs are designed to work together seamlessly while providing specialized functionality for different administrative tasks.
