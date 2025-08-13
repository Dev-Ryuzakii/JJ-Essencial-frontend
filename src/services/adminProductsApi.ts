import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Admin product interfaces extending base product types
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: string[];
  specifications?: Record<string, any>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  rating: number;
  reviewCount: number;
  totalSold: number;
  revenue: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  lowStockThreshold?: number;
  categoryId: string;
  specifications?: Record<string, any>;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface AdminProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  lowStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalRevenue: string;
  averagePrice: string;
  topSellingProducts: {
    id: string;
    name: string;
    sku: string;
    totalSold: number;
    revenue: string;
  }[];
  recentlyAddedProducts: AdminProduct[];
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    productCount: number;
    revenue: string;
  }[];
}

const adminProductsApi = {
  /**
   * Get all products (Admin view with extended data)
   * GET /api/v1/admin/products
   */
  getProducts: async (filters?: AdminProductFilter): Promise<PaginatedResponse<AdminProduct>> => {
    const response = await get<PaginatedResponse<AdminProduct>>('/admin/products', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get products');
    }
  },

  /**
   * Get product details (Admin view)
   * GET /api/v1/admin/products/:id
   */
  getProduct: async (id: string): Promise<AdminProduct> => {
    const response = await get<AdminProduct>(`/admin/products/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get product details');
    }
  },

  /**
   * Create product with images
   * POST /api/v1/admin/products/with-images
   */
  createProductWithImages: async (data: CreateProductDto, images?: File[]): Promise<AdminProduct> => {
    const formData = new FormData();
    
    // Add product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await post<AdminProduct>('/admin/products/with-images', formData, {
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
   * Update product with images
   * PUT /api/v1/admin/products/:id/with-images
   */
  updateProductWithImages: async (id: string, data: UpdateProductDto, images?: File[]): Promise<AdminProduct> => {
    const formData = new FormData();
    
    // Add product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Add images if provided
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await put<AdminProduct>(`/admin/products/${id}/with-images`, formData, {
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
   * Update product without images
   * PUT /api/v1/admin/products/:id
   */
  updateProduct: async (id: string, data: UpdateProductDto): Promise<AdminProduct> => {
    const response = await put<AdminProduct>(`/admin/products/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update product');
    }
  },

  /**
   * Delete product
   * DELETE /api/v1/admin/products/:id
   */
  deleteProduct: async (id: string): Promise<void> => {
    const response = await del(`/admin/products/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete product');
    }
  },

  /**
   * Bulk update products
   * PATCH /api/v1/admin/products/bulk
   */
  bulkUpdateProducts: async (productIds: string[], data: {
    isActive?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    discountPrice?: number;
  }): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/admin/products/bulk', {
      productIds,
      ...data
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk update products');
    }
  },

  /**
   * Bulk delete products
   * DELETE /api/v1/admin/products/bulk
   */
  bulkDeleteProducts: async (productIds: string[]): Promise<{ deleted: number }> => {
    const response = await del<{ deleted: number }>('/admin/products/bulk', {
      data: { productIds }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk delete products');
    }
  },

  /**
   * Get product analytics
   * GET /api/v1/admin/products/analytics
   */
  getProductAnalytics: async (period?: '7days' | '30days' | '90days' | '1year'): Promise<ProductAnalytics> => {
    const response = await get<ProductAnalytics>('/admin/products/analytics', { 
      params: { period } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get product analytics');
    }
  },

  /**
   * Get low stock products
   * GET /api/v1/admin/products/low-stock
   */
  getLowStockProducts: async (threshold?: number): Promise<AdminProduct[]> => {
    const response = await get<AdminProduct[]>('/admin/products/low-stock', { 
      params: { threshold } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get low stock products');
    }
  },

  /**
   * Get out of stock products
   * GET /api/v1/admin/products/out-of-stock
   */
  getOutOfStockProducts: async (): Promise<AdminProduct[]> => {
    const response = await get<AdminProduct[]>('/admin/products/out-of-stock');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get out of stock products');
    }
  },

  /**
   * Update product stock
   * PATCH /api/v1/admin/products/:id/stock
   */
  updateProductStock: async (id: string, data: {
    stock: number;
    lowStockThreshold?: number;
    reason?: string;
  }): Promise<AdminProduct> => {
    const response = await patch<AdminProduct>(`/admin/products/${id}/stock`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update product stock');
    }
  },

  /**
   * Duplicate product
   * POST /api/v1/admin/products/:id/duplicate
   */
  duplicateProduct: async (id: string, data?: {
    name?: string;
    sku?: string;
  }): Promise<AdminProduct> => {
    const response = await post<AdminProduct>(`/admin/products/${id}/duplicate`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to duplicate product');
    }
  },

  /**
   * Export products
   * GET /api/v1/admin/products/export
   */
  exportProducts: (format: 'csv' | 'excel' = 'csv', filters?: AdminProductFilter): string => {
    const queryParams = new URLSearchParams({
      format,
      ...(filters as Record<string, string>)
    }).toString();
    return `/api/v1/admin/products/export?${queryParams}`;
  },

  /**
   * Import products from CSV/Excel
   * POST /api/v1/admin/products/import
   */
  importProducts: async (file: File): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await post<{
      success: number;
      failed: number;
      errors: string[];
    }>('/admin/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to import products');
    }
  }
};

export default adminProductsApi;
