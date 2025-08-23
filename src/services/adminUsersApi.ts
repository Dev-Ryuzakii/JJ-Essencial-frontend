import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

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

const adminUsersApi = {
  /**
   * Get all users (Admin only)
   * GET /admin/users
   */
  getUsers: async (filters?: AdminUserFilter): Promise<PaginatedResponse<AdminUser>> => {
    const response = await get<any>('/admin/users', { params: filters });
    
    console.log('AdminUsersApi: Raw response:', response);
    
    // The response from the backend has this structure:
    // { success: true, data: AdminUser[], pagination: {...} }
    // But the apiClient returns { data: { success: true, data: AdminUser[], pagination: {...} } }
    
    if (response.data && Array.isArray(response.data)) {
      // Direct array - no pagination info
      return {
        data: response.data,
        meta: {
          total: response.data.length,
          page: 1,
          lastPage: 1,
          hasNextPage: false
        }
      };
    } else if (response.data && response.data.data) {
      // Nested structure with pagination
      const backendData = response.data;
      return {
        data: backendData.data,
        meta: {
          total: backendData.pagination?.total || backendData.data.length,
          page: backendData.pagination?.page || 1,
          lastPage: backendData.pagination?.pages || Math.ceil((backendData.pagination?.total || backendData.data.length) / (filters?.limit || 10)),
          hasNextPage: backendData.pagination?.hasNext || false
        }
      };
    } else {
      // Fallback - return the response as-is if it matches our expected structure
      return response.data;
    }
  },

  /**
   * Get user details (Admin only)
   * GET /admin/users/:id
   */
  getUser: async (id: string): Promise<AdminUser> => {
    const response = await get<AdminUser>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Update user status (Admin only)
   * PATCH /admin/users/:id/status
   */
  updateUserStatus: async (id: string, data: UpdateUserStatusDto): Promise<AdminUser> => {
    const response = await patch<AdminUser>(`/admin/users/${id}/status`, data);
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
  },

  /**
   * Search users (Admin only)
   * GET /admin/users/search
   */
  searchUsers: async (query: string, limit?: number): Promise<AdminUser[]> => {
    const response = await get<AdminUser[]>('/admin/users/search', { 
      params: { q: query, limit } 
    });
    return response.data;
  }
};

export default adminUsersApi;
