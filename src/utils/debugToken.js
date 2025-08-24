/**
 * Utility function to help debug token issues in the browser console
 * Run this in the browser console to check token storage status
 */
export function checkTokenStatus() {
  const tokens = {
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
  
  return tokens;
}

// Add this to window for easy console access
if (typeof window !== 'undefined') {
  window.checkTokenStatus = checkTokenStatus;
}
