/**
 * DashboardGrid Example
 * 
 * Simple example demonstrating DashboardGrid usage with various widget types.
 */

import React, { useState } from 'react';
import DashboardGrid from './DashboardGrid';
import DashboardWidget from './DashboardWidget';
import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import ListWidget from './ListWidget';
import QuickActionWidget from './QuickActionWidget';
import Button from '@/design-system/components/Button';

const DashboardGridExample = () => {
  const [editMode, setEditMode] = useState(false);

  // Sample data
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  const listItems = [
    { id: 1, title: 'New order #1234', timestamp: '2 minutes ago' },
    { id: 2, title: 'Customer inquiry', timestamp: '15 minutes ago' },
    { id: 3, title: 'Payment received', timestamp: '1 hour ago' },
  ];

  const actions = [
    { id: 1, label: 'New Order', icon: 'Plus', onClick: () => alert('New order') },
    { id: 2, label: 'Add Customer', icon: 'UserPlus', onClick: () => alert('Add customer') },
  ];

  // Widget configurations
  const widgets = [
    {
      id: 'revenue',
      size: 'small',
      component: (
        <DashboardWidget id="revenue" title="Revenue" size="small">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <MetricCard value={125430} label="Total Revenue" trend={12.5} format="currency" />
        </DashboardWidget>
      ),
    },
    {
      id: 'orders',
      size: 'small',
      component: (
        <DashboardWidget id="orders" title="Orders" size="small">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <MetricCard value={342} label="Orders" trend={8.3} format="number" />
        </DashboardWidget>
      ),
    },
    {
      id: 'customers',
      size: 'small',
      component: (
        <DashboardWidget id="customers" title="Customers" size="small">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <MetricCard value={1247} label="Active Customers" trend={-2.1} format="number" />
        </DashboardWidget>
      ),
    },
    {
      id: 'sales-chart',
      size: 'medium',
      component: (
        <DashboardWidget id="sales-chart" title="Sales Trend" size="medium">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <ChartWidget chartType="line" data={chartData} xKey="name" yKey="value" />
        </DashboardWidget>
      ),
    },
    {
      id: 'recent-activity',
      size: 'medium',
      component: (
        <DashboardWidget id="recent-activity" title="Recent Activity" size="medium">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <ListWidget items={listItems} maxItems={5} showTimestamp={true} />
        </DashboardWidget>
      ),
    },
    {
      id: 'quick-actions',
      size: 'small',
      component: (
        <DashboardWidget id="quick-actions" title="Quick Actions" size="small">
          {editMode && (
            <div className="drag-handle absolute top-2 right-2 cursor-move p-2 hover:bg-neutral-100 rounded">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}
          <QuickActionWidget actions={actions} />
        </DashboardWidget>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard Grid Example</h1>
          <p className="text-neutral-600 mt-1">
            Drag widgets to reorder, resize using handles
          </p>
        </div>
        <Button
          variant={editMode ? 'primary' : 'outline'}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Done Editing' : 'Edit Layout'}
        </Button>
      </div>

      {editMode && (
        <div className="mb-4 p-4 bg-info-50 border border-info-200 rounded-lg">
          <p className="text-sm text-info-800">
            <strong>Edit Mode:</strong> Drag widgets by the handle icon to reorder. 
            Drag the bottom-right corner to resize. Changes are saved automatically.
          </p>
        </div>
      )}

      <DashboardGrid
        widgets={widgets}
        editable={editMode}
        maxWidgets={8}
        onLayoutChange={(layouts) => console.log('Layout changed:', layouts)}
      />
    </div>
  );
};

export default DashboardGridExample;
