/**
 * Error Logger Utility
 * 
 * Logs errors for monitoring and debugging.
 * In production, this would send errors to a monitoring service like Sentry.
 */

/**
 * Log error to monitoring service
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information
 * @param {Object} context - Additional context (user, route, etc.)
 */
export const logError = (error, errorInfo = {}, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
    },
    errorInfo,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    },
  };

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('Error logged:', errorLog);
  }

  // In production, send to monitoring service
  if (import.meta.env.PROD) {
    // Example: Send to Sentry, LogRocket, or custom endpoint
    try {
      // Uncomment and configure your monitoring service
      // Sentry.captureException(error, { contexts: { errorInfo, ...context } });
      
      // Or send to custom endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog),
      }).catch(err => {
        // Silently fail if error logging fails
        console.error('Failed to log error:', err);
      });
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  }

  return errorLog;
};

/**
 * Log API error
 * @param {Error} error - The error object
 * @param {Object} request - Request details
 */
export const logApiError = (error, request = {}) => {
  return logError(error, {}, {
    type: 'API_ERROR',
    request: {
      url: request.url,
      method: request.method,
      status: error.response?.status,
    },
  });
};

/**
 * Log user action error
 * @param {Error} error - The error object
 * @param {string} action - The action that failed
 */
export const logActionError = (error, action) => {
  return logError(error, {}, {
    type: 'ACTION_ERROR',
    action,
  });
};

/**
 * Create error message with guidance
 * @param {Error} error - The error object
 * @returns {Object} Error message with guidance
 */
export const getErrorMessage = (error) => {
  const errorString = error?.toString() || '';
  const statusCode = error?.response?.status;

  // Network errors
  if (errorString.includes('NetworkError') || errorString.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server.',
      action: 'Check your internet connection and try again.',
    };
  }

  // HTTP status codes
  switch (statusCode) {
    case 400:
      return {
        title: 'Invalid Request',
        message: 'The request contains invalid data.',
        action: 'Please check your input and try again.',
      };
    case 401:
      return {
        title: 'Authentication Required',
        message: 'Your session has expired.',
        action: 'Please log in again.',
      };
    case 403:
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'Contact your administrator for access.',
      };
    case 404:
      return {
        title: 'Not Found',
        message: 'The requested resource was not found.',
        action: 'Please check the URL and try again.',
      };
    case 409:
      return {
        title: 'Conflict',
        message: 'This action conflicts with existing data.',
        action: 'Please refresh and try again.',
      };
    case 422:
      return {
        title: 'Validation Error',
        message: 'The data provided is invalid.',
        action: 'Please check your input and try again.',
      };
    case 429:
      return {
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests.',
        action: 'Please wait a moment and try again.',
      };
    case 500:
      return {
        title: 'Server Error',
        message: 'An error occurred on the server.',
        action: 'Please try again later or contact support.',
      };
    case 503:
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable.',
        action: 'Please try again in a few minutes.',
      };
    default:
      return {
        title: 'Error',
        message: error?.message || 'An unexpected error occurred.',
        action: 'Please try again or contact support if the problem persists.',
      };
  }
};

export default {
  logError,
  logApiError,
  logActionError,
  getErrorMessage,
};
