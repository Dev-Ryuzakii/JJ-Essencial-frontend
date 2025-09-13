import { post, get, patch } from './apiClient';
import type { SuccessResponseDto, ErrorResponseDto } from '../types';

// Make sure we're using the correct apiClient and not importing anything from Supabase
console.log('authApi.ts: Loaded - using backend API client only, NO SUPABASE');

// Utility function to handle API response types safely
const handleApiResponse = <T>(response: any): T => {
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.error?.message || 'API request failed');
};

// User profile response structure
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication response structure
export interface AuthResponse {
  access_token: string;
  user: UserProfile;
}

// Registration data
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

// Login data
export interface SignInData {
  email: string;
  password: string;
}

// Profile update data
export interface ProfileUpdateData {
  fullName: string;
}

// Admin-specific auth functions - Uses dedicated admin endpoints with /api/v1
export const adminAuthApi = {
  /**
   * Admin signin using dedicated admin signin endpoint - Fixed response handling
   */
  signin: async (data: SignInData): Promise<AuthResponse> => {
    console.log('Admin signin: Using /api/v1/auth/admin/signin endpoint');
    
    try {
      // Use the dedicated admin signin endpoint
      const response = await post<{access_token: string; user: UserProfile}>('/auth/admin/signin', data);
      
      // Handle successful response using utility function
      const { access_token, user } = handleApiResponse<{access_token: string; user: UserProfile}>(response);

      // Store in admin-specific localStorage
      localStorage.setItem('adminToken', access_token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      console.log('Admin signin: Authentication successful');
      
      return { access_token, user };
    } catch (error) {
      console.error('Admin signin failed:', error);
      throw error;
    }
  },

  /**
   * Admin signout - clear local storage
   */
  signout: async (): Promise<void> => {
    console.log('Admin signout: Clearing local storage');
    
    // Clear admin storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    console.log('Admin signout: Local storage cleared');
  },

  /**
   * Validate admin token - LOCAL STORAGE CHECK ONLY, NO API CALLS
   * Version: 2024-FIXED - No server calls
   */
  validateToken: async (): Promise<boolean> => {
    console.log('Admin validate: Using backend API endpoint');
    console.log('Admin validate: LOCAL STORAGE CHECK ONLY - NO API CALLS - VERSION 2024-FIXED');
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      const adminUserData = localStorage.getItem('adminUser');
      
      console.log('Admin validate: Checking storage...', { 
        hasToken: !!adminToken, 
        hasUserData: !!adminUserData 
      });
      
      if (!adminToken || !adminUserData) {
        console.log('Admin validate: Missing token or user data');
        console.log('Admin validate: Token validation failed');
        return false;
      }
      
      const user = JSON.parse(adminUserData);
      const isAdmin = user.role === 'ADMIN';
      console.log('Admin validate: User role check - isAdmin:', isAdmin);
      
      if (!isAdmin) {
        console.log('Admin validate: Token validation failed');
        return false;
      }
      
      console.log('Admin validate: Token validation successful');
      return true;
    } catch (error) {
      console.log('Admin validate: Storage error:', error);
      console.log('Admin validate: Token validation failed');
      return false;
    }
  },

  /**
   * Change admin password using admin change password endpoint
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    console.log('Admin change password: Using /api/v1/auth/admin/change-password endpoint');
    
    const response = await post<{ message: string }>('/auth/admin/change-password', {
      currentPassword,
      newPassword
    });
    return handleApiResponse<{ message: string }>(response);
  }
};

const authApi = {
  /**
   * Sign up new user (regular user endpoint)
   */
  signup: async (data: SignUpData): Promise<AuthResponse> => {
    console.log('authApi.signup: Making request to /auth/signup endpoint');
    try {
      const response = await post<AuthResponse>('/auth/signup', data);
      console.log('authApi.signup: Server response:', response);
      
      const { access_token, user } = handleApiResponse<AuthResponse>(response);

      // Store authentication data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // If user is admin, also store in admin-specific storage
      if (user.role === 'ADMIN') {
        localStorage.setItem('adminToken', access_token);
        localStorage.setItem('adminUser', JSON.stringify(user));
      }

      return { access_token, user };
    } catch (error: any) {
      // Check if the error is a 409 conflict (email already exists)
      if (error.statusCode === 409 || error.status === 409) {
        console.error('Registration failed: Email already exists', error);
        throw new Error('This email is already registered. Please use a different email or try to login.');
      }
      
      // Handle any other errors
      console.error('Registration error in authApi.signup:', error);
      throw error;
    }
  },

  /**
   * Sign out user
   */
  signout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await get<UserProfile>('/users/profile');
    return handleApiResponse<UserProfile>(response);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const response = await patch<UserProfile>('/users/profile', data);
    return handleApiResponse<UserProfile>(response);
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<{ message: string }> => {
    const response = await post<{ message: string }>('/auth/reset-password', { email });
    return handleApiResponse<{ message: string }>(response);
  },

  /**
   * Confirm password reset with token
   */
  confirmResetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await post<{ message: string }>('/auth/confirm-reset-password', {
      token,
      newPassword
    });
    return handleApiResponse<{ message: string }>(response);
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await authApi.getProfile();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get current user data
   */
  getUser: async (): Promise<UserProfile | null> => {
    try {
      return await authApi.getProfile();
    } catch {
      return null;
    }
  },

  /**
   * Sign in user (regular user endpoint) - Fixed to use correct response structure
   */
  signin: async (data: SignInData): Promise<AuthResponse> => {
    const response = await post<{access_token: string; user: UserProfile}>('/auth/signin', data);
    
    // ✅ CORRECT: Extract using handleApiResponse utility
    const { access_token, user } = handleApiResponse<{access_token: string; user: UserProfile}>(response);

    if (!access_token || !user) {
      throw new Error('Invalid response structure from server');
    }

    // Store authentication data - use access_token as key (matches backend)
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    // If user is admin, also store in admin-specific storage
    if (user.role === 'ADMIN') {
      localStorage.setItem('adminToken', access_token);
      localStorage.setItem('adminUser', JSON.stringify(user));
    }

    return { access_token, user };
  }
}

export default authApi
