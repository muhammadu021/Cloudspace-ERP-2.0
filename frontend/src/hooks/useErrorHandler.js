import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getErrorMessage, getErrorDetails, createErrorHandler } from '../utils/errorHandler';

/**
 * Custom hook for handling errors with toast notifications
 * @returns {Object} - Error handling utilities
 */
export const useErrorHandler = () => {
  
  /**
   * Handle API errors with toast notifications
   * @param {Error|Object} error - The error object
   * @param {string} defaultMessage - Default message if no specific error found
   * @returns {string} - The error message that was displayed
   */
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    const errorMessage = getErrorMessage(error);
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Details:', getErrorDetails(error));
    }
    
    // Show user-friendly error message
    toast.error(errorMessage);
    
    return errorMessage;
  }, []);

  /**
   * Handle API errors with contextual operation message
   * @param {Error|Object} error - The error object
   * @param {string} operation - Description of the operation (e.g., 'load data', 'save record')
   * @returns {string} - The error message that was displayed
   */
  const handleOperationError = useCallback((error, operation = 'perform this action') => {
    const errorMessage = getErrorMessage(error);
    const contextualMessage = `Failed to ${operation}: ${errorMessage}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error during ${operation}:`, getErrorDetails(error));
    }
    
    toast.error(contextualMessage);
    
    return contextualMessage;
  }, []);

  /**
   * Create a reusable error handler for a specific operation
   * @param {string} operation - Description of the operation
   * @returns {Function} - Error handler function
   */
  const createOperationErrorHandler = useCallback((operation) => {
    return createErrorHandler(toast, operation);
  }, []);

  /**
   * Handle validation errors specifically
   * @param {Error|Object} error - The error object
   * @returns {Object|null} - Formatted validation errors or null
   */
  const handleValidationError = useCallback((error) => {
    if (!error.response || error.response.status !== 400) {
      return null;
    }

    const { data } = error.response;
    
    // Handle structured validation errors
    if (data && data.errors && typeof data.errors === 'object') {
      return data.errors;
    }

    // Handle express-validator format
    if (data && data.details && Array.isArray(data.details)) {
      const validationErrors = {};
      data.details.forEach(detail => {
        const field = detail.param || detail.path || detail.field;
        const message = detail.msg || detail.message;
        if (field && message) {
          validationErrors[field] = message;
        }
      });
      return Object.keys(validationErrors).length > 0 ? validationErrors : null;
    }

    return null;
  }, []);

  /**
   * Show success message
   * @param {string} message - Success message
   */
  const showSuccess = useCallback((message) => {
    toast.success(message);
  }, []);

  /**
   * Show info message
   * @param {string} message - Info message
   */
  const showInfo = useCallback((message) => {
    toast(message, {
      icon: 'ℹ️',
    });
  }, []);

  /**
   * Show warning message
   * @param {string} message - Warning message
   */
  const showWarning = useCallback((message) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
    });
  }, []);

  /**
   * Handle async operations with error handling
   * @param {Function} asyncOperation - The async function to execute
   * @param {string} operation - Description of the operation
   * @param {Object} options - Additional options
   * @returns {Promise} - Promise that resolves with the result or rejects with handled error
   */
  const withErrorHandling = useCallback(async (asyncOperation, operation, options = {}) => {
    const {
      showLoading = false,
      successMessage = null,
      onSuccess = null,
      onError = null
    } = options;

    let loadingToast = null;
    
    try {
      if (showLoading) {
        loadingToast = toast.loading(`${operation}...`);
      }

      const result = await asyncOperation();

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      if (successMessage) {
        showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      const errorMessage = handleOperationError(error, operation);

      if (onError) {
        onError(error, errorMessage);
      }

      throw error;
    }
  }, [handleOperationError, showSuccess]);

  return {
    handleError,
    handleOperationError,
    createOperationErrorHandler,
    handleValidationError,
    showSuccess,
    showInfo,
    showWarning,
    withErrorHandling
  };
};

export default useErrorHandler;