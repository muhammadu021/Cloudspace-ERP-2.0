/**
 * Preference Management Utilities
 * 
 * Helper functions for managing user preferences across the application.
 * Provides convenient methods for common preference operations.
 */

import {
  resetPreferences,
  resetDashboardPreferences,
  resetTablePreferences,
  resetFilterPreferences,
  resetQuickAccessPreferences,
  resetLocalizationPreferences,
} from '../slices/preferencesSlice';

/**
 * Preference categories for reset functionality
 */
export const PREFERENCE_CATEGORIES = {
  ALL: 'all',
  DASHBOARD: 'dashboard',
  TABLES: 'tables',
  FILTERS: 'filters',
  QUICK_ACCESS: 'quickAccess',
  LOCALIZATION: 'localization',
};

/**
 * Reset preferences by category
 * 
 * @param {string} category - The preference category to reset
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<void>}
 */
export const resetPreferencesByCategory = async (category, dispatch) => {
  switch (category) {
    case PREFERENCE_CATEGORIES.ALL:
      dispatch(resetPreferences());
      break;
    case PREFERENCE_CATEGORIES.DASHBOARD:
      dispatch(resetDashboardPreferences());
      break;
    case PREFERENCE_CATEGORIES.TABLES:
      dispatch(resetTablePreferences());
      break;
    case PREFERENCE_CATEGORIES.FILTERS:
      dispatch(resetFilterPreferences());
      break;
    case PREFERENCE_CATEGORIES.QUICK_ACCESS:
      dispatch(resetQuickAccessPreferences());
      break;
    case PREFERENCE_CATEGORIES.LOCALIZATION:
      dispatch(resetLocalizationPreferences());
      break;
    default:
      console.warn(`Unknown preference category: ${category}`);
  }
};

/**
 * Get preference category display name
 * 
 * @param {string} category - The preference category
 * @returns {string} Display name
 */
export const getPreferenceCategoryName = (category) => {
  const names = {
    [PREFERENCE_CATEGORIES.ALL]: 'All Preferences',
    [PREFERENCE_CATEGORIES.DASHBOARD]: 'Dashboard Layout',
    [PREFERENCE_CATEGORIES.TABLES]: 'Table Columns',
    [PREFERENCE_CATEGORIES.FILTERS]: 'Saved Filters',
    [PREFERENCE_CATEGORIES.QUICK_ACCESS]: 'Quick Access & Favorites',
    [PREFERENCE_CATEGORIES.LOCALIZATION]: 'Language & Format',
  };
  
  return names[category] || category;
};

/**
 * Get preference category description
 * 
 * @param {string} category - The preference category
 * @returns {string} Description
 */
export const getPreferenceCategoryDescription = (category) => {
  const descriptions = {
    [PREFERENCE_CATEGORIES.ALL]: 'Reset all preferences to default values',
    [PREFERENCE_CATEGORIES.DASHBOARD]: 'Reset dashboard widget layout and configuration',
    [PREFERENCE_CATEGORIES.TABLES]: 'Reset table column visibility and ordering',
    [PREFERENCE_CATEGORIES.FILTERS]: 'Clear all saved filters and search preferences',
    [PREFERENCE_CATEGORIES.QUICK_ACCESS]: 'Reset quick access items, recent routes, and favorites',
    [PREFERENCE_CATEGORIES.LOCALIZATION]: 'Reset language, timezone, and date/time formats',
  };
  
  return descriptions[category] || '';
};

/**
 * Check if preferences are synced with backend
 * 
 * @param {Object} preferences - Current preferences state
 * @returns {boolean} True if synced
 */
export const arePreferencesSynced = (preferences) => {
  if (!preferences.lastSyncedAt || !preferences.lastUpdatedAt) {
    return false;
  }
  
  const syncedTime = new Date(preferences.lastSyncedAt).getTime();
  const updatedTime = new Date(preferences.lastUpdatedAt).getTime();
  
  // Consider synced if backend sync is within 5 seconds of last update
  return Math.abs(syncedTime - updatedTime) < 5000;
};

/**
 * Get sync status message
 * 
 * @param {Object} preferences - Current preferences state
 * @returns {string} Status message
 */
export const getSyncStatusMessage = (preferences) => {
  if (!preferences.lastUpdatedAt) {
    return 'No changes';
  }
  
  if (arePreferencesSynced(preferences)) {
    return 'Synced';
  }
  
  return 'Syncing...';
};

/**
 * Validate preference data structure
 * 
 * @param {Object} preferences - Preferences to validate
 * @returns {boolean} True if valid
 */
export const validatePreferences = (preferences) => {
  if (!preferences || typeof preferences !== 'object') {
    return false;
  }
  
  // Check required fields
  const requiredFields = ['dashboard', 'tableColumns', 'filters'];
  for (const field of requiredFields) {
    if (!(field in preferences)) {
      return false;
    }
  }
  
  // Validate dashboard structure
  if (!preferences.dashboard.widgets || !Array.isArray(preferences.dashboard.widgets)) {
    return false;
  }
  
  if (!preferences.dashboard.layout || !Array.isArray(preferences.dashboard.layout)) {
    return false;
  }
  
  // Validate tableColumns is an object
  if (typeof preferences.tableColumns !== 'object') {
    return false;
  }
  
  // Validate filters is an object
  if (typeof preferences.filters !== 'object') {
    return false;
  }
  
  return true;
};

/**
 * Merge preferences with defaults
 * Useful when loading preferences that might be missing new fields
 * 
 * @param {Object} preferences - User preferences
 * @param {Object} defaults - Default preferences
 * @returns {Object} Merged preferences
 */
export const mergeWithDefaults = (preferences, defaults) => {
  const merged = { ...defaults };
  
  for (const key in preferences) {
    if (preferences[key] !== undefined && preferences[key] !== null) {
      if (typeof preferences[key] === 'object' && !Array.isArray(preferences[key])) {
        merged[key] = { ...defaults[key], ...preferences[key] };
      } else {
        merged[key] = preferences[key];
      }
    }
  }
  
  return merged;
};

/**
 * Export preferences to JSON file
 * 
 * @param {Object} preferences - Preferences to export
 * @param {string} filename - Export filename
 */
export const exportPreferences = (preferences, filename = 'preferences.json') => {
  try {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export preferences:', error);
    throw error;
  }
};

/**
 * Import preferences from JSON file
 * 
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported preferences
 */
export const importPreferences = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const preferences = JSON.parse(e.target.result);
        
        if (!validatePreferences(preferences)) {
          reject(new Error('Invalid preference file format'));
          return;
        }
        
        resolve(preferences);
      } catch (error) {
        reject(new Error('Failed to parse preference file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read preference file'));
    };
    
    reader.readAsText(file);
  });
};
