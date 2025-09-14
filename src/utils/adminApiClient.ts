// utils/adminApiClient.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { validateAdminToken } from './adminTokenValidator';

interface AuthHeaders {
  Authorization?: string;
  'Content-Type'?: string;
}

const createAdminApiClient = (
  getAuthHeaders: () => AuthHeaders, 
  logout: () => void
): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
  });

  // Request interceptor
  client.interceptors.request.use((config) => {
    const headers = getAuthHeaders();
    
    // Validate admin token before making request
    const token = headers.Authorization?.replace('Bearer ', '');
    if (token) {
      const validation = validateAdminToken(token);
      if (!validation.isValid || !validation.isAdmin) {
        console.warn('Invalid admin token detected, logging out...');
        logout();
        return Promise.reject(new Error('Invalid admin token'));
      }
    }
    
    Object.assign(config.headers, headers);
    return config;
  });

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('Admin token expired or invalid, logging out...');
        logout();
      } else if (error.response?.status === 403) {
        console.log('Access forbidden - insufficient admin privileges');
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default createAdminApiClient;
