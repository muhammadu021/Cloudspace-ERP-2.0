/**
 * Dashboard Constants
 * Central location for dashboard-related constants
 * Requirements: 1.6
 */

// Dashboard types
export const DASHBOARD_TYPES = {
  SYSTEM_ADMIN: 'system-administrator',
  ADMIN: 'admin',
  HR: 'hr',
  FINANCE: 'finance',
  NORMAL_USER: 'normal-user'
};

// Widget types
export const WIDGET_TYPES = {
  METRIC: 'metric',
  CHART: 'chart',
  LIST: 'list',
  QUICK_ACTION: 'quick-action'
};

// Dashboard routes
export const DASHBOARD_ROUTES = {
  MAIN: '/dashboard',
  MY_SPACE: '/myspace'
};

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  DASHBOARD_CONFIG: 1800, // 30 minutes
  WIDGET_DATA: 300, // 5 minutes
  USER_PREFERENCES: 3600 // 1 hour
};

// Grid layout configuration
export const GRID_CONFIG = {
  COLUMNS: 12,
  ROW_HEIGHT: 60,
  MARGIN: [16, 16],
  CONTAINER_PADDING: [16, 16],
  BREAKPOINTS: {
    lg: 1024,
    md: 768,
    sm: 0
  },
  COLS: {
    lg: 12,
    md: 6,
    sm: 1
  }
};

// Widget position constraints
export const WIDGET_CONSTRAINTS = {
  MIN_WIDTH: 1,
  MAX_WIDTH: 12,
  MIN_HEIGHT: 1,
  MIN_X: 0,
  MAX_X: 11
};

// Analytics event types
export const ANALYTICS_EVENTS = {
  DASHBOARD_VIEW: 'dashboard_view',
  DASHBOARD_SWITCH: 'dashboard_switch',
  WIDGET_RENDER: 'widget_render',
  WIDGET_REFRESH: 'widget_refresh',
  QUICK_ACTION_CLICK: 'quick_action_click',
  WIDGET_ERROR: 'widget_error'
};

// Error messages
export const ERROR_MESSAGES = {
  CONFIG_LOAD_FAILED: 'Failed to load dashboard configuration',
  WIDGET_DATA_FAILED: 'Failed to load widget data',
  PREFERENCES_LOAD_FAILED: 'Failed to load user preferences',
  PREFERENCES_SAVE_FAILED: 'Failed to save user preferences',
  UNAUTHORIZED: 'You do not have permission to access this dashboard',
  NETWORK_ERROR: 'Network error. Please check your connection.'
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FREQUENT: 30000, // 30 seconds
  NORMAL: 60000, // 1 minute
  SLOW: 300000 // 5 minutes
};
