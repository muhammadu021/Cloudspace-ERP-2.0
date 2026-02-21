/**
 * ListWidget Component
 * 
 * Displays a list of recent items or activities.
 * Supports custom item rendering and timestamps.
 * 
 * @example
 * <ListWidget
 *   items={recentOrders}
 *   renderItem={(item) => (
 *     <div>
 *       <div>{item.title}</div>
 *       <div>{item.description}</div>
 *     </div>
 *   )}
 *   onViewAll={() => navigate('/orders')}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@/design-system/components/Button';
import Badge from '@/design-system/components/Badge';
import { cn } from '@/design-system/utils';

const ListWidget = ({
  items = [],
  renderItem,
  maxItems = 5,
  showTimestamp = true,
  onViewAll = null,
  viewAllText = 'View All',
  emptyMessage = 'No items to display',
  className,
  ...props
}) => {
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Default item renderer
  const defaultRenderItem = (item) => (
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-neutral-900 truncate">
        {item.title || item.name || 'Untitled'}
      </div>
      {item.description && (
        <div className="text-xs text-neutral-500 truncate mt-0.5">
          {item.description}
        </div>
      )}
    </div>
  );

  // Empty state
  if (!items || items.length === 0) {
    return (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  const displayItems = items.slice(0, maxItems);
  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {/* Items list */}
      <div className="space-y-2">
        {displayItems.map((item, index) => (
          <div
            key={item.id || index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            onClick={() => item.onClick && item.onClick()}
          >
            {/* Optional icon or avatar */}
            {item.icon && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                {item.icon}
              </div>
            )}

            {/* Item content */}
            {itemRenderer(item)}

            {/* Optional badge */}
            {item.badge && (
              <Badge variant={item.badge.variant || 'default'} size="sm">
                {item.badge.text}
              </Badge>
            )}

            {/* Timestamp */}
            {showTimestamp && item.timestamp && (
              <div className="flex-shrink-0 text-xs text-neutral-400">
                {formatTimestamp(item.timestamp)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View all link */}
      {onViewAll && items.length > maxItems && (
        <div className="pt-2 border-t border-neutral-200">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onViewAll}
            className="text-primary-600 hover:text-primary-700"
          >
            {viewAllText}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

ListWidget.propTypes = {
  /** Array of items to display */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      icon: PropTypes.node,
      badge: PropTypes.shape({
        text: PropTypes.string,
        variant: PropTypes.string,
      }),
      onClick: PropTypes.func,
    })
  ),
  /** Custom item renderer function */
  renderItem: PropTypes.func,
  /** Maximum number of items to display */
  maxItems: PropTypes.number,
  /** Show timestamp for each item */
  showTimestamp: PropTypes.bool,
  /** View all handler */
  onViewAll: PropTypes.func,
  /** View all button text */
  viewAllText: PropTypes.string,
  /** Empty state message */
  emptyMessage: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ListWidget;
