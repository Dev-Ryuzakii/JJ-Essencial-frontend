import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:3000/api/v1';

/**
 * Test different signup payload formats to see which one works
 */
export const testSignupFormats = async () => {
  const testPayloads = [
    {
      description: "Original format with fullName",
      payload: {
        email: "test@example.com",
        password: "password123",
        fullName: "Test User"
      }
    },
    {
      description: "Format with name instead of fullName",
      payload: {
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      }
    },
    {
      description: "Format with both name and fullName",
      payload: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        fullName: "Test User"
      }
    },
    {
      description: "Format with firstName and lastName",
      payload: {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User"
      }
    },
    {
      description: "Minimal format",
      payload: {
        email: "test@example.com",
        password: "password123"
      }
    }
  ];

  console.log("Starting signup format tests...");
  
  for (const test of testPayloads) {
    try {
      console.log(`Testing: ${test.description}`);
      console.log(`Payload: ${JSON.stringify(test.payload)}`);
      
      const response = await axios.post(`${API_URL}/auth/signup`, test.payload);
      
      console.log(`SUCCESS! Format works: ${test.description}`);
      console.log(`Response:`, response.data);
      
      // We found a working format, no need to test more
      return {
        success: true,
        workingFormat: test.description,
        payload: test.payload,
        response: response.data
      };
    } catch (error: any) {
      console.log(`FAILED: ${test.description}`);
      console.log(`Error status: ${error.response?.status}`);
      console.log(`Error data:`, error.response?.data);
      console.log("---");
    }
  }
  
  return {
    success: false,
    message: "None of the tested formats worked"
  };
};

/**
 * Test a specific signup payload
 */
export const testSpecificSignupPayload = async (payload: any) => {
  try {
    console.log(`Testing specific payload: ${JSON.stringify(payload)}`);
    
    const response = await axios.post(`${API_URL}/auth/signup`, payload);
    
    console.log(`SUCCESS! Payload works`);
    console.log(`Response:`, response.data);
    
    return {
      success: true,
      payload,
      response: response.data
    };
  } catch (error: any) {
    console.log(`FAILED with specific payload`);
    console.log(`Error status: ${error.response?.status}`);
    console.log(`Error data:`, error.response?.data);
    
    return {
      success: false,
      payload,
      error: error.response?.data || error.message
    };
  }
};
