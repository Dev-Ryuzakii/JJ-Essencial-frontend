// utils/adminTokenValidator.js
export const validateAdminToken = (token) => {
  if (!token) return { isValid: false, reason: 'No token provided' };
  
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'Invalid JWT structure' };
    }
    
    // Decode payload
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
    
    return { 
      isValid: true, 
      payload,
      isAdmin: true,
      userId: payload.sub 
    };
  } catch (error) {
    return { isValid: false, reason: 'Token parsing failed' };
  }
};

export const getAdminFromToken = (token) => {
  const validation = validateAdminToken(token);
  if (!validation.isValid) return null;
  
  return {
    id: 'admin-user',
    role: 'ADMIN',
    email: 'jadesola0518@gmail.com', // Your admin email
    isAdmin: true
  };
};
