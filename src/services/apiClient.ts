import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Response structure as per documentation
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

// Paginated response structure
export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// API Error response structure
export type ApiError = {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
};

// Base API URL from the documentation
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Adding CORS support
  withCredentials: false, // Set to true if your backend requires credentials
  timeout: 15000, // Increased timeout for better reliability
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<ApiError>) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle auth errors (401)
    if (error.response?.status === 401) {
      // Check if this is an admin route
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Redirect to admin login if not already there
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        // Handle regular user auth error
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error.response?.data || {
      success: false,
      message: error.message,
      error: 'Unknown error',
      statusCode: error.response?.status || 500,
      timestamp: new Date().toISOString()
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
