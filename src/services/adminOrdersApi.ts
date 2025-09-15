import { get, post, put, patch, del } from './apiClient';
import type { PaginatedResponse, PaginationMeta } from '../types';

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
  receiptUrl?: string; // Added to handle payment receipt URLs
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
    images?: ProductImage[]; // Changed to array of ProductImage objects
    isActive: boolean;
    stock: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
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

/**
 * Helper function to safely parse images from API response
 */
const parseProductImages = (imageData: any): ProductImage[] => {
  if (!imageData) return [];

  try {
    // If imageData is already an array of objects, return it
    if (Array.isArray(imageData) && typeof imageData[0] === 'object') {
      return imageData;
    }

    // If imageData is a JSON string, parse it
    if (typeof imageData === 'string') {
      return JSON.parse(imageData);
    }

    // If imageData is an array of strings, parse each one
    if (Array.isArray(imageData)) {
      return imageData.map(img => {
        if (typeof img === 'string') {
          try {
            return JSON.parse(img);
          } catch {
            return { id: Math.random().toString(), url: img, isMain: false, sortOrder: 0 };
          }
        }
        return img;
      });
    }

    return [];
  } catch (error) {
    console.error('Error parsing product images:', error);
    return [];
  }
};

const adminOrdersApi = {
  /**
   * Get all orders (Admin view with extended data)
   * GET /admin/orders
   */
  getOrders: async (filters?: AdminOrderFilter): Promise<PaginatedResponse<AdminOrder>> => {
    console.log('🔍 AdminOrdersApi.getOrders: Fetching orders with filters:', filters);
    
    const response = await get<any>('/admin/orders', { params: filters });
    
    console.log('📦 AdminOrdersApi.getOrders: Raw response:', response);
    
    if (response.success && response.data) {
      // Transform backend data to frontend format
      const transformedOrders = response.data.map((order: any) => {
        console.log('🔄 Transforming order:', order.id);
        
        return {
          id: order.id,
          orderNumber: order.order_number || order.id, // Use order_number if available, fallback to ID
          userId: order.user_id,
          customer: {
            id: order.user_id,
            fullName: order.profile?.full_name || 'Unknown Customer',
            email: order.profile?.email || 'unknown@email.com',
            phone: order.profile?.phone || order.delivery_phone || '',
            avatar: order.profile?.avatar_url || '',
            totalOrders: order.profile?.total_orders || 1,
            totalSpent: order.profile?.total_spent?.toString() || order.total_amount?.toString() || '0'
          },
          items: order.order_item?.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price?.toString() || '0',
            discount: item.discount?.toString() || '0',
            finalPrice: ((item.price - (item.discount || 0)) * item.quantity)?.toString() || '0',
            product: {
              id: item.product?.id || item.product_id,
              name: item.product?.name || 'Unknown Product',
              sku: item.product?.sku || '',
              images: parseProductImages(item.product?.images),
              isActive: item.product?.is_active !== false,
              stock: item.product?.stock || 0
            }
          })) || [],
          status: order.status || 'PENDING',
          paymentStatus: order.payment_status || 'PENDING',
          paymentMethod: order.payment_method || 'bank_transfer',
          paymentId: order.payment_ref || '',
          totalAmount: order.total_amount?.toString() || '0',
          subtotal: order.subtotal?.toString() || order.total_amount?.toString() || '0',
          tax: order.tax?.toString() || '0',
          discount: order.discount?.toString() || '0',
          shippingCost: order.shipping_cost?.toString() || '0',
          receiptUrl: order.receipt_url || '',
          shippingAddress: {
            fullName: order.profile?.full_name || 'Unknown',
            company: order.company || '',
            addressLine1: order.delivery_address || 'No address provided',
            addressLine2: order.delivery_address_line2 || '',
            city: order.delivery_city || '',
            state: order.delivery_state || '',
            postalCode: order.delivery_postal || '',
            country: order.delivery_country || '',
            phone: order.delivery_phone || ''
          },
          billingAddress: {
            fullName: order.profile?.full_name || 'Unknown',
            company: order.company || '',
            addressLine1: order.delivery_address || 'No address provided',
            addressLine2: order.delivery_address_line2 || '',
            city: order.delivery_city || '',
            state: order.delivery_state || '',
            postalCode: order.delivery_postal || '',
            country: order.delivery_country || '',
            phone: order.delivery_phone || ''
          },
          shippingMethod: order.shipping_method || 'standard',
          trackingNumber: order.tracking_number || '',
          trackingUrl: order.tracking_url || '',
          estimatedDelivery: order.estimated_delivery || '',
          actualDelivery: order.actual_delivery || '',
          notes: order.notes || '',
          adminNotes: order.admin_notes || '',
          couponCode: order.coupon_code || '',
          couponDiscount: order.coupon_discount?.toString() || '0',
          refundAmount: order.refund_amount?.toString() || '0',
          refundReason: order.refund_reason || '',
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          statusHistory: []
        } as AdminOrder;
      });
      
      console.log('✅ AdminOrdersApi.getOrders: Transformed orders:', transformedOrders.length);
      
      // Cast response to include pagination data from the curl response
      const paginatedResponse = response as any;
      const pagination = paginatedResponse.pagination || {};
      
      return {
        items: transformedOrders,
        meta: {
          totalItems: pagination.total || transformedOrders.length,
          itemCount: transformedOrders.length,
          itemsPerPage: pagination.limit || 10,
          totalPages: pagination.pages || 1,
          currentPage: pagination.page || 1
        }
      } as PaginatedResponse<AdminOrder>;
    } else {
      console.error('❌ AdminOrdersApi.getOrders: Invalid response:', response);
      throw new Error(response.message || 'Failed to get orders');
    }
  },

  /**
   * Get order details (Admin view)
   * GET /admin/orders/:id
   */
  getOrder: async (id: string): Promise<AdminOrder> => {
    console.log('🔍 AdminOrdersApi.getOrder: Fetching order details for:', id);
    
    const response = await get<any>(`/admin/orders/${id}`);
    
    console.log('📦 AdminOrdersApi.getOrder: Raw response:', response);
    
    if (response.success && response.data) {
      // Transform single order data from backend format to frontend format
      const order = response.data;
      
      console.log('🔄 Transforming single order:', order.id);
      
      const transformedOrder: AdminOrder = {
        id: order.id,
        orderNumber: order.order_number || order.id, // Use order_number if available, fallback to ID
        userId: order.user_id,
        customer: {
          id: order.user_id,
          fullName: order.profile?.full_name || 'Unknown Customer',
          email: order.profile?.email || 'unknown@email.com',
          phone: order.profile?.phone || order.delivery_phone || '',
          avatar: order.profile?.avatar_url || '',
          totalOrders: order.profile?.total_orders || 1,
          totalSpent: order.profile?.total_spent?.toString() || order.total_amount?.toString() || '0'
        },
        items: order.order_item?.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price?.toString() || '0',
          discount: item.discount?.toString() || '0',
          finalPrice: ((item.price - (item.discount || 0)) * item.quantity)?.toString() || '0',
          product: {
            id: item.product?.id || item.product_id,
            name: item.product?.name || 'Unknown Product',
            sku: item.product?.sku || '',
            images: parseProductImages(item.product?.images),
            isActive: item.product?.is_active !== false,
            stock: item.product?.stock || 0
          }
        })) || [],
        status: order.status || 'PENDING',
        paymentStatus: order.payment_status || 'PENDING',
        paymentMethod: order.payment_method || 'bank_transfer',
        paymentId: order.payment_ref || '',
        totalAmount: order.total_amount?.toString() || '0',
        subtotal: order.subtotal?.toString() || order.total_amount?.toString() || '0',
        tax: order.tax?.toString() || '0',
        discount: order.discount?.toString() || '0',
        shippingCost: order.shipping_cost?.toString() || '0',
        receiptUrl: order.receipt_url || '',
        shippingAddress: {
          fullName: order.profile?.full_name || 'Unknown',
          company: order.company || '',
          addressLine1: order.delivery_address || 'No address provided',
          addressLine2: order.delivery_address_line2 || '',
          city: order.delivery_city || '',
          state: order.delivery_state || '',
          postalCode: order.delivery_postal || '',
          country: order.delivery_country || '',
          phone: order.delivery_phone || ''
        },
        billingAddress: {
          fullName: order.profile?.full_name || 'Unknown',
          company: order.company || '',
          addressLine1: order.delivery_address || 'No address provided',
          addressLine2: order.delivery_address_line2 || '',
          city: order.delivery_city || '',
          state: order.delivery_state || '',
          postalCode: order.delivery_postal || '',
          country: order.delivery_country || '',
          phone: order.delivery_phone || ''
        },
        shippingMethod: order.shipping_method || 'standard',
        trackingNumber: order.tracking_number || '',
        trackingUrl: order.tracking_url || '',
        estimatedDelivery: order.estimated_delivery || '',
        actualDelivery: order.actual_delivery || '',
        notes: order.notes || '',
        adminNotes: order.admin_notes || '',
        couponCode: order.coupon_code || '',
        couponDiscount: order.coupon_discount?.toString() || '0',
        refundAmount: order.refund_amount?.toString() || '0',
        refundReason: order.refund_reason || '',
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        statusHistory: []
      };
      
      console.log('✅ AdminOrdersApi.getOrder: Transformed order:', transformedOrder);
      
      return transformedOrder;
    } else {
      console.error('❌ AdminOrdersApi.getOrder: Invalid response:', response);
      const errorResponse = response as any;
      const errorMessage = errorResponse.error?.message || errorResponse.message || 'Failed to get order details';
      throw new Error(errorMessage);
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
  },

  /**
   * View payment receipt
   * GET /admin/orders/:id/receipt
   */
  getPaymentReceipt: async (id: string): Promise<{
    receiptUrl: string;
    uploadedAt: string;
  }> => {
    const response = await get<{
      receiptUrl: string;
      uploadedAt: string;
    }>(`/admin/orders/${id}/receipt`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get payment receipt');
    }
  }
};

export default adminOrdersApi;