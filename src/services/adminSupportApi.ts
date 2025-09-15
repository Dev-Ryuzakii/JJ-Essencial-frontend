import { get, put, post } from './apiClient';

export interface AdminSupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  };
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

export interface AdminSupportTicketDetail {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
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

export interface UpdateTicketStatusDto {
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  notes?: string;
}

export interface AssignTicketDto {
  supportUserId: string;
}

export interface SendMessageDto {
  message: string;
}

export interface SupportStats {
  totalChats: number;
  openChats: number;
  inProgressChats: number;
  closedChats: number;
  highPriorityChats: number;
  chatsByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

const adminSupportApi = {
  /**
   * Get all support tickets with filtering and pagination
   * GET /api/v1/admin/support/tickets
   */
  getTickets: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    priority?: string
  ): Promise<{ 
    chats: AdminSupportTicket[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      totalPages: number; 
    } 
  }> => {
    try {
      // Build query parameters correctly
      const params: Record<string, any> = {
        page: page.toString(),
        limit: limit.toString()
      };
      
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const url = `/admin/support/tickets`;
      const response = await get<{ 
        chats: AdminSupportTicket[]; 
        pagination: { 
          page: number; 
          limit: number; 
          total: number; 
          totalPages: number; 
        } 
      }>(url, { params });

      // Debug the response
      console.log('Raw API response:', response);
      
      // Since the apiClient interceptor already returns response.data, we need to check the actual structure
      // The API returns a SuccessResponseDto with { success: true, message: string, data: { chats: ..., pagination: ... }, timestamp: string }
      if (response && typeof response === 'object' && 'success' in response && response.success === true && 'data' in response) {
        // Extract the actual data from the response
        const responseData = response.data;
        
        // Check if the data has the expected structure
        if (responseData && typeof responseData === 'object' && 'chats' in responseData && 'pagination' in responseData) {
          return responseData as unknown as { 
            chats: AdminSupportTicket[]; 
            pagination: { 
              page: number; 
              limit: number; 
              total: number; 
              totalPages: number; 
            } 
          };
        } else {
          throw new Error('Unexpected data structure in response');
        }
      } else if (response && typeof response === 'object' && 'chats' in response && 'pagination' in response) {
        // Handle case where response is already the data object (legacy format)
        return response as unknown as { 
          chats: AdminSupportTicket[]; 
          pagination: { 
            page: number; 
            limit: number; 
            total: number; 
            totalPages: number; 
          } 
        };
      } else {
        // Handle case where response.data is the actual chats array directly
        // This might happen if the API structure has changed
        if (Array.isArray(response)) {
          return {
            chats: response as unknown as AdminSupportTicket[],
            pagination: {
              page: 1,
              limit: response.length,
              total: response.length,
              totalPages: 1
            }
          };
        }
        throw new Error('Unexpected response structure from server');
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch support tickets');
    }
  },

  /**
   * Get support ticket details
   * GET /api/v1/customer-support/chat/:chatId
   */
  getTicket: async (ticketId: string): Promise<AdminSupportTicketDetail> => {
    try {
      const response = await get<AdminSupportTicketDetail>(`/customer-support/chat/${ticketId}`);
      
      // Since the apiClient interceptor already returns response.data, we can directly return it
      // Check if it's a success response
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response as unknown as AdminSupportTicketDetail;
      } else {
        throw new Error('Failed to fetch ticket details');
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch ticket details');
    }
  },

  /**
   * Update support ticket status
   * PUT /api/v1/admin/support/tickets/:id/status
   */
  updateTicketStatus: async (ticketId: string, statusData: UpdateTicketStatusDto): Promise<any> => {
    try {
      const response = await put(`/admin/support/tickets/${ticketId}/status`, statusData);
      
      // Since the apiClient interceptor already returns response.data, we can directly return it
      // Check if it's a success response
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response;
      } else {
        throw new Error('Failed to update ticket status');
      }
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update ticket status');
    }
  },

  /**
   * Assign ticket to support staff
   * PUT /api/v1/admin/support/tickets/:id/assign
   */
  assignTicket: async (ticketId: string, assignData: AssignTicketDto): Promise<any> => {
    try {
      const response = await put(`/admin/support/tickets/${ticketId}/assign`, assignData);
      
      // Since the apiClient interceptor already returns response.data, we can directly return it
      // Check if it's a success response
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response;
      } else {
        throw new Error('Failed to assign ticket');
      }
    } catch (error: any) {
      console.error('Error assigning ticket:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to assign ticket');
    }
  },

  /**
   * Get support statistics
   * GET /api/v1/admin/support/stats
   */
  getStats: async (): Promise<SupportStats> => {
    try {
      const response = await get<SupportStats>('/admin/support/stats');
      
      // Since the apiClient interceptor already returns response.data, we can directly return it
      // Check if it's a success response
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response as unknown as SupportStats;
      } else {
        throw new Error('Failed to fetch support stats');
      }
    } catch (error: any) {
      console.error('Error fetching support stats:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch support stats');
    }
  },

  /**
   * Send message to support ticket
   * POST /api/v1/customer-support/chat/:chatId/message
   */
  sendMessage: async (ticketId: string, messageData: SendMessageDto): Promise<any> => {
    try {
      const response = await post<any>(`/customer-support/chat/${ticketId}/message`, messageData);
      
      // Since the apiClient interceptor already returns response.data, we can directly return it
      // Check if it's a success response
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
    }
  }
};

export default adminSupportApi;