import productsApi from './productsApi';
import ordersApi from './ordersApi';

// Interface definitions
export interface StatMetric {
  current: number;
  previous: number;
}

export interface OrderStatusDistribution {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

export interface DashboardStats {
  revenue: StatMetric
  orders: StatMetric
  customers: StatMetric
  conversionRate: StatMetric
  orderStatusDistribution: OrderStatusDistribution
}

export interface RevenueData {
  label: string
  revenue: number
}

export interface OrdersData {
  label: string
  orders: number
}

export interface TopProduct {
  id: string
  name: string
  sku: string
  image: string
  orders: number
  revenue: number
  stock: number
}

export interface LowStockProduct {
  id: string
  name: string
  sku: string
  image: string
  quantity: number
  lowStockThreshold: number
}

export interface PaymentMethodDistribution {
  creditCard: number
  paypal: number
  bankTransfer: number
  other: number
}

export interface CustomerDemographics {
  newVsReturning: {
    new: number
    returning: number
  }
  topCountries: {
    country: string
    count: number
  }[]
}

/**
 * Get start date for a given timeframe
 * @param timeframe - day, week, month, or year
 * @returns ISO date string
 */
function getStartDateForTimeframe(timeframe: 'day' | 'week' | 'month' | 'year'): string {
  const now = new Date()
  let startDate: Date
  
  switch (timeframe) {
    case 'day':
      // Last 24 hours
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'week':
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      // Last 365 days
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Default to month
  }
  
  return startDate.toISOString().split('T')[0]
}

const dashboardApi = {
  /**
   * Get dashboard stats by combining data from different API endpoints
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Get order stats
      const orderStats = await ordersApi.getOrderStats();
      
      // Get product stats
      const productStats = await productsApi.getProductStats();
      
      // Calculate previous period metrics (mock for now, would be based on actual data)
      const previousRevenue = orderStats.totalRevenue * 0.85; // Mock: 15% growth
      const previousOrders = orderStats.totalOrders * 0.92; // Mock: 8% growth
      const previousCustomers = productStats.totalProducts * 0.9; // Mock: 10% growth
      
      // Calculate conversion rate (orders / customers)
      const currentConversionRate = productStats.totalProducts > 0 
        ? (orderStats.totalOrders / productStats.totalProducts) * 100 
        : 0;
      const previousConversionRate = previousCustomers > 0 
        ? (previousOrders / previousCustomers) * 100 
        : 0;
      
      // Create order status distribution
      const orderStatusDistribution: OrderStatusDistribution = {
        pending: orderStats.pendingOrders || 0,
        processing: orderStats.processingOrders || 0,
        shipped: orderStats.shippedOrders || 0,
        delivered: orderStats.deliveredOrders || 0,
        cancelled: orderStats.cancelledOrders || 0
      };
      
      return {
        revenue: {
          current: orderStats.totalRevenue,
          previous: previousRevenue
        },
        orders: {
          current: orderStats.totalOrders,
          previous: previousOrders
        },
        customers: {
          current: productStats.totalProducts,
          previous: previousCustomers
        },
        conversionRate: {
          current: currentConversionRate,
          previous: previousConversionRate
        },
        orderStatusDistribution
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      
      // Return empty data in case of error
      return {
        revenue: { current: 0, previous: 0 },
        orders: { current: 0, previous: 0 },
        customers: { current: 0, previous: 0 },
        conversionRate: { current: 0, previous: 0 },
        orderStatusDistribution: { 
          pending: 0, 
          processing: 0, 
          shipped: 0, 
          delivered: 0, 
          cancelled: 0 
        }
      };
    }
  },

  /**
   * Get revenue data for chart by using the order stats
   * @param timeframe - day, week, month, or year
   */
  getRevenueData: async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<RevenueData[]> => {
    try {
      // Get order stats which includes revenue by day
      const orderStats = await ordersApi.getOrderStats({
        startDate: getStartDateForTimeframe(timeframe),
        endDate: new Date().toISOString().split('T')[0]
      });
      
      // Check if revenueByDay exists and is an array
      if (!orderStats || !orderStats.revenueByDay || !Array.isArray(orderStats.revenueByDay)) {
        console.warn('No revenue by day data found in order stats');
        return [];
      }
      
      // Map the data to the expected format
      return orderStats.revenueByDay.map(item => ({
        label: item.date,
        revenue: item.revenue
      }));
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return []; // Return empty array in case of error
    }
  },

  /**
   * Get orders data for chart by using the order stats
   * @param timeframe - day, week, month, or year
   */
  getOrdersData: async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<OrdersData[]> => {
    try {
      // Get order stats which includes orders by day
      const orderStats = await ordersApi.getOrderStats({
        startDate: getStartDateForTimeframe(timeframe),
        endDate: new Date().toISOString().split('T')[0]
      });
      
      // Check if revenueByDay exists and is an array
      if (!orderStats || !orderStats.revenueByDay || !Array.isArray(orderStats.revenueByDay)) {
        console.warn('No revenue by day data found in order stats');
        return [];
      }
      
      // Map the data to the expected format
      return orderStats.revenueByDay.map(item => ({
        label: item.date,
        orders: item.orders
      }));
    } catch (error) {
      console.error('Error fetching orders data:', error);
      return []; // Return empty array in case of error
    }
  },

  /**
   * Get top products by using the order stats
   * @param timeframe - day, week, month, or year
   */
  getTopProducts: async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<TopProduct[]> => {
    try {
      // Get order stats which includes top selling products
      const orderStats = await ordersApi.getOrderStats({
        startDate: getStartDateForTimeframe(timeframe),
        endDate: new Date().toISOString().split('T')[0]
      });
      
      // Check if topSellingProducts exists and is an array
      if (!orderStats || !orderStats.topSellingProducts || !Array.isArray(orderStats.topSellingProducts)) {
        console.warn('No top selling products found in order stats');
        return [];
      }
      
      // Get product details for the top selling products
      const topProductsPromises = orderStats.topSellingProducts.map(async product => {
        try {
          const productDetails = await productsApi.getProduct(product.productId);
          return {
            id: product.productId,
            name: product.productName || productDetails.name,
            sku: productDetails.sku,
            image: productDetails.images?.[0] || '',
            orders: product.totalSold,
            revenue: product.revenue,
            stock: productDetails.stock
          };
        } catch (e) {
          // If product fetch fails, return with available data
          return {
            id: product.productId,
            name: product.productName || 'Unknown Product',
            sku: 'N/A',
            image: '',
            orders: product.totalSold,
            revenue: product.revenue,
            stock: 0
          };
        }
      });
      
      return await Promise.all(topProductsPromises);
    } catch (error) {
      console.error('Error fetching top products:', error);
      return []; // Return empty array in case of error
    }
  },

  /**
   * Get products with low stock
   */
  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    try {
      // Get low stock products
      const lowStockProducts = await productsApi.getLowStockProducts();
      
      // Check if we have a valid response
      if (!lowStockProducts || !Array.isArray(lowStockProducts)) {
        console.warn('Invalid response format from getLowStockProducts');
        return [];
      }
      
      // Map to expected format
      return lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        image: product.images?.[0] || '',
        quantity: product.stock,
        lowStockThreshold: product.lowStockThreshold || 5
      }));
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return []; // Return empty array in case of error
    }
  },

  /**
   * Get payment method distribution from order stats
   */
  getPaymentMethodDistribution: async (): Promise<PaymentMethodDistribution> => {
    try {
      // Get order stats
      const orderStats = await ordersApi.getOrderStats();
      
      // Check if payment method breakdown exists
      if (orderStats && 'paymentMethodBreakdown' in orderStats && 
          Array.isArray((orderStats as any).paymentMethodBreakdown) && 
          (orderStats as any).paymentMethodBreakdown.length > 0) {
        
        const distribution: PaymentMethodDistribution = {
          creditCard: 0,
          paypal: 0,
          bankTransfer: 0,
          other: 0
        };
        
        (orderStats as any).paymentMethodBreakdown.forEach((item: {method: string, percentage: number}) => {
          const method = item.method.toLowerCase();
          if (method.includes('credit') || method.includes('card')) {
            distribution.creditCard += item.percentage;
          } else if (method.includes('paypal')) {
            distribution.paypal += item.percentage;
          } else if (method.includes('bank') || method.includes('transfer')) {
            distribution.bankTransfer += item.percentage;
          } else {
            distribution.other += item.percentage;
          }
        });
        
        return distribution;
      }
      
      // Return empty distribution if no data
      return {
        creditCard: 0,
        paypal: 0,
        bankTransfer: 0,
        other: 0
      };
    } catch (error) {
      console.error('Error fetching payment method distribution:', error);
      
      // Return empty distribution in case of error
      return {
        creditCard: 0,
        paypal: 0,
        bankTransfer: 0,
        other: 0
      };
    }
  },

  /**
   * Get customer demographics (mocked for now)
   */
  getCustomerDemographics: async (): Promise<CustomerDemographics> => {
    try {
      // This would ideally come from a real API endpoint
      // For now, return empty data since we're removing all mock data
      return {
        newVsReturning: {
          new: 0,
          returning: 0
        },
        topCountries: []
      };
    } catch (error) {
      console.error('Error fetching customer demographics:', error);
      
      // Return empty data in case of error
      return {
        newVsReturning: {
          new: 0,
          returning: 0
        },
        topCountries: []
      };
    }
  },

  /**
   * Get sales by category
   * @param timeframe - day, week, month, or year
   */
  getSalesByCategory: async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<{category: string, sales: number}[]> => {
    try {
      // Get order stats
      const orderStats = await ordersApi.getOrderStats({
        startDate: getStartDateForTimeframe(timeframe),
        endDate: new Date().toISOString().split('T')[0]
      });
      
      // Check if the API returned sales by category
      if (orderStats && 'salesByCategory' in orderStats && 
          Array.isArray((orderStats as any).salesByCategory) && 
          (orderStats as any).salesByCategory.length > 0) {
        
        return (orderStats as any).salesByCategory.map((item: any) => ({
          category: item.category,
          sales: parseFloat(item.totalSales.toString()) || 0
        }));
      }
      
      // Return empty array if no data
      return [];
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      return []; // Return empty array in case of error
    }
  }
}

export default dashboardApi
