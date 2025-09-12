import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import toast from 'react-hot-toast'

// API Configuration - Use localhost:3000 for local backend development
const API_BASE_URL = 'http://localhost:3000/api/v1'

console.log('🌐 API Base URL:', API_BASE_URL); // Debug log to confirm URL

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Use correct token key
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token') // ✅ Matches auth service
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // 🚨 DEBUG: Log bank account requests
        if (config.url?.includes('bank-account')) {
          console.log('🌐 API Client - Making bank account request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            hasAuth: !!config.headers.Authorization
          });
        }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

  // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 🚨 DEBUG: Log bank account responses
        if (response.config.url?.includes('bank-account')) {
          console.log('📨 API Client - Bank account response received:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            dataType: typeof response.data,
            dataKeys: response.data ? Object.keys(response.data) : [],
            dataLength: Array.isArray(response.data) ? response.data.length : 
                       response.data?.data?.length || 'not array',
            fullResponse: response.data
          });
        }
        
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          toast.error('Session expired. Please login again.')
        } else if (error.response?.status === 400) {
          // Get a more detailed error message from the response if available
          const errorMsg = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          'Bad request. Please check your input.'
          toast.error(errorMsg)
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.')
        } else if (error.message === 'Network Error') {
          toast.error('Network error. Please check your connection.')
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config)
    return response.data
  }

  // File upload with progress
  async uploadFile<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(progress)
        }
      },
    })

    return response.data
  }
}

export const api = new ApiClient()

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

// Auth API
export const authApi = {
  // Sign in user - Fixed to extract token from correct location
  login: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<{access_token: string; user: any}>>('/auth/signin', credentials),
  
  // Register a new user
  register: (userData: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => {
    // Log the data being sent to help with debugging
    console.log('Register API: Sending user data:', userData);
    
    // Validate phone number if provided
    if (userData.phone && !/^[0-9+\-\s()]*$/.test(userData.phone)) {
      console.error('Invalid phone number format');
      return Promise.reject({
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid phone number format. Please enter a valid phone number.'
            }
          }
        }
      });
    }
    
    // Make sure we're sending the data in the format expected by the backend
    return api.post<ApiResponse<any>>('/auth/signup', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phone: userData.phone
    }).catch(error => {
      // Log more detailed error information
      console.error('Register API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        details: error.response?.data?.message || error.response?.data?.error?.message,
        stack: error.stack
      });
      
      // Provide more specific error messages for common issues
      if (error.response?.data?.error?.message?.includes('phone')) {
        error.response.data.error.message = 'Please enter a valid phone number format.';
      } else if (error.response?.data?.error?.message?.includes('email')) {
        error.response.data.error.message = 'This email is already registered or invalid.';
      } else if (error.response?.data?.error?.message?.includes('password')) {
        error.response.data.error.message = 'Password must meet the required criteria.';
      }
      
      throw error;
    });
  },
  
  // Request password reset
  resetPassword: (email: string) =>
    api.post<ApiResponse<any>>('/auth/reset-password', { email }),
  
  // Admin sign in
  adminSignIn: (credentials: { email: string; password: string }) =>
    api.post<ApiResponse<any>>('/auth/admin/signin', credentials),
    
  // Get current user profile
  getUserProfile: () =>
    api.get<ApiResponse<any>>('/auth/profile'),
    
  // Update user profile
  updateProfile: (data: { fullName?: string }) =>
    api.put<ApiResponse<any>>('/auth/profile', data),
    
  // Get current user from token
  getCurrentUser: () =>
    api.get<ApiResponse<any>>('/auth/me'),
}

// Products API
export const productsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/products', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/products/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/products', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/products/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/products/${id}`),
  
  updateStock: (id: string, data: { stock: number; notes?: string }) =>
    api.patch<ApiResponse<any>>(`/products/${id}/stock`, data),
}

// Categories API
export const categoriesApi = {
  getAll: (nested?: boolean) =>
    api.get<ApiResponse<any[]>>('/categories', { params: { nested } }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/categories/${id}`),
  
  create: (data: any) =>
    api.post<ApiResponse<any>>('/categories', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/categories/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/categories/${id}`),
}

// Orders API
export const ordersApi = {
  create: (data: any) =>
    api.post<ApiResponse<any>>('/orders', data),
  
  getAll: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/orders', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/orders/${id}`),
  
  cancel: (id: string, reason: string) =>
    api.patch<ApiResponse<any>>(`/orders/${id}/cancel`, { reason }),
  
  getReceipt: (id: string) =>
    api.get(`/orders/${id}/receipt`, { responseType: 'blob' }),
  
  // Admin endpoints
  admin: {
    getAll: (params?: Record<string, any>) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/orders/admin', { params }),
    
    updateStatus: (id: string, data: { status: string; notes?: string }) =>
      api.patch<ApiResponse<any>>(`/orders/${id}/status`, data),
  },
}

// Users API
export const usersApi = {
  getProfile: () =>
    api.get<ApiResponse<any>>('/users/profile'),
  
  updateProfile: (data: any) =>
    api.put<ApiResponse<any>>('/users/profile', data),
  
  getStats: () =>
    api.get<ApiResponse<any>>('/users/profile/stats'),
  
  addresses: {
    getAll: () =>
      api.get<ApiResponse<any[]>>('/users/addresses'),
    
    create: (data: any) =>
      api.post<ApiResponse<any>>('/users/addresses', data),
    
    update: (id: string, data: any) =>
      api.put<ApiResponse<any>>(`/users/addresses/${id}`, data),
    
    delete: (id: string) =>
      api.delete<ApiResponse<any>>(`/users/addresses/${id}`),
    
    setDefault: (id: string) =>
      api.patch<ApiResponse<any>>(`/users/addresses/${id}/default`),
  },
}

// Payments API
export const paymentsApi = {
  initiate: (data: { orderId: string; gateway: string; callbackUrl?: string }) =>
    api.post<ApiResponse<any>>('/payments/initiate', data),
  
  verify: (reference: string) =>
    api.get<ApiResponse<any>>(`/payments/verify/${reference}`),
  
  bankTransfer: {
    initiate: (orderId: string) =>
      api.post<ApiResponse<any>>('/payments/bank-transfer/initiate', { orderId }),
    
    uploadReceipt: (reference: string, file: File, notes?: string) => {
      const formData = new FormData()
      formData.append('reference', reference)
      formData.append('file', file)
      if (notes) formData.append('notes', notes)
      
      return api.post<ApiResponse<any>>('/payments/receipt/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
  },
  
  // Admin endpoints
  admin: {
    getPendingReceipts: (params?: Record<string, any>) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/payments/receipts/pending', { params }),
    
    verifyReceipt: (id: string, data: { status: string; notes?: string }) =>
      api.patch<ApiResponse<any>>(`/payments/receipt/${id}/verify`, data),
  },
}

// Wishlist API
export const wishlistApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/wishlist', { params }),
  
  add: (productId: string) =>
    api.post<ApiResponse<any>>('/wishlist', { productId }),
  
  remove: (id: string) =>
    api.delete<ApiResponse<any>>(`/wishlist/${id}`),
  
  check: (productId: string) =>
    api.get<ApiResponse<any>>(`/wishlist/check/${productId}`),
}

// Reviews API
export const reviewsApi = {
  create: (data: any) =>
    api.post<ApiResponse<any>>('/reviews', data),
  
  getByProduct: (productId: string, params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>(`/reviews/product/${productId}`, { params }),
  
  getByUser: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/reviews/user', { params }),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/reviews/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<any>>(`/reviews/${id}`),
}

// Search API
export const searchApi = {
  products: (params: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/search/products', { params }),
  
  suggestions: (query: string) =>
    api.get<ApiResponse<any[]>>('/search/suggestions', { params: { q: query } }),
  
  popular: (limit?: number) =>
    api.get<ApiResponse<any[]>>('/search/popular', { params: { limit } }),
  
  trending: (params?: Record<string, any>) =>
    api.get<ApiResponse<any[]>>('/search/trending', { params }),
  
  similar: (id: string, limit?: number) =>
    api.get<ApiResponse<any[]>>(`/search/similar/${id}`, { params: { limit } }),
}

// Support API
export const supportApi = {
  tickets: {
    create: (data: any) =>
      api.post<ApiResponse<any>>('/support/tickets', data),
    
    getAll: (params?: Record<string, any>) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/support/tickets', { params }),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/support/tickets/${id}`),
    
    sendMessage: (id: string, message: string) =>
      api.post<ApiResponse<any>>(`/support/tickets/${id}/messages`, { message }),
    
    close: (id: string) =>
      api.patch<ApiResponse<any>>(`/support/tickets/${id}/close`),
  },
  
  // Admin endpoints
  admin: {
    getAll: (params?: Record<string, any>) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/support/admin/tickets', { params }),
    
    updateStatus: (id: string, data: any) =>
      api.patch<ApiResponse<any>>(`/support/admin/tickets/${id}/status`, data),
  },
}

// Trades API
export const tradesApi = {
  create: (data: any) =>
    api.post<ApiResponse<any>>('/trades', data),
  
  getAll: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/trades', { params }),
  
  getApproved: (params?: Record<string, any>) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/trades/approved', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<any>>(`/trades/${id}`),
  
  // Admin endpoints
  admin: {
    getAll: (params?: Record<string, any>) =>
      api.get<ApiResponse<PaginatedResponse<any>>>('/trades/admin', { params }),
    
    updateStatus: (id: string, data: { status: string; notes?: string }) =>
      api.patch<ApiResponse<any>>(`/trades/${id}/status`, data),
  },
}

// Analytics API (Admin only)
export const analyticsApi = {
  sales: (params?: Record<string, any>) =>
    api.get<ApiResponse<any>>('/analytics/sales', { params }),
  
  products: (params?: Record<string, any>) =>
    api.get<ApiResponse<any>>('/analytics/products', { params }),
  
  customers: (params?: Record<string, any>) =>
    api.get<ApiResponse<any>>('/analytics/customers', { params }),
  
  inventory: () =>
    api.get<ApiResponse<any>>('/analytics/inventory'),
}

export default api
