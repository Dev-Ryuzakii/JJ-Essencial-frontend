import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Admin category interfaces
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: AdminCategory;
  children?: AdminCategory[];
  level: number;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  totalRevenue: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface AdminCategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  level?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

export interface CategoryAnalytics {
  totalCategories: number;
  activeCategories: number;
  categoriesWithProducts: number;
  topCategories: {
    id: string;
    name: string;
    productCount: number;
    revenue: string;
  }[];
  categoryHierarchy: {
    parent: string;
    children: number;
    totalProducts: number;
  }[];
}

const adminCategoriesApi = {
  /**
   * Get all categories (Admin view with extended data)
   * GET /api/v1/categories
   */
  getCategories: async (filters?: AdminCategoryFilter): Promise<PaginatedResponse<AdminCategory>> => {
    const params = {
      ...filters,
      includeInactive: true // Include inactive categories for admin view
    };
    const response = await get<PaginatedResponse<AdminCategory>>('/categories', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get categories');
    }
  },

  /**
   * Get category tree (Admin view)
   * GET /api/v1/categories/tree
   */
  getCategoryTree: async (includeInactive?: boolean): Promise<AdminCategory[]> => {
    const response = await get<AdminCategory[]>('/categories/tree', { 
      params: { includeInactive } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category tree');
    }
  },

  /**
   * Get category details (Admin view)
   * GET /api/v1/categories/:id
   */
  getCategory: async (id: string): Promise<AdminCategory> => {
    const response = await get<AdminCategory>(`/categories/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category details');
    }
  },

  /**
   * Create category with image
   * POST /api/v1/categories/with-image
   */
  createCategoryWithImage: async (data: CreateCategoryDto, image?: File): Promise<AdminCategory> => {
    const formData = new FormData();
    
    // Add required fields
    formData.append('name', data.name);
    
    // Add optional fields only if they have values
    if (data.description) formData.append('description', data.description);
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
    if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
    if (data.seoKeywords) formData.append('seoKeywords', data.seoKeywords);
    
    // Add image if provided
    if (image) {
      formData.append('image', image);
    }

    const response = await post<AdminCategory>('/categories/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create category');
    }
  },

  /**
   * Create category without image (JSON only)
   * POST /api/v1/categories
   */
  createCategory: async (data: CreateCategoryDto): Promise<AdminCategory> => {
    const response = await post<AdminCategory>('/categories', data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create category');
    }
  },

  /**
   * Update category with image
   * PUT /api/v1/categories/:id/with-image
   */
  updateCategoryWithImage: async (id: string, data: UpdateCategoryDto, image?: File): Promise<AdminCategory> => {
    const formData = new FormData();
    
    // Add fields that are being updated
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
    if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
    if (data.seoKeywords) formData.append('seoKeywords', data.seoKeywords);
    
    // Add image if provided
    if (image) {
      formData.append('image', image);
    }

    const response = await put<AdminCategory>(`/categories/${id}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update category');
    }
  },

  /**
   * Update category without image
   * PUT /api/v1/categories/:id
   */
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<AdminCategory> => {
    const response = await put<AdminCategory>(`/categories/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update category');
    }
  },

  /**
   * Delete category
   * DELETE /api/v1/categories/:id
   */
  deleteCategory: async (id: string, moveProductsTo?: string): Promise<void> => {
    const response = await del(`/categories/${id}`, {
      params: { moveProductsTo }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }
  },

  /**
   * Bulk update categories
   * PATCH /api/v1/categories/bulk
   */
  bulkUpdateCategories: async (categoryIds: string[], data: {
    isActive?: boolean;
    parentId?: string;
    sortOrder?: number;
  }): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/categories/bulk', {
      categoryIds,
      ...data
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk update categories');
    }
  },

  /**
   * Reorder categories
   * PATCH /api/v1/categories/reorder
   */
  reorderCategories: async (categoryOrders: {
    id: string;
    sortOrder: number;
    parentId?: string;
  }[]): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/categories/reorder', {
      categoryOrders
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to reorder categories');
    }
  },

  /**
   * Get category analytics
   * GET /api/v1/categories/analytics
   */
  getCategoryAnalytics: async (): Promise<CategoryAnalytics> => {
    const response = await get<CategoryAnalytics>('/categories/analytics');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category analytics');
    }
  },

  /**
   * Get categories with product count
   * GET /api/v1/categories/with-product-count
   */
  getCategoriesWithProductCount: async (): Promise<{
    id: string;
    name: string;
    productCount: number;
    revenue: string;
  }[]> => {
    const response = await get<{
      id: string;
      name: string;
      productCount: number;
      revenue: string;
    }[]>('/categories/with-product-count');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get categories with product count');
    }
  },

  /**
   * Search categories
   * GET /api/v1/categories/search
   */
  searchCategories: async (query: string, limit?: number): Promise<AdminCategory[]> => {
    const response = await get<AdminCategory[]>('/categories/search', { 
      params: { q: query, limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to search categories');
    }
  },

  /**
   * Validate category structure
   * GET /api/v1/categories/validate-structure
   */
  validateCategoryStructure: async (): Promise<{
    isValid: boolean;
    issues: {
      type: 'orphaned' | 'circular' | 'depth';
      categoryId: string;
      description: string;
    }[];
  }> => {
    const response = await get<{
      isValid: boolean;
      issues: {
        type: 'orphaned' | 'circular' | 'depth';
        categoryId: string;
        description: string;
      }[];
    }>('/categories/validate-structure');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to validate category structure');
    }
  },

  /**
   * Export categories
   * GET /api/v1/categories/export
   */
  exportCategories: (format: 'csv' | 'excel' = 'csv'): string => {
    return `/api/v1/categories/export?format=${format}`;
  },

  /**
   * Import categories from CSV/Excel
   * POST /api/v1/categories/import
   */
  importCategories: async (file: File): Promise<{
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
    }>('/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to import categories');
    }
  }
};

export default adminCategoriesApi;
