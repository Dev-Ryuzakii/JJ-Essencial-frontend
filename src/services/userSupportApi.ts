import { get, post } from './apiClient';
import type { ApiResponse } from '../types';

// User-facing support ticket types based on API documentation
export interface UserSupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatesdAt: string;
  assignedTo?: string | null;
  messages: Array<{
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
    sender: {
      id: string;
      email: string;
      fullName: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

export interface CreateSupportTicketDto {
  subject: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  initialMessage: string;
}

export interface SendMessageDto {
  message: string;
}

export interface SupportTicketDetail {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatesdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  messages: Array<{
    id: string;
    chatId: string;
    senderId: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
    sender: {
      id: string;
      email: string;
      fullName: string;
    };
  }>;
}

const userSupportApi = {
  /**
   * Create a new support ticket
   * POST /customer-support/chat
   */
  createTicket: async (ticketData: CreateSupportTicketDto): Promise<UserSupportTicket> => {
    try {
      const response = await post<UserSupportTicket>('/customer-support/chat', ticketData);
      
      // Since the apiClient interceptor already returns response.data, we can directly check the structure
      if ('success' in response && response.success && 'data' in response) {
        return response.data;
      } else if ('id' in response && 'subject' in response) {
        // Direct data object (legacy format or direct data)
        return response as unknown as UserSupportTicket;
      } else {
        // Handle error response
        if ('success' in response && !response.success && 'error' in response) {
          throw new Error(response.error.message || 'Failed to create support ticket');
        } else {
          throw new Error('Failed to create support ticket');
        }
      }
    } catch (error: any) {
      console.error('Error creating support ticket:', error);
      console.error('Error details:', {
        statusCode: error.statusCode,
        response: error.response,
        status: error.status,
        message: error.message
      });
      
      // Check if it's an error indicating the feature is not implemented or available
      // Also check the response data for error codes
      const errorMessage = error.message || '';
      const responseStatus = error.response?.status || error.statusCode || error.status;
      
      if (responseStatus === 500 || responseStatus === 400 || responseStatus === 429 ||
          errorMessage.includes('500') || errorMessage.includes('400') || errorMessage.includes('429') ||
          (error.response?.data && (
            error.response.data.statusCode === 500 || 
            error.response.data.statusCode === 400 || 
            error.response.data.statusCode === 429 ||
            error.response.data.message?.includes('500') || 
            error.response.data.message?.includes('400') || 
            error.response.data.message?.includes('429')
          ))) {
        throw new Error('Support system is currently unavailable. Please contact us directly at support@jj-essential.com or call +234-XXX-XXXX-XXX.');
      }
      
      throw new Error(error.message || error.response?.data?.message || 'Failed to create support ticket');
    }
  },

  /**
   * Get user's support tickets
   * GET /customer-support/my-chats
   */
  getMyTickets: async (): Promise<UserSupportTicket[]> => {
    try {
      const response = await get<UserSupportTicket[]>('/customer-support/my-chats');
      
      // Since the apiClient interceptor already returns response.data, we can directly check the structure
      if ('success' in response && response.success && 'data' in response) {
        return response.data;
      } else if (Array.isArray(response)) {
        // Direct array of tickets (legacy format or direct data)
        return response;
      } else {
        // Handle error response
        if ('success' in response && !response.success && 'error' in response) {
          throw new Error(response.error.message || 'Failed to fetch support tickets');
        } else {
          throw new Error('Failed to fetch support tickets');
        }
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      
      // Check if it's an error indicating the feature is not implemented or available
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || 
          error.statusCode === 400 || error.response?.status === 400 || error.status === 400 ||
          error.statusCode === 429 || error.response?.status === 429 || error.status === 429 ||
          error.message?.includes('500') || error.message?.includes('400') || error.message?.includes('429')) {
        console.log('Support system not available, returning empty array');
        return [];
      }
      
      throw new Error(error.message || error.response?.data?.message || 'Failed to fetch support tickets');
    }
  },

  /**
   * Get support ticket details with full conversation
   * GET /customer-support/chat/:chatId
   */
  getTicketDetails: async (ticketId: string): Promise<SupportTicketDetail> => {
    try {
      const response = await get<SupportTicketDetail>(`/customer-support/chat/${ticketId}`);
      
      // Since the apiClient interceptor already returns response.data, we can directly check the structure
      if ('success' in response && response.success && 'data' in response) {
        return response.data;
      } else if ('id' in response && 'subject' in response) {
        // Direct data object (legacy format or direct data)
        return response as unknown as SupportTicketDetail;
      } else {
        // Handle error response
        if ('success' in response && !response.success && 'error' in response) {
          throw new Error(response.error.message || 'Failed to fetch ticket details');
        } else {
          throw new Error('Failed to fetch ticket details');
        }
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      
      // Check if it's an error indicating the feature is not implemented or available
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || 
          error.statusCode === 400 || error.response?.status === 400 || error.status === 400 ||
          error.statusCode === 429 || error.response?.status === 429 || error.status === 429 ||
          error.message?.includes('500') || error.message?.includes('400') || error.message?.includes('429')) {
        throw new Error('Support system is currently unavailable. Please contact us directly at support@jj-essential.com.');
      }
      
      throw new Error(error.message || error.response?.data?.message || 'Failed to fetch ticket details');
    }
  },

  /**
   * Send a message to support ticket
   * POST /customer-support/chat/:chatId/message
   */
  sendMessage: async (ticketId: string, messageData: SendMessageDto): Promise<any> => {
    try {
      const response = await post(`/customer-support/chat/${ticketId}/message`, messageData);
      
      // Since the apiClient interceptor already returns response.data, we can directly check the structure
      if ('success' in response && response.success && 'data' in response) {
        return response.data;
      } else if ('id' in response) {
        // Direct data object (legacy format or direct data)
        return response;
      } else {
        // Handle error response
        if ('success' in response && !response.success && 'error' in response) {
          throw new Error(response.error.message || 'Failed to send message');
        } else {
          throw new Error('Failed to send message');
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Check if it's an error indicating the feature is not implemented or available
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || 
          error.statusCode === 400 || error.response?.status === 400 || error.status === 400 ||
          error.statusCode === 429 || error.response?.status === 429 || error.status === 429 ||
          error.message?.includes('500') || error.message?.includes('400') || error.message?.includes('429')) {
        throw new Error('Support system is currently unavailable. Please contact us directly at support@jj-essential.com.');
      }
      
      throw new Error(error.message || error.response?.data?.message || 'Failed to send message');
    }
  },

  checkAvailability: async (): Promise<boolean> => {
    try {
      const response = await get<UserSupportTicket[]>('/customer-support/my-chats');
      // Since the apiClient interceptor already returns response.data, we can directly check the structure
      if ('success' in response) {
        return response.success !== false;
      } else {
        // For arrays or direct data, assume success
        return true;
      }
    } catch (error: any) {
      // If we get an error that indicates the support system is not implemented or available
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || 
          error.statusCode === 400 || error.response?.status === 400 || error.status === 400 ||
          error.statusCode === 429 || error.response?.status === 429 || error.status === 429 ||
          error.message?.includes('500') || error.message?.includes('400') || error.message?.includes('429')) {
        return false;
      }
      // For other errors, assume it's available but there's a different issue
      return true;
    }
  }
};

export default userSupportApi;