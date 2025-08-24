import { get, post, patch, del } from './apiClient';

// Admin analytics interfaces
export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    revenueGrowth: number;
    orderGrowth: number;
    userGrowth: number;
    averageOrderValue: number;
  };
  salesData: {
    daily: SalesDataPoint[];
    weekly: SalesDataPoint[];
    monthly: SalesDataPoint[];
    yearly: SalesDataPoint[];
  };
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  recentOrders: RecentOrder[];
  userActivity: UserActivity[];
  revenueByPaymentMethod: PaymentMethodRevenue[];
  ordersByStatus: OrderStatusDistribution[];
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  image?: string;
  totalSales: number;
  revenue: number;
  orderCount: number;
  category: string;
}

export interface TopCategory {
  id: string;
  name: string;
  totalSales: number;
  revenue: number;
  orderCount: number;
  productCount: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
}

export interface PaymentMethodRevenue {
  method: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  status: 'low_stock' | 'out_of_stock' | 'overstock';
  lastRestocked?: string;
  estimatedRunOut?: string;
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomersThisMonth: number;
  customerRetentionRate: number;
  averageLifetimeValue: number;
  topCustomers: {
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
  }[];
  customerSegments: {
    segment: string;
    count: number;
    percentage: number;
    averageOrderValue: number;
  }[];
}

export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  taxAmount: number;
  refunds: number;
  revenueByCategory: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    percentage: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  profitMargins: {
    gross: number;
    net: number;
    operating: number;
  };
}

const adminAnalyticsApi = {
  /**
   * Get dashboard analytics overview
   * GET /admin/analytics/dashboard
   */
  getDashboardAnalytics: async (period: '7days' | '30days' | '90days' | '1year' = '30days'): Promise<AdminAnalytics> => {
    const response = await get<AdminAnalytics>('/admin/analytics/dashboard', { 
      params: { period } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get dashboard analytics');
    }
  },

  /**
   * Get sales analytics
   * GET /admin/analytics/sales
   */
  getSalesAnalytics: async (params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
    categoryId?: string;
  } = {}): Promise<SalesDataPoint[]> => {
    const response = await get<SalesDataPoint[]>('/admin/analytics/sales', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get sales analytics');
    }
  },

  /**
   * Get product performance analytics
   * GET /admin/analytics/products
   */
  getProductAnalytics: async (params: {
    limit?: number;
    period?: string;
    categoryId?: string;
    sortBy?: 'revenue' | 'sales' | 'orders';
  } = {}): Promise<TopProduct[]> => {
    const response = await get<TopProduct[]>('/admin/analytics/products', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get product analytics');
    }
  },

  /**
   * Get category performance analytics
   * GET /admin/analytics/categories
   */
  getCategoryAnalytics: async (params: {
    limit?: number;
    period?: string;
    sortBy?: 'revenue' | 'sales' | 'orders';
  } = {}): Promise<TopCategory[]> => {
    const response = await get<TopCategory[]>('/admin/analytics/categories', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get category analytics');
    }
  },

  /**
   * Get customer insights
   * GET /admin/analytics/customers
   */
  getCustomerInsights: async (period: '30days' | '90days' | '1year' = '30days'): Promise<CustomerInsight> => {
    const response = await get<CustomerInsight>('/admin/analytics/customers', { 
      params: { period } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get customer insights');
    }
  },

  /**
   * Get inventory alerts
   * GET /admin/analytics/inventory/alerts
   */
  getInventoryAlerts: async (type?: 'low_stock' | 'out_of_stock' | 'overstock'): Promise<InventoryAlert[]> => {
    const response = await get<InventoryAlert[]>('/admin/analytics/inventory/alerts', { 
      params: { type } 
    });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get inventory alerts');
    }
  },

  /**
   * Get financial report
   * GET /admin/analytics/financial
   */
  getFinancialReport: async (params: {
    startDate: string;
    endDate: string;
    includeBreakdown?: boolean;
  }): Promise<FinancialReport> => {
    const response = await get<FinancialReport>('/admin/analytics/financial', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get financial report');
    }
  },

  /**
   * Get revenue trends
   * GET /admin/analytics/revenue/trends
   */
  getRevenueTrends: async (params: {
    period: '7days' | '30days' | '90days' | '1year';
    groupBy?: 'day' | 'week' | 'month';
    compareWith?: 'previous_period' | 'previous_year';
  }): Promise<{
    current: SalesDataPoint[];
    previous?: SalesDataPoint[];
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }> => {
    const response = await get<{
      current: SalesDataPoint[];
      previous?: SalesDataPoint[];
      growth: number;
      trend: 'up' | 'down' | 'stable';
    }>('/admin/analytics/revenue/trends', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get revenue trends');
    }
  },

  /**
   * Get order analytics
   * GET /admin/analytics/orders
   */
  getOrderAnalytics: async (params: {
    period?: string;
    groupBy?: 'day' | 'week' | 'month';
    status?: string;
  } = {}): Promise<{
    totalOrders: number;
    averageOrderValue: number;
    ordersByStatus: OrderStatusDistribution[];
    ordersByPaymentMethod: PaymentMethodRevenue[];
    trends: SalesDataPoint[];
  }> => {
    const response = await get<{
      totalOrders: number;
      averageOrderValue: number;
      ordersByStatus: OrderStatusDistribution[];
      ordersByPaymentMethod: PaymentMethodRevenue[];
      trends: SalesDataPoint[];
    }>('/admin/analytics/orders', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get order analytics');
    }
  },

  /**
   * Get user activity analytics
   * GET /admin/analytics/users/activity
   */
  getUserActivityAnalytics: async (params: {
    period?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<UserActivity[]> => {
    const response = await get<UserActivity[]>('/admin/analytics/users/activity', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get user activity analytics');
    }
  },

  /**
   * Get conversion analytics
   * GET /admin/analytics/conversion
   */
  getConversionAnalytics: async (period: '7days' | '30days' | '90days' = '30days'): Promise<{
    visitorToLead: number;
    leadToCustomer: number;
    visitorToCustomer: number;
    cartAbandonmentRate: number;
    checkoutCompletionRate: number;
    repeatPurchaseRate: number;
    trends: {
      date: string;
      visitors: number;
      leads: number;
      customers: number;
      conversionRate: number;
    }[];
  }> => {
    const response = await get<{
      visitorToLead: number;
      leadToCustomer: number;
      visitorToCustomer: number;
      cartAbandonmentRate: number;
      checkoutCompletionRate: number;
      repeatPurchaseRate: number;
      trends: {
        date: string;
        visitors: number;
        leads: number;
        customers: number;
        conversionRate: number;
      }[];
    }>('/admin/analytics/conversion', { params: { period } });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get conversion analytics');
    }
  },

  /**
   * Export analytics report
   * GET /admin/analytics/export
   */
  exportReport: (params: {
    type: 'sales' | 'products' | 'customers' | 'financial' | 'complete';
    format: 'csv' | 'excel' | 'pdf';
    startDate: string;
    endDate: string;
    includeCharts?: boolean;
  }): string => {
    const queryParams = new URLSearchParams({
      ...params,
      includeCharts: params.includeCharts?.toString() || 'false'
    }).toString();
    return `/admin/analytics/export?${queryParams}`;
  },

  /**
   * Generate custom report
   * POST /admin/analytics/reports/custom
   */
  generateCustomReport: async (config: {
    name: string;
    type: string;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    metrics: string[];
    filters?: Record<string, any>;
    groupBy?: string;
    format?: 'json' | 'pdf' | 'excel';
  }): Promise<{
    reportId: string;
    downloadUrl?: string;
    data?: any;
  }> => {
    const response = await post<{
      reportId: string;
      downloadUrl?: string;
      data?: any;
    }>('/admin/analytics/reports/custom', config);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to generate custom report');
    }
  },

  /**
   * Get real-time statistics
   * GET /admin/analytics/realtime
   */
  getRealTimeStats: async (): Promise<{
    activeUsers: number;
    onlineVisitors: number;
    ordersToday: number;
    revenueToday: number;
    topPages: {
      page: string;
      views: number;
    }[];
    recentOrders: RecentOrder[];
    currentConversions: number;
  }> => {
    const response = await get<{
      activeUsers: number;
      onlineVisitors: number;
      ordersToday: number;
      revenueToday: number;
      topPages: {
        page: string;
        views: number;
      }[];
      recentOrders: RecentOrder[];
      currentConversions: number;
    }>('/admin/analytics/realtime');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get real-time statistics');
    }
  },

  /**
   * Get forecast data
   * GET /admin/analytics/forecast
   */
  getForecastData: async (params: {
    metric: 'revenue' | 'orders' | 'customers';
    period: '30days' | '90days' | '1year';
    confidence?: number;
  }): Promise<{
    historical: SalesDataPoint[];
    forecast: {
      date: string;
      predicted: number;
      confidenceMin: number;
      confidenceMax: number;
    }[];
    accuracy: number;
    trend: 'growing' | 'declining' | 'stable';
  }> => {
    const response = await get<{
      historical: SalesDataPoint[];
      forecast: {
        date: string;
        predicted: number;
        confidenceMin: number;
        confidenceMax: number;
      }[];
      accuracy: number;
      trend: 'growing' | 'declining' | 'stable';
    }>('/admin/analytics/forecast', { params });
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to get forecast data');
    }
  }
};

export default adminAnalyticsApi;
