/**
 * DashboardPage Component
 * 
 * Main dashboard page demonstrating DashboardGrid with configurable widgets.
 * Includes widget management (add/remove), layout persistence, and responsive behavior.
 * 
 * Features:
 * - Drag-and-drop widget reordering
 * - Widget resize handles
 * - Add/remove widgets
 * - Maximum 8 widgets enforcement
 * - Layout persistence to Redux preferences
 * - Edit mode toggle
 */

import React, { useState, useCallback, useMemo } from 'react';
import DashboardGrid from './DashboardGrid';
import DashboardWidget from './DashboardWidget';
import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import ListWidget from './ListWidget';
import QuickActionWidget from './QuickActionWidget';
import Button from '@/design-system/components/Button';
import Modal from '@/design-system/components/Modal';
import Badge from '@/design-system/components/Badge';
import Alert from '@/design-system/components/Alert';
import { usePreferences } from '@/store/hooks/usePreferences';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
  useGetDashboardMetricsQuery,
  useGetRecentActivityQuery,
  useGetQuickStatsQuery,
} from '@/store/api/dashboardApi';
import {
  WIDGET_TYPES,
  WIDGET_SIZES,
  getAvailableWidgets,
  createWidget,
  getDefaultWidgetConfig,
} from './widgetRegistry';

const DashboardPage = () => {
  const { dashboardWidgets, updateDashboardWidgets } = usePreferences();
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch dashboard data with real-time polling (30 seconds)
  const {
    data: metricsData,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics,
  } = useGetDashboardMetricsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const {
    data: activityData,
    isLoading: activityLoading,
    isError: activityError,
  } = useGetRecentActivityQuery({ limit: 8 }, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetQuickStatsQuery(undefined, {
    pollingInterval: 60000, // Poll every 60 seconds
    refetchOnMountOrArgChange: true,
  });

  // Quick actions configuration
  const sampleActions = [
    { id: 1, label: 'New Order', icon: 'Plus', onClick: () => console.log('New order') },
    { id: 2, label: 'Add Customer', icon: 'UserPlus', onClick: () => console.log('Add customer') },
    { id: 3, label: 'Create Invoice', icon: 'FileText', onClick: () => console.log('Create invoice') },
    { id: 4, label: 'View Reports', icon: 'BarChart', onClick: () => console.log('View reports') },
  ];

  // Initialize default widgets if none exist
  const defaultWidgets = useMemo(() => {
    // Use real data if available, otherwise use empty state
    const metrics = metricsData || {};
    const chartData = statsData?.salesTrend || [];
    const activityItems = activityData || [];

    return [
      {
        id: 'revenue-metric',
        type: WIDGET_TYPES.METRIC,
        title: 'Revenue',
        size: WIDGET_SIZES.SMALL,
        visible: true,
        config: metrics.revenue || { value: 0, trend: 0, label: 'Total Revenue', format: 'currency' },
      },
      {
        id: 'orders-metric',
        type: WIDGET_TYPES.METRIC,
        title: 'Orders',
        size: WIDGET_SIZES.SMALL,
        visible: true,
        config: metrics.orders || { value: 0, trend: 0, label: 'Orders', format: 'number' },
      },
      {
        id: 'customers-metric',
        type: WIDGET_TYPES.METRIC,
        title: 'Customers',
        size: WIDGET_SIZES.SMALL,
        visible: true,
        config: metrics.customers || { value: 0, trend: 0, label: 'Active Customers', format: 'number' },
      },
      {
        id: 'sales-chart',
        type: WIDGET_TYPES.CHART,
        title: 'Sales Trend',
        size: WIDGET_SIZES.MEDIUM,
        visible: true,
        config: {
          chartType: 'line',
          data: chartData,
          xKey: 'name',
          yKey: 'value',
        },
      },
      {
        id: 'recent-activity',
        type: WIDGET_TYPES.LIST,
        title: 'Recent Activity',
        size: WIDGET_SIZES.MEDIUM,
        visible: true,
        config: {
          items: activityItems,
          maxItems: 5,
          showTimestamp: true,
        },
      },
      {
        id: 'quick-actions',
        type: WIDGET_TYPES.QUICK_ACTION,
        title: 'Quick Actions',
        size: WIDGET_SIZES.SMALL,
        visible: true,
        config: {
          actions: sampleActions,
        },
      },
    ];
  }, [metricsData, statsData, activityData]);

  // Use saved widgets or default widgets
  const activeWidgets = useMemo(() => {
    if (dashboardWidgets && dashboardWidgets.length > 0) {
      return dashboardWidgets;
    }
    return defaultWidgets;
  }, [dashboardWidgets, defaultWidgets]);

  // Create widget components with DashboardWidget wrapper
  const widgetComponents = useMemo(() => {
    return activeWidgets
      .filter((widget) => widget.visible)
      .map((widget) => {
        let content;
        let loading = false;
        let error = null;
        let emptyState = null;

        // Determine loading and error states based on widget type
        if (widget.type === WIDGET_TYPES.METRIC) {
          loading = metricsLoading;
          error = metricsError ? 'Failed to load metrics' : null;
          
          // Empty state for metrics
          if (!metricsLoading && !metricsError && (!widget.config || widget.config.value === undefined)) {
            emptyState = (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="w-12 h-12 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-neutral-500">No data available</p>
              </div>
            );
          }
        } else if (widget.type === WIDGET_TYPES.CHART) {
          loading = statsLoading;
          error = statsError ? 'Failed to load chart data' : null;
          
          // Empty state for charts
          if (!statsLoading && !statsError && (!widget.config?.data || widget.config.data.length === 0)) {
            emptyState = (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="w-12 h-12 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-sm text-neutral-500">No chart data available</p>
                <p className="text-xs text-neutral-400 mt-1">Data will appear here once available</p>
              </div>
            );
          }
        } else if (widget.type === WIDGET_TYPES.LIST) {
          loading = activityLoading;
          error = activityError ? 'Failed to load activity' : null;
          
          // Empty state for lists
          if (!activityLoading && !activityError && (!widget.config?.items || widget.config.items.length === 0)) {
            emptyState = (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="w-12 h-12 text-neutral-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-neutral-500">No recent activity</p>
                <p className="text-xs text-neutral-400 mt-1">Activity will appear here as it happens</p>
              </div>
            );
          }
        }

        // Render content based on widget type
        if (emptyState) {
          content = emptyState;
        } else {
          switch (widget.type) {
            case WIDGET_TYPES.METRIC:
              content = (
                <MetricCard
                  value={widget.config.value}
                  label={widget.config.label}
                  trend={widget.config.trend}
                  format={widget.config.format}
                />
              );
              break;

            case WIDGET_TYPES.CHART:
              content = (
                <ChartWidget
                  chartType={widget.config.chartType}
                  data={widget.config.data}
                  xKey={widget.config.xKey}
                  yKey={widget.config.yKey}
                />
              );
              break;

            case WIDGET_TYPES.LIST:
              content = (
                <ListWidget
                  items={widget.config.items}
                  maxItems={widget.config.maxItems}
                  showTimestamp={widget.config.showTimestamp}
                />
              );
              break;

            case WIDGET_TYPES.QUICK_ACTION:
              content = (
                <QuickActionWidget actions={widget.config.actions} />
              );
              break;

            default:
              content = <div>Unknown widget type</div>;
          }
        }

        const actions = editMode ? (
          <div className="flex items-center gap-2">
            <div className="drag-handle cursor-move p-2 hover:bg-neutral-100 rounded-md transition-colors">
              <svg
                className="w-5 h-5 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveWidget(widget.id)}
              className="min-h-[44px] min-w-[44px]"
            >
              Remove
            </Button>
          </div>
        ) : null;

        return {
          id: widget.id,
          size: widget.size,
          component: (
            <DashboardWidget
              id={widget.id}
              title={widget.title}
              size={widget.size}
              actions={actions}
              loading={loading}
              error={error}
            >
              {content}
            </DashboardWidget>
          ),
        };
      });
  }, [activeWidgets, editMode, metricsData, metricsLoading, metricsError, statsData, statsLoading, statsError, activityData, activityLoading, activityError]);

  // Handle layout change
  const handleLayoutChange = useCallback(
    (layouts) => {
      // Layout is automatically saved by DashboardGrid via usePreferences
      console.log('Layout changed:', layouts);
    },
    []
  );

  // Handle add widget
  const handleAddWidget = useCallback(
    (widgetType) => {
      const newWidget = getDefaultWidgetConfig(widgetType);
      
      if (newWidget) {
        const updatedWidgets = [...activeWidgets, newWidget];
        updateDashboardWidgets(updatedWidgets);
        setShowAddModal(false);
      }
    },
    [activeWidgets, updateDashboardWidgets]
  );

  // Handle remove widget
  const handleRemoveWidget = useCallback(
    (widgetId) => {
      const updatedWidgets = activeWidgets.filter((w) => w.id !== widgetId);
      updateDashboardWidgets(updatedWidgets);
    },
    [activeWidgets, updateDashboardWidgets]
  );

  // Handle reset to defaults
  const handleResetToDefaults = useCallback(() => {
    updateDashboardWidgets(defaultWidgets);
  }, [defaultWidgets, updateDashboardWidgets]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const availableWidgets = getAvailableWidgets();
  const canAddMore = activeWidgets.length < 8;

  // Set page title and actions in the top nav bar
  usePageTitle('Dashboard', [
    <Badge key="mode" variant={editMode ? 'info' : 'default'}>
      {editMode ? 'Edit Mode' : 'View Mode'}
    </Badge>,
    <Button
      key="customize"
      variant={editMode ? 'primary' : 'outline'}
      onClick={toggleEditMode}
      size="sm"
    >
      {editMode ? 'Done Editing' : 'Customize'}
    </Button>
  ]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="mb-2">
          <p className="text-sm md:text-base text-neutral-600">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Error Alert */}
        {(metricsError || activityError || statsError) && (
          <Alert
            type="error"
            title="Failed to load dashboard data"
            message="Some dashboard data could not be loaded. Please try refreshing the page."
            dismissible={false}
            actions={[
              {
                label: 'Retry',
                onClick: () => {
                  refetchMetrics();
                },
              },
            ]}
          />
        )}

        {editMode && (
          <div className="mt-4 p-3 md:p-4 bg-info-50 border border-info-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-info-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-info-800">Edit Mode Active</p>
                  <p className="text-sm text-info-700 mt-1">
                    <span className="hidden md:inline">Drag widgets to reorder, resize using handles, or remove widgets you don't need.</span>
                    <span className="md:hidden">Tap "Add Widget" or "Remove" to customize your dashboard.</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                  disabled={!canAddMore}
                  className="min-h-[44px]" // Touch-friendly
                >
                  Add Widget
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToDefaults}
                  className="min-h-[44px]" // Touch-friendly
                >
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid
        widgets={widgetComponents}
        onLayoutChange={handleLayoutChange}
        editable={editMode}
        maxWidgets={8}
      />

      {/* Add Widget Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Widget"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Choose a widget type to add to your dashboard. You can have up to 8 widgets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => handleAddWidget(widget.type)}
                className="p-4 border border-neutral-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left min-h-[88px] touch-manipulation"
              >
                <div className="font-medium text-neutral-900 mb-1">
                  {widget.name}
                </div>
                <div className="text-sm text-neutral-600">
                  {widget.description}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowAddModal(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
