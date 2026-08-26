# API Client Usage Guidelines

## Overview
This document explains the correct usage of the existing apiClient in the JJ-Essencial frontend project and why it should be used instead of direct axios calls.

## Current Implementation

The project already has a comprehensive apiClient implementation at `/src/services/apiClient.ts` that provides:

1. **Smart Authentication Handling**
   - Automatic token selection (admin vs user tokens)
   - Proper header management
   - Automatic redirection on auth failures

2. **Request/Response Interceptors**
   - Detailed logging for debugging
   - Error handling with enhanced timeout management
   - Network error detection

3. **Helper Functions**
   - Typed GET, POST, PUT, PATCH, DELETE functions
   - Consistent error handling
   - Proper response formatting

## Why Not to Use Direct Axios

### 1. Violates API Client Usage Policy
The project has a strict policy requiring the use of the existing apiClient infrastructure for all API calls.

### 2. Duplicates Existing Functionality
Creating another axios-based client duplicates functionality that already exists.

### 3. Bypasses Important Features
Direct axios calls bypass:
- Authentication token management
- Request/response logging
- Error handling interceptors
- Timeout management
- Consistent response formatting

### 4. Creates Maintenance Burden
Having multiple ways to make API calls increases complexity and maintenance burden.

## How to Use the Existing apiClient

### 1. Import the Helper Functions
```typescript
import { get, post, put, del } from './apiClient';
```

### 2. Make API Calls
```typescript
// GET request
const userData = await get<User>('/users/123');

// POST request
const newProduct = await post<Product>('/products', productData);

// PUT request
const updatesdUser = await put<User>('/users/123', updatesData);

// DELETE request
const result = await del<DeleteResponse>('/products/123');
```

### 3. Handle Responses
The apiClient automatically handles:
- Response data extraction
- Error formatting
- Authentication token attachment

## Example: Correct Admin Support API Implementation

```typescript
import { get, put } from './apiClient';

// Correct implementation using existing apiClient
const adminSupportApi = {
  getTicket: async (ticketId: string): Promise<AdminSupportTicketDetail> => {
    try {
      // Uses existing apiClient helper function
      const response = await get<AdminSupportTicketDetail>(`/customer-support/chat/${ticketId}`);
      
      // Response is already processed by apiClient interceptors
      if (response && typeof response === 'object' && !('success' in response && response.success === false)) {
        return response as unknown as AdminSupportTicketDetail;
      } else {
        throw new Error('Failed to fetch ticket details');
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch ticket details');
    }
  }
};
```

## Benefits of Using Existing apiClient

### 1. Consistency
- All API calls follow the same patterns
- Consistent error handling across the application
- Uniform authentication management

### 2. Reliability
- Proven implementation with error handling
- Tested authentication token management
- Built-in logging for debugging

### 3. Maintainability
- Single source of truth for API interactions
- Easier to updates when requirements change
- Reduced code duplication

### 4. Security
- Proper token handling
- Automatic cleanup on auth failures
- Consistent header management

## Troubleshooting

If you're experiencing issues with API calls:

1. **Check the existing apiClient is being used**
2. **Verify authentication tokens are valid**
3. **Check browser console for detailed error messages**
4. **Confirm endpoints exist on the backend**
5. **Verify network connectivity**

The existing apiClient should handle all API interactions properly without requiring direct axios calls.