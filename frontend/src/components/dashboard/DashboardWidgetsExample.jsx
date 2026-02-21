/**
 * Dashboard Widgets Example
 * 
 * Demonstrates usage of all dashboard widget components.
 * This file serves as both documentation and a testing ground.
 */

import React, { useState } from 'react';
import {
  DashboardWidget,
  MetricCard,
  ChartWidget,
  ListWidget,
  QuickActionWidget,
} from './index';
import Button from '@/design-system/components/Button';

const DashboardWidgetsExample = () => {
  const [loading, setLoading] = useState(false);

  // Sample data for charts
  const salesData = [
    { month: 'Jan', sales: 4000, revenue: 2400, orders: 240 },
    { month: 'Feb', sales: 3000, revenue: 1398, orders: 221 },
    { month: 'Mar', sales: 2000, revenue: 9800, orders: 229 },
    { month: 'Apr', sales: 2780, revenue: 3908, orders: 200 },
    { month: 'May', sales: 1890, revenue: 4800, orders: 218 },
    { month: 'Jun', sales: 2390, revenue: 3800, orders: 250 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Clothing', value: 300 },
    { name: 'Food', value: 200 },
    { name: 'Books', value: 100 },
  ];

  // Sample data for list widget
  const recentOrders = [
    {
      id: '1',
      title: 'Order #1234',
      description: 'John Doe - $234.50',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      badge: { text: 'Pending', variant: 'warning' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: '2',
      title: 'Order #1233',
      description: 'Jane Smith - $156.00',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      badge: { text: 'Completed', variant: 'success' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: '3',
      title: 'Order #1232',
      description: 'Bob Johnson - $89.99',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      badge: { text: 'Shipped', variant: 'info' },
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  // Sample quick actions
  const quickActions = [
    {
      id: 'new-order',
      label: 'New Order',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => alert('Create new order'),
      variant: 'primary',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => alert('View reports'),
      variant: 'neutral',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onClick: () => alert('View customers'),
      variant: 'neutral',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      onClick: () => alert('View inventory'),
      variant: 'neutral',
      badge: 3,
    },
  ];

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Dashboard Widgets Example
          </h1>
          <p className="text-neutral-600">
            Demonstration of all dashboard widget components with various configurations.
          </p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Metric Cards */}
          <DashboardWidget
            id="total-revenue"
            title="Total Revenue"
            size="small"
            loading={loading}
          >
            <MetricCard
              value={125430}
              label="Total Revenue"
              type="currency"
              trend={{ value: 12.5, direction: 'up' }}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </DashboardWidget>

          <DashboardWidget
            id="total-orders"
            title="Total Orders"
            size="small"
            loading={loading}
          >
            <MetricCard
              value={1358}
              label="Total Orders"
              type="number"
              trend={{ value: 8.2, direction: 'up' }}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          </DashboardWidget>

          <DashboardWidget
            id="conversion-rate"
            title="Conversion Rate"
            size="small"
            loading={loading}
          >
            <MetricCard
              value={3.24}
              label="Conversion Rate"
              type="percentage"
              trend={{ value: 2.1, direction: 'down', isIncreaseBad: false }}
              description="Last 30 days"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </DashboardWidget>

          {/* Line Chart */}
          <DashboardWidget
            id="sales-chart"
            title="Sales Overview"
            size="medium"
            loading={loading}
            actions={
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            }
          >
            <ChartWidget
              type="line"
              data={salesData}
              config={{
                lines: [
                  { dataKey: 'sales', name: 'Sales', color: '#6366F1' },
                  { dataKey: 'revenue', name: 'Revenue', color: '#22C55E' },
                ],
                xAxisKey: 'month',
              }}
              height={250}
            />
          </DashboardWidget>

          {/* Bar Chart */}
          <DashboardWidget
            id="orders-chart"
            title="Monthly Orders"
            size="medium"
            loading={loading}
          >
            <ChartWidget
              type="bar"
              data={salesData}
              config={{
                bars: [{ dataKey: 'orders', name: 'Orders', color: '#F59E0B' }],
                xAxisKey: 'month',
              }}
              height={250}
            />
          </DashboardWidget>

          {/* Pie Chart */}
          <DashboardWidget
            id="category-chart"
            title="Sales by Category"
            size="small"
            loading={loading}
          >
            <ChartWidget
              type="pie"
              data={categoryData}
              config={{
                dataKey: 'value',
                nameKey: 'name',
              }}
              height={250}
            />
          </DashboardWidget>

          {/* Recent Orders List */}
          <DashboardWidget
            id="recent-orders"
            title="Recent Orders"
            size="small"
            loading={loading}
          >
            <ListWidget
              items={recentOrders}
              maxItems={5}
              showTimestamp={true}
              onViewAll={() => alert('View all orders')}
              viewAllText="View All Orders"
            />
          </DashboardWidget>

          {/* Quick Actions */}
          <DashboardWidget
            id="quick-actions"
            title="Quick Actions"
            size="medium"
            loading={loading}
          >
            <QuickActionWidget actions={quickActions} columns={2} />
          </DashboardWidget>

          {/* Empty State Example */}
          <DashboardWidget
            id="empty-widget"
            title="Empty Widget"
            size="small"
            emptyState="No data available for this widget"
          />

          {/* Error State Example */}
          <DashboardWidget
            id="error-widget"
            title="Error Widget"
            size="small"
            error="Failed to load widget data"
            onRetry={() => alert('Retrying...')}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4 pt-6 border-t border-neutral-200">
          <Button
            variant="primary"
            onClick={() => setLoading(!loading)}
          >
            {loading ? 'Stop Loading' : 'Show Loading State'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgetsExample;
