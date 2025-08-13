import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Updated Product structure based on new API documentation
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  sku: string;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  specifications?: Record<string, any>;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product filter options
export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
}

// Create product with images request
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  specifications?: string; // JSON string
  isFeatured?: boolean;
  isActive?: boolean;
  images?: File[]; // Up to 10 images
}

// Update product with images request
export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  categoryId?: string;
  specifications?: string; // JSON string
  isFeatured?: boolean;
  isActive?: boolean;
  images?: File[]; // Additional images to add
}

// Additional interfaces for extended functionality
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ProductStats {
  totalProducts: number;
  totalActiveProducts: number;
  totalInactiveProducts: number;
  totalDraftProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  featuredProducts: number;
  averagePrice: number;
  totalStockValue: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parentId?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface ProductImport {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    message: string;
    data: any;
  }>;
}

const productsApi = {
  /**
   * Get all products with optional filtering
   * GET /api/v1/products
   */
  getProducts: async (filters?: ProductFilter): Promise<PaginatedResponse<Product>> => {
    const response = await get<PaginatedResponse<Product>>('/products', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get products');
    }
  },

  /**
   * Get single product by ID
   * GET /api/v1/products/:id
   */
  getProduct: async (id: string): Promise<Product> => {
    const response = await get<Product>(`/products/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get product');
    }
  },

  /**
   * Create a new product (JSON)
   * POST /api/v1/products
   */
  createProduct: async (productData: Partial<Product>) => {
    const response = await post<Product>('/products', productData);
    return response.data;
  },

  /**
   * Create product with images (ADMIN) - NEW multipart endpoint
   * POST /api/v1/products/with-images
   */
  createProductWithImages: async (data: CreateProductData): Promise<Product> => {
    const formData = new FormData();
    
    // Add required fields
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('sku', data.sku);
    formData.append('stock', data.stock.toString());
    formData.append('categoryId', data.categoryId);
    
    // Add optional fields
    if (data.discountPrice) formData.append('discountPrice', data.discountPrice.toString());
    if (data.specifications) formData.append('specifications', data.specifications);
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    
    // Add image files (up to 10)
    if (data.images && data.images.length > 0) {
      const maxFiles = Math.min(data.images.length, 10);
      for (let i = 0; i < maxFiles; i++) {
        formData.append('images', data.images[i]);
      }
    }

    const response = await post<Product>('/products/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create product');
    }
  },

  /**
   * Update a product (JSON)
   * PUT /api/v1/products/:id
   */
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Update product with images (ADMIN) - NEW multipart endpoint
   * PUT /api/v1/products/:id/with-images
   */
  updateProductWithImages: async (id: string, data: UpdateProductData): Promise<Product> => {
    const formData = new FormData();
    
    // Add fields that are being updated
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.discountPrice !== undefined) formData.append('discountPrice', data.discountPrice.toString());
    if (data.stock !== undefined) formData.append('stock', data.stock.toString());
    if (data.categoryId) formData.append('categoryId', data.categoryId);
    if (data.specifications) formData.append('specifications', data.specifications);
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    
    // Add additional image files
    if (data.images && data.images.length > 0) {
      const maxFiles = Math.min(data.images.length, 10);
      for (let i = 0; i < maxFiles; i++) {
        formData.append('images', data.images[i]);
      }
    }

    const response = await put<Product>(`/products/${id}/with-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update product');
    }
  },

  /**
   * Partial update of a product
   * PATCH /api/v1/products/:id
   */
  patchProduct: async (id: string, productData: Partial<Product>) => {
    const response = await patch<Product>(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product (ADMIN)
   * DELETE /api/v1/products/:id
   */
  deleteProduct: async (id: string): Promise<void> => {
    const response = await del<null>(`/products/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete product');
    }
  },

  // Get product statistics
  getProductStats: async () => {
    const response = await get<ProductStats>('/products/stats');
    return response.data;
  },
  
  // Get low stock products
  getLowStockProducts: async (threshold?: number) => {
    const response = await get<Product[]>('/products/low-stock', { 
      params: { threshold } 
    });
    return response.data;
  },
  
  // Import products from CSV/Excel
  importProducts: async (formData: FormData) => {
    const response = await post<ProductImport>('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Export products to CSV/Excel
  exportProducts: (format: 'csv' | 'excel' = 'csv', filters?: ProductFilter) => {
    // This will be handled by the browser directly as a file download
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString();
    return `/api/v1/products/export?format=${format}&${queryParams}`;
  },

  // Get all product categories
  getCategories: async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      const response = await get<ApiResponse<PaginatedResponse<ProductCategory>>>('/categories', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get a single category by ID
  getCategory: async (id: string) => {
    try {
      const response = await get<ApiResponse<ProductCategory>>(`/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData: Partial<ProductCategory>) => {
    try {
      const response = await post<ApiResponse<ProductCategory>>('/categories', categoryData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update a category
  updateCategory: async (id: string, categoryData: Partial<ProductCategory>) => {
    try {
      const response = await put<ApiResponse<ProductCategory>>(`/categories/${id}`, categoryData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (id: string, moveProductsTo?: string) => {
    try {
      const params = moveProductsTo ? { moveProductsTo } : undefined;
      const response = await del<ApiResponse<{ deletedId: string; productsMovedCount?: number }>>(`/categories/${id}`, { params });
      return response.data.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  },
  
  // Reorder categories
  reorderCategories: async (categoryOrders: { id: string; sortOrder: number }[]) => {
    try {
      const response = await patch<ApiResponse<{ updatedCount: number }>>('/categories/reorder', { categoryOrders });
      return response.data.data;
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  },

  // Get all product tags
  getTags: async () => {
    const response = await get<ProductTag[]>('/products/tags');
    return response.data;
  },

  // Create a new tag
  createTag: async (name: string) => {
    const response = await post<ProductTag>('/products/tags', { name });
    return response.data;
  },

  // Delete a tag
  deleteTag: async (id: string) => {
    const response = await del<{ success: boolean }>(`/products/tags/${id}`);
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number; status?: string }) => {
    const response = await get<PaginatedResponse<ProductReview>>(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Update review status
  updateReviewStatus: async (reviewId: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    const response = await patch<ProductReview>(`/products/reviews/${reviewId}`, { status });
    return response.data;
  },

  // Upload product image
  uploadProductImage: async (productId: string, formData: FormData) => {
    const response = await post<{ imageUrl: string }>(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete product image
  deleteProductImage: async (productId: string, imageUrl: string) => {
    const response = await del<{ success: boolean }>(`/products/${productId}/images`, {
      data: { imageUrl }
    });
    return response.data;
  },

  // Bulk operations
  bulkUpdateProducts: async (productIds: string[], updateData: Partial<Product>) => {
    const response = await patch<{ success: boolean; updated: number }>('/products/bulk', {
      ids: productIds,
      data: updateData
    });
    return response.data;
  },

  bulkDeleteProducts: async (productIds: string[]) => {
    const response = await del<{ success: boolean; deleted: number }>('/products/bulk', {
      data: { ids: productIds }
    });
    return response.data;
  },

  // Update product stock
  updateStock: async (productId: string, stock: number, reason?: string) => {
    const response = await patch<Product>(`/products/${productId}/stock`, { 
      stock, 
      reason 
    });
    return response.data;
  },

  // Get product stock history
  getStockHistory: async (productId: string, params?: { page?: number; limit?: number }) => {
    const response = await get<PaginatedResponse<{ 
      id: string;
      productId: string;
      previousStock: number;
      newStock: number;
      change: number;
      reason: string;
      userId: string;
      userName: string;
      timestamp: string;
    }>>(`/products/${productId}/stock-history`, { params });
    return response.data;
  }
};

export default productsApi;
