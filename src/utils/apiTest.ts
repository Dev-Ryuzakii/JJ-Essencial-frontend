import axios from 'axios';

/**
 * Simple utility to test API connectivity
 */
export const testApiConnection = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://jj-essencial-b33c39ba.afribase.dev';
    const response = await axios.get(API_URL, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    console.log('API Connection Test Result:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error('API Connection Test Failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

// Export a function to test the signup endpoint specifically
export const testSignupEndpoint = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://jj-essencial-b33c39ba.afribase.dev';
    const response = await axios.post(
      `${API_URL}/auth/signup`,
      {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    
    console.log('Signup Endpoint Test Result:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      success: response.data.success,
      message: response.data.message,
    });
    
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Signup Endpoint Test Failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    return {
      success: false,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};
