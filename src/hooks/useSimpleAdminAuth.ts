import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminAuthApi } from '../services/authApi';
import { validateAdminToken } from '../utils/adminTokenValidator';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  isActive: boolean;
  createdAt: string;
  updatesdAt: string;
}

export const useSimpleAdminAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    
    if (!storedToken || !adminUserData) {
      console.log('🔍 Admin auth check: No admin token or user data found');
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsLoading(false);
      return;
    }
    
    // Client-side token validation using the proper admin validator
    const clientValidation = validateAdminToken(storedToken);
    if (!clientValidation.isValid || !clientValidation.isAdmin) {
      console.log('❌ Admin auth check: Invalid admin token:', clientValidation.reason);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(adminUserData);
      
      // Check if user has admin role and correct ID
      if (user.role !== 'ADMIN' || user.id !== 'admin-user') {
        console.log('❌ Admin auth check: User is not a valid admin');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        setIsAuthenticated(false);
        setAdminUser(null);
        setIsLoading(false);
        return;
      }

      // Set authenticated state with full user data
      setToken(storedToken);
      setIsAuthenticated(true);
      setAdminUser({
        ...user,
        fullName: user.fullName || 'Admin User',
        phone: user.phone || null,
        avatar: user.avatar || null,
        dateOfBirth: user.dateOfBirth || null,
        isActive: true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatesdAt: user.updatesdAt || new Date().toISOString()
      });
      
      console.log('✅ Admin auth check: Successfully authenticated from local storage');
      
    } catch (error) {
      console.error('❌ Admin auth validation error:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('🔐 Admin login attempt with:', { email });
      console.log('🎯 Using adminAuthApi.signin from services/authApi - BACKEND ONLY');
      
      // Use dedicated admin signin endpoint - BACKEND ONLY, NO SUPABASE
      const authData = await adminAuthApi.signin({ email, password });
      console.log('✅ Admin login: Backend response received successfully');

      // Validate the received token is actually an admin token
      const token = authData.access_token;
      const tokenValidation = validateAdminToken(token);
      
      if (!tokenValidation.isValid || !tokenValidation.isAdmin) {
        throw new Error(`Invalid admin token received: ${tokenValidation.reason}`);
      }

      // Verify user data
      const user = authData.user;
      if (user.role !== 'ADMIN' || user.id !== 'admin-user') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // updates local state
      setToken(token);
      setIsAuthenticated(true);
      setAdminUser({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName || 'Admin User',
        phone: (user as any).phone || null,
        avatar: (user as any).avatar || null,
        dateOfBirth: (user as any).dateOfBirth || null,
        isActive: true,
        createdAt: user.createdAt || new Date().toISOString(),
        updatesdAt: user.updatesdAt || new Date().toISOString()
      });

      console.log('✅ Admin login: Success - user authenticated');
      
      toast.success('Admin login successful!', {
        duration: 3000,
        position: 'top-right'
      });

      return { success: true, user };

    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Admin login failed';
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right'
      });

      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Admin logout: Starting logout process');
      
      // Call the logout API to clean up server-side
      await adminAuthApi.signout();
      
      // Clear local state
      setToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
      
      console.log('✅ Admin logout: Successfully logged out');
      
      toast.success('Logged out successfully', {
        duration: 2000,
        position: 'top-right'
      });

    } catch (error) {
      console.error('❌ Admin logout error:', error);
      // Even if logout API fails, clear local state
      setToken(null);
      setIsAuthenticated(false);
      setAdminUser(null);
    }
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Check if user is specifically an admin
  const isAdmin = (): boolean => {
    return isAuthenticated && adminUser?.role === 'ADMIN' && adminUser?.id === 'admin-user';
  };

  // Get admin status details
  const getAdminStatus = () => {
    return {
      isAuthenticated,
      isAdmin: isAdmin(),
      userId: adminUser?.id,
      email: adminUser?.email,
      role: adminUser?.role,
      hasValidToken: !!token && validateAdminToken(token).isValid
    };
  };

  return {
    token,
    isAuthenticated,
    isLoading,
    adminUser,
    login,
    logout,
    getAuthHeaders,
    isAdmin,
    getAdminStatus,
    refreshAuth: checkAuthStatus
  };
};
