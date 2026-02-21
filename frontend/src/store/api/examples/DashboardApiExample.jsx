/**
 * Dashboard API Usage Examples
 * 
 * This file demonstrates how to use the dashboard API endpoints
 * with RTK Query hooks for real-time data fetching.
 */

import React from 'react';
import {
  useGetDashboardMetricsQuery,
  useGetRecentActivityQuery,
  useGetQuickStatsQuery,
  useGetWidgetDataQuery,
} from '../dashboardApi';

/**
 * Example 1: Basic Dashboard Metrics
 * Fetches overall metrics with automatic polling every 30 seconds
 */
export function BasicMetricsExample() {
  const { data, isLoading, isError, refetch } = useGetDashboardMetricsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (isError) {
    return (
      <div>
        <p>Error loading metrics</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 border rounded">
        <h3>Revenue</h3>
        <p className="text-2xl font-bold">
          ${data.revenue?.value?.toLocaleString()}
        </p>
        <p className="text-sm text-neutral-600">
          {data.revenue?.trend > 0 ? '↑' : '↓'} {Math.abs(data.revenue?.trend)}%
        </p>
      </div>
      
      <div className="p-4 border rounded">
        <h3>Orders</h3>
        <p className="text-2xl font-bold">{data.orders?.value}</p>
        <p className="text-sm text-neutral-600">
          {data.orders?.trend > 0 ? '↑' : '↓'} {Math.abs(data.orders?.trend)}%
        </p>
      </div>
      
      <div className="p-4 border rounded">
        <h3>Customers</h3>
        <p className="text-2xl font-bold">{data.customers?.value}</p>
        <p className="text-sm text-neutral-600">
          {data.customers?.trend > 0 ? '↑' : '↓'} {Math.abs(data.customers?.trend)}%
        </p>
      </div>
    </div>
  );
}

/**
 * Example 2: Recent Activity Feed
 * Fetches recent activity with automatic polling
 */
export function RecentActivityExample() {
  const { data, isLoading, isError } = useGetRecentActivityQuery(
    { limit: 5 },
    {
      pollingInterval: 30000, // Poll every 30 seconds
    }
  );

  if (isLoading) {
    return <div>Loading activity...</div>;
  }

  if (isError) {
    return <div>Error loading activity</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-neutral-500">
        <p>No recent activity</p>
        <p className="text-sm">Activity will appear here as it happens</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.id} className="p-3 border rounded hover:bg-neutral-50">
          <div className="flex justify-between items-start">
            <p className="font-medium">{item.title}</p>
            <span className="text-xs text-neutral-500">{item.timestamp}</span>
          </div>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
              item.status === 'completed'
                ? 'bg-success-100 text-success-700'
                : item.status === 'warning'
                ? 'bg-warning-100 text-warning-700'
                : item.status === 'new'
                ? 'bg-info-100 text-info-700'
                : 'bg-neutral-100 text-neutral-700'
            }`}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 3: Quick Stats with Charts
 * Fetches stats data for charts and visualizations
 */
export function QuickStatsExample() {
  const { data, isLoading, isError } = useGetQuickStatsQuery(undefined, {
    pollingInterval: 60000, // Poll every 60 seconds
  });

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  if (isError) {
    return <div>Error loading stats</div>;
  }

  return (
    <div className="space-y-6">
      {/* Sales Trend */}
      <div>
        <h3 className="font-semibold mb-2">Sales Trend</h3>
        <div className="flex items-end gap-2 h-32">
          {data.salesTrend?.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-500 rounded-t"
                style={{
                  height: `${(item.value / 6000) * 100}%`,
                }}
              />
              <span className="text-xs mt-1">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h3 className="font-semibold mb-2">Top Products</h3>
        <div className="space-y-2">
          {data.topProducts?.slice(0, 3).map((product, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{product.name}</span>
              <div className="text-right">
                <p className="font-medium">{product.sales} sales</p>
                <p className="text-sm text-neutral-600">
                  ${product.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Status */}
      <div>
        <h3 className="font-semibold mb-2">Project Status</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-info-50 rounded">
            <p className="text-sm text-neutral-600">Planning</p>
            <p className="text-xl font-bold">{data.projectStatus?.planning}</p>
          </div>
          <div className="p-2 bg-success-50 rounded">
            <p className="text-sm text-neutral-600">Active</p>
            <p className="text-xl font-bold">{data.projectStatus?.active}</p>
          </div>
          <div className="p-2 bg-warning-50 rounded">
            <p className="text-sm text-neutral-600">On Hold</p>
            <p className="text-xl font-bold">{data.projectStatus?.onHold}</p>
          </div>
          <div className="p-2 bg-neutral-50 rounded">
            <p className="text-sm text-neutral-600">Completed</p>
            <p className="text-xl font-bold">{data.projectStatus?.completed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Custom Widget Data
 * Fetches data for a specific widget type
 */
export function CustomWidgetExample() {
  const { data, isLoading, isError } = useGetWidgetDataQuery({
    widgetType: 'metrics',
    config: { period: 'month' },
  });

  if (isLoading) {
    return <div>Loading widget data...</div>;
  }

  if (isError) {
    return <div>Error loading widget data</div>;
  }

  return (
    <div>
      <h3>Custom Widget</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/**
 * Example 5: Manual Refetch Control
 * Demonstrates manual control over data fetching
 */
export function ManualRefetchExample() {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetDashboardMetricsQuery(undefined, {
    // Disable automatic polling
    pollingInterval: 0,
    // Don't refetch on mount
    refetchOnMountOrArgChange: false,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3>Dashboard Metrics</h3>
        <button
          onClick={refetch}
          disabled={isFetching}
          className="px-4 py-2 bg-primary-500 text-white rounded disabled:opacity-50"
        >
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <p className="text-sm text-neutral-600">Revenue</p>
            <p className="text-2xl font-bold">
              ${data?.revenue?.value?.toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded">
            <p className="text-sm text-neutral-600">Orders</p>
            <p className="text-2xl font-bold">{data?.orders?.value}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Conditional Polling
 * Demonstrates conditional polling based on user interaction
 */
export function ConditionalPollingExample() {
  const [enablePolling, setEnablePolling] = React.useState(true);

  const { data, isLoading } = useGetDashboardMetricsQuery(undefined, {
    pollingInterval: enablePolling ? 30000 : 0,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={enablePolling}
            onChange={(e) => setEnablePolling(e.target.checked)}
          />
          <span>Enable real-time updates</span>
        </label>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Revenue: ${data?.revenue?.value?.toLocaleString()}</p>
          <p>Orders: {data?.orders?.value}</p>
          <p className="text-sm text-neutral-500 mt-2">
            {enablePolling
              ? 'Updates every 30 seconds'
              : 'Real-time updates disabled'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Complete Dashboard Example
 * Combines all features into a complete dashboard
 */
export function CompleteDashboardExample() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Metrics */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <BasicMetricsExample />
      </section>

      {/* Activity and Stats */}
      <div className="grid grid-cols-2 gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivityExample />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <QuickStatsExample />
        </section>
      </div>
    </div>
  );
}

export default CompleteDashboardExample;
