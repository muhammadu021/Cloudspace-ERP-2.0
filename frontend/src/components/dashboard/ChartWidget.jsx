/**
 * ChartWidget Component
 * 
 * Wrapper for chart components with data loading and error handling.
 * Supports multiple chart types (line, bar, pie, area).
 * Uses lazy loading for chart components to reduce initial bundle size.
 * 
 * @example
 * <ChartWidget
 *   type="line"
 *   data={chartData}
 *   config={{
 *     lines: [{ dataKey: 'sales', name: 'Sales' }],
 *     xAxisKey: 'month'
 *   }}
 *   height={300}
 * />
 */

import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';

// Lazy load chart components for better code splitting
const LineChart = lazy(() => import('@/components/charts/LineChart'));
const BarChart = lazy(() => import('@/components/charts/BarChart'));
const PieChart = lazy(() => import('@/components/charts/PieChart'));
const AreaChart = lazy(() => import('@/components/charts/AreaChart'));

const ChartWidget = ({
  type = 'line',
  data = [],
  config = {},
  height = 300,
  loading = false,
  error = null,
  className,
  title,
  ...props
}) => {
  /**
   * Generate text summary of chart data for accessibility
   */
  const generateDataSummary = () => {
    if (!data || data.length === 0) return 'No data available';
    
    const dataPoints = data.length;
    const chartTypeLabel = type === 'line' ? 'line chart' : 
                          type === 'bar' ? 'bar chart' : 
                          type === 'pie' ? 'pie chart' : 
                          type === 'area' ? 'area chart' : 'chart';
    
    // For line/bar/area charts, describe trend
    if (['line', 'bar', 'area'].includes(type) && data.length > 1) {
      const firstValue = data[0][config.yAxisKey || 'value'] || 0;
      const lastValue = data[data.length - 1][config.yAxisKey || 'value'] || 0;
      const trend = lastValue > firstValue ? 'increasing' : 
                   lastValue < firstValue ? 'decreasing' : 'stable';
      
      return `${chartTypeLabel} with ${dataPoints} data points showing ${trend} trend from ${firstValue} to ${lastValue}`;
    }
    
    // For pie charts, describe distribution
    if (type === 'pie') {
      const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
      const largest = data.reduce((max, item) => 
        (item.value || 0) > (max.value || 0) ? item : max, data[0]);
      
      return `${chartTypeLabel} showing distribution across ${dataPoints} categories. Total: ${total}. Largest segment: ${largest.name || 'Unknown'} (${largest.value || 0})`;
    }
    
    return `${chartTypeLabel} with ${dataPoints} data points`;
  };

  /**
   * Generate data table for screen readers
   */
  const DataTable = () => {
    if (!data || data.length === 0) return null;
    
    // Get keys from first data item
    const keys = Object.keys(data[0]);
    
    return (
      <table className="sr-only" aria-label="Chart data table">
        <thead>
          <tr>
            {keys.map(key => (
              <th key={key} scope="col">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {keys.map(key => (
                <td key={key}>{row[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Loading skeleton for charts
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-3" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-neutral-200 rounded-t flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ height }}
    >
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm text-neutral-600">
        {error || 'Failed to load chart data'}
      </p>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ height }}
    >
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">No data available</p>
    </div>
  );

  // Render appropriate chart based on type
  const renderChart = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return <ErrorState />;
    }

    if (!data || data.length === 0) {
      return <EmptyState />;
    }

    const chartProps = {
      data,
      height,
      ...config,
    };

    // Wrap chart in Suspense for lazy loading
    const ChartComponent = () => {
      switch (type) {
        case 'line':
          return <LineChart {...chartProps} />;
        
        case 'bar':
          return <BarChart {...chartProps} />;
        
        case 'pie':
          return <PieChart {...chartProps} />;
        
        case 'area':
          return <AreaChart {...chartProps} />;
        
        default:
          return <LineChart {...chartProps} />;
      }
    };

    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <ChartComponent />
      </Suspense>
    );
  };

  return (
    <div 
      className={cn('w-full', className)} 
      role="img"
      aria-label={title ? `${title}: ${generateDataSummary()}` : generateDataSummary()}
      {...props}
    >
      {renderChart()}
      <DataTable />
    </div>
  );
};

ChartWidget.propTypes = {
  /** Chart type */
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'area']),
  /** Chart data */
  data: PropTypes.array,
  /** Chart configuration (passed to underlying chart component) */
  config: PropTypes.object,
  /** Chart height in pixels */
  height: PropTypes.number,
  /** Loading state */
  loading: PropTypes.bool,
  /** Error message */
  error: PropTypes.string,
  /** Chart title for accessibility */
  title: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ChartWidget;
