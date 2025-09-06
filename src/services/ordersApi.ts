import { api } from '../lib/api';

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface DeliveryAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    sku: string;
    attributes?: Record<string, string>;
  };
  quantity: number;
  price: number;
  finalPrice: number;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderDetails extends Order {
  deliveryAddress: DeliveryAddress;
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: DeliveryAddress;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderInvoice {
  id: string;
  pdfUrl: string;
  createdAt: string;
}

// Define the API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

const ordersApi = {
  /**
   * Create a new order
   * POST /orders
   */
  create: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
    // Add pre-request logging to see what's actually being sent
    console.log('📦 Order API client: Request data:', JSON.stringify(data, null, 2));
    
    // Ensure the fields are correctly formatted for the backend
    const formattedData = {
      ...data,
      items: data.items.map(item => ({
        // Include both formats to be safe - the backend might expect product_id
        productId: item.productId,
        product_id: item.productId,
        quantity: item.quantity
      }))
    };
    
    console.log('📦 Order API client: Formatted request data:', JSON.stringify(formattedData, null, 2));
    
    return await api.post<ApiResponse<Order>>('/orders', formattedData);
  },

  /**
   * List user orders with filtering (original function that returns paginated response)
   * GET /orders
   */
  list: async (params: OrdersQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    return await api.get<ApiResponse<PaginatedResponse<Order>>>('/orders', { params });
  },

  /**
   * Get all user orders - added to match the component usage in Orders.tsx
   * GET /orders
   */
  getAll: async (params: OrdersQueryParams = {}): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await api.get<ApiResponse<Order[]>>('/orders', { params });
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch orders'
      };
    }
  },

  /**
   * Get order details by ID - added to match the component usage in OrderDetail.tsx
   * GET /orders/:id
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error; // Let the component handle the error
    }
  },

  /**
   * Cancel an order
   * PATCH /orders/:id/cancel
   */
  cancelOrder: async (id: string, reason?: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error; // Let the component handle the error
    }
  },

  /**
   * Get order invoice
   * GET /orders/:id/invoice
   */
  getOrderInvoice: async (id: string): Promise<OrderInvoice> => {
    try {
      // First try to get invoice from API
      const response = await api.get<ApiResponse<OrderInvoice>>(`/orders/${id}/invoice`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        // Fallback if API doesn't return expected format
        return {
          id: id,
          pdfUrl: '', // No URL available
          createdAt: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`Error fetching invoice for order ${id}:`, error);
      // Return a minimal object if API call fails
      return {
        id: id,
        pdfUrl: '', // No URL available
        createdAt: new Date().toISOString()
      };
    }
  },

  /**
   * Get order confirmation details
   * GET /orders/confirmation
   */
  getOrderConfirmation: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      // In a real implementation, this would call a backend endpoint
      // For now, we'll just proxy to the getById method
      return await ordersApi.getById(orderId);
    } catch (error) {
      console.error(`Error fetching order confirmation for ${orderId}:`, error);
      throw error; // Let the component handle the error
    }
  }
};

export default ordersApi;
