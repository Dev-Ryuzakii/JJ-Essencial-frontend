import { get, post } from './apiClient';
import type { PaginatedResponse } from './apiClient';

export interface DeliveryAddress {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
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
  status?: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
}

const ordersApi = {
  /**
   * Create a new order
   * POST /orders
   */
  create: async (data: CreateOrderData): Promise<OrderDetails> => {
    const response = await post<OrderDetails>('/orders', data);
    return response.data;
  },

  /**
   * List user orders with filtering
   * GET /orders
   */
  list: async (params: OrdersQueryParams = {}): Promise<PaginatedResponse<Order>> => {
    const response = await get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  }
};

export default ordersApi;
