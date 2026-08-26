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
  productId: string;                  // ✅ updatesd to match backend field
  quantity: number;
  price: number;                      // ✅ updatesd to match backend field (not unitPrice)
  product?: {                         // ✅ updatesd to match backend structure
    id: string;
    name: string;
    images?: string[];                // ✅ updatesd from image to images array
    price?: number;                   // ✅ Made optional
    sku?: string;                     // ✅ Made optional
    attributes?: Record<string, string>; // ✅ Made optional
  };
  finalPrice?: number;                // ✅ Made optional for backward compatibility
}

export interface Order {
  id: string;
  orderNumber?: string;               // ✅ NEW: 6-digit order number (e.g., "123456") - optional for backward compatibility
  userId?: string;                    // ✅ Added userId field from backend
  totalAmount: number;
  status: OrderStatus;
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';  // ✅ Added paymentStatus
  paymentRef?: string | null;         // ✅ Added paymentRef 
  receiptUrl?: string | null;         // ✅ Added receiptUrl
  orderItems?: OrderItem[];           // ✅ Renamed from items to orderItems to match backend
  items?: OrderItem[];                // ✅ Keep items for backward compatibility
  createdAt: string;
  updatesdAt?: string;                 // ✅ Added updatesdAt
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
    orderNumber: backendOrder.orderNumber || backendOrder.order_number || backendOrder.id.slice(-6).toUpperCase(), // ✅ Use backend orderNumber or fallback
    userId: backendOrder.userId || backendOrder.user_id,
    totalAmount: parseFloat((backendOrder.totalAmount || backendOrder.total_amount || 0).toString()),
    status: backendOrder.status,
    paymentStatus: backendOrder.paymentStatus || backendOrder.payment_status,  // ✅ Now available from backend
    paymentRef: backendOrder.paymentRef || backendOrder.payment_ref,
    receiptUrl: backendOrder.receiptUrl || backendOrder.receipt_url,
    createdAt: backendOrder.createdAt || backendOrder.created_at,
    updatesdAt: backendOrder.updatesdAt || backendOrder.updatesd_at,
    
    // ✅ Add delivery address fields from backend response
    deliveryPhone: backendOrder.deliveryPhone,
    deliveryAddressText: backendOrder.deliveryAddress,  // ✅ Map backend field to frontend expectation
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
    notes: backendOrder.notes,  // ✅ Add missing backend field
    
    // Optional legacy fields
    subtotal: backendOrder.subtotal,
    shippingCost: backendOrder.shippingCost,
    tax: backendOrder.tax,
    paymentMethod: backendOrder.paymentMethod,
    trackingNumber: backendOrder.trackingNumber,
    estimatedDelivery: backendOrder.estimatedDelivery
  };
};

// ✅ updatesd interfaces to match backend SuccessResponseDto
interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;  // ✅ Backend includes timestamp
}

// ✅ Backend returns orders in this format
interface BackendOrdersResponse {
  orders: any[];  // ✅ Backend returns 'orders' array
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const ordersApi = {
  /**
   * Create a new order - updatesd for backend schema compatibility
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
    
    // Enhanced order creation with timeout handling and retry logic
    const createOrderWithRetry = async (attempt: number = 1): Promise<ApiResponse<any>> => {
      try {
        console.log(`📦 Order API client: Attempt ${attempt} - Creating order...`);
        
        // Use extended timeout for order creation (90 seconds)
        const response = await api.post<ApiResponse<any>>('/orders', formattedData, {
          timeout: 90000 // 90 seconds for order creation
        });
        
        console.log(`✅ Order API client: Order created successfully on attempt ${attempt}`);
        return response;
      } catch (error: any) {
        console.error(`❌ Order API client: Attempt ${attempt} failed:`, error.message);
        
        // Check if it's a timeout error and we haven't exceeded max attempts
        if ((error.code === 'ECONNABORTED' || error.message?.includes('timeout')) && attempt < 3) {
          console.log(`🔄 Order API client: Retrying order creation (attempt ${attempt + 1}/3)...`);
          // Exponential backoff: wait 2s, then 4s
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          return createOrderWithRetry(attempt + 1);
        }
        
        // If it's not a timeout or we've exceeded max attempts, throw the error
        throw error;
      }
    };
    
    const response = await createOrderWithRetry();
    
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
   * Get all user orders - updatesd to match backend response format
   * GET /orders
   */
  getAll: async (params: OrdersQueryParams = {}): Promise<ApiResponse<Order[]>> => {
    try {
      console.log('🔍 Orders API: Making request to GET /orders with params:', params);
      console.log('🌍 Orders API: Base URL being used:', import.meta.env.VITE_API_URL || 'https://jj-essencial-b33c39ba.afribase.dev/api/v1');
      console.log('🔑 Orders API: Auth token exists:', !!localStorage.getItem('access_token'));
      
      // Debug: Log the actual token being used (first/last 10 chars for security)
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('🔐 Orders API: Token preview:', token.substring(0, 10) + '...' + token.substring(token.length - 10));
        console.log('🔐 Orders API: Full token length:', token.length);
      }
      
      // Use the backend response interface
      const response = await api.get<BackendApiResponse<BackendOrdersResponse>>('/orders', { params });
      console.log('📦 Orders API: Raw response:', response);
      console.log('🔍 Orders API: Response data structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasOrders: response.data && 'orders' in response.data,
        ordersLength: response.data && response.data.orders ? response.data.orders.length : 'N/A',
        paginationDetails: response.data && response.data.pagination ? response.data.pagination : null,
        fullDataObject: response.data
      });
      
      // Compare with your curl test - let's see the exact query parameters being sent
      console.log('🔍 Orders API: Query params being sent:', params);
      console.log('🔍 Orders API: Full URL would be:', `https://jj-essencial-b33c39ba.afribase.dev/api/v1/orders?${new URLSearchParams(params as any).toString()}`);
      
      // Debug: Compare token with your working curl token
      const curlToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OWU1OGQxMi1hNjFhLTRmYzUtYmRiYS03MjUyNTM5OTBmYjYiLCJlbWFpbCI6ImZhbGFkZXJhc2FxMjJAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTc3OTkzNDMsImV4cCI6MTc1ODQwNDE0M30.0Y-lLAE8u5kKaicVhzHg1CABqqe8_UogDocvSilqd1I";
      const currentToken = localStorage.getItem('access_token');
      console.log('🔍 Orders API: Token comparison:', {
        tokensMatch: currentToken === curlToken,
        currentTokenEnd: currentToken?.substring(currentToken.length - 10),
        curlTokenEnd: curlToken.substring(curlToken.length - 10)
      });
      
      // Handle the backend SuccessResponseDto format
      if (response.success && response.data) {
        // NEW: Handle backend's { orders: [], pagination: {} } format
        if (response.data.orders && Array.isArray(response.data.orders)) {
          console.log('✅ Orders API: Got orders array with', response.data.orders.length, 'orders');
          
          // If we got 0 orders but expected some, try without parameters
          if (response.data.orders.length === 0 && Object.keys(params).length > 0) {
            console.log('🔄 Orders API: Got 0 orders with params, trying without params...');
            const simpleResponse = await api.get<BackendApiResponse<BackendOrdersResponse>>('/orders');
            console.log('🔄 Orders API: Simple response (no params):', simpleResponse);
            
            if (simpleResponse.success && simpleResponse.data && simpleResponse.data.orders) {
              console.log('✅ Orders API: Simple request found', simpleResponse.data.orders.length, 'orders');
              return {
                success: simpleResponse.success,
                data: simpleResponse.data.orders.map(formatOrderResponse),
                message: simpleResponse.message
              };
            }
          }
          
          return {
            success: response.success,
            data: response.data.orders.map(formatOrderResponse),  // Transform each order
            message: response.message
          };
        }
      }
      
      console.log('⚠️ Orders API: Unexpected response format, returning empty array');
      return {
        success: true,
        data: [],
        message: 'No orders found'
      };
    } catch (error) {
      console.error('❌ Orders API: Error fetching orders:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch orders'
      };
    }
  },

  /**
   * Get order details by ID - updatesd with response formatting
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
  },

  /**
   * ✅ NEW: Search by order number specifically
   * GET /orders?search=orderNumber
   */
  searchByOrderNumber: async (orderNumber: string): Promise<ApiResponse<Order[]>> => {
    try {
      console.log('🔍 Orders API: Searching by order number:', orderNumber);
      
      const response = await api.get<BackendApiResponse<BackendOrdersResponse>>(`/orders?search=${orderNumber}`);
      
      if (response.success && response.data && response.data.orders) {
        return {
          success: response.success,
          data: response.data.orders.map(formatOrderResponse),
          message: response.message
        };
      }
      
      return {
        success: false,
        data: [],
        message: 'No orders found with that order number'
      };
    } catch (error) {
      console.error(`Error searching for order number ${orderNumber}:`, error);
      return {
        success: false,
        data: [],
        message: 'Failed to search orders'
      };
    }
  }
};

export default ordersApi;
