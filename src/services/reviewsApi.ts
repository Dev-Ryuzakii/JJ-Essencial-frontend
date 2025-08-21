import { post } from './apiClient';

export interface AddReviewData {
  rating: number;
  comment: string;
  images?: string[];
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

const reviewsApi = {
  /**
   * Add a review to a product
   * POST /products/:productId/reviews
   */
  add: async (productId: string, data: AddReviewData): Promise<Review> => {
    const response = await post<Review>(`/products/${productId}/reviews`, data);
    return response.data;
  }
};

export default reviewsApi;
