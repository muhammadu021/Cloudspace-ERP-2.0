/**
 * DashboardContent Component
 * 
 * Main dashboard content area displaying quick actions and widget grid.
 * Handles global refresh and last update timestamp display.
 * 
 * Requirements: 9.3, 9.4, 9.5
 */

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';
import Button from '@/design-system/components/Button';
import QuickActionsBar from './QuickActionsBar';
import WidgetRenderer from './WidgetRenderer';
import { announceToScreenReader } from '@/utils/accessibility';

/**
 * Dashboard Content Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.config - Dashboard configuration
 * @param {string} props.role - User role
 * @param {Function} props.onRefresh - Callback for global refresh
 * @param {string} [props.lastUpdate] - Last update timestamp
 * @param {boolean} [props.isRefreshing] - Whether refresh is in progress
 * @param {string} [props.className] - Additional CSS classes
 */
const DashboardContent = ({
  config,
  role,
  onRefresh,
  lastUpdate,
  isRefreshing = false,
  className,
}) => {
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  /**
   * Handle global refresh
   * Refreshes all visible widgets in parallel
   */
  const handleGlobalRefresh = useCallback(
    async () => {
      setIsRefreshingAll(true);
      announceToScreenReader('Refreshing all widgets');
      
      try {
        if (onRefresh) {
          await onRefresh();
        }
        announceToScreenReader('All widgets refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh dashboard:', error);
        announceToScreenReader('Failed to refresh widgets. Please try again.');
      } finally {
        setIsRefreshingAll(false);
      }
    },
    [onRefresh]
  );

  /**
   * Format last update timestamp
   */
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Extract quick actions and widgets from config
  console.log('DashboardContent received config:', config);
  const quickActions = config?.quickActions || [];
  const widgets = config?.widgets || [];
  console.log('DashboardContent extracted:', { quickActions, widgets });

  // Transform widgets into renderable components with position data
  const renderableWidgets = widgets.map((widget) => ({
    id: widget.id,
    size: widget.size || 'medium',
    position: widget.position || { x: 0, y: 0, w: 6, h: 3 },
    component: (
      <WidgetRenderer
        key={widget.id}
        widget={widget}
        role={role}
      />
    ),
  }));

  return (
    <div className={cn('space-y-2', className)}>
      {/* Screen reader announcements for dynamic updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isRefreshingAll && 'Refreshing all widgets'}
      </div>

      {/* Dashboard Grid */}
      {renderableWidgets.length > 0 ? (
        <div 
          className="gap-3"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: 'minmax(60px, auto)',
          }}
        >
          {renderableWidgets.map((widget) => {
            const pos = widget.position || { x: 0, y: 0, w: 6, h: 3 };
            
            return (
              <div
                key={widget.id}
                style={{
                  gridColumn: `${pos.x + 1} / span ${Math.min(pos.w, 12)}`,
                  gridRow: `${pos.y + 1} / span ${pos.h}`,
                }}
              >
                {widget.component}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

DashboardContent.propTypes = {
  /** Dashboard configuration object */
  config: PropTypes.shape({
    widgets: PropTypes.array,
    quickActions: PropTypes.array,
  }).isRequired,
  /** User role */
  role: PropTypes.string.isRequired,
  /** Callback for global refresh */
  onRefresh: PropTypes.func,
  /** Last update timestamp (ISO string) */
  lastUpdate: PropTypes.string,
  /** Whether refresh is in progress */
  isRefreshing: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default DashboardContent;
