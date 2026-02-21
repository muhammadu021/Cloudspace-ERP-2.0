/**
 * QuickActionWidget Component
 * 
 * Grid of action buttons for common operations.
 * Supports icons, labels, and click handlers.
 * 
 * @example
 * <QuickActionWidget
 *   actions={[
 *     {
 *       id: 'new-order',
 *       label: 'New Order',
 *       icon: <PlusIcon />,
 *       onClick: () => navigate('/orders/new'),
 *       variant: 'primary'
 *     },
 *     {
 *       id: 'reports',
 *       label: 'Reports',
 *       icon: <ChartIcon />,
 *       onClick: () => navigate('/reports')
 *     }
 *   ]}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';

const QuickActionWidget = ({
  actions = [],
  columns = 2,
  className,
  ...props
}) => {
  // Grid column classes
  const gridColsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  // Variant styles for action buttons
  const variantStyles = {
    primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200',
    secondary: 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border-secondary-200',
    success: 'bg-success-50 text-success-700 hover:bg-success-100 border-success-200',
    warning: 'bg-warning-50 text-warning-700 hover:bg-warning-100 border-warning-200',
    error: 'bg-error-50 text-error-700 hover:bg-error-100 border-error-200',
    neutral: 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-neutral-200',
  };

  // Empty state
  if (!actions || actions.length === 0) {
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <p className="text-sm text-neutral-500">No quick actions available</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        gridColsClasses[columns] || 'grid-cols-2',
        className
      )}
      {...props}
    >
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[action.variant || 'neutral']
          )}
          aria-label={action.label}
        >
          {/* Icon */}
          {action.icon && (
            <div className="w-8 h-8 flex items-center justify-center">
              {action.icon}
            </div>
          )}

          {/* Label */}
          <span className="text-sm font-medium text-center">
            {action.label}
          </span>

          {/* Optional badge/count */}
          {action.badge && (
            <span className="absolute top-2 right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error-500 rounded-full">
              {action.badge}
            </span>
          )}

          {/* Optional description */}
          {action.description && (
            <span className="text-xs text-current opacity-75 text-center">
              {action.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

QuickActionWidget.propTypes = {
  /** Array of action configurations */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique action identifier */
      id: PropTypes.string.isRequired,
      /** Action label */
      label: PropTypes.string.isRequired,
      /** Action icon */
      icon: PropTypes.node,
      /** Click handler */
      onClick: PropTypes.func.isRequired,
      /** Action variant/color */
      variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'neutral']),
      /** Disabled state */
      disabled: PropTypes.bool,
      /** Optional badge/count */
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      /** Optional description */
      description: PropTypes.string,
    })
  ),
  /** Number of columns in grid */
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default QuickActionWidget;
