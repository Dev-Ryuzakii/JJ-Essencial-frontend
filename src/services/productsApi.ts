import { get, post } from './apiClient';
import type { PaginatedResponse } from './apiClient';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: Category;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  images?: string[];
  user: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface ProductDetails extends Product {
  reviews: Review[];
  isActive?: boolean; // Add isActive field for frontend use
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'price' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface AddReviewData {
  rating: number;
  comment: string;
  images?: string[];
}

const productsApi = {
  /**
   * List products with filtering and pagination
   * GET /products
   */
  list: async (params: ProductsQueryParams = {}): Promise<PaginatedResponse<Product>> => {
    const response = await get<PaginatedResponse<Product>>('/products', { params });
    return response.data;
  },

  /**
   * Get product details including reviews
   * GET /products/:id
   */
  getById: async (id: string): Promise<ProductDetails> => {
    const response = await get<ProductDetails>(`/products/${id}`);
    const product = response.data;
    
    // Ensure both camelCase and snake_case fields are available for backend compatibility
    const rawProduct = product as any;
    
    // If backend sends isActive but not is_active, add is_active
    if (typeof rawProduct.isActive !== 'undefined' && typeof rawProduct.is_active === 'undefined') {
      rawProduct.is_active = rawProduct.isActive;
    }
    
    // If backend sends is_active but not isActive, add isActive  
    if (typeof rawProduct.is_active !== 'undefined' && typeof rawProduct.isActive === 'undefined') {
      rawProduct.isActive = rawProduct.is_active;
    }
    
    // If neither field exists, default both to true
    if (typeof rawProduct.isActive === 'undefined' && typeof rawProduct.is_active === 'undefined') {
      rawProduct.isActive = true;
      rawProduct.is_active = true;
    }
    
    return product;
  },

  /**
   * Add a review to a product
   * POST /products/:productId/reviews
   */
  addReview: async (productId: string, data: AddReviewData): Promise<Review> => {
    const response = await post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  }
};

export default productsApi;
