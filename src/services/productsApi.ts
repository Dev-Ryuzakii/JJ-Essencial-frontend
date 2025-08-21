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
    return response.data;
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
