/**
 * Card Component
 * 
 * A flexible container component for grouping related content.
 * Supports optional header, footer, and configurable padding.
 * 
 * @example
 * <Card
 *   title="Card Title"
 *   subtitle="Card subtitle"
 *   actions={<Button>Action</Button>}
 *   footer={<div>Footer content</div>}
 * >
 *   Card content goes here
 * </Card>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';

const Card = React.forwardRef(({
  title,
  subtitle,
  actions,
  footer,
  padding = 'md',
  hoverable = false,
  children,
  className,
  ...props
}, ref) => {
  // Base card styles
  const baseStyles = 'bg-white rounded-lg border border-neutral-200 shadow-sm transition-shadow duration-150';

  // Hoverable styles
  const hoverStyles = hoverable ? 'hover:shadow-md cursor-pointer' : '';

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Header component
  const CardHeader = () => {
    if (!title && !subtitle && !actions) return null;

    return (
      <div className={cn(
        'flex items-start justify-between gap-4 border-b border-neutral-200',
        paddingStyles[padding],
        children && 'pb-4'
      )}>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-h4 text-neutral-900 font-semibold truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-body-sm text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  };

  // Content component
  const CardContent = () => {
    if (!children) return null;

    const hasHeader = title || subtitle || actions;
    const hasFooter = footer;

    return (
      <div className={cn(
        paddingStyles[padding],
        !hasHeader && !hasFooter && '',
        hasHeader && !hasFooter && 'pt-4',
        !hasHeader && hasFooter && 'pb-4',
        hasHeader && hasFooter && 'py-4'
      )}>
        {children}
      </div>
    );
  };

  // Footer component
  const CardFooter = () => {
    if (!footer) return null;

    return (
      <div className={cn(
        'border-t border-neutral-200',
        paddingStyles[padding],
        children && 'pt-4'
      )}>
        {footer}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        hoverStyles,
        className
      )}
      {...props}
    >
      <CardHeader />
      <CardContent />
      <CardFooter />
    </div>
  );
});

Card.displayName = 'Card';

Card.propTypes = {
  /** Card title */
  title: PropTypes.string,
  /** Card subtitle */
  subtitle: PropTypes.string,
  /** Action buttons or elements in header */
  actions: PropTypes.node,
  /** Footer content */
  footer: PropTypes.node,
  /** Padding size */
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  /** Enable hover effect */
  hoverable: PropTypes.bool,
  /** Card content */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Card;
