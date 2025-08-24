/**
 * Utility function to help debug token issues in the browser console
 * Run this in the browser console to check token storage status
 */
export interface TokenStatus {
  token: string | null;
  auth_token: string | null;
  adminToken: string | null;
}

export function checkTokenStatus(): TokenStatus {
  const tokens: TokenStatus = {
    'token': localStorage.getItem('token'),
    'auth_token': localStorage.getItem('auth_token'),
    'adminToken': localStorage.getItem('adminToken')
  };
  
  console.log('--- Token Status Check ---');
  console.table(tokens);
  
  // Analyze which tokens are available
  const availableTokens = Object.entries(tokens)
    .filter(([_, value]) => !!value)
    .map(([key]) => key);
  
  console.log('Available tokens:', availableTokens.length ? availableTokens.join(', ') : 'None');
  
  // Check for token inconsistencies
  if (tokens.token && tokens.auth_token && tokens.token !== tokens.auth_token) {
    console.warn('Warning: token and auth_token have different values!');
  }
  
  // Check token format
  for (const [key, value] of Object.entries(tokens)) {
    if (value) {
      try {
        // Try to decode the token to see if it's valid JWT format
        const parts = value.split('.');
        if (parts.length === 3) {
          console.log(`${key} appears to be a valid JWT format`);
          
          // Try to decode the payload
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log(`${key} payload:`, payload);
            
            // Check expiration
            if (payload.exp) {
              const expDate = new Date(payload.exp * 1000);
              const now = new Date();
              if (expDate < now) {
                console.warn(`${key} is EXPIRED (${expDate.toLocaleString()})`);
              } else {
                console.log(`${key} expires at ${expDate.toLocaleString()}`);
              }
            }
          } catch (e) {
            console.log(`Could not decode ${key} payload`);
          }
        } else {
          console.warn(`${key} does not appear to be a valid JWT (parts: ${parts.length})`);
        }
      } catch (e) {
        console.error(`Error analyzing ${key}:`, e);
      }
    }
  }
  
  return tokens;
}

// Add this to window for easy console access
declare global {
  interface Window {
    checkTokenStatus: () => TokenStatus;
    debugWishlist?: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.checkTokenStatus = checkTokenStatus;
}
