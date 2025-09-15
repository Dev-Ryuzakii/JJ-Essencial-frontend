import { useAuthStore } from '../store'
import authApi from '../services/authApi'
import toast from 'react-hot-toast'
import type { LoginFormData, RegisterFormData } from '../types'
import type { User } from '../types'

// Helper function to adapt the API user to our User type
const adaptUser = (authUser: any): User => {
  return {
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.fullName,
    phone: authUser.phone || '',  // Default to empty string if not provided
    role: authUser.role,
    createdAt: authUser.createdAt || new Date().toISOString(),
    updatedAt: authUser.updatedAt || new Date().toISOString(),
  };
};

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading,
    login, 
    logout: logoutStore, 
    setLoading 
  } = useAuthStore()

  /**
   * Handle user login
   * Aligns with /api/v1/auth/signin endpoint
   */
  const handleLogin = async (credentials: LoginFormData) => {
    try {
      setLoading(true)
      
      // Use the signin endpoint from services/authApi
      const authData = await authApi.signin({
        email: credentials.email,
        password: credentials.password
      })
      
      // Store user data and token in state - using adapter to ensure type safety
      login(adaptUser(authData.user), authData.access_token)
      toast.success('Login successful!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle user registration
   * Aligns with /api/v1/auth/signup endpoint
   */
  const handleRegister = async (userData: RegisterFormData) => {
    try {
      setLoading(true)
      
      // Extract fields needed by the backend: email, password, and fullName
      // According to the API docs, fullName is optional
      const signupData = { 
        email: userData.email, 
        password: userData.password,
        fullName: userData.fullName
      };
      
      console.log('handleRegister: Sending data to authApi.signUp:', signupData);
      
      // Enhanced logging for debugging
      console.log('Registration attempt - API URL check:', {
        envApiUrl: import.meta.env.VITE_API_URL || 'Not set',
        usingProxy: true,
        endpoint: '/api/v1/auth/signup'
      });
      
      // First, test the API connection
      try {
        const { testApiConnection } = await import('../utils/apiTest');
        const testResult = await testApiConnection();
        console.log('API connection test completed:', testResult);
      } catch (testError) {
        console.error('API connection test failed:', testError);
        // Continue anyway, as the test might fail but the actual request might succeed
      }

      // Use the signup endpoint from services/authApi - with additional error handling
      let authData;
      try {
        console.log('Calling authApi.signup...');
        authData = await authApi.signup(signupData);
        console.log('authApi.signup successful:', authData);
      } catch (signupError: any) {
        console.error('Signup API call failed:', {
          error: signupError,
          response: signupError.response?.data,
          status: signupError.response?.status
        });
        throw signupError; // Re-throw to be handled by outer catch
      }

      // Store user data and token in state - using adapter to ensure type safety
      login(adaptUser(authData.user), authData.access_token);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Safely handle different error message formats
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          // If it's an array, take the first message
          errorMessage = error.response.data.message[0];
        } else if (typeof error.response.data.message === 'string') {
          // If it's a string, use it directly
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await authApi.signout();
      logoutStore();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }

  /**
   * Handle password reset request
   * Aligns with /api/v1/auth/reset-password endpoint
   */
  const handleResetPassword = async (email: string) => {
    try {
      setLoading(true)
      await authApi.resetPassword(email)
      
      toast.success('If your email is registered, you will receive password reset instructions')
      return { success: true }
    } catch (error: any) {
      // Always show a generic message for security
      toast.success('If your email is registered, you will receive password reset instructions')
      return { success: true }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle password reset confirmation
   * Aligns with /api/v1/auth/confirm-reset-password endpoint
   */
  const handleConfirmResetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true)
      await authApi.confirmResetPassword(token, newPassword)
      
      toast.success('Password has been reset successfully! You can now login with your new password.')
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to reset password. The reset link may have expired.'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  // Check if user has admin role
  const isAdmin = user?.role === 'ADMIN'
  const isUser = user?.role === 'USER'

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin,
    isUser,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    confirmResetPassword: handleConfirmResetPassword,
  }
}

