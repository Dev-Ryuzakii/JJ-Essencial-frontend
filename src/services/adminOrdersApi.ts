import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Admin order interfaces with extended data
export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
    totalOrders: number;
    totalSpent: string;
  };
  items: AdminOrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentId?: string;
  totalAmount: string;
  subtotal: string;
  tax: string;
  discount: string;
  shippingCost: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shippingMethod: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  adminNotes?: string;
  couponCode?: string;
  couponDiscount?: string;
  refundAmount?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[];
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  discount?: string;
  finalPrice: string;
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string;
    isActive: boolean;
    stock: number;
  };
}

export interface OrderAddress {
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string;
  changedBy: string;
  changedByName: string;
  createdAt: string;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURNED' 
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export interface AdminOrderFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  note?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  notifyCustomer?: boolean;
}

export interface UpdatePaymentStatusDto {
  paymentStatus: PaymentStatus;
  paymentId?: string;
  note?: string;
  notifyCustomer?: boolean;
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: string;
  averageOrderValue: string;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  revenueByDay: {
    date: string;
    revenue: string;
    orders: number;
  }[];
  ordersByStatus: {
    status: OrderStatus;
    count: number;
    percentage: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    revenue: string;
    percentage: number;
  }[];
  topCustomers: {
    userId: string;
    customerName: string;
    email: string;
    totalOrders: number;
    totalSpent: string;
  }[];
}

const adminOrdersApi = {
  /**
   * Get all orders (Admin view with extended data)
   * GET /admin/orders
   */
  getOrders: async (filters?: AdminOrderFilter): Promise<PaginatedResponse<AdminOrder>> => {
    const response = await get<PaginatedResponse<AdminOrder>>('/admin/orders', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get orders');
    }
  },

  /**
   * Get order details (Admin view)
   * GET /admin/orders/:id
   */
  getOrder: async (id: string): Promise<AdminOrder> => {
    const response = await get<AdminOrder>(`/admin/orders/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order details');
    }
  },

  /**
   * Update order status
   * PATCH /admin/orders/:id/status
   */
  updateOrderStatus: async (id: string, data: UpdateOrderStatusDto): Promise<AdminOrder> => {
    const response = await patch<AdminOrder>(`/admin/orders/${id}/status`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update order status');
    }
  },

  /**
   * Update payment status
   * PATCH /admin/orders/:id/payment-status
   */
  updatePaymentStatus: async (id: string, data: UpdatePaymentStatusDto): Promise<AdminOrder> => {
    const response = await patch<AdminOrder>(`/admin/orders/${id}/payment-status`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update payment status');
    }
  },

  /**
   * Add admin note to order
   * POST /admin/orders/:id/notes
   */
  addAdminNote: async (id: string, note: string, isInternal: boolean = true): Promise<{
    id: string;
    note: string;
    isInternal: boolean;
    createdBy: string;
    createdAt: string;
  }> => {
    const response = await post<{
      id: string;
      note: string;
      isInternal: boolean;
      createdBy: string;
      createdAt: string;
    }>(`/admin/orders/${id}/notes`, { note, isInternal });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add admin note');
    }
  },

  /**
   * Process refund
   * POST /admin/orders/:id/refund
   */
  processRefund: async (id: string, data: {
    amount: number;
    reason: string;
    refundMethod?: string;
    notifyCustomer?: boolean;
  }): Promise<{
    id: string;
    amount: string;
    status: string;
    refundId?: string;
  }> => {
    const response = await post<{
      id: string;
      amount: string;
      status: string;
      refundId?: string;
    }>(`/admin/orders/${id}/refund`, data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to process refund');
    }
  },

  /**
   * Cancel order
   * PATCH /admin/orders/:id/cancel
   */
  cancelOrder: async (id: string, reason: string, notifyCustomer: boolean = true): Promise<AdminOrder> => {
    const response = await patch<AdminOrder>(`/admin/orders/${id}/cancel`, {
      reason,
      notifyCustomer
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to cancel order');
    }
  },

  /**
   * Bulk update orders
   * PATCH /admin/orders/bulk
   */
  bulkUpdateOrders: async (orderIds: string[], data: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    note?: string;
    notifyCustomers?: boolean;
  }): Promise<{ updated: number }> => {
    const response = await patch<{ updated: number }>('/admin/orders/bulk', {
      orderIds,
      ...data
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to bulk update orders');
    }
  },

  /**
   * Get order analytics
   * GET /admin/orders/analytics
   */
  getOrderAnalytics: async (period?: '7days' | '30days' | '90days' | '1year'): Promise<OrderAnalytics> => {
    const response = await get<OrderAnalytics>('/admin/orders/analytics', { 
      params: { period } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order analytics');
    }
  },

  /**
   * Get recent orders
   * GET /admin/orders/recent
   */
  getRecentOrders: async (limit: number = 10): Promise<AdminOrder[]> => {
    const response = await get<AdminOrder[]>('/admin/orders/recent', { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get recent orders');
    }
  },

  /**
   * Get orders by status
   * GET /admin/orders/by-status/:status
   */
  getOrdersByStatus: async (status: OrderStatus, limit?: number): Promise<AdminOrder[]> => {
    const response = await get<AdminOrder[]>(`/admin/orders/by-status/${status}`, { 
      params: { limit } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get orders by status');
    }
  },

  /**
   * Export orders
   * GET /admin/orders/export
   */
  exportOrders: (format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: AdminOrderFilter): string => {
    const queryParams = new URLSearchParams({
      format,
      ...(filters as Record<string, string>)
    }).toString();
    return `/admin/orders/export?${queryParams}`;
  },

  /**
   * Generate order invoice
   * GET /admin/orders/:id/invoice
   */
  generateInvoice: async (id: string): Promise<{
    invoiceUrl: string;
    invoiceNumber: string;
  }> => {
    const response = await get<{
      invoiceUrl: string;
      invoiceNumber: string;
    }>(`/admin/orders/${id}/invoice`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to generate invoice');
    }
  },

  /**
   * Send order email to customer
   * POST /admin/orders/:id/send-email
   */
  sendOrderEmail: async (id: string, emailType: 'confirmation' | 'shipped' | 'delivered' | 'cancelled'): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await post<{
      success: boolean;
      message: string;
    }>(`/admin/orders/${id}/send-email`, { emailType });
    
    if (response.success) {
      return response.data || { success: true, message: 'Email sent successfully' };
    } else {
      throw new Error(response.message || 'Failed to send order email');
    }
  },

  /**
   * Get order timeline/history
   * GET /admin/orders/:id/timeline
   */
  getOrderTimeline: async (id: string): Promise<OrderStatusHistory[]> => {
    const response = await get<OrderStatusHistory[]>(`/admin/orders/${id}/timeline`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order timeline');
    }
  }
};

export default adminOrdersApi;
