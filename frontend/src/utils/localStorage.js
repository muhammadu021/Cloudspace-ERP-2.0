/**
 * LocalStorage Utility
 * 
 * Centralized localStorage management with error handling and type safety.
 * Used by the demo/mock layer to persist data across page refreshes.
 */

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'cleardesk_user_preferences',
  AUTH_DATA: 'cleardesk_auth_data',
  DASHBOARD_STATE: 'cleardesk_dashboard_state',
};

/**
 * Get item from localStorage with JSON parsing
 * 
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`[LocalStorage] Failed to get item "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set item in localStorage with JSON stringification
 * 
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Failed to set item "${key}":`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 * 
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Failed to remove item "${key}":`, error);
    return false;
  }
};

/**
 * Clear all localStorage
 * 
 * @returns {boolean} Success status
 */
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('[LocalStorage] Failed to clear storage:', error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * 
 * @returns {boolean} Availability status
 */
export const isAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
