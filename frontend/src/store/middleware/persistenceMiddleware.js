/**
 * Middleware to persist specific state slices to localStorage and backend
 * 
 * Features:
 * - Immediate localStorage persistence for instant feedback
 * - Debounced backend sync (2 seconds after last change)
 * - Handles offline scenarios gracefully
 * - Preference versioning for migration support
 */

const PREFERENCE_VERSION = 1;
const BACKEND_SYNC_DELAY = 2000; // 2 seconds

// Debounce timers for backend sync
let preferenceSyncTimer = null;
let uiSyncTimer = null;

/**
 * Debounce function to delay backend sync
 */
const debounce = (func, delay) => {
  return (...args) => {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve(func(...args));
      }, delay);
      return timer;
    });
  };
};

/**
 * Sync preferences to backend
 */
const syncPreferencesToBackend = async (preferences, store) => {
  try {
    // Only sync if user is authenticated
    const state = store.getState();
    const token = state.auth?.token;
    
    if (!token) {
      return;
    }

    // Add version to preferences
    const versionedPreferences = {
      ...preferences,
      version: PREFERENCE_VERSION,
      lastSyncedAt: new Date().toISOString(),
    };

    // Use RTK Query mutation to sync
    const { dispatch } = store;
    
    // Import the mutation dynamically to avoid circular dependencies
    const { preferencesApi } = await import('../api/preferencesApi');
    
    dispatch(
      preferencesApi.endpoints.updatePreferences.initiate(versionedPreferences)
    );
  } catch (error) {
    console.error('Failed to sync preferences to backend:', error);
    // Don't throw - fail gracefully for offline scenarios
  }
};

/**
 * Main persistence middleware
 */
const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Get the updated state
  const state = store.getState();
  
  // Persist auth state
  if (action.type.startsWith('auth/')) {
    try {
      localStorage.setItem('auth', JSON.stringify({
        token: state.auth.token,
        user: state.auth.user,
        permissions: state.auth.permissions,
      }));
    } catch (error) {
      console.error('Failed to persist auth state:', error);
    }
  }
  
  // Persist UI state (localStorage only, no backend sync needed)
  if (action.type.startsWith('ui/')) {
    try {
      localStorage.setItem('ui', JSON.stringify({
        sidebar: state.ui.sidebar,
        theme: state.ui.theme,
      }));
    } catch (error) {
      console.error('Failed to persist UI state:', error);
    }
  }
  
  // Persist preferences state (localStorage + debounced backend sync)
  if (action.type.startsWith('preferences/')) {
    try {
      // Immediate localStorage persistence
      const preferencesData = {
        ...state.preferences,
        version: PREFERENCE_VERSION,
        lastUpdatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('preferences', JSON.stringify(preferencesData));
      
      // Debounced backend sync
      if (preferenceSyncTimer) {
        clearTimeout(preferenceSyncTimer);
      }
      
      preferenceSyncTimer = setTimeout(() => {
        syncPreferencesToBackend(state.preferences, store);
      }, BACKEND_SYNC_DELAY);
      
    } catch (error) {
      console.error('Failed to persist preferences state:', error);
    }
  }
  
  return result;
};

/**
 * Load persisted state from localStorage
 */
export const loadPersistedState = () => {
  try {
    const auth = localStorage.getItem('auth');
    const ui = localStorage.getItem('ui');
    const preferences = localStorage.getItem('preferences');
    
    const parsedPreferences = preferences ? JSON.parse(preferences) : undefined;
    
    // Handle preference versioning/migration
    if (parsedPreferences && parsedPreferences.version !== PREFERENCE_VERSION) {
      console.log('Migrating preferences from version', parsedPreferences.version, 'to', PREFERENCE_VERSION);
      // Add migration logic here if needed in the future
    }
    
    return {
      auth: auth ? JSON.parse(auth) : undefined,
      ui: ui ? JSON.parse(ui) : undefined,
      preferences: parsedPreferences,
    };
  } catch (error) {
    console.error('Failed to load persisted state:', error);
    return {};
  }
};

/**
 * Clear persisted state from localStorage
 */
export const clearPersistedState = () => {
  try {
    localStorage.removeItem('auth');
    localStorage.removeItem('ui');
    localStorage.removeItem('preferences');
  } catch (error) {
    console.error('Failed to clear persisted state:', error);
  }
};

/**
 * Sync preferences from backend on app initialization
 * This ensures preferences are synced across devices
 */
export const initializePreferences = async (store) => {
  try {
    const state = store.getState();
    const token = state.auth?.token;
    
    if (!token) {
      return;
    }

    // Import the query dynamically
    const { preferencesApi } = await import('../api/preferencesApi');
    
    // Fetch preferences from backend
    const result = await store.dispatch(
      preferencesApi.endpoints.getPreferences.initiate()
    );
    
    if (result.data) {
      const backendPreferences = result.data;
      const localPreferences = state.preferences;
      
      // Compare timestamps to determine which is newer
      const backendTime = backendPreferences.lastSyncedAt 
        ? new Date(backendPreferences.lastSyncedAt).getTime() 
        : 0;
      const localTime = localPreferences.lastUpdatedAt 
        ? new Date(localPreferences.lastUpdatedAt).getTime() 
        : 0;
      
      // Use backend preferences if they're newer
      if (backendTime > localTime) {
        console.log('Loading preferences from backend (newer than local)');
        
        // Remove metadata fields before dispatching
        const { version, lastSyncedAt, lastUpdatedAt, ...cleanPreferences } = backendPreferences;
        
        // Update Redux state with backend preferences
        store.dispatch({
          type: 'preferences/loadFromBackend',
          payload: cleanPreferences,
        });
        
        // Update localStorage
        localStorage.setItem('preferences', JSON.stringify({
          ...cleanPreferences,
          version: PREFERENCE_VERSION,
          lastUpdatedAt: new Date().toISOString(),
        }));
      } else if (localTime > backendTime) {
        console.log('Local preferences are newer, syncing to backend');
        // Sync local preferences to backend
        await syncPreferencesToBackend(localPreferences, store);
      }
    }
  } catch (error) {
    console.error('Failed to initialize preferences from backend:', error);
    // Don't throw - fail gracefully and use local preferences
  }
};

export default persistenceMiddleware;
