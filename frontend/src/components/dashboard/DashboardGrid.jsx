/**
 * DashboardGrid Component
 * 
 * Responsive grid layout with drag-and-drop widget reordering and resizing.
 * Persists layout configuration to user preferences.
 * 
 * Features:
 * - Responsive breakpoints (12 cols desktop, 6 tablet, 1 mobile)
 * - Drag-and-drop widget reordering
 * - Widget resize handles
 * - Maximum 8 widgets on initial load
 * - Layout persistence to Redux preferences
 * 
 * @example
 * <DashboardGrid
 *   widgets={widgets}
 *   onLayoutChange={handleLayoutChange}
 *   editable={true}
 * />
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { usePreferences } from '@/store/hooks/usePreferences';
import { debounce } from '@/design-system/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Default layout configuration for new widgets
const DEFAULT_WIDGET_SIZE = {
  small: { w: 4, h: 2 },
  medium: { w: 6, h: 3 },
  large: { w: 12, h: 4 },
};

// Breakpoint configuration
const BREAKPOINTS = {
  lg: 1024,
  md: 768,
  sm: 0, // Mobile starts at 0
};

const COLS = {
  lg: 12,
  md: 6,
  sm: 1, // Single column on mobile
};

const DashboardGrid = ({
  widgets = [],
  onLayoutChange,
  editable = true,
  maxWidgets = 8,
  className = '',
}) => {
  const { dashboardLayout, updateDashboardLayout } = usePreferences();
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [mounted, setMounted] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate layout from widgets and saved preferences
  const generateLayout = useCallback((breakpoint) => {
    const savedLayout = dashboardLayout?.[breakpoint] || [];
    
    return widgets.map((widget, index) => {
      // Check if we have a saved layout for this widget
      const savedItem = savedLayout.find((item) => item.i === widget.id);
      
      if (savedItem) {
        return savedItem;
      }

      // Use position from widget configuration if available
      if (widget.position && breakpoint === 'lg') {
        return {
          i: widget.id,
          x: widget.position.x || 0,
          y: widget.position.y || 0,
          w: widget.position.w || 6,
          h: widget.position.h || 3,
          minW: 2,
          minH: 2,
        };
      }

      // Generate default layout based on widget size
      const size = DEFAULT_WIDGET_SIZE[widget.size] || DEFAULT_WIDGET_SIZE.medium;
      const cols = COLS[breakpoint];
      
      // Mobile: single column, stack vertically with priority ordering
      if (breakpoint === 'sm') {
        return {
          i: widget.id,
          x: 0,
          y: index * 3,
          w: 1,
          h: widget.size === 'small' ? 2 : widget.size === 'large' ? 4 : 3,
          minW: 1,
          minH: 2,
          static: !editable,
        };
      }
      
      // Calculate position based on index for desktop/tablet
      const itemsPerRow = Math.floor(cols / size.w);
      const row = Math.floor(index / itemsPerRow);
      const col = (index % itemsPerRow) * size.w;

      return {
        i: widget.id,
        x: col,
        y: row * size.h,
        w: size.w,
        h: size.h,
        minW: 2,
        minH: 2,
      };
    });
  }, [widgets, dashboardLayout, editable]);

  // Generate layouts for all breakpoints
  const layouts = useMemo(() => {
    return {
      lg: generateLayout('lg'),
      md: generateLayout('md'),
      sm: generateLayout('sm'),
    };
  }, [generateLayout]);

  // Debounced layout save to prevent excessive updates
  const debouncedSaveLayout = useMemo(
    () =>
      debounce((newLayouts) => {
        updateDashboardLayout(newLayouts);
        if (onLayoutChange) {
          onLayoutChange(newLayouts);
        }
      }, 500),
    [updateDashboardLayout, onLayoutChange]
  );

  // Handle layout change
  const handleLayoutChange = useCallback(
    (layout, allLayouts) => {
      if (!mounted) return;
      debouncedSaveLayout(allLayouts);
    },
    [mounted, debouncedSaveLayout]
  );

  // Handle breakpoint change
  const handleBreakpointChange = useCallback((breakpoint) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  // Limit widgets to maxWidgets
  const visibleWidgets = useMemo(() => {
    return widgets.slice(0, maxWidgets);
  }, [widgets, maxWidgets]);

  // Show warning if widgets exceed limit
  const hasExcessWidgets = widgets.length > maxWidgets;

  if (!mounted) {
    return (
      <div className="grid grid-cols-12 gap-4">
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="h-48 bg-neutral-100 animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {hasExcessWidgets && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-warning-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-warning-800">
                Performance Warning
              </p>
              <p className="text-sm text-warning-700 mt-1">
                You have {widgets.length} widgets configured. Only the first {maxWidgets} are
                displayed for optimal performance. Consider removing unused widgets.
              </p>
            </div>
          </div>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={80}
        isDraggable={editable && currentBreakpoint !== 'sm'} // Disable drag on mobile
        isResizable={editable && currentBreakpoint !== 'sm'} // Disable resize on mobile
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        draggableHandle=".drag-handle"
        margin={currentBreakpoint === 'sm' ? [0, 12] : [16, 16]} // Tighter margins on mobile
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType="vertical" // Stack widgets vertically
      >
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className="dashboard-grid-item"
            data-grid={{
              i: widget.id,
              x: 0,
              y: 0,
              w: DEFAULT_WIDGET_SIZE[widget.size]?.w || 6,
              h: DEFAULT_WIDGET_SIZE[widget.size]?.h || 3,
            }}
          >
            {widget.component}
          </div>
        ))}
      </ResponsiveGridLayout>

      {editable && (
        <style>{`
          .react-grid-item {
            transition: all 200ms ease;
            transition-property: left, top, width, height;
          }
          
          .react-grid-item.cssTransforms {
            transition-property: transform, width, height;
          }
          
          .react-grid-item.resizing {
            transition: none;
            z-index: 100;
          }
          
          .react-grid-item.react-draggable-dragging {
            transition: none;
            z-index: 100;
            opacity: 0.9;
          }
          
          .react-grid-item > .react-resizable-handle {
            position: absolute;
            width: 20px;
            height: 20px;
          }
          
          .react-grid-item > .react-resizable-handle::after {
            content: "";
            position: absolute;
            right: 3px;
            bottom: 3px;
            width: 8px;
            height: 8px;
            border-right: 2px solid rgba(0, 0, 0, 0.4);
            border-bottom: 2px solid rgba(0, 0, 0, 0.4);
          }
          
          .react-grid-item > .react-resizable-handle:hover::after {
            border-color: rgba(0, 0, 0, 0.7);
          }
          
          .react-grid-placeholder {
            background: rgb(99, 102, 241);
            opacity: 0.2;
            transition-duration: 100ms;
            z-index: 2;
            border-radius: 8px;
          }
          
          .dashboard-grid-item {
            overflow: hidden;
          }
        `}</style>
      )}
    </div>
  );
};

DashboardGrid.propTypes = {
  /** Array of widget configurations */
  widgets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      component: PropTypes.node.isRequired,
    })
  ),
  /** Callback when layout changes */
  onLayoutChange: PropTypes.func,
  /** Whether grid is editable (drag/resize enabled) */
  editable: PropTypes.bool,
  /** Maximum number of widgets to display */
  maxWidgets: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default DashboardGrid;
