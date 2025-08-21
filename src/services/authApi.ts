import { supabase } from './apiClient'

/**
 * Updated DTOs matching Supabase auth structure
 */

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

const authApi = {
  /**
   * Sign up new user
   * @param data User registration data
   * @param isAdmin Optional flag to create an admin user
   */
  signup: async (data: SignUpData, isAdmin: boolean = false): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: isAdmin ? 'ADMIN' : 'USER'
        }
      }
    });

    if (error) throw error;

    const userData = {
      id: authData.user?.id || '',
      email: authData.user?.email || '',
      fullName: authData.user?.user_metadata?.full_name || '',
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: authData.user?.created_at || '',
      updatedAt: authData.user?.updated_at || ''
    };

    const token = authData.session?.access_token || '';

    // Store in the appropriate storage based on role
    if (isAdmin) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return {
      access_token: token,
      user: userData
    };
  },

  /**
   * Sign out user
   */
  signout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) throw new Error('No user found');

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || '',
      role: user.role || 'user',
      createdAt: user.created_at || '',
      updatedAt: user.updated_at || ''
    };
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const { data: userData, error } = await supabase.auth.updateUser({
      data: { full_name: data.fullName }
    });

    if (error) throw error;
    if (!userData.user) throw new Error('No user found');

    return {
      id: userData.user.id,
      email: userData.user.email || '',
      fullName: userData.user.user_metadata?.full_name || '',
      role: userData.user.role || 'user',
      createdAt: userData.user.created_at || '',
      updatedAt: userData.user.updated_at || ''
    };
  },

  /**
   * Reset password
   */
  resetPassword: async (email: string): Promise<{ message: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { message: 'Password reset email sent' };
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
  },

  /**
   * Get current user data
   */
  getUser: async (): Promise<UserProfile | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email || '',
      fullName: user.user_metadata?.full_name || '',
      role: user.role || 'user',
      createdAt: user.created_at || '',
      updatedAt: user.updated_at || ''
    };
  },

  /**
   * Sign up new admin user
   */
  signupAdmin: async (data: SignUpData): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: 'ADMIN'
        }
      }
    });

    if (error) throw error;

    const userData = {
      id: authData.user?.id || '',
      email: authData.user?.email || '',
      fullName: authData.user?.user_metadata?.full_name || '',
      role: 'ADMIN',
      createdAt: authData.user?.created_at || '',
      updatedAt: authData.user?.updated_at || ''
    };

    // Store admin data immediately
    if (authData.session) {
      localStorage.setItem('adminToken', authData.session.access_token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    }

    return {
      access_token: authData.session?.access_token || '',
      user: userData
    };
  },

  /**
   * Sign in user (works for both admin and regular users)
   */
  signin: async (data: SignInData): Promise<AuthResponse> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    const isAdmin = authData.user?.user_metadata?.role === 'ADMIN';
    const token = authData.session?.access_token || '';
    const userData = {
      id: authData.user?.id || '',
      email: authData.user?.email || '',
      fullName: authData.user?.user_metadata?.full_name || '',
      role: isAdmin ? 'ADMIN' : 'USER',
      createdAt: authData.user?.created_at || '',
      updatedAt: authData.user?.updated_at || ''
    };

    // Store in the appropriate storage based on role
    if (isAdmin) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return {
      access_token: token,
      user: userData
    };
  }
}

export default authApi
