import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Notification types based on the new API documentation
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  isRead: boolean;
  data?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'ORDER_CONFIRMED' 
  | 'ORDER_SHIPPED' 
  | 'ORDER_DELIVERED' 
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PRODUCT_BACK_IN_STOCK'
  | 'PRICE_DROP'
  | 'REVIEW_REQUEST'
  | 'WISHLIST_ITEM_SALE'
  | 'ACCOUNT_UPDATE'
  | 'SECURITY_ALERT'
  | 'SYSTEM_MAINTENANCE'
  | 'MARKETING'
  | 'GENERAL';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalOffers: boolean;
  securityAlerts: boolean;
  priceAlerts: boolean;
  stockAlerts: boolean;
}

export interface NotificationFilter {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<string, number>;
}

const notificationsApi = {
  /**
   * Get user notifications
   * GET /api/v1/notifications
   */
  getNotifications: async (filters?: NotificationFilter): Promise<PaginatedResponse<Notification>> => {
    const response = await get<PaginatedResponse<Notification>>('/notifications', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get notifications');
    }
  },

  /**
   * Get notification by ID
   * GET /api/v1/notifications/:id
   */
  getNotification: async (id: string): Promise<Notification> => {
    const response = await get<Notification>(`/notifications/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get notification');
    }
  },

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await patch<Notification>(`/notifications/${id}/read`, {});
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark notification as unread
   * PATCH /api/v1/notifications/:id/unread
   */
  markAsUnread: async (id: string): Promise<Notification> => {
    const response = await patch<Notification>(`/notifications/${id}/unread`, {});
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to mark notification as unread');
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/notifications/mark-all-read', {});
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification: async (id: string): Promise<void> => {
    const response = await del(`/notifications/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete notification');
    }
  },

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications
   */
  deleteAllNotifications: async (): Promise<{ deleted: number }> => {
    const response = await del<{ deleted: number }>('/notifications');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to delete all notifications');
    }
  },

  /**
   * Get notification statistics
   * GET /api/v1/notifications/stats
   */
  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await get<NotificationStats>('/notifications/stats');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get notification stats');
    }
  },

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await get<NotificationPreferences>('/notifications/preferences');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get notification preferences');
    }
  },

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  updateNotificationPreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const response = await put<NotificationPreferences>('/notifications/preferences', preferences);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update notification preferences');
    }
  },

  /**
   * Test notification (for admin testing)
   * POST /api/v1/notifications/test
   */
  sendTestNotification: async (type: NotificationType, title: string, message: string): Promise<Notification> => {
    const response = await post<Notification>('/notifications/test', {
      type,
      title,
      message
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to send test notification');
    }
  }
};

export default notificationsApi;
