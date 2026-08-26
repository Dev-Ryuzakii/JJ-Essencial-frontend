import { get, post, put, del } from './apiClient';
// Remove the PaginatedResponse import as we're not using it anymore

// Admin product interfaces extending base product types
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string; // Decimal as string, format with toFixed(2)
  salePrice: string | null; // Decimal as string when on sale
  stock: number;
  sku: string;
  images: ProductImage[];
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  featured: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatesdAt: string; // ISO date string
  attributes: ProductAttribute[];
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  categoryId: string;
  lowStockThreshold?: number;
  isActive?: boolean;
  // Note: Images are uploaded separately
}

export interface updatesProductDto extends Partial<CreateProductDto> {}

export interface AdminProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// API Response structure for admin products
export interface AdminProductsResponse {
  success: boolean;
  message: string;
  data: AdminProduct[];
  timestamp: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
  };
}

const adminProductsApi = {
  /**
   * Get all products (Admin view with extended data)
   * GET /admin/products
   */
  getProducts: async (filters?: AdminProductFilter): Promise<AdminProductsResponse> => {
    const params: any = {};
    
    // Add supported parameters with minimal approach like categories
    if (filters?.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortOrder) params.sortOrder = filters.sortOrder;
    
    console.log('Calling API with params:', params);
    const response = await get<any>('/admin/products', { params });
    console.log('Raw API response:', response);
    return response as AdminProductsResponse;
  },

  /**
   * Get product details (Admin view)
   * GET /admin/products/:id
   */
  getProduct: async (id: string): Promise<AdminProduct> => {
    const response = await get<AdminProduct>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Create product 
   * POST /admin/products
   */
  createProduct: async (data: CreateProductDto): Promise<AdminProduct> => {
    const response = await post<AdminProduct>('/admin/products', data);
    return response.data;
  },

  /**
   * updates product
   * PUT /admin/products/:id
   */
  updatesProduct: async (id: string, data: updatesProductDto): Promise<AdminProduct> => {
    const response = await put<AdminProduct>(`/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product
   * DELETE /admin/products/:id
   */
  deleteProduct: async (id: string): Promise<void> => {
    await del(`/admin/products/${id}`);
  },

  /**
   * Upload product images
   * POST /admin/products/:productId/images?isMain=true
   */
  uploadProductImages: async (
    productId: string, 
    files: File[], 
    isMain: boolean = false
  ): Promise<ProductImage[]> => {
    const formData = new FormData();
    
    // Add all image files with the field name "images"
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    // Build the URL with query parameter
    const url = `/admin/products/${productId}/images${isMain ? '?isMain=true' : ''}`;
    
    const response = await post<ProductImage[]>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Set main product image
   * PUT /admin/products/:productId/images/:imageId/main
   */
  setMainImage: async (productId: string, imageId: string): Promise<void> => {
    await put(`/admin/products/${productId}/images/${imageId}/main`, {});
  },

  /**
   * Delete product image
   * DELETE /admin/products/:productId/images/:imageId
   */
  deleteProductImage: async (productId: string, imageId: string): Promise<void> => {
    await del(`/admin/products/${productId}/images/${imageId}`);
  }
};

export default adminProductsApi;
