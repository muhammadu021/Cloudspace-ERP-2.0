import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import preferencesReducer from './slices/preferencesSlice';
import spacesReducer from './slices/spacesSlice';
import cacheReducer from './slices/cacheSlice';
import dashboardReducer from './slices/dashboardSlice';
import persistenceMiddleware, { loadPersistedState } from './middleware/persistenceMiddleware';
import { baseApi } from './api/baseApi';

// Load persisted state from localStorage
const preloadedState = loadPersistedState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    preferences: preferencesReducer,
    spaces: spacesReducer,
    cache: cacheReducer,
    dashboard: dashboardReducer,
    // Add RTK Query reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['cache/setEntity'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['cache.entities'],
      },
    })
      .concat(baseApi.middleware)
      .concat(persistenceMiddleware),
});

export default store;
