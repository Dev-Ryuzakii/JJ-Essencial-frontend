import { get, post } from './apiClient';
import type { ApiResponse } from '../types';

// User-facing support ticket types based on API documentation
export interface UserSupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
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
  updatedAt: string;
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
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.success === false ? response.error.message : 'Failed to create support ticket');
      }
    } catch (error: any) {
      console.error('Error creating support ticket:', error);
      
      // Check if it's a 500 error indicating the feature is not implemented
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || error.message?.includes('500')) {
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
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.success === false ? response.error.message : 'Failed to fetch support tickets');
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      
      // Check if it's a 500 error indicating the feature is not implemented
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || error.message?.includes('500')) {
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
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.success === false ? response.error.message : 'Failed to fetch ticket details');
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      
      // Check if it's a 500 error indicating the feature is not implemented
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || error.message?.includes('500')) {
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
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.success === false ? response.error.message : 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Check if it's a 500 error indicating the feature is not implemented
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || error.message?.includes('500')) {
        throw new Error('Support system is currently unavailable. Please contact us directly at support@jj-essential.com.');
      }
      
      throw new Error(error.message || error.response?.data?.message || 'Failed to send message');
    }
  },

  /**
   * Check if support system is available
   */
  checkAvailability: async (): Promise<boolean> => {
    try {
      const response = await get<UserSupportTicket[]>('/customer-support/my-chats');
      return response.success !== false;
    } catch (error: any) {
      // If we get a 500 error, the support system is not implemented
      if (error.statusCode === 500 || error.response?.status === 500 || error.status === 500 || error.message?.includes('500')) {
        return false;
      }
      // For other errors, assume it's available but there's a different issue
      return true;
    }
  }
};

export default userSupportApi;