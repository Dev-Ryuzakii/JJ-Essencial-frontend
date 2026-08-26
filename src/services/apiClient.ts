import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  SuccessResponseDto, 
  ErrorResponseDto, 
  PaginatedResponse,
  PaginationMeta 
} from '../types';

// Legacy API Error response structure for backward compatibility
export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};


// Base API URL - Use environment variable or fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                     (import.meta.env.PROD ? 'https://jj-essencial-b33c39ba.afribase.dev/api/v1' : '/api/v1');

console.log('🔍 Environment variable VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔍 All import.meta.env:', import.meta.env);
console.log('🌍 API Base URL (final):', API_BASE_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // ✅ Increased to 30 seconds for slower connections
  // Add withCredentials for proper cookie handling in production
  withCredentials: true
});

// Request interceptor - Smart token selection with enhanced logging
apiClient.interceptors.request.use(
  (config: any) => {
    // Log the full request URL being made
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    
    // Only use admin token for actual admin endpoints (but not auth endpoints)
    const isAdminRequest = config.url?.includes('/admin') && !config.url?.includes('/auth/admin')
    const isAdminAuthRequest = config.url?.includes('/auth/admin');
    
    // Choose the appropriate token
    let token;
    
    if (isAdminRequest) {
      token = localStorage.getItem('adminToken');
      console.log('Using admin token for admin request:', config.url);
    } else if (isAdminAuthRequest) {
      // Don't use any token for admin auth endpoints (login/register)
      console.log('Admin auth request - no token required:', config.url);
    } else {
      // For non-admin requests, prefer access_token (matches backend response)
      token = localStorage.getItem('access_token') || localStorage.getItem('token');
      console.log('Using user token for request:', config.url);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ API Request: Token attached for ${config.url}`);
    } else {
      console.log(`⚠️ API Request: No token available for ${config.url}`);
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors with enhanced timeout handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<ApiError>) => {
    // Enhanced error logging
    console.error('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      response_data: error.response?.data
    });

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏰ Request timeout - Backend may be slow or unavailable');
      return Promise.reject({
        statusCode: 408,
        message: 'Request timed out. Please check if the backend server is running.',
        error: 'TIMEOUT'
      });
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network error - Backend server may not be running');
      return Promise.reject({
        statusCode: 503,
        message: 'Cannot connect to backend server. Please ensure the backend is running.',
        error: 'NETWORK_ERROR'
      });
    }

    // Handle server errors (500)
    if (error.response?.status === 500) {
      console.error('🔥 Server error (500) - Backend may be misconfigured or down');
      return Promise.reject({
        statusCode: 500,
        message: 'Server error. The backend service may be temporarily unavailable. Please try again later.',
        error: 'SERVER_ERROR'
      });
    }

    // Handle auth errors (401)
    if (error.response?.status === 401) {
      // Check if this is an admin route
      const isAdminRoute = error.config?.url?.startsWith('/admin') || error.config?.url?.startsWith('/auth/admin');
      
      if (isAdminRoute) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('access_token'); // ✅ updatesd to use correct key
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Return the full error response so that calling functions can properly handle it
    return Promise.reject(error);
  }
);

// Helper function for regular GET requests with retry logic
export const get = async <T>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  let lastError: any;
  
  // Retry up to 3 times for 500 errors
  for (let i = 0; i < 3; i++) {
    try {
      const response = await apiClient.get<any, ApiResponse<T>>(url, config);
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for auth errors or client errors
      if (error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < 2) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`API call failed (attempt ${i + 1}/3), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Helper function for POST requests
export const post = async <T>(
  url: string, 
  data: any, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return await apiClient.post<any, ApiResponse<T>>(url, data, config);
};

// Helper function for PUT requests
export const put = async <T>(
  url: string, 
  data: any, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return await apiClient.put<any, ApiResponse<T>>(url, data, config);
};

// Helper function for PATCH requests
export const patch = async <T>(
  url: string, 
  data: any, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return await apiClient.patch<any, ApiResponse<T>>(url, data, config);
};

// Helper function for DELETE requests
export const del = async <T>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return await apiClient.delete<any, ApiResponse<T>>(url, config);
};

export default apiClient;
