import { get, post, put, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Category types based on the new API documentation
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  level: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryFilter {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  level?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const categoriesApi = {
  /**
   * Get all categories
   * GET /api/v1/categories
   */
  getCategories: async (filters?: CategoryFilter): Promise<PaginatedResponse<Category>> => {
    const response = await get<PaginatedResponse<Category>>('/categories', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get categories');
    }
  },

  /**
   * Get category tree (hierarchical structure)
   * GET /api/v1/categories/tree
   */
  getCategoryTree: async (): Promise<Category[]> => {
    const response = await get<Category[]>('/categories/tree');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category tree');
    }
  },

  /**
   * Get category by ID or slug
   * GET /api/v1/categories/:id
   */
  getCategory: async (id: string): Promise<Category> => {
    const response = await get<Category>(`/categories/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category');
    }
  },

  /**
   * Get category with products
   * GET /api/v1/categories/:id/products
   */
  getCategoryWithProducts: async (id: string, page?: number, limit?: number) => {
    const response = await get(`/categories/${id}/products`, { 
      params: { page, limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category products');
    }
  },

  /**
   * Create category with image upload
   * POST /api/v1/categories
   */
  createCategory: async (data: CreateCategoryDto, image?: File): Promise<Category> => {
    let response;

    if (image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append('image', image);

      response = await post<Category>('/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await post<Category>('/categories', data);
    }
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create category');
    }
  },

  /**
   * Update category with image upload
   * PUT /api/v1/categories/:id
   */
  updateCategory: async (id: string, data: UpdateCategoryDto, image?: File): Promise<Category> => {
    let response;

    if (image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append('image', image);

      response = await put<Category>(`/categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await put<Category>(`/categories/${id}`, data);
    }
    
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
  deleteCategory: async (id: string): Promise<void> => {
    const response = await del(`/categories/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }
  },

  /**
   * Get popular categories
   * GET /api/v1/categories/popular
   */
  getPopularCategories: async (limit?: number): Promise<Category[]> => {
    const response = await get<Category[]>('/categories/popular', { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get popular categories');
    }
  },

  /**
   * Search categories
   * GET /api/v1/categories/search
   */
  searchCategories: async (query: string, limit?: number): Promise<Category[]> => {
    const response = await get<Category[]>('/categories/search', { 
      params: { q: query, limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to search categories');
    }
  }
};

export default categoriesApi;
