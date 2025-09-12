import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
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

// Base API URL - Use environment variable or production fallback
// Fixed to use relative URL which will work with the Vite proxy
const API_BASE_URL = '/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Smart token selection
apiClient.interceptors.request.use(
  (config: any) => {
    // Only use admin token for actual admin endpoints
    const isAdminRequest = config.url?.includes('/admin');
    
    // Choose the appropriate token
    let token;
    
    if (isAdminRequest) {
      token = localStorage.getItem('adminToken');
      console.log('Using admin token for admin request:', config.url);
    } else {
      // For non-admin requests, prefer the user token
      token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      console.log('Using user token for request:', config.url);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API Request: Using token for ${config.url}`);
    } else {
      console.warn(`API Request: No token found for ${config.url}`);
    }
    
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<ApiError>) => {
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error.response?.data || {
      statusCode: error.response?.status || 500,
      message: error.message,
      error: 'Unknown error'
    });
  }
);

// Helper function for regular GET requests
export const get = async <T>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return await apiClient.get<any, ApiResponse<T>>(url, config);
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
