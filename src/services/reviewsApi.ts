import { get, post, put, del } from './apiClient';
import type { ApiResponse } from './apiClient';

// Review types based on the API documentation
export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewDto {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[]; // For JSON endpoint
}

export interface CreateReviewWithImagesDto {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: File[]; // For multipart endpoint
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
}

// Pagination response structure
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const reviewsApi = {
  /**
   * Get product reviews
   * GET /api/v1/reviews/product/{productId}
   */
  getProductReviews: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ) => {
    const response = await get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  /**
   * Get user reviews (requires authentication)
   * GET /api/v1/reviews/user
   */
  getUserReviews: async (
    params?: {
      page?: number;
      limit?: number;
      productId?: string;
    }
  ) => {
    const response = await get<PaginatedResponse<Review>>('/reviews/user', { params });
    return response.data;
  },

  /**
   * Create review (JSON version)
   * POST /api/v1/reviews
   */
  createReview: async (reviewData: CreateReviewDto): Promise<Review> => {
    const response = await post<Review>('/reviews', reviewData);
    return response.data;
  },

  /**
   * Create review with image upload (NEW multipart endpoint)
   * POST /api/v1/reviews/with-images
   */
  createReviewWithImages: async (reviewData: CreateReviewWithImagesDto): Promise<Review> => {
    const formData = new FormData();
    
    // Add review data
    formData.append('productId', reviewData.productId);
    if (reviewData.orderId) formData.append('orderId', reviewData.orderId);
    formData.append('rating', reviewData.rating.toString());
    if (reviewData.title) formData.append('title', reviewData.title);
    formData.append('comment', reviewData.comment);
    
    // Add image files if provided (max 5 files for reviews)
    if (reviewData.images && reviewData.images.length > 0) {
      const maxFiles = Math.min(reviewData.images.length, 5);
      for (let i = 0; i < maxFiles; i++) {
        formData.append('images', reviewData.images[i]);
      }
    }

    const response = await post<Review>('/reviews/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Update review (requires authentication)
   * PUT /api/v1/reviews/{id}
   */
  updateReview: async (id: string, reviewData: UpdateReviewDto): Promise<Review> => {
    const response = await put<Review>(`/reviews/${id}`, reviewData);
    return response.data;
  },

  /**
   * Delete review (requires authentication)
   * DELETE /api/v1/reviews/{id}
   */
  deleteReview: async (id: string): Promise<{ success: boolean }> => {
    const response = await del<{ success: boolean }>(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Get product rating stats
   * GET /api/v1/reviews/product/{productId}/stats
   */
  getProductRatingStats: async (productId: string): Promise<ReviewStats> => {
    const response = await get<ReviewStats>(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  /**
   * Validate review images before upload
   */
  validateReviewImages: (files: File[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} images allowed for reviews`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Image ${index + 1}: Invalid file type. Allowed: JPEG, JPG, PNG, WebP, GIF`);
      }

      if (file.size > maxSize) {
        errors.push(`Image ${index + 1}: File too large. Maximum size: 5MB`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export default reviewsApi;
