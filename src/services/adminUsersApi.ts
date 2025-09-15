import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse, PaginationMeta, ApiResponse, SuccessResponseDto } from '../types';

// Admin-specific user interfaces
export interface AdminUser {
  id: string;
  email: string;
  username?: string; // Added username field
  fullName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
  emailVerified?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface UpdateUserStatusDto {
  isActive: boolean;
  reason?: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  userGrowthData: {
    date: string;
    newUsers: number;
    totalUsers: number;
  }[];
  usersByRole: {
    role: string;
    count: number;
  }[];
  topSpenders: {
    userId: string;
    fullName: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }[];
}

// Helper function to extract data from ApiResponse
const extractData = <T>(response: ApiResponse<T>): T => {
  if ('success' in response && response.success) {
    return (response as SuccessResponseDto<T>).data;
  }
  throw new Error('API request failed');
};

const adminUsersApi = {
  /**
   * Get all users (Admin only)
   * GET /admin/users
   */
  getUsers: async (filters?: AdminUserFilter): Promise<PaginatedResponse<AdminUser>> => {
    const response = await get<any>('/admin/users', { params: filters });
    
    console.log('AdminUsersApi: Raw response:', response);
    
    // Handle different possible response structures from the backend
    let userData: any[] = [];
    let paginationMeta: any = {};
    
    // Type guard to check if response is SuccessResponseDto
    if ('success' in response && response.success) {
      const successResponse = response as SuccessResponseDto<any>;
      if (Array.isArray(successResponse.data)) {
        userData = successResponse.data;
      } else if (successResponse.data && Array.isArray(successResponse.data.items)) {
        userData = successResponse.data.items;
        paginationMeta = successResponse.data.meta || {};
      } else if (successResponse.data && Array.isArray(successResponse.data.data)) {
        userData = successResponse.data.data;
        paginationMeta = successResponse.data.pagination || successResponse.data.meta || {};
      }
    }
    // Handle direct array response (legacy)
    else if (Array.isArray(response)) {
      userData = response;
    }
    // Handle any other structure
    else if ((response as any).data && Array.isArray((response as any).data)) {
      userData = (response as any).data;
      paginationMeta = (response as any).pagination || (response as any).meta || {};
    }
    
    // Transform user data to ensure consistency
    const transformedUsers: AdminUser[] = userData.map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.username || user.email?.split('@')[0] || '',
      fullName: user.fullName || user.full_name || user.name || 'Unknown',
      phone: user.phone || user.phone_number || '',
      avatar: user.avatar || user.avatar_url || '',
      dateOfBirth: user.dateOfBirth || user.date_of_birth || '',
      role: user.role || 'USER',
      isActive: user.isActive !== undefined ? user.isActive : (user.is_active !== undefined ? user.is_active : true),
      emailVerified: user.emailVerified !== undefined ? user.emailVerified : (user.email_verified !== undefined ? user.email_verified : false),
      lastLoginAt: user.lastLoginAt || user.last_login_at || '',
      totalOrders: user.totalOrders || user.total_orders || 0,
      totalSpent: user.totalSpent || user.total_spent || 0,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString()
    }));
    
    console.log('AdminUsersApi: Transformed users sample:', transformedUsers.slice(0, 2));
    
    return {
      items: transformedUsers,
      meta: {
        totalItems: paginationMeta.total || paginationMeta.totalItems || transformedUsers.length,
        itemCount: transformedUsers.length,
        itemsPerPage: paginationMeta.limit || paginationMeta.itemsPerPage || filters?.limit || 10,
        totalPages: paginationMeta.pages || paginationMeta.totalPages || Math.ceil((paginationMeta.total || paginationMeta.totalItems || transformedUsers.length) / (filters?.limit || 10)),
        currentPage: paginationMeta.page || paginationMeta.currentPage || filters?.page || 1
      }
    };
  },

  /**
   * Get user details (Admin only)
   * GET /admin/users/:id
   */
  getUser: async (id: string): Promise<AdminUser> => {
    const response = await get<AdminUser>(`/admin/users/${id}`);
    return extractData(response);
  },

  /**
   * Update user status (Admin only)
   * PATCH /admin/users/:id/status
   */
  updateUserStatus: async (id: string, data: UpdateUserStatusDto): Promise<AdminUser> => {
    const response = await patch<AdminUser>(`/admin/users/${id}/status`, data);
    return extractData(response);
  },

  /**
   * Delete user (Admin only)
   * DELETE /admin/users/:id
   */
  deleteUser: async (id: string): Promise<void> => {
    await del(`/admin/users/${id}`);
  },

  /**
   * Get user analytics (Admin only)
   * GET /admin/users/analytics
   */
  getUserAnalytics: async (period?: '7days' | '30days' | '90days' | '1year'): Promise<UserAnalytics> => {
    const response = await get<UserAnalytics>('/admin/users/analytics', { 
      params: { period } 
    });
    return extractData(response);
  },

  /**
   * Export users data (Admin only)
   * GET /admin/users/export
   */
  exportUsers: (format: 'csv' | 'excel' = 'csv', filters?: AdminUserFilter): string => {
    const queryParams = new URLSearchParams({
      format,
      ...(filters as Record<string, string>)
    }).toString();
    return `/admin/users/export?${queryParams}`;
  },

  /**
   * Send email to user (Admin only)
   * POST /admin/users/:id/send-email
   */
  sendEmailToUser: async (id: string, data: {
    subject: string;
    content: string;
    template?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>(`/admin/users/${id}/send-email`, data);
    return extractData(response);
  },

  /**
   * Bulk update users (Admin only)
   * PATCH /admin/users/bulk
   */
  bulkUpdateUsers: async (userIds: string[], data: {
    isActive?: boolean;
    role?: 'USER' | 'ADMIN';
    emailVerified?: boolean;
  }): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/admin/users/bulk', {
      userIds,
      ...data
    });
    return extractData(response);
  },

  /**
   * Get user activity logs (Admin only)
   * GET /admin/users/:id/activity
   */
  getUserActivity: async (id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<{
    id: string;
    action: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
  }>> => {
    const response = await get<PaginatedResponse<{
      id: string;
      action: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
    }>>(`/admin/users/${id}/activity`, { params });
    return extractData(response);
  },

  /**
   * Search users (Admin only)
   * GET /admin/users/search
   */
  searchUsers: async (query: string, limit?: number): Promise<AdminUser[]> => {
    const response = await get<AdminUser[]>('/admin/users/search', { 
      params: { q: query, limit } 
    });
    return extractData(response);
  }
};

export default adminUsersApi;
