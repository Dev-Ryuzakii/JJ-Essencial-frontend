import { get, post, patch } from './apiClient';
import type { PaginatedResponse } from './apiClient';

// Support ticket types based on the new API documentation
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  resolution?: string;
  satisfactionRating?: number;
  satisfactionComment?: string;
  tags: string[];
  estimatedResolutionTime?: string;
  actualResolutionTime?: string;
  createdAt: string;
  updatesdAt: string;
  closedAt?: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export type TicketCategory = 
  | 'ORDER_ISSUE'
  | 'PAYMENT_PROBLEM'
  | 'PRODUCT_INQUIRY'
  | 'SHIPPING_ISSUE'
  | 'RETURN_REFUND'
  | 'ACCOUNT_ISSUE'
  | 'TECHNICAL_SUPPORT'
  | 'GENERAL_INQUIRY'
  | 'COMPLAINT'
  | 'SUGGESTION';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CUSTOMER'
  | 'WAITING_FOR_AGENT'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface TicketAttachment {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  isFromCustomer: boolean;
  isInternal: boolean;
  attachments: TicketAttachment[];
  readAt?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  orderId?: string;
  productId?: string;
}

export interface TicketFilter {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  assignedTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  tags: string[];
  createdAt: string;
  updatesdAt: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  workingHours: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const supportApi = {
  /**
   * Create support ticket with attachments
   * POST /api/v1/support/tickets
   */
  createTicket: async (data: CreateTicketDto, attachments?: File[]): Promise<SupportTicket> => {
    let response;

    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      response = await post<SupportTicket>('/support/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await post<SupportTicket>('/support/tickets', data);
    }
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create support ticket');
    }
  },

  /**
   * Get user's support tickets
   * GET /api/v1/support/tickets
   */
  getTickets: async (filters?: TicketFilter): Promise<PaginatedResponse<SupportTicket>> => {
    const response = await get<PaginatedResponse<SupportTicket>>('/support/tickets', { params: filters });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get support tickets');
    }
  },

  /**
   * Get support ticket by ID
   * GET /api/v1/support/tickets/:id
   */
  getTicket: async (id: string): Promise<SupportTicket> => {
    const response = await get<SupportTicket>(`/support/tickets/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get support ticket');
    }
  },

  /**
   * Add message to support ticket
   * POST /api/v1/support/tickets/:id/messages
   */
  addTicketMessage: async (
    ticketId: string, 
    content: string, 
    attachments?: File[]
  ): Promise<TicketMessage> => {
    let response;

    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append('content', content);
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      response = await post<TicketMessage>(`/support/tickets/${ticketId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await post<TicketMessage>(`/support/tickets/${ticketId}/messages`, { content });
    }
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to add message to ticket');
    }
  },

  /**
   * Close support ticket
   * PATCH /api/v1/support/tickets/:id/close
   */
  closeTicket: async (id: string): Promise<SupportTicket> => {
    const response = await patch<SupportTicket>(`/support/tickets/${id}/close`, {});
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to close support ticket');
    }
  },

  /**
   * Reopen support ticket
   * PATCH /api/v1/support/tickets/:id/reopen
   */
  reopenTicket: async (id: string): Promise<SupportTicket> => {
    const response = await patch<SupportTicket>(`/support/tickets/${id}/reopen`, {});
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to reopen support ticket');
    }
  },

  /**
   * Rate support ticket satisfaction
   * POST /api/v1/support/tickets/:id/rate
   */
  rateTicket: async (
    id: string, 
    rating: number, 
    comment?: string
  ): Promise<SupportTicket> => {
    const response = await post<SupportTicket>(`/support/tickets/${id}/rate`, {
      rating,
      comment
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to rate support ticket');
    }
  },

  /**
   * Get FAQ items
   * GET /api/v1/support/faq
   */
  getFAQ: async (category?: string): Promise<FAQItem[]> => {
    const response = await get<FAQItem[]>('/support/faq', { 
      params: { category } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get FAQ items');
    }
  },

  /**
   * Search FAQ items
   * GET /api/v1/support/faq/search
   */
  searchFAQ: async (query: string): Promise<FAQItem[]> => {
    const response = await get<FAQItem[]>('/support/faq/search', { 
      params: { q: query } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to search FAQ items');
    }
  },

  /**
   * Rate FAQ item helpful/not helpful
   * POST /api/v1/support/faq/:id/rate
   */
  rateFAQ: async (id: string, helpful: boolean): Promise<{ success: boolean }> => {
    const response = await post<{ success: boolean }>(`/support/faq/${id}/rate`, {
      helpful
    });
    
    if (response.success) {
      return { success: true };
    } else {
      throw new Error(response.message || 'Failed to rate FAQ item');
    }
  },

  /**
   * Get contact information
   * GET /api/v1/support/contact
   */
  getContactInfo: async (): Promise<ContactInfo> => {
    const response = await get<ContactInfo>('/support/contact');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get contact information');
    }
  },

  /**
   * Send general contact form
   * POST /api/v1/support/contact
   */
  sendContactForm: async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>('/support/contact', data);
    
    if (response.success) {
      return response.data || { success: true, message: 'Contact form sent successfully' };
    } else {
      throw new Error(response.message || 'Failed to send contact form');
    }
  },

  /**
   * Get support categories
   * GET /api/v1/support/categories
   */
  getSupportCategories: async (): Promise<{ category: TicketCategory; label: string; description: string }[]> => {
    const response = await get<{ category: TicketCategory; label: string; description: string }[]>('/support/categories');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      // Return default categories if API call fails
      return [
        { category: 'ORDER_ISSUE', label: 'Order Issue', description: 'Problems with orders' },
        { category: 'PAYMENT_PROBLEM', label: 'Payment Problem', description: 'Payment and billing issues' },
        { category: 'PRODUCT_INQUIRY', label: 'Product Inquiry', description: 'Questions about products' },
        { category: 'SHIPPING_ISSUE', label: 'Shipping Issue', description: 'Delivery and shipping problems' },
        { category: 'RETURN_REFUND', label: 'Return/Refund', description: 'Returns and refund requests' },
        { category: 'ACCOUNT_ISSUE', label: 'Account Issue', description: 'Account and profile problems' },
        { category: 'TECHNICAL_SUPPORT', label: 'Technical Support', description: 'Technical problems with the website' },
        { category: 'GENERAL_INQUIRY', label: 'General Inquiry', description: 'General questions and inquiries' }
      ];
    }
  }
};

export default supportApi;
