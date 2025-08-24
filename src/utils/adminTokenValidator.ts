/**
 * Admin Token Validator Utility
 * Validates admin-specific JWT tokens with proper admin user identification
 */

export interface AdminTokenValidation {
  isValid: boolean;
  reason?: string;
  payload?: any;
  isAdmin?: boolean;
  userId?: string;
  email?: string;
}

interface AdminUser {
  id: string;
  role: string;
  email: string;
  isAdmin: boolean;
}

export const validateAdminToken = (token: string | null): AdminTokenValidation => {
  if (!token) return { isValid: false, reason: 'No token provided' };
  
  try {
    // Basic JWT structure validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'Invalid JWT structure' };
    }
    
    // Decode payload (without verification - just for client checks)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check required fields
    if (!payload.sub || !payload.exp) {
      return { isValid: false, reason: 'Missing required JWT fields' };
    }
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return { isValid: false, reason: 'Token expired' };
    }
    
    // ADMIN-SPECIFIC: Check if this is an admin token
    if (payload.sub !== 'admin-user') {
      return { isValid: false, reason: 'Not an admin token' };
    }
    
    // Additional admin role verification
    if (payload.role && payload.role !== 'ADMIN') {
      return { isValid: false, reason: 'Invalid admin role' };
    }
    
    return { 
      isValid: true, 
      payload,
      isAdmin: true,
      userId: payload.sub,
      email: payload.email 
    };
  } catch (error) {
    return { isValid: false, reason: 'Token parsing failed' };
  }
};

export const getAdminFromToken = (token: string | null): AdminUser | null => {
  const validation = validateAdminToken(token);
  if (!validation.isValid) return null;
  
  return {
    id: 'admin-user',
    role: 'ADMIN',
    email: validation.payload?.email || 'jadesola0518@gmail.com',
    isAdmin: true
  };
};

export const isTokenExpired = (token: string | null): boolean => {
  const validation = validateAdminToken(token);
  return !validation.isValid || validation.reason === 'Token expired';
};

export const checkAdminTokenStructure = (token: string | null) => {
  const checks = {
    hasToken: !!token,
    hasValidStructure: false,
    isAdminToken: false,
    isExpired: false,
    adminEmail: null as string | null
  };
  
  if (!token) return checks;
  
  try {
    const parts = token.split('.');
    checks.hasValidStructure = parts.length === 3;
    
    if (checks.hasValidStructure) {
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if it's an admin token
      checks.isAdminToken = payload.sub === 'admin-user';
      
      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      checks.isExpired = payload.exp < now;
      
      // Get admin email
      checks.adminEmail = payload.email;
    }
  } catch (error) {
    // Token parsing failed
  }
  
  return checks;
};
