// Utility functions for safe localStorage operations

export const storage = {
  // Get item from localStorage with error handling
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue
      
      // Try to parse as JSON, but if it fails, return the raw string
      // This handles both JSON-stored values and plain string tokens
      try {
        return JSON.parse(item)
      } catch (parseError) {
        // If JSON.parse fails, it's likely a plain string (like a token)
        // Return it as-is
        return item
      }
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return defaultValue
    }
  },

  // Set item in localStorage with error handling
  setItem: (key, value) => {
    try {
      // For tokens (strings), store as-is without JSON.stringify
      // For objects, use JSON.stringify
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(key, valueToStore)
      return true
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
      return false
    }
  },

  // Remove item from localStorage with error handling
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },

  // Clear all auth-related data
  clearAuthData: () => {
    console.log('🗑️ clearAuthData called');
    console.trace('Stack trace:'); // This will show where it was called from
    const authKeys = ['token', 'refreshToken', 'user', 'permissions', 'company_id']
    authKeys.forEach(key => {
      console.log(`  Removing ${key} from localStorage`);
      storage.removeItem(key);
    });
  },

  // Check if localStorage is available
  isAvailable: () => {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }
}

export default storage