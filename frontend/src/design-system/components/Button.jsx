/**
 * Button Component
 * 
 * A flexible button component with multiple variants, sizes, and states.
 * Built with accessibility in mind and consistent with the design system.
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';

const Button = React.forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className,
  type = 'button',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500',
    outline: 'bg-transparent text-primary-600 border border-primary-300 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-error-500',
  };

  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-base gap-2',
    lg: 'h-12 px-6 text-lg gap-2.5',
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      {...props}
    >
      {loading && (
        <>
          <LoadingSpinner />
          <span className="sr-only">Loading...</span>
        </>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  /** Button variant style */
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Loading state */
  loading: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Icon element to display */
  icon: PropTypes.node,
  /** Position of the icon */
  iconPosition: PropTypes.oneOf(['left', 'right']),
  /** Full width button */
  fullWidth: PropTypes.bool,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Button type attribute */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
