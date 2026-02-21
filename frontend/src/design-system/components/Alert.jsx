/**
 * Alert Component
 * 
 * A standalone alert component for displaying important messages.
 * Supports multiple types (info, success, warning, error) with icons and dismissible option.
 * 
 * @example
 * <Alert
 *   type="success"
 *   title="Success"
 *   message="Your changes have been saved."
 *   dismissible
 *   onDismiss={() => console.log('dismissed')}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  actions,
  className,
  ...props
}) => {
  // Type configurations
  const typeConfig = {
    info: {
      icon: Info,
      containerClass: 'bg-info-50 border-info-500 text-info-900',
      iconClass: 'text-info-500',
      titleClass: 'text-info-900',
      messageClass: 'text-info-800',
    },
    success: {
      icon: CheckCircle,
      containerClass: 'bg-success-50 border-success-500 text-success-900',
      iconClass: 'text-success-500',
      titleClass: 'text-success-900',
      messageClass: 'text-success-800',
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'bg-warning-50 border-warning-500 text-warning-900',
      iconClass: 'text-warning-500',
      titleClass: 'text-warning-900',
      messageClass: 'text-warning-800',
    },
    error: {
      icon: XCircle,
      containerClass: 'bg-error-50 border-error-500 text-error-900',
      iconClass: 'text-error-500',
      titleClass: 'text-error-900',
      messageClass: 'text-error-800',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-lg border-l-4',
        config.containerClass,
        className
      )}
      {...props}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={cn('h-5 w-5', config.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('text-sm font-semibold mb-1', config.titleClass)}>
            {title}
          </h4>
        )}
        <p className={cn('text-sm', config.messageClass)}>
          {message}
        </p>
        {actions && (
          <div className="flex items-center gap-2 mt-3">
            {actions}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 transition-colors duration-150',
            'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
            type === 'info' && 'focus:ring-info-500',
            type === 'success' && 'focus:ring-success-500',
            type === 'warning' && 'focus:ring-warning-500',
            type === 'error' && 'focus:ring-error-500'
          )}
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  /** Alert type */
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  /** Alert title (optional) */
  title: PropTypes.string,
  /** Alert message */
  message: PropTypes.string.isRequired,
  /** Whether the alert can be dismissed */
  dismissible: PropTypes.bool,
  /** Function to call when alert is dismissed */
  onDismiss: PropTypes.func,
  /** Action buttons or elements */
  actions: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Alert;
