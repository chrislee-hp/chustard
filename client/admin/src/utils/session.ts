/**
 * Validates if the current session is still valid
 * Checks token existence and expiry time
 */
export function validateSession(): boolean {
  const token = localStorage.getItem('admin_token');
  const expiry = localStorage.getItem('token_expiry');
  
  if (!token || !expiry) {
    return false;
  }
  
  const isExpired = Date.now() > Number(expiry);
  if (isExpired) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token_expiry');
    return false;
  }
  
  return true;
}

/**
 * Checks if token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = localStorage.getItem('token_expiry');
  if (!expiry) return true;
  return Date.now() > Number(expiry);
}

/**
 * Creates a mock user for development/testing
 * TODO: Remove when real API is implemented
 */
export function createMockUser(storeId: string, username: string) {
  return {
    id: '1',
    storeId,
    username,
    role: 'admin' as const,
    createdAt: new Date().toISOString()
  };
}
