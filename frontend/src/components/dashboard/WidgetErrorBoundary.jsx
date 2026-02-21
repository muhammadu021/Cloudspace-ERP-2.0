/**
 * WidgetErrorBoundary Component
 * 
 * React error boundary for isolating widget errors.
 * Prevents widget failures from crashing the entire dashboard.
 * 
 * Requirements: 4.6, 12.1, 12.2, 12.5, 12.6
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';
import Button from '@/design-system/components/Button';
import { logWidgetError } from '@/utils/dashboardAnalytics';

/**
 * Widget Error Boundary Component
 * 
 * Catches errors in widget rendering and displays fallback UI.
 * Logs errors with context for debugging.
 */
class WidgetErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    const { widgetId, widgetType, userRole, onError } = this.props;

    // Log error with context
    console.error('Widget Error Boundary caught an error:', {
      widgetId,
      widgetType,
      userRole,
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Log error to backend analytics
    logWidgetError({
      widgetId,
      widgetType,
      userRole,
      error: error.toString(),
      stack: errorInfo.componentStack,
      metadata: {
        errorType: 'rendering_error',
      },
    });

    // Call optional error callback for additional logging
    if (onError) {
      onError({
        widgetId,
        widgetType,
        userRole,
        error: error.toString(),
        stack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, widgetId, widgetType, userRole, isSystemAdmin } = this.props;

    if (hasError) {
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center p-6',
            'bg-error-50 border-2 border-error-200 rounded-lg',
            'min-h-[200px]'
          )}
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-error-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h3 className="text-lg font-semibold text-error-900 mb-2">
            Widget Error
          </h3>
          <p className="text-sm text-error-700 text-center mb-4">
            This widget encountered an error and couldn't be displayed.
          </p>

          {/* Technical Details (System Admin only) */}
          {isSystemAdmin && error && (
            <details className="w-full mb-4">
              <summary className="text-sm font-medium text-error-800 cursor-pointer hover:text-error-900 mb-2">
                Technical Details
              </summary>
              <div className="bg-white border border-error-200 rounded p-3 text-xs font-mono text-error-900 overflow-auto max-h-40">
                <div className="mb-2">
                  <strong>Error:</strong> {error.toString()}
                </div>
                {errorInfo && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Retry Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            }
            aria-label="Retry loading widget"
          >
            Retry
          </Button>
        </div>
      );
    }

    return children;
  }
}

WidgetErrorBoundary.propTypes = {
  /** Widget ID for logging */
  widgetId: PropTypes.string.isRequired,
  /** Widget type for logging */
  widgetType: PropTypes.string.isRequired,
  /** User role for logging */
  userRole: PropTypes.string.isRequired,
  /** Whether user is System Administrator (shows technical details) */
  isSystemAdmin: PropTypes.bool,
  /** Error callback for analytics/logging */
  onError: PropTypes.func,
  /** Child components to render */
  children: PropTypes.node.isRequired,
};

WidgetErrorBoundary.defaultProps = {
  isSystemAdmin: false,
  onError: null,
};

export default WidgetErrorBoundary;
