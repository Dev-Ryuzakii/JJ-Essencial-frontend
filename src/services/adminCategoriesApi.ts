import { get, post, put, patch, del } from './apiClient';

// Admin category interfaces
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string; // Backend uses snake_case
  parent_id?: string; // Backend uses snake_case
  parent?: AdminCategory;
  children?: AdminCategory[];
  level?: number;
  sort_order: number; // Backend uses snake_case
  is_active: boolean; // Backend uses snake_case
  product_count?: number; // Backend uses snake_case
  total_revenue?: string; // Backend uses snake_case
  seo_title?: string; // Backend uses snake_case
  seo_description?: string; // Backend uses snake_case
  seo_keywords?: string; // Backend uses snake_case
  created_by?: string; // Backend uses snake_case
  created_at: string; // Backend uses snake_case
  updatesd_at: string; // Backend uses snake_case
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

export interface updatesCategoryDto extends Partial<CreateCategoryDto> {}

export interface AdminCategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  level?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';  // Backend expects uppercase
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
   * GET /admin/categories
   */
  getCategories: async (filters?: AdminCategoryFilter): Promise<AdminCategory[]> => {
    const params: any = {};
    
    // Only add parameters that we know work - test minimal first
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }
    
    // Test without other parameters first
    // if (filters?.includeInactive !== undefined) params.includeInactive = filters.includeInactive.toString();
    // if (filters?.sortBy) params.sortBy = filters.sortBy;
    // if (filters?.sortOrder) params.sortOrder = filters.sortOrder.toUpperCase();
    
    const response = await get<AdminCategory[]>('/admin/categories', { params });
    return response.data;
  },

  /**
   * Get category tree (Admin view)
   * GET /admin/categories/tree
   */
  getCategoryTree: async (includeInactive?: boolean): Promise<AdminCategory[]> => {
    const response = await get<AdminCategory[]>('/admin/categories/tree', { 
      params: { includeInactive } 
    });
    return response.data;
  },

  /**
   * Get category details (Admin view)
   * GET /admin/categories/:id
   */
  getCategory: async (id: string): Promise<AdminCategory> => {
    const response = await get<AdminCategory>(`/admin/categories/${id}`);
    return response.data;
  },

  /**
   * Create category with or without image
   * POST /admin/categories
   */
  createCategory: async (data: CreateCategoryDto, image?: File): Promise<AdminCategory> => {
    if (image) {
      // Use FormData when image is provided
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
      
      // Add image
      formData.append('image', image);

      const response = await post<AdminCategory>('/admin/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Use JSON when no image
      const response = await post<AdminCategory>('/admin/categories', data);
      return response.data;
    }
  },

  /**
   * updates category with or without image
   * PUT /admin/categories/:id
   */
  updatesCategory: async (id: string, data: updatesCategoryDto, image?: File): Promise<AdminCategory> => {
    if (image) {
      // Use FormData when image is provided
      const formData = new FormData();
      
      // Add fields that are being updatesd
      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.parentId) formData.append('parentId', data.parentId);
      if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
      if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
      if (data.seoTitle) formData.append('seoTitle', data.seoTitle);
      if (data.seoDescription) formData.append('seoDescription', data.seoDescription);
      if (data.seoKeywords) formData.append('seoKeywords', data.seoKeywords);
      
      // Add image
      formData.append('image', image);

      const response = await put<AdminCategory>(`/admin/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // Use JSON when no image
      const response = await put<AdminCategory>(`/admin/categories/${id}`, data);
      return response.data;
    }
  },

  /**
   * Delete category
   * DELETE /admin/categories/:id
   */
  deleteCategory: async (id: string, moveProductsTo?: string): Promise<void> => {
    await del(`/admin/categories/${id}`, {
      params: { moveProductsTo }
    });
  },

  /**
   * Bulk updates categories
   * PATCH /admin/categories/bulk
   */
  bulkupdatesCategories: async (categoryIds: string[], data: {
    isActive?: boolean;
    parentId?: string;
    sortOrder?: number;
  }): Promise<{ updatesd: number }> => {
    const response = await patch<{ updatesd: number }>('/admin/categories/bulk', {
      categoryIds,
      ...data
    });
    return response.data;
  },

  /**
   * Reorder categories
   * PATCH /admin/categories/reorder
   */
  reorderCategories: async (categoryOrders: {
    id: string;
    sortOrder: number;
    parentId?: string;
  }[]): Promise<{ updatesd: number }> => {
    const response = await patch<{ updatesd: number }>('/admin/categories/reorder', {
      categoryOrders
    });
    return response.data;
  },

  /**
   * Get category analytics
   * GET /admin/categories/analytics
   */
  getCategoryAnalytics: async (): Promise<CategoryAnalytics> => {
    const response = await get<CategoryAnalytics>('/admin/categories/analytics');
    return response.data;
  },

  /**
   * Get categories with product count
   * GET /admin/categories/with-product-count
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
    }[]>('/admin/categories/with-product-count');
    return response.data;
  },

  /**
   * Search categories
   * GET /admin/categories/search
   */
  searchCategories: async (query: string, limit?: number): Promise<AdminCategory[]> => {
    const response = await get<AdminCategory[]>('/admin/categories/search', { 
      params: { q: query, limit } 
    });
    return response.data;
  },

  /**
   * Validate category structure
   * GET /admin/categories/validate-structure
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
    }>('/admin/categories/validate-structure');
    return response.data;
  },

  /**
   * Export categories
   * GET /admin/categories/export
   */
  exportCategories: (format: 'csv' | 'excel' = 'csv'): string => {
    return `/admin/categories/export?format=${format}`;
  },

  /**
   * Import categories from CSV/Excel
   * POST /admin/categories/import
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
    }>('/admin/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default adminCategoriesApi;
