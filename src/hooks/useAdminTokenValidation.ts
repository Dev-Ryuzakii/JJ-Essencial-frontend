// hooks/useAdminTokenValidation.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { validateAdminToken } from '../utils/adminTokenValidator';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UseAdminTokenValidationResult {
  isValidAdmin: boolean;
  isLoading: boolean;
  adminUser: AdminUser | null;
  error: string | null;
  revalidate: () => Promise<void>;
}

const useAdminTokenValidation = (token: string | null): UseAdminTokenValidationResult => {
  const [isValidAdmin, setIsValidAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://jj-Essential.onrender.com/api/v1';

  const validateAdminTokenOnServer = async () => {
    if (!token) {
      setIsValidAdmin(false);
      setIsLoading(false);
      return;
    }

    // First, do client-side validation
    const clientValidation = validateAdminToken(token);
    if (!clientValidation.isValid) {
      console.log('Client-side admin token validation failed:', clientValidation.reason);
      setIsValidAdmin(false);
      setError(clientValidation.reason || 'Invalid token');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use /auth/me endpoint to validate with server
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const user = response.data.data;
      
      // Verify this is actually an admin user
      if (user.id === 'admin-user' && user.role === 'ADMIN') {
        setAdminUser(user);
        setIsValidAdmin(true);
      } else {
        setIsValidAdmin(false);
        setError('Token is valid but user is not an admin');
      }
    } catch (error: any) {
      console.error('Server-side admin token validation failed:', error);
      setIsValidAdmin(false);
      setAdminUser(null);
      setError(error.response?.data?.message || 'Token validation failed');
      
      // Clear invalid token
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateAdminTokenOnServer();
  }, [token]);

  return { 
    isValidAdmin, 
    isLoading, 
    adminUser, 
    error,
    revalidate: validateAdminTokenOnServer 
  };
};

export default useAdminTokenValidation;
