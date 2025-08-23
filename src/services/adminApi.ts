// Import all specialized admin API services
import adminUsersApi from './adminUsersApi';
import adminProductsApi from './adminProductsApi';
import adminOrdersApi from './adminOrdersApi';
import adminCategoriesApi from './adminCategoriesApi';
import adminReviewsApi from './adminReviewsApi';
import adminAnalyticsApi from './adminAnalyticsApi';
import { post, get, put, patch, del } from './apiClient';

/**
 * Comprehensive Admin API Layer
 * Integrates all specialized admin services for complete administrative functionality
 */

// Re-export all admin API interfaces for easy access
export * from './adminUsersApi';
export * from './adminProductsApi';
export * from './adminOrdersApi';
export * from './adminCategoriesApi';
export * from './adminReviewsApi';
export * from './adminAnalyticsApi';

// Response structure as per API documentation
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Pagination response structure
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response structure
export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

// Admin Dashboard Stats
export interface AdminDashboardStats {
  salesSummary: {
    totalSales: string;
    orderCount: number;
    averageOrderValue: string;
    comparisonPeriod: {
      totalSales: string;
      orderCount: number;
      percentChange: {
        totalSales: number;
        orderCount: number;
      }
    }
  };
  orderStats: {
    pending: number;
    paid: number;
    completed: number;
    cancelled: number;
  };
  productStats: {
    totalProducts: number;
    lowStock: number;
    outOfStock: number;
    topSelling: Array<{
      id: string;
      name: string;
      totalSold: number;
      revenue: string;
    }>;
  };
  userStats: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
  };
  recentOrders: Array<{
    id: string;
    totalAmount: string;
    status: string;
    createdAt: string;
    user: {
      fullName: string;
    };
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    title: string;
    createdAt: string;
    product: {
      name: string;
    };
    user: {
      fullName: string;
    };
  }>;
  salesChart: {
    labels: string[];
    data: number[];
  };
}

// Payment Management DTOs
export interface AdminPaymentDto {
  id: string;
  orderId: string;
  reference: string;
  amount: string;
  gateway: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
  };
}

export interface AdminPaymentDetailDto extends AdminPaymentDto {
  gatewayData: any;
  order: {
    id: string;
    totalAmount: string;
    status: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  receipts: Array<{
    id: string;
    receiptUrl: string;
    originalName: string;
    verificationStatus: string;
    uploadedBy: string;
    verifiedBy: string | null;
    createdAt: string;
  }>;
}

export interface UpdatePaymentStatusDto {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  notes?: string;
  updateOrder?: boolean;
}

export interface VerifyReceiptDto {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
  updatePaymentStatus?: boolean;
}

// Support Management DTOs
export interface AdminSupportChatDto {
  id: string;
  userId: string;
  assignedTo: string | null;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
  lastMessage: {
    message: string;
    createdAt: string;
    isAdmin: boolean;
  };
  messageCount: number;
}

export interface AdminSupportChatDetailDto {
  chat: {
    id: string;
    userId: string;
    assignedTo: string | null;
    subject: string;
    status: string;
    priority: string;
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

export interface UpdateChatStatusDto {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  addMessage?: string;
}

export interface ReplySupportChatDto {
  message: string;
  updateStatus?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
}

// Admin Settings DTOs
export interface AdminSettingsDto {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderAutoConfirm: boolean;
  lowStockThreshold: number;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  defaultLanguage: string;
  dateFormat: string;
  timeFormat: string;
}

export interface UpdateAdminSettingsDto {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  currency?: string;
  timezone?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  orderAutoConfirm?: boolean;
  lowStockThreshold?: number;
  taxRate?: number;
  shippingFee?: number;
  freeShippingThreshold?: number;
  defaultLanguage?: string;
  dateFormat?: string;
  timeFormat?: string;
}

// Bank Account Management DTOs
export interface BankAccountDto {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountDto {
  bank_name: string;
  account_name: string;
  account_number: string;
  currency?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export interface UpdateBankAccountDto {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  currency?: string;
  is_default?: boolean;
  is_active?: boolean;
}

// Reports DTOs
export interface SalesReportDto {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalSales: string;
    orderCount: number;
    averageOrderValue: string;
    totalRefunds: string;
    netSales: string;
  };
  salesByDay: Array<{
    date: string;
    orderCount: number;
    totalSales: string;
  }>;
  salesByCategory: Array<{
    category: string;
    orderCount: number;
    totalSales: string;
    percentage: number;
  }>;
  salesByPaymentMethod: Array<{
    gateway: string;
    orderCount: number;
    totalSales: string;
    percentage: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sku: string | null;
    quantitySold: number;
    totalSales: string;
  }>;
  topCustomers: Array<{
    id: string;
    fullName: string;
    email: string;
    orderCount: number;
    totalSpent: string;
  }>;
  downloadUrl: string | null;
}

export interface InventoryReportDto {
  summary: {
    totalProducts: number;
    totalStockValue: string;
    lowStockCount: number;
    outOfStockCount: number;
    overStockedCount: number;
  };
  stockByCategory: Array<{
    category: string;
    productCount: number;
    totalStock: number;
    stockValue: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    sku: string | null;
    category: string;
    stock: number;
    lowStockThreshold: number;
    price: string;
    stockValue: string;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVER_STOCK';
    lastRestock: string | null;
    avgSalesPerMonth: number;
  }>;
  downloadUrl: string | null;
}

/**
 * Comprehensive Admin API combining all specialized services
 * Provides a unified interface for all administrative operations
 */
const adminApi = {
  // Specialized service APIs
  users: adminUsersApi,
  products: adminProductsApi,
  orders: adminOrdersApi,
  categories: adminCategoriesApi,
  reviews: adminReviewsApi,
  analytics: adminAnalyticsApi,
  /**
   * Get admin dashboard statistics
   * GET /admin/dashboard/stats
   */
  // Dashboard Statistics
  getDashboardStats: async (dateRange?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AdminDashboardStats> => {
    const params: any = {};
    if (dateRange?.period) params.period = dateRange.period;
    if (dateRange?.startDate) params.startDate = dateRange.startDate;
    if (dateRange?.endDate) params.endDate = dateRange.endDate;
    
    const response = await get<AdminDashboardStats>('/admin/dashboard/stats', { params });
    return response.data;
  },

  // Payment Management (not covered by specialized APIs)
  payments: {
    /**
     * Get all payments (paginated)
     * GET /admin/payments
     */
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      status?: string;
      gateway?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<PaginatedResponse<AdminPaymentDto>> => {
      const response = await get<PaginatedResponse<AdminPaymentDto>>('/payments/history', { params });
      return response.data;
    },

    /**
     * Get payment by ID
     * GET /admin/payments/:id
     */
    getById: async (id: string): Promise<AdminPaymentDetailDto> => {
      const response = await get<AdminPaymentDetailDto>(`/payments/${id}`);
      return response.data;
    },

    /**
     * Update payment status
     * PATCH /admin/payments/:id/status
     */
    updateStatus: async (id: string, data: UpdatePaymentStatusDto): Promise<AdminPaymentDto> => {
      const response = await patch<AdminPaymentDto>(`/payments/${id}/status`, data);
      return response.data;
    },

    /**
     * Verify payment receipt
     * PATCH /admin/payments/receipts/:id/verify
     */
    verifyReceipt: async (id: string, data: VerifyReceiptDto): Promise<any> => {
      const response = await patch<any>(`/payments/receipt/${id}/verify`, data);
      return response.data;
    }
  },

  // Support Management (not covered by specialized APIs)
  support: {
    /**
     * Get all support chats (paginated)
     * GET /admin/support
     */
    getAll: async (params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      status?: string;
      priority?: string;
      assignedTo?: string;
    }): Promise<PaginatedResponse<AdminSupportChatDto>> => {
      const response = await get<PaginatedResponse<AdminSupportChatDto>>('/customer-support/admin/chats', { params });
      return response.data;
    },

    /**
     * Get chat by ID
     * GET /admin/support/:id
     */
    getById: async (id: string): Promise<AdminSupportChatDetailDto> => {
      const response = await get<AdminSupportChatDetailDto>(`/customer-support/admin/chat/${id}`);
      return response.data;
    },

    /**
     * Update chat status
     * PATCH /admin/support/:id/status
     */
    updateStatus: async (id: string, data: UpdateChatStatusDto): Promise<AdminSupportChatDto> => {
      const response = await patch<AdminSupportChatDto>(`/customer-support/admin/chat/${id}/status`, data);
      return response.data;
    },

    /**
     * Reply to support chat
     * POST /admin/support/:id/reply
     */
    reply: async (id: string, data: ReplySupportChatDto): Promise<AdminSupportChatDto> => {
      const response = await post<AdminSupportChatDto>(`/customer-support/admin/chat/${id}/reply`, data);
      return response.data;
    }
  },

  // System Settings
  settings: {
    /**
     * Get system settings
     * GET /admin/settings
     */
    getSettings: async (): Promise<AdminSettingsDto> => {
      const response = await get<AdminSettingsDto>('/admin/settings');
      return response.data;
    },

    /**
     * Update system settings
     * PUT /admin/settings
     */
    updateSettings: async (data: UpdateAdminSettingsDto): Promise<AdminSettingsDto> => {
      const response = await put<AdminSettingsDto>('/admin/settings', data);
      return response.data;
    },

    /**
     * Get bank accounts
     * GET /admin/settings/bank-accounts
     */
    getBankAccounts: async (): Promise<BankAccountDto[]> => {
      const response = await get<BankAccountDto[]>('/admin/settings/bank-accounts');
      return response.data;
    },

    /**
     * Create bank account
     * POST /admin/settings/bank-accounts
     */
    createBankAccount: async (data: CreateBankAccountDto): Promise<BankAccountDto> => {
      const response = await post<BankAccountDto>('/admin/settings/bank-accounts', data);
      return response.data;
    },

    /**
     * Update bank account
     * PUT /admin/settings/bank-accounts/:id
     */
    updateBankAccount: async (id: string, data: UpdateBankAccountDto): Promise<BankAccountDto> => {
      const response = await put<BankAccountDto>(`/admin/settings/bank-accounts/${id}`, data);
      return response.data;
    },

    /**
     * Delete bank account
     * DELETE /admin/settings/bank-accounts/:id
     */
    deleteBankAccount: async (id: string): Promise<void> => {
      await del<ApiResponse<null>>(`/admin/settings/bank-accounts/${id}`);
    }
  },

  // Traditional Reports (Legacy - prefer analytics API for new features)
  reports: {
    /**
     * Generate sales report
     * GET /admin/reports/sales
     */
    getSalesReport: async (params?: {
      period?: string;
      startDate?: string;
      endDate?: string;
      format?: 'json' | 'csv' | 'pdf';
    }): Promise<SalesReportDto> => {
      const response = await get<SalesReportDto>('/admin/analytics/sales', { params });
      return response.data;
    },

    /**
     * Generate inventory report
     * GET /admin/reports/inventory
     */
    getInventoryReport: async (params?: {
      filterBy?: 'all' | 'low_stock' | 'out_of_stock' | 'high_stock';
      categoryId?: string;
      format?: 'json' | 'csv' | 'pdf';
    }): Promise<InventoryReportDto> => {
      const response = await get<InventoryReportDto>('/admin/analytics/inventory', { params });
      return response.data;
    }
  },

  // Authentication & System Admin
  auth: {
    /**
     * Sync users
     * GET /auth/admin/sync-users
     */
    syncUsers: async (fix?: boolean): Promise<{
      totalSupabaseUsers: number;
      totalDbUsers: number;
      onlyInSupabase: string[];
      onlyInDb: string[];
    }> => {
      const response = await get<{
        totalSupabaseUsers: number;
        totalDbUsers: number;
        onlyInSupabase: string[];
        onlyInDb: string[];
      }>('/auth/admin/sync-users', { params: { fix } });
      return response.data;
    }
  }
};
export default adminApi;

// Individual exports for direct access to specialized APIs
export { 
  adminUsersApi,
  adminProductsApi,
  adminOrdersApi,
  adminCategoriesApi,
  adminReviewsApi,
  adminAnalyticsApi
};
