/**
 * Token utility functions for handling JWT tokens
 */

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Check if a JWT token is expiring soon (within 5 minutes)
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expiring soon
 */
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + (5 * 60); // 5 minutes
    
    return payload.exp < fiveMinutesFromNow;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Token payload or null if invalid
 */
export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    return JSON.parse(atob(parts[1]));
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('permissions');
};

/**
 * Check if user is authenticated with a valid token
 * @returns {boolean} - True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token && !isTokenExpired(token);
};

/**
 * Get the current user's email from token
 * @returns {string|null} - User email or null
 */
export const getCurrentUserEmail = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const payload = getTokenPayload(token);
  return payload?.email || null;
};

/**
 * Get the current user's ID from token
 * @returns {string|null} - User ID or null
 */
export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const payload = getTokenPayload(token);
  return payload?.userId || payload?.id || payload?.sub || null;
};

/**
 * Format token expiration time for display
 * @param {string} token - JWT token
 * @returns {string} - Formatted expiration time
 */
export const getTokenExpirationTime = (token) => {
  if (!token) return 'Invalid token';
  
  const payload = getTokenPayload(token);
  if (!payload?.exp) return 'No expiration';
  
  const expDate = new Date(payload.exp * 1000);
  return expDate.toLocaleString();
};

/**
 * Get time remaining until token expires
 * @param {string} token - JWT token
 * @returns {string} - Time remaining (e.g., "5 minutes", "2 hours")
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 'No token';
  
  const payload = getTokenPayload(token);
  if (!payload?.exp) return 'No expiration';
  
  const expTime = payload.exp * 1000;
  const now = Date.now();
  const timeLeft = expTime - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const minutes = Math.floor(timeLeft / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};