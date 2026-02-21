/**
 * Lazy Widget Loading Example
 * 
 * Demonstrates how to use DashboardWidget with lazy loading
 * to defer data fetching until widgets are visible.
 * 
 * Requirements: 7.1
 */

import React from 'react';
import DashboardWidget from './DashboardWidget';
import { useWidgetData } from '@/hooks/useWidgetData';

/**
 * Example widget component that uses lazy loading and refresh functionality
 * 
 * This component demonstrates the complete data flow:
 * 1. useWidgetData hook fetches data and provides refetch function
 * 2. DashboardWidget receives onRefresh and lastUpdate props
 * 3. When refresh button is clicked, refetch is called
 * 4. After successful refresh, timestamp updates automatically
 */
const LazyMetricWidget = ({ widgetType, config, shouldFetch, role }) => {
  // Only fetch data when shouldFetch is true (widget is visible)
  const { data, loading, error, refetch, lastUpdate } = useWidgetData({
    widgetType,
    config,
    options: {
      skip: !shouldFetch, // Skip query until widget is visible
      role,
    },
  });

  // Render the widget with proper data flow
  return (
    <DashboardWidget
      id={`widget-${widgetType}`}
      title={data?.title || 'Loading...'}
      size="small"
      widgetType={widgetType}
      role={role}
      config={config}
      loading={loading}
      error={error?.message || null}
      onRefresh={refetch} // Connect refetch to refresh button
      lastUpdate={lastUpdate} // Display last update timestamp
      enableLazyLoading={false} // Already handled by parent
    >
      {data && (
        <div className="space-y-2">
          <div className="text-3xl font-bold">{data.value || 0}</div>
          <div className="text-sm text-neutral-600">{data.label}</div>
        </div>
      )}
    </DashboardWidget>
  );
};

/**
 * Example dashboard with lazy-loaded widgets and refresh functionality
 * 
 * This example demonstrates:
 * 1. Lazy loading for performance optimization
 * 2. Widget refresh functionality with timestamp updates
 * 3. Proper data flow from useWidgetData to DashboardWidget
 */
const LazyWidgetExample = () => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Widget 1 - Above the fold, loads immediately with refresh */}
      <LazyMetricWidget
        widgetType="sales-total"
        config={{ period: 'month' }}
        shouldFetch={true}
        role="admin"
      />

      {/* Widget 2 - Above the fold, loads immediately with refresh */}
      <LazyMetricWidget
        widgetType="users-active"
        config={{ period: 'day' }}
        shouldFetch={true}
        role="admin"
      />

      {/* Widget 3 - Below the fold, defers loading until visible */}
      <LazyMetricWidget
        widgetType="revenue-chart"
        config={{ period: 'week' }}
        shouldFetch={true}
        role="admin"
      />

      {/* Widget 4 - Below the fold, defers loading until visible */}
      <LazyMetricWidget
        widgetType="activities-list"
        config={{ limit: 10 }}
        shouldFetch={true}
        role="admin"
      />

      {/* Widget 5 - Critical widget, loads immediately */}
      <LazyMetricWidget
        widgetType="alerts-critical"
        config={{ severity: 'high' }}
        shouldFetch={true}
        role="admin"
      />
    </div>
  );
};

export default LazyWidgetExample;
