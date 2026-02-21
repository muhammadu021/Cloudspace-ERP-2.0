/**
 * Badge Component
 * 
 * A small label component for displaying status, counts, or categories.
 * Supports semantic color variants and optional dot indicator.
 * 
 * @example
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error" dot>Offline</Badge>
 * <Badge variant="info" size="sm">New</Badge>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';

const Badge = ({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';

  // Variant styles
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-700',
    info: 'bg-info-50 text-info-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    error: 'bg-error-50 text-error-700',
    neutral: 'bg-neutral-100 text-neutral-700',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  // Dot color styles
  const dotColorStyles = {
    default: 'bg-neutral-500',
    info: 'bg-info-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    neutral: 'bg-neutral-500',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotColorStyles[variant]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

Badge.propTypes = {
  /** Badge color variant */
  variant: PropTypes.oneOf(['default', 'info', 'success', 'warning', 'error', 'neutral']),
  /** Badge size */
  size: PropTypes.oneOf(['sm', 'md']),
  /** Show dot indicator */
  dot: PropTypes.bool,
  /** Badge content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge;
