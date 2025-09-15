import axios from 'axios';

// Base URL for API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://api.jandjessential.org/api/v1';

/**
 * Test the API connection
 * This is useful to verify that the backend is accessible
 */
export const testDirect = async () => {
  // Try different field combinations for signup
  const testCases = [
    {
      name: "Test with 'name'", 
      data: {
        email: "test1@example.com",
        password: "password123",
        name: "Test User"
      }
    },
    {
      name: "Test with 'firstName' and 'lastName'", 
      data: {
        email: "test2@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User"
      }
    },
    {
      name: "Test with 'username'", 
      data: {
        email: "test3@example.com",
        password: "password123",
        username: "testuser"
      }
    },
    {
      name: "Test minimal fields", 
      data: {
        email: "test4@example.com",
        password: "password123"
      }
    }
  ];

  console.log("Starting direct test with different field combinations");
  
  for (const test of testCases) {
    try {
      console.log(`Trying ${test.name}:`, test.data);
      const response = await axios.post(`${API_URL}/auth/signup`, test.data);
      console.log(`SUCCESS with ${test.name}:`, response.data);
      return { success: true, data: response.data, workingTest: test.name };
    } catch (error: any) {
      console.error(`FAILED with ${test.name}:`, error.response?.data || error.message);
    }
  }
  
  return { success: false, message: "All test cases failed" };
};

// Run the test
testDirect().then(result => {
  console.log("Final result:", result);
}).catch(error => {
  console.error("Test failed with error:", error);
});
