/**
 * Widget Validation Utilities
 * Validation functions for widget data and configuration
 * Requirements: 3.5, 8.2
 */

import { WIDGET_TYPES } from '../constants/dashboardConstants';

/**
 * Valid widget type identifiers
 */
export const VALID_WIDGET_TYPES = Object.values(WIDGET_TYPES);

/**
 * Check if widget type is valid
 * @param {string} widgetType - Widget type identifier
 * @returns {boolean} True if valid
 */
export function isValidWidgetType(widgetType) {
  return VALID_WIDGET_TYPES.includes(widgetType);
}

/**
 * Validate widget data structure
 * @param {object} data - Widget data object
 * @param {string} widgetType - Widget type
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export function validateWidgetData(data, widgetType) {
  const errors = [];
  
  if (!data) {
    return { valid: false, errors: ['Widget data is required'] };
  }
  
  // Type-specific validation
  switch (widgetType) {
    case WIDGET_TYPES.METRIC:
      if (data.value === undefined && data.value === null) {
        errors.push('Metric widget requires a value');
      }
      break;
      
    case WIDGET_TYPES.CHART:
      if (!data.data || !Array.isArray(data.data)) {
        errors.push('Chart widget requires data array');
      }
      if (!data.labels || !Array.isArray(data.labels)) {
        errors.push('Chart widget requires labels array');
      }
      break;
      
    case WIDGET_TYPES.LIST:
      if (!data.items || !Array.isArray(data.items)) {
        errors.push('List widget requires items array');
      }
      break;
      
    default:
      // No specific validation for other types
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate widget props
 * @param {object} props - Widget props object
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export function validateWidgetProps(props) {
  const errors = [];
  
  if (!props) {
    return { valid: false, errors: ['Widget props are required'] };
  }
  
  // Check required props
  if (!props.id) errors.push('Widget ID is required');
  if (!props.type) errors.push('Widget type is required');
  if (!props.title) errors.push('Widget title is required');
  
  // Validate type
  if (props.type && !isValidWidgetType(props.type)) {
    errors.push(`Invalid widget type: ${props.type}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize widget data (remove potentially harmful content)
 * @param {object} data - Widget data object
 * @returns {object} Sanitized data
 */
export function sanitizeWidgetData(data) {
  if (!data) return data;
  
  // Create a deep copy
  const sanitized = JSON.parse(JSON.stringify(data));
  
  // Remove any script tags or event handlers from string values
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  };
  
  // Recursively sanitize all string values
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        result[key] = sanitizeObject(obj[key]);
      }
      return result;
    }
    return obj;
  };
  
  return sanitizeObject(sanitized);
}

/**
 * Check if widget requires authentication
 * @param {string} widgetType - Widget type identifier
 * @returns {boolean} True if authentication required
 */
export function widgetRequiresAuth(widgetType) {
  // All widgets require authentication in this system
  return true;
}

/**
 * Check if widget requires specific role
 * @param {string} widgetId - Widget ID
 * @param {string} userRole - User role
 * @returns {boolean} True if user has access
 */
export function userHasWidgetAccess(widgetId, userRole) {
  // Widget access is determined by dashboard configuration
  // This function can be extended with specific widget access rules
  return true;
}

/**
 * Get widget error message
 * @param {Error} error - Error object
 * @param {string} widgetType - Widget type
 * @returns {string} User-friendly error message
 */
export function getWidgetErrorMessage(error, widgetType) {
  if (!error) return 'An unknown error occurred';
  
  // Network errors
  if (error.message && error.message.includes('Network')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  
  // Permission errors
  if (error.status === 403 || error.message && error.message.includes('permission')) {
    return 'You do not have permission to view this widget.';
  }
  
  // Not found errors
  if (error.status === 404) {
    return 'Widget data not found.';
  }
  
  // Generic error
  return error.message || 'Failed to load widget data. Please try again.';
}
