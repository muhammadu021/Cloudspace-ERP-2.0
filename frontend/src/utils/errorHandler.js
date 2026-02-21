/**
 * Comprehensive error handling utility for the frontend
 * Extracts meaningful error messages from various error response formats
 */

/**
 * Extract error message from different error response formats
 * @param {Error|Object} error - The error object from API response
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return 'Network connection failed. Please check your internet connection and try again.';
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return extractValidationErrors(data) || 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You are not authorized to perform this action. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return data?.message || 'A conflict occurred. The resource may already exist.';
    case 422:
      return extractValidationErrors(data) || 'The provided data is invalid. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      break;
  }

  // Extract message from response data
  if (data) {
    // Handle structured error responses
    if (data.message) {
      return data.message;
    }

    // Handle validation errors
    if (data.errors) {
      return extractValidationErrors(data);
    }

    // Handle error arrays
    if (Array.isArray(data.error)) {
      return data.error.join(', ');
    }

    // Handle string errors
    if (typeof data.error === 'string') {
      return data.error;
    }

    // Handle details array
    if (data.details && Array.isArray(data.details)) {
      return data.details.map(detail => detail.message || detail.msg || detail).join(', ');
    }
  }

  // Fallback to generic message
  return 'An error occurred. Please try again.';
};

/**
 * Extract validation errors from error response
 * @param {Object} data - Error response data
 * @returns {string|null} - Formatted validation error message
 */
const extractValidationErrors = (data) => {
  if (!data) return null;

  // Handle express-validator format: { errors: { field: 'message' } }
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const errorMessages = Object.entries(data.errors).map(([field, message]) => {
      const fieldName = formatFieldName(field);
      return `${fieldName}: ${message}`;
    });
    
    if (errorMessages.length > 0) {
      return errorMessages.join(', ');
    }
  }

  // Handle express-validator array format: { details: [{ param: 'field', msg: 'message' }] }
  if (data.details && Array.isArray(data.details)) {
    const errorMessages = data.details.map(detail => {
      const fieldName = formatFieldName(detail.param || detail.path || detail.field);
      const message = detail.msg || detail.message || detail;
      return fieldName ? `${fieldName}: ${message}` : message;
    });
    
    if (errorMessages.length > 0) {
      return errorMessages.join(', ');
    }
  }

  // Handle simple errors array
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map(error => {
      if (typeof error === 'string') return error;
      if (error.message) return error.message;
      if (error.msg) return error.msg;
      return JSON.stringify(error);
    }).join(', ');
  }

  return null;
};

/**
 * Format field names to be more user-friendly
 * @param {string} fieldName - Raw field name
 * @returns {string} - Formatted field name
 */
const formatFieldName = (fieldName) => {
  if (!fieldName) return '';
  
  // Convert snake_case and camelCase to readable format
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
};

/**
 * Get error details for debugging (only in development)
 * @param {Error|Object} error - The error object
 * @returns {Object|null} - Error details for debugging
 */
export const getErrorDetails = (error) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    config: {
      method: error.config?.method,
      url: error.config?.url,
      data: error.config?.data
    },
    stack: error.stack
  };
};

/**
 * Handle API errors with toast notifications
 * @param {Error|Object} error - The error object
 * @param {Function} toast - Toast notification function
 * @param {string} defaultMessage - Default message if no specific error found
 */
export const handleApiError = (error, toast, defaultMessage = 'An error occurred') => {
  const errorMessage = getErrorMessage(error);
  
  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error Details:', getErrorDetails(error));
  }
  
  // Show user-friendly error message
  if (toast && toast.error) {
    toast.error(errorMessage);
  } else {
    console.error('Toast function not available:', errorMessage);
  }
  
  return errorMessage;
};

/**
 * Create a standardized error handler for async operations
 * @param {Function} toast - Toast notification function
 * @param {string} operation - Description of the operation (e.g., 'load data', 'save record')
 * @returns {Function} - Error handler function
 */
export const createErrorHandler = (toast, operation = 'perform this action') => {
  return (error) => {
    const errorMessage = getErrorMessage(error);
    const contextualMessage = `Failed to ${operation}: ${errorMessage}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error during ${operation}:`, getErrorDetails(error));
    }
    
    if (toast && toast.error) {
      toast.error(contextualMessage);
    }
    
    return contextualMessage;
  };
};

/**
 * Validate form data and return formatted errors
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateFormData = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, rule]) => {
    const value = data[field];
    
    // Required field validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${formatFieldName(field)} is required`;
      isValid = false;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rule.required) return;
    
    // Email validation
    if (rule.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field] = `${formatFieldName(field)} must be a valid email address`;
        isValid = false;
      }
    }
    
    // Minimum length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${formatFieldName(field)} must be at least ${rule.minLength} characters long`;
      isValid = false;
    }
    
    // Maximum length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${formatFieldName(field)} must not exceed ${rule.maxLength} characters`;
      isValid = false;
    }
    
    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${formatFieldName(field)} format is invalid`;
      isValid = false;
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value, data);
      if (customError) {
        errors[field] = customError;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return '';
  
  const errorMessages = Object.values(errors).filter(Boolean);
  return errorMessages.join(', ');
};

export default {
  getErrorMessage,
  getErrorDetails,
  handleApiError,
  createErrorHandler,
  validateFormData,
  formatValidationErrors
};