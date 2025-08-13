import axios from 'axios';

/**
 * Simple utility to test API connectivity
 */
export const testApiConnection = async () => {
  try {
    // Test connection to the base API URL
    const response = await axios.get('http://localhost:3000/api/v1', {
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
    // Test the signup endpoint with minimal data
    const response = await axios.post(
      'http://localhost:3000/api/v1/auth/signup',
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
