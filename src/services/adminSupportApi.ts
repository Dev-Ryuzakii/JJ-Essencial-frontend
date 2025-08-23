import { get, patch } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Support ticket types for admin interface based on API documentation
export interface AdminSupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt?: string;
  user: {
    id?: string;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  messages?: Array<{
    id: string;
    content: string;
    isFromCustomer: boolean;
    createdAt: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  assignedTo?: string | null;
}

export interface AdminSupportTicketDetail {
  chat: {
    id: string;
    userId: string;
    assignedTo: string | null;
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
    };
  };
  messages: Array<{
    id: string;
    chatId: string;
    senderId: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
    sender: {
      fullName: string;
    };
  }>;
  relatedOrders: Array<{
    id: string;
    totalAmount: string;
    status: string;
    createdAt: string;
  }>;
}

export interface UpdateSupportTicketStatusDto {
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
  addMessage?: string;
}

export interface ReplySupportTicketDto {
  message: string;
  updateStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

export interface AdminSupportFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: string;
}

const adminSupportApi = {
  /**
   * Get all support tickets with admin view
   * GET /admin/support/tickets
   */
  getTickets: async (filters?: AdminSupportFilters): Promise<PaginatedResponse<AdminSupportTicket>> => {
    try {
      const response = await get<PaginatedResponse<AdminSupportTicket>>('/admin/support/tickets', {
        params: filters
      });
      
      console.log('AdminSupportApi: Raw response:', response.data);
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('No data received from server');
      }
    } catch (error: any) {
      console.error('Error fetching support tickets:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch support tickets');
    }
  },

  /**
   * Get support ticket by ID
   * GET /admin/support/tickets/:id
   */
  getTicketById: async (id: string): Promise<AdminSupportTicketDetail> => {
    try {
      const response = await get<AdminSupportTicketDetail>(`/admin/support/tickets/${id}`);
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch support ticket');
      }
    } catch (error: any) {
      console.error('Error fetching support ticket:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch support ticket');
    }
  },

  /**
   * Update support ticket status
   * PUT /admin/support/tickets/:id/status
   */
  updateTicketStatus: async (id: string, data: UpdateSupportTicketStatusDto): Promise<AdminSupportTicket> => {
    try {
      const response = await patch<AdminSupportTicket>(`/admin/support/tickets/${id}/status`, data);
      
      if (response.data) {
        return response.data;
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
   * PUT /admin/support/tickets/:id/assign
   */
  assignTicket: async (id: string, assignedTo: string): Promise<AdminSupportTicket> => {
    try {
      const response = await patch<AdminSupportTicket>(`/admin/support/tickets/${id}/assign`, { assignedTo });
      
      if (response.data) {
        return response.data;
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
   * GET /admin/support/stats
   */
  getStats: async (): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    urgent: number;
  }> => {
    try {
      const response = await get<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        urgent: number;
      }>('/admin/support/stats');
      
      if (response.data) {
        return response.data;
      } else {
        // Fallback to calculating stats from tickets
        return adminSupportApi.getTicketStats();
      }
    } catch (error: any) {
      console.error('Error fetching support stats:', error);
      // Fallback to calculating stats from tickets
      return adminSupportApi.getTicketStats();
    }
  },

  /**
   * Get support ticket statistics
   */
  getTicketStats: async (): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    urgent: number;
  }> => {
    try {
      // Fetch all tickets to calculate stats
      const response = await adminSupportApi.getTickets({ limit: 1000 });
      const tickets = response.data || [];

      return {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'CLOSED').length,
        urgent: tickets.filter(t => t.priority === 'HIGH').length,
      };
    } catch (error: any) {
      console.error('Error fetching ticket stats:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0,
      };
    }
  }
};

export default adminSupportApi;
