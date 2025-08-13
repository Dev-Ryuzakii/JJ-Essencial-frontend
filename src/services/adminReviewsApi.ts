import { get, post, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Admin review interfaces
export interface AdminReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVisible: boolean;
  isVerified: boolean;
  isApproved: boolean;
  isFlagged: boolean;
  flagReason?: string;
  adminResponse?: string;
  adminRespondedBy?: string;
  adminRespondedAt?: string;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
    totalReviews: number;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string;
    isActive: boolean;
  };
}

export interface AdminReviewFilter {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  userId?: string;
  rating?: number;
  isVisible?: boolean;
  isVerified?: boolean;
  isApproved?: boolean;
  isFlagged?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface UpdateReviewVisibilityDto {
  isVisible: boolean;
  reason?: string;
}

export interface UpdateReviewStatusDto {
  isApproved?: boolean;
  isVerified?: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  adminNote?: string;
}

export interface AdminResponseDto {
  adminResponse: string;
}

export interface ReviewAnalytics {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  averageRating: number;
  reviewsToday: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  topReviewedProducts: {
    productId: string;
    productName: string;
    reviewCount: number;
    averageRating: number;
  }[];
  mostActiveReviewers: {
    userId: string;
    userName: string;
    reviewCount: number;
    averageRating: number;
  }[];
  reviewTrends: {
    date: string;
    reviews: number;
    averageRating: number;
  }[];
}

const adminReviewsApi = {
  /**
   * Get all reviews (Admin view with extended data)
   * GET /api/v1/admin/reviews
   */
  getReviews: async (filters?: AdminReviewFilter): Promise<PaginatedResponse<AdminReview>> => {
    const response = await get<PaginatedResponse<AdminReview>>('/admin/reviews', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get reviews');
    }
  },

  /**
   * Get review details (Admin view)
   * GET /api/v1/admin/reviews/:id
   */
  getReview: async (id: string): Promise<AdminReview> => {
    const response = await get<AdminReview>(`/admin/reviews/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get review details');
    }
  },

  /**
   * Update review visibility
   * PATCH /api/v1/admin/reviews/:id/visibility
   */
  updateReviewVisibility: async (id: string, data: UpdateReviewVisibilityDto): Promise<AdminReview> => {
    const response = await patch<AdminReview>(`/admin/reviews/${id}/visibility`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update review visibility');
    }
  },

  /**
   * Update review status (approval, verification, flagging)
   * PATCH /api/v1/admin/reviews/:id/status
   */
  updateReviewStatus: async (id: string, data: UpdateReviewStatusDto): Promise<AdminReview> => {
    const response = await patch<AdminReview>(`/admin/reviews/${id}/status`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update review status');
    }
  },

  /**
   * Add admin response to review
   * POST /api/v1/admin/reviews/:id/response
   */
  addAdminResponse: async (id: string, data: AdminResponseDto): Promise<AdminReview> => {
    const response = await post<AdminReview>(`/admin/reviews/${id}/response`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add admin response');
    }
  },

  /**
   * Delete review
   * DELETE /api/v1/admin/reviews/:id
   */
  deleteReview: async (id: string, reason?: string): Promise<void> => {
    const response = await del(`/admin/reviews/${id}`, {
      data: { reason }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete review');
    }
  },

  /**
   * Bulk update reviews
   * PATCH /api/v1/admin/reviews/bulk
   */
  bulkUpdateReviews: async (reviewIds: string[], data: {
    isVisible?: boolean;
    isApproved?: boolean;
    isVerified?: boolean;
    isFlagged?: boolean;
    flagReason?: string;
  }): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/admin/reviews/bulk', {
      reviewIds,
      ...data
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk update reviews');
    }
  },

  /**
   * Bulk delete reviews
   * DELETE /api/v1/admin/reviews/bulk
   */
  bulkDeleteReviews: async (reviewIds: string[], reason?: string): Promise<{ deleted: number }> => {
    const response = await del<{ deleted: number }>('/admin/reviews/bulk', {
      data: { reviewIds, reason }
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk delete reviews');
    }
  },

  /**
   * Get pending reviews (awaiting approval)
   * GET /api/v1/admin/reviews/pending
   */
  getPendingReviews: async (limit?: number): Promise<AdminReview[]> => {
    const response = await get<AdminReview[]>('/admin/reviews/pending', { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get pending reviews');
    }
  },

  /**
   * Get flagged reviews
   * GET /api/v1/admin/reviews/flagged
   */
  getFlaggedReviews: async (limit?: number): Promise<AdminReview[]> => {
    const response = await get<AdminReview[]>('/admin/reviews/flagged', { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get flagged reviews');
    }
  },

  /**
   * Get recent reviews
   * GET /api/v1/admin/reviews/recent
   */
  getRecentReviews: async (limit: number = 10): Promise<AdminReview[]> => {
    const response = await get<AdminReview[]>('/admin/reviews/recent', { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get recent reviews');
    }
  },

  /**
   * Get review analytics
   * GET /api/v1/admin/reviews/analytics
   */
  getReviewAnalytics: async (period?: '7days' | '30days' | '90days' | '1year'): Promise<ReviewAnalytics> => {
    const response = await get<ReviewAnalytics>('/admin/reviews/analytics', { 
      params: { period } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get review analytics');
    }
  },

  /**
   * Search reviews
   * GET /api/v1/admin/reviews/search
   */
  searchReviews: async (query: string, limit?: number): Promise<AdminReview[]> => {
    const response = await get<AdminReview[]>('/admin/reviews/search', { 
      params: { q: query, limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to search reviews');
    }
  },

  /**
   * Get reviews by product (Admin view)
   * GET /api/v1/admin/reviews/product/:productId
   */
  getReviewsByProduct: async (productId: string, filters?: {
    page?: number;
    limit?: number;
    rating?: number;
    isVisible?: boolean;
  }): Promise<PaginatedResponse<AdminReview>> => {
    const response = await get<PaginatedResponse<AdminReview>>(`/admin/reviews/product/${productId}`, { 
      params: filters 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get reviews by product');
    }
  },

  /**
   * Get reviews by user (Admin view)
   * GET /api/v1/admin/reviews/user/:userId
   */
  getReviewsByUser: async (userId: string, filters?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<PaginatedResponse<AdminReview>> => {
    const response = await get<PaginatedResponse<AdminReview>>(`/admin/reviews/user/${userId}`, { 
      params: filters 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get reviews by user');
    }
  },

  /**
   * Export reviews
   * GET /api/v1/admin/reviews/export
   */
  exportReviews: (format: 'csv' | 'excel' = 'csv', filters?: AdminReviewFilter): string => {
    const queryParams = new URLSearchParams({
      format,
      ...(filters as Record<string, string>)
    }).toString();
    return `/api/v1/admin/reviews/export?${queryParams}`;
  },

  /**
   * Generate review report
   * GET /api/v1/admin/reviews/report
   */
  generateReviewReport: async (params: {
    startDate: string;
    endDate: string;
    format?: 'json' | 'pdf';
    includeCharts?: boolean;
  }): Promise<{
    reportUrl?: string;
    data?: ReviewAnalytics;
  }> => {
    const response = await get<{
      reportUrl?: string;
      data?: ReviewAnalytics;
    }>('/admin/reviews/report', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to generate review report');
    }
  }
};

export default adminReviewsApi;
