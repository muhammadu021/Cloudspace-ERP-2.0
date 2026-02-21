/**
 * Responsive Layout Test Component
 * 
 * Visual testing component for dashboard responsive behavior across breakpoints.
 * Tests desktop (1920px), tablet (768px), and mobile (375px) layouts.
 */

import React, { useState } from 'react';
import DashboardGrid from './DashboardGrid';
import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import ListWidget from './ListWidget';
import { Card } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';

const BREAKPOINTS = [
  { name: 'Desktop', width: 1920, icon: 'Monitor' },
  { name: 'Tablet', width: 768, icon: 'Tablet' },
  { name: 'Mobile', width: 375, icon: 'Smartphone' },
];

const ResponsiveLayoutTest = () => {
  const [selectedBreakpoint, setSelectedBreakpoint] = useState(BREAKPOINTS[0]);
  const [showGrid, setShowGrid] = useState(true);

  // Sample widgets for testing
  const testWidgets = [
    {
      id: 'metric-1',
      size: 'small',
      component: (
        <MetricCard
          title="Total Users"
          value="1,234"
          change="+12%"
          trend="up"
        />
      ),
    },
    {
      id: 'metric-2',
      size: 'small',
      component: (
        <MetricCard
          title="Active Projects"
          value="45"
          change="+5%"
          trend="up"
        />
      ),
    },
    {
      id: 'metric-3',
      size: 'small',
      component: (
        <MetricCard
          title="Pending Tasks"
          value="89"
          change="-3%"
          trend="down"
        />
      ),
    },
    {
      id: 'chart-1',
      size: 'medium',
      component: (
        <ChartWidget
          title="Performance Trend"
          type="line"
          data={[
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 600 },
            { name: 'Apr', value: 800 },
          ]}
        />
      ),
    },
    {
      id: 'list-1',
      size: 'medium',
      component: (
        <ListWidget
          title="Recent Activities"
          items={[
            { id: 1, title: 'User registered', time: '2 min ago' },
            { id: 2, title: 'Project created', time: '5 min ago' },
            { id: 3, title: 'Task completed', time: '10 min ago' },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Responsive Layout Testing
          </h2>
          <p className="text-neutral-600 mb-6">
            Test dashboard layout across different screen sizes. The grid should adapt:
          </p>
          <ul className="list-disc list-inside text-neutral-600 space-y-2 mb-6">
            <li><strong>Desktop (1920px):</strong> 12-column grid, all widgets visible</li>
            <li><strong>Tablet (768px):</strong> 6-column grid, widgets reflow</li>
            <li><strong>Mobile (375px):</strong> Single column, widgets stack vertically</li>
          </ul>

          {/* Breakpoint Selector */}
          <div className="flex flex-wrap gap-3 mb-6">
            {BREAKPOINTS.map((bp) => (
              <Button
                key={bp.name}
                variant={selectedBreakpoint.name === bp.name ? 'primary' : 'secondary'}
                onClick={() => setSelectedBreakpoint(bp)}
              >
                {bp.name} ({bp.width}px)
              </Button>
            ))}
          </div>

          {/* Toggle Grid */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="secondary"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? 'Hide' : 'Show'} Grid
            </Button>
            <span className="text-sm text-neutral-600">
              Current viewport: {selectedBreakpoint.name} ({selectedBreakpoint.width}px)
            </span>
          </div>
        </div>
      </Card>

      {/* Viewport Simulator */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Viewport Simulator
            </h3>
            <div className="text-sm text-neutral-600">
              Simulating {selectedBreakpoint.name}
            </div>
          </div>

          {/* Simulated Viewport */}
          <div className="bg-neutral-100 p-4 rounded-lg overflow-auto">
            <div
              style={{
                width: `${selectedBreakpoint.width}px`,
                margin: '0 auto',
                transition: 'width 0.3s ease',
              }}
              className="bg-white rounded-lg shadow-sm"
            >
              <div className="p-4">
                {showGrid && (
                  <DashboardGrid
                    widgets={testWidgets}
                    editable={false}
                    maxWidgets={8}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Layout Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Grid Columns
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedBreakpoint.width >= 1024 ? '12' : selectedBreakpoint.width >= 768 ? '6' : '1'}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900 mb-1">
                Row Height
              </div>
              <div className="text-2xl font-bold text-green-600">
                80px
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900 mb-1">
                Spacing
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {selectedBreakpoint.width < 768 ? '12px' : '16px'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Expected Behavior */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Expected Behavior
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Desktop (≥1024px)</h4>
              <ul className="list-disc list-inside text-neutral-600 space-y-1 text-sm">
                <li>12-column grid layout</li>
                <li>Metric widgets (3 cols each) in top row</li>
                <li>Chart widgets (6 cols each) in middle rows</li>
                <li>List widgets (6 cols each) in bottom rows</li>
                <li>Drag and drop enabled</li>
                <li>Resize handles visible</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Tablet (768px-1023px)</h4>
              <ul className="list-disc list-inside text-neutral-600 space-y-1 text-sm">
                <li>6-column grid layout</li>
                <li>Widgets reflow to fit 6 columns</li>
                <li>Metric widgets (3 cols each, 2 per row)</li>
                <li>Chart and list widgets (6 cols, full width)</li>
                <li>Drag and drop enabled</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Mobile (&lt;768px)</h4>
              <ul className="list-disc list-inside text-neutral-600 space-y-1 text-sm">
                <li>Single column layout</li>
                <li>All widgets stack vertically</li>
                <li>Widgets maintain priority order (metrics → charts → lists)</li>
                <li>Drag and drop disabled</li>
                <li>Resize disabled</li>
                <li>Tighter spacing (12px vs 16px)</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Testing Checklist */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Testing Checklist
          </h3>
          <div className="space-y-2">
            {[
              'Widgets render correctly at 1920px (desktop)',
              'Widgets render correctly at 768px (tablet)',
              'Widgets render correctly at 375px (mobile)',
              'Widgets stack vertically on mobile',
              'Grid uses 6 columns on tablet',
              'Grid uses 1 column on mobile',
              'Spacing adjusts correctly (16px desktop/tablet, 12px mobile)',
              'Drag/drop disabled on mobile',
              'Resize disabled on mobile',
              'Widget order maintained across breakpoints',
              'No horizontal scrolling on any breakpoint',
              'Smooth transitions between breakpoints',
            ].map((item, index) => (
              <label key={index} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-neutral-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResponsiveLayoutTest;
