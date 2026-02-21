/**
 * DashboardWidget Component
 * 
 * Reusable container for dashboard information displays.
 * Provides consistent loading, error, and empty states.
 * Wraps widgets with error boundary for isolation.
 * Supports role-based configuration and permissions.
 * 
 * Requirements: 4.3, 9.1, 9.5, 9.6
 * 
 * @example
 * <DashboardWidget
 *   id="sales-metrics"
 *   title="Sales Overview"
 *   size="medium"
 *   widgetType="metric"
 *   role="admin"
 *   config={{ metric: 'sales' }}
 *   permissions={['view_sales']}
 *   loading={false}
 *   error={null}
 *   onRefresh={() => {}}
 *   lastUpdate={new Date().toISOString()}
 * >
 *   <MetricCard value={1234} label="Total Sales" />
 * </DashboardWidget>
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '@/design-system/components/Card';
import Button from '@/design-system/components/Button';
import { cn } from '@/design-system/utils';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import useLazyWidget from '@/hooks/useLazyWidget';
import { logWidgetError } from '@/utils/dashboardAnalytics';

const DashboardWidget = ({
  id,
  title,
  size = 'medium',
  widgetType,
  role,
  config = {},
  permissions = [],
  children,
  actions,
  loading = false,
  error = null,
  emptyState = null,
  onRefresh,
  lastUpdate,
  isSystemAdmin = false,
  className,
  enableLazyLoading = true,
  ...props
}) => {
  // Lazy loading hook for performance optimization
  const { widgetRef, shouldFetch } = useLazyWidget({
    rootMargin: '50px',
    threshold: 0.1,
  });

  // Timeout detection state
  const [showTimeout, setShowTimeout] = useState(false);
  const timeoutRef = useRef(null);

  // Determine if widget should load data
  const shouldLoadData = !enableLazyLoading || shouldFetch;

  // Log fetch errors to analytics
  useEffect(() => {
    if (error && widgetType && role) {
      logWidgetError({
        widgetId: id,
        widgetType,
        userRole: role,
        error: typeof error === 'string' ? error : error?.message || 'Unknown error',
        metadata: {
          errorType: 'fetch_error',
          config,
        },
      });
    }
  }, [error, id, widgetType, role, config]);

  // Handle timeout detection for slow requests (>3 seconds)
  useEffect(() => {
    if (loading && !error) {
      // Start timeout timer when loading begins
      timeoutRef.current = setTimeout(() => {
        setShowTimeout(true);
      }, 3000);
    } else {
      // Clear timeout and reset state when loading completes or error occurs
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setShowTimeout(false);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, error]);
  // Size styles for widget dimensions
  const sizeStyles = {
    small: 'col-span-12 md:col-span-6 lg:col-span-4',
    medium: 'col-span-12 md:col-span-6 lg:col-span-6',
    large: 'col-span-12',
  };

  /**
   * Format last update timestamp
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  // Build widget header actions
  const widgetActions = (
    <div className="flex items-center gap-2">
      {/* Last Update Timestamp */}
      {lastUpdate && (
        <span className="text-xs text-neutral-500" title={new Date(lastUpdate).toLocaleString()}>
          {formatLastUpdate(lastUpdate)}
        </span>
      )}
      
      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          icon={
            <svg 
              className={cn("w-4 h-4", loading && "animate-spin")} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
          aria-label="Refresh widget"
          title="Refresh widget"
        />
      )}
      
      {/* Custom Actions */}
      {actions}
    </div>
  );

  // Loading skeleton component with timeout warning
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
      </div>
      {showTimeout && (
        <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-md">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-800">
                Taking longer than expected
              </p>
              <p className="text-xs text-warning-700 mt-1">
                This widget is loading slowly. Please wait or try refreshing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Error state component
  const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-error-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-neutral-600 mb-3">{message || 'Failed to load data'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );

  // Empty state component
  const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">
        {message || 'No data available'}
      </p>
    </div>
  );

  // Determine content to display
  const renderContent = () => {
    // If lazy loading is enabled and widget is not visible yet, show placeholder
    if (enableLazyLoading && !shouldLoadData) {
      return <LoadingSkeleton />;
    }

    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={onRefresh} />;
    }

    if (!children && emptyState) {
      return typeof emptyState === 'string' ? (
        <EmptyState message={emptyState} />
      ) : (
        emptyState
      );
    }

    // Clone children and pass role-specific config and permissions
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        config,
        permissions,
        role,
        shouldFetch: shouldLoadData,
      });
    }

    return children;
  };

  // Wrap content with error boundary
  const wrappedContent = (
    <WidgetErrorBoundary
      widgetId={id}
      widgetType={widgetType || 'unknown'}
      userRole={role || 'unknown'}
      isSystemAdmin={isSystemAdmin}
      onError={(errorInfo) => {
        // Log error for analytics
        console.error('Widget error:', errorInfo);
      }}
    >
      {renderContent()}
    </WidgetErrorBoundary>
  );

  // Generate descriptive ARIA label
  const ariaLabel = `${title || 'Widget'}${widgetType ? ` - ${widgetType}` : ''}${
    loading ? ' - Loading' : error ? ' - Error' : ''
  }`;

  return (
    <Card
      ref={widgetRef}
      title={title}
      actions={widgetActions}
      padding="md"
      className={cn(sizeStyles[size], className)}
      data-widget-id={id}
      data-widget-type={widgetType}
      data-widget-role={role}
      role="region"
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-live={loading ? 'polite' : undefined}
      {...props}
    >
      {wrappedContent}
    </Card>
  );
};

DashboardWidget.propTypes = {
  /** Unique widget identifier */
  id: PropTypes.string.isRequired,
  /** Widget title */
  title: PropTypes.string,
  /** Widget size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Widget type identifier */
  widgetType: PropTypes.string,
  /** User role */
  role: PropTypes.string,
  /** Role-specific widget configuration */
  config: PropTypes.object,
  /** Widget permissions array */
  permissions: PropTypes.arrayOf(PropTypes.string),
  /** Widget content */
  children: PropTypes.node,
  /** Action buttons in header */
  actions: PropTypes.node,
  /** Loading state */
  loading: PropTypes.bool,
  /** Error message */
  error: PropTypes.string,
  /** Empty state content or message */
  emptyState: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /** Refresh handler */
  onRefresh: PropTypes.func,
  /** Last update timestamp (ISO string) */
  lastUpdate: PropTypes.string,
  /** Whether user is System Administrator */
  isSystemAdmin: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Enable lazy loading (default: true) */
  enableLazyLoading: PropTypes.bool,
};

export default DashboardWidget;
