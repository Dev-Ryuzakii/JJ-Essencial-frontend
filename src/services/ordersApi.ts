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
  productId: string;                  // ✅ Updated to match backend field
  quantity: number;
  price: number;                      // ✅ Updated to match backend field (not unitPrice)
  product?: {                         // ✅ Updated to match backend structure
    id: string;
    name: string;
    images?: string[];                // ✅ Updated from image to images array
    price?: number;                   // ✅ Made optional
    sku?: string;                     // ✅ Made optional
    attributes?: Record<string, string>; // ✅ Made optional
  };
  finalPrice?: number;                // ✅ Made optional for backward compatibility
}

export interface Order {
  id: string;
  userId?: string;                    // ✅ Added userId field from backend
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';  // ✅ Added paymentStatus
  paymentRef?: string | null;         // ✅ Added paymentRef 
  receiptUrl?: string | null;         // ✅ Added receiptUrl
  orderItems?: OrderItem[];           // ✅ Renamed from items to orderItems to match backend
  items?: OrderItem[];                // ✅ Keep items for backward compatibility
  createdAt: string;
  updatedAt?: string;                 // ✅ Added updatedAt
  subtotal?: number;                  // ✅ Made optional
  shippingCost?: number;              // ✅ Made optional
  tax?: number;                       // ✅ Made optional
  shippingAddress?: ShippingAddress;  // ✅ Made optional
  paymentMethod?: string;             // ✅ Made optional  
  trackingNumber?: string;
  estimatedDelivery?: string;
  user?: {                            // ✅ Added user object from backend
    id: string;
    fullName?: string;
    email?: string;
  };
  notes?: string;                     // ✅ Added notes field
  // ✅ Delivery address fields from backend response
  deliveryPhone?: string;
  deliveryAddressText?: string;       // ✅ Renamed to avoid conflict with DeliveryAddress interface
  deliveryCity?: string;
  deliveryState?: string;
  deliveryPostal?: string;
  deliveryCountry?: string;
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
  orderNotes?: string;  // ✅ Added orderNotes field to match backend expectations
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

// API Response formatting helpers
const formatOrderResponse = (backendOrder: any): Order => {
  // Handle both camelCase frontend and snake_case database fields
  return {
    id: backendOrder.id,
    userId: backendOrder.userId || backendOrder.user_id,
    totalAmount: parseFloat((backendOrder.totalAmount || backendOrder.total_amount || 0).toString()),
    status: backendOrder.status,
    paymentStatus: backendOrder.paymentStatus || backendOrder.payment_status,
    paymentRef: backendOrder.paymentRef || backendOrder.payment_ref,
    receiptUrl: backendOrder.receiptUrl || backendOrder.receipt_url,
    createdAt: backendOrder.createdAt || backendOrder.created_at,
    updatedAt: backendOrder.updatedAt || backendOrder.updated_at,
    
    // ✅ Add delivery address fields from backend response
    deliveryPhone: backendOrder.deliveryPhone,
    deliveryAddressText: backendOrder.deliveryAddress,
    deliveryCity: backendOrder.deliveryCity,
    deliveryState: backendOrder.deliveryState,
    deliveryPostal: backendOrder.deliveryPostal,
    deliveryCountry: backendOrder.deliveryCountry,
    
    // Handle order items - support both field names
    orderItems: (backendOrder.orderItems || backendOrder.order_item || []).map((item: any) => ({
      id: item.id,
      productId: item.productId || item.product_id,
      quantity: item.quantity,
      price: parseFloat((item.price || 0).toString()),
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images || []
      } : undefined
    })),
    
    // Backward compatibility
    items: (backendOrder.orderItems || backendOrder.order_item || []).map((item: any) => ({
      id: item.id,
      productId: item.productId || item.product_id,
      quantity: item.quantity,
      price: parseFloat((item.price || 0).toString()),
      product: item.product ? {
        id: item.product.id,
        name: item.product.name,
        images: item.product.images || []
      } : undefined
    })),
    
    user: backendOrder.user,
    notes: backendOrder.notes,
    
    // Optional legacy fields
    subtotal: backendOrder.subtotal,
    shippingCost: backendOrder.shippingCost,
    tax: backendOrder.tax,
    paymentMethod: backendOrder.paymentMethod,
    trackingNumber: backendOrder.trackingNumber,
    estimatedDelivery: backendOrder.estimatedDelivery
  };
};

const ordersApi = {
  /**
   * Create a new order - Updated for backend schema compatibility
   * POST /orders
   */
  create: async (data: CreateOrderData): Promise<ApiResponse<Order>> => {
    // Add pre-request logging to see what's actually being sent
    console.log('📦 Order API client: Request data:', JSON.stringify(data, null, 2));
    
    // Format data to match the corrected backend DTO structure
    const formattedData = {
      // Order items with correct structure - backend expects camelCase here
      items: data.items.map(item => ({
        productId: item.productId,  // ✅ Correct: frontend camelCase maps to backend processing
        quantity: item.quantity     // ✅ Only send productId and quantity as per fixed backend DTO
      })),
      
      // Delivery address with proper field mapping
      deliveryAddress: {
        phone: data.deliveryAddress.phone,       // ✅ Required phone field
        address: data.deliveryAddress.address,   // ✅ Maps to delivery_address in DB
        city: data.deliveryAddress.city,         // ✅ Maps to delivery_city in DB  
        state: data.deliveryAddress.state,       // ✅ Maps to delivery_state in DB
        postalCode: data.deliveryAddress.postalCode, // ✅ Maps to delivery_postal in DB
        country: data.deliveryAddress.country    // ✅ Maps to delivery_country in DB
      },
      
      // Optional order notes
      orderNotes: data.orderNotes || null       // ✅ Maps to notes in DB
      
      // ✅ Removed paymentMethod, shippingMethod - handled separately by backend
    };
    
    console.log('📦 Order API client: Formatted request data (aligned with backend fixes):', JSON.stringify(formattedData, null, 2));
    
    const response = await api.post<ApiResponse<any>>('/orders', formattedData);
    
    // Format the response to ensure consistent frontend data structure
    if (response.success && response.data) {
      return {
        ...response,
        data: formatOrderResponse(response.data)
      };
    }
    
    return response as ApiResponse<Order>;
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
   * Get order details by ID - updated with response formatting
   * GET /orders/:id
   */
  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<any>>(`/orders/${id}`);
    
    // Format the response to ensure consistent frontend data structure
    if (response.success && response.data) {
      return {
        ...response,
        data: formatOrderResponse(response.data)
      };
    }
    
    return response as ApiResponse<Order>;
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
