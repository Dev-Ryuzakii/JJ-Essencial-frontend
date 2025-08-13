import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Updated Order types based on the new API documentation
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  shippingCost: number;
  tax: number;
  discount: number;
  subtotal: number;
  notes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  finalPrice: number;
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string;
    attributes?: Record<string, string>;
  };
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: string;
  notes?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topSellingProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
  paymentMethodBreakdown: {
    method: string;
    count: number;
    percentage: number;
  }[];
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';

export interface OrderHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface OrderRefund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  items?: {
    orderItemId: string;
    quantity: number;
  }[];
  refundMethod: string;
  refundId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDeliveryDays: number;
  carrier: string;
  active: boolean;
}

export interface OrderNote {
  id: string;
  orderId: string;
  note: string;
  userId: string;
  userName: string;
  isInternal: boolean;
  createdAt: string;
}

export interface OrderInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID';
  dueDate?: string;
  pdfUrl: string;
  createdAt: string;
  updatedAt: string;
}

const ordersApi = {
  /**
   * Create order
   * POST /api/v1/orders
   */
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await post<Order>('/orders', data);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create order');
    }
  },

  /**
   * Get user orders
   * GET /api/v1/orders
   */
  getOrders: async (filters?: OrderFilter): Promise<PaginatedResponse<Order>> => {
    const response = await get<PaginatedResponse<Order>>('/orders', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get orders');
    }
  },

  /**
   * Get order by ID
   * GET /api/v1/orders/:id
   */
  getOrder: async (id: string): Promise<Order> => {
    const response = await get<Order>(`/orders/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order');
    }
  },

  /**
   * Update an order
   * PUT /api/v1/orders/:id
   */
  updateOrder: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const response = await put<Order>(`/orders/${id}`, orderData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update order');
    }
  },

  /**
   * Update order status
   * PATCH /api/v1/orders/:id/status
   */
  updateOrderStatus: async (id: string, status: OrderStatus, note?: string): Promise<Order> => {
    const response = await patch<Order>(`/orders/${id}/status`, { status, note });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update order status');
    }
  },

  /**
   * Update payment status
   * PATCH /api/v1/orders/:id/payment-status
   */
  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus, note?: string): Promise<Order> => {
    const response = await patch<Order>(`/orders/${id}/payment-status`, { paymentStatus, note });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update payment status');
    }
  },

  /**
   * Cancel order
   * PATCH /api/v1/orders/:id/cancel
   */
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await patch<Order>(`/orders/${id}/cancel`, { reason });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to cancel order');
    }
  },

  /**
   * Delete an order
   * DELETE /api/v1/orders/:id
   */
  deleteOrder: async (id: string): Promise<{ success: boolean }> => {
    const response = await del<{ success: boolean }>(`/orders/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to delete order');
    }
  },

  /**
   * Get order statistics
   * GET /api/v1/orders/stats
   */
  getOrderStats: async (params?: { startDate?: string; endDate?: string }): Promise<OrderStats> => {
    const response = await get<OrderStats>('/orders/stats', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order stats');
    }
  },

  /**
   * Get order history (status changes)
   * GET /api/v1/orders/:id/history
   */
  getOrderHistory: async (orderId: string): Promise<OrderHistory[]> => {
    const response = await get<OrderHistory[]>(`/orders/${orderId}/history`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order history');
    }
  },

  /**
   * Get order invoice
   * GET /api/v1/orders/:id/invoice
   */
  getOrderInvoice: async (id: string): Promise<{ pdfUrl: string; invoiceNumber: string }> => {
    const response = await get<{ pdfUrl: string; invoiceNumber: string }>(`/orders/${id}/invoice`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order invoice');
    }
  },

  /**
   * Add a note to an order
   * POST /api/v1/orders/:id/notes
   */
  addOrderNote: async (orderId: string, note: string, isInternal: boolean = false): Promise<OrderNote> => {
    const response = await post<OrderNote>(`/orders/${orderId}/notes`, { note, isInternal });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add order note');
    }
  },

  /**
   * Get order notes
   * GET /api/v1/orders/:id/notes
   */
  getOrderNotes: async (orderId: string): Promise<OrderNote[]> => {
    const response = await get<OrderNote[]>(`/orders/${orderId}/notes`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order notes');
    }
  },

  /**
   * Update tracking information
   * PATCH /api/v1/orders/:id/tracking
   */
  updateTracking: async (orderId: string, trackingData: {
    trackingNumber: string;
    trackingUrl?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }): Promise<Order> => {
    const response = await patch<Order>(`/orders/${orderId}/tracking`, trackingData);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to update tracking');
    }
  }
};

export default ordersApi;
