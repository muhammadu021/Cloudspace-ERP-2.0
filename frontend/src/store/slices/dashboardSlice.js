/**
 * Dashboard Redux Slice
 * Manages dashboard state including configuration, widget data, and loading states
 * Requirements: 2.4, 11.1
 */

import { createSlice } from '@reduxjs/toolkit';
import { LOADING_STATES } from '../../constants/dashboardConstants';

const initialState = {
  // Current dashboard type being viewed
  currentDashboardType: null,
  
  // Selected dashboard type (for System Administrators)
  selectedDashboardType: null,
  
  // Dashboard configuration
  configuration: null,
  configurationLoading: LOADING_STATES.IDLE,
  configurationError: null,
  
  // Widget data (keyed by widget ID)
  widgetData: {},
  
  // Widget loading states (keyed by widget ID)
  widgetLoadingStates: {},
  
  // Widget errors (keyed by widget ID)
  widgetErrors: {},
  
  // Last refresh timestamp
  lastRefresh: null,
  
  // Analytics
  analyticsEnabled: true
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Set current dashboard type
    setDashboardType: (state, action) => {
      state.currentDashboardType = action.payload;
    },
    
    // Set selected dashboard type (for System Administrators)
    setSelectedDashboardType: (state, action) => {
      state.selectedDashboardType = action.payload;
    },
    
    // Set dashboard configuration
    setConfiguration: (state, action) => {
      state.configuration = action.payload;
      state.configurationLoading = LOADING_STATES.SUCCESS;
      state.configurationError = null;
    },
    
    // Set configuration loading state
    setConfigurationLoading: (state, action) => {
      state.configurationLoading = action.payload;
    },
    
    // Set configuration error
    setConfigurationError: (state, action) => {
      state.configurationError = action.payload;
      state.configurationLoading = LOADING_STATES.ERROR;
    },
    
    // Set widget data
    setWidgetData: (state, action) => {
      const { widgetId, data } = action.payload;
      state.widgetData[widgetId] = data;
      state.widgetLoadingStates[widgetId] = LOADING_STATES.SUCCESS;
      state.widgetErrors[widgetId] = null;
    },
    
    // Set widget loading state
    setWidgetLoading: (state, action) => {
      const { widgetId, loading } = action.payload;
      state.widgetLoadingStates[widgetId] = loading ? LOADING_STATES.LOADING : LOADING_STATES.IDLE;
    },
    
    // Set widget error
    setWidgetError: (state, action) => {
      const { widgetId, error } = action.payload;
      state.widgetErrors[widgetId] = error;
      state.widgetLoadingStates[widgetId] = LOADING_STATES.ERROR;
    },
    
    // Clear widget error
    clearWidgetError: (state, action) => {
      const widgetId = action.payload;
      state.widgetErrors[widgetId] = null;
    },
    
    // Set last refresh timestamp
    setLastRefresh: (state, action) => {
      state.lastRefresh = action.payload || new Date().toISOString();
    },
    
    // Reset dashboard state
    resetDashboard: (state) => {
      return initialState;
    },
    
    // Clear all widget data
    clearWidgetData: (state) => {
      state.widgetData = {};
      state.widgetLoadingStates = {};
      state.widgetErrors = {};
    },
    
    // Toggle analytics
    toggleAnalytics: (state, action) => {
      state.analyticsEnabled = action.payload !== undefined ? action.payload : !state.analyticsEnabled;
    }
  }
});

// Export actions
export const {
  setDashboardType,
  setSelectedDashboardType,
  setConfiguration,
  setConfigurationLoading,
  setConfigurationError,
  setWidgetData,
  setWidgetLoading,
  setWidgetError,
  clearWidgetError,
  setLastRefresh,
  resetDashboard,
  clearWidgetData,
  toggleAnalytics
} = dashboardSlice.actions;

// Selectors
export const selectCurrentDashboardType = (state) => state.dashboard.currentDashboardType;
export const selectSelectedDashboardType = (state) => state.dashboard.selectedDashboardType;
export const selectConfiguration = (state) => state.dashboard.configuration;
export const selectConfigurationLoading = (state) => state.dashboard.configurationLoading;
export const selectConfigurationError = (state) => state.dashboard.configurationError;
export const selectWidgetData = (widgetId) => (state) => state.dashboard.widgetData[widgetId];
export const selectWidgetLoading = (widgetId) => (state) => state.dashboard.widgetLoadingStates[widgetId] || LOADING_STATES.IDLE;
export const selectWidgetError = (widgetId) => (state) => state.dashboard.widgetErrors[widgetId];
export const selectLastRefresh = (state) => state.dashboard.lastRefresh;
export const selectAnalyticsEnabled = (state) => state.dashboard.analyticsEnabled;

// Complex selectors
export const selectAllWidgetData = (state) => state.dashboard.widgetData;
export const selectAllWidgetErrors = (state) => state.dashboard.widgetErrors;
export const selectAllWidgetLoadingStates = (state) => state.dashboard.widgetLoadingStates;

export const selectIsAnyWidgetLoading = (state) => {
  const loadingStates = state.dashboard.widgetLoadingStates;
  return Object.values(loadingStates).some(state => state === LOADING_STATES.LOADING);
};

export const selectWidgetCount = (state) => {
  return state.dashboard.configuration?.widgets?.length || 0;
};

export const selectQuickActions = (state) => {
  return state.dashboard.configuration?.quickActions || [];
};

// Export reducer
export default dashboardSlice.reducer;
