// utils/testAdminToken.ts
import axios from 'axios';
import { validateAdminToken } from './adminTokenValidator';

export const testAdminTokenValidation = async (): Promise<boolean> => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    console.log('❌ No admin token found');
    return false;
  }

  console.log('🔍 Testing admin token validation...');

  // Client-side validation
  const clientValidation = validateAdminToken(token);
  console.log('Client validation:', clientValidation);

  if (!clientValidation.isValid) {
    console.log('❌ Client-side validation failed');
    return false;
  }

  // Server-side validation
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://jj-essencial-b33c39ba.afribase.dev';
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const user = response.data.data;
    console.log('Server validation response:', user);

    if (user.id === 'admin-user' && user.role === 'ADMIN') {
      console.log('✅ Admin token validation successful');
      return true;
    } else {
      console.log('❌ User is not an admin');
      return false;
    }
  } catch (error: any) {
    console.log('❌ Server validation failed:', error.response?.data || error.message);
    return false;
  }
};

// Test function you can call in browser console
if (typeof window !== 'undefined') {
  (window as any).testAdminToken = testAdminTokenValidation;
}
