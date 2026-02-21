import React from 'react';
import { AlertCircle, XCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Alert } from '../design-system/components';
import { getErrorMessage } from '../utils/errorLogger';

/**
 * ErrorMessage Component
 * 
 * Displays actionable error messages with resolution guidance.
 * Can be used inline in forms, pages, or as standalone alerts.
 * 
 * @example
 * <ErrorMessage
 *   error={error}
 *   onRetry={() => refetch()}
 *   onDismiss={() => setError(null)}
 * />
 */

const ErrorMessage = ({
  error,
  title,
  message,
  action,
  onRetry,
  onDismiss,
  showContactSupport = true,
  className = '',
}) => {
  if (!error && !message) return null;

  // Get error guidance if error object is provided
  const guidance = error ? getErrorMessage(error) : { title, message, action };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request: ' + guidance.title);
    const body = encodeURIComponent(
      'I need help with the following issue:\n\n' +
      guidance.message + '\n\n' +
      'Error details: ' + (error?.message || 'N/A')
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800">
            {guidance.title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{guidance.message}</p>
            {guidance.action && (
              <p className="mt-2 flex items-start gap-2">
                <HelpCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{guidance.action}</span>
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          {(onRetry || showContactSupport || onDismiss) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  Try Again
                </button>
              )}
              
              {showContactSupport && (
                <button
                  onClick={handleContactSupport}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Contact Support
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="ml-auto inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * InlineError Component
 * 
 * Compact error display for form fields and inline contexts.
 * 
 * @example
 * <InlineError error={fieldError} />
 */
export const InlineError = ({ error, message, className = '' }) => {
  if (!error && !message) return null;

  const errorText = message || error?.message || 'An error occurred';

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 mt-1 ${className}`}>
      <AlertCircle size={14} />
      <span>{errorText}</span>
    </div>
  );
};

/**
 * ErrorAlert Component
 * 
 * Alert-style error display using the design system Alert component.
 * 
 * @example
 * <ErrorAlert error={error} onDismiss={() => setError(null)} />
 */
export const ErrorAlert = ({ error, title, message, onDismiss, className = '' }) => {
  if (!error && !message) return null;

  const guidance = error ? getErrorMessage(error) : { title, message };

  return (
    <Alert
      type="error"
      title={guidance.title}
      message={guidance.message}
      dismissible={!!onDismiss}
      onDismiss={onDismiss}
      className={className}
    />
  );
};

/**
 * useErrorHandler Hook
 * 
 * Hook for managing error state and display.
 * 
 * @example
 * const { error, setError, clearError, ErrorDisplay } = useErrorHandler();
 * 
 * try {
 *   await someAction();
 * } catch (err) {
 *   setError(err);
 * }
 * 
 * return <ErrorDisplay onRetry={handleRetry} />;
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const clearError = () => setError(null);

  const ErrorDisplay = ({ onRetry, ...props }) => (
    <ErrorMessage
      error={error}
      onRetry={onRetry}
      onDismiss={clearError}
      {...props}
    />
  );

  return {
    error,
    setError,
    clearError,
    hasError: !!error,
    ErrorDisplay,
  };
};

export default ErrorMessage;
