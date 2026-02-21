/**
 * Design System Utilities
 * 
 * Helper functions and utilities for the design system.
 */

import { clsx } from 'clsx';

/**
 * Combines class names using clsx
 * @param {...any} classes - Class names to combine
 * @returns {string} Combined class names
 */
export const cn = (...classes) => {
  return clsx(...classes);
};

/**
 * Get responsive class names based on breakpoint
 * @param {object} config - Breakpoint configuration { sm: 'class', md: 'class', ... }
 * @returns {string} Responsive class names
 */
export const responsive = (config) => {
  return Object.entries(config)
    .map(([breakpoint, className]) => {
      if (breakpoint === 'base') return className;
      return `${breakpoint}:${className}`;
    })
    .join(' ');
};

/**
 * Generate variant classes
 * @param {string} base - Base class name
 * @param {string} variant - Variant name
 * @returns {string} Variant class name
 */
export const variant = (base, variant) => {
  return `${base}-${variant}`;
};

/**
 * Check if value is a valid color from design system
 * @param {string} color - Color value to check
 * @returns {boolean} True if valid color
 */
export const isValidColor = (color) => {
  const validColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'];
  return validColors.includes(color);
};

/**
 * Get color class name
 * @param {string} color - Color name (e.g., 'primary', 'success')
 * @param {string|number} shade - Color shade (e.g., 500, 'DEFAULT')
 * @returns {string} Color class name
 */
export const getColorClass = (color, shade = 500) => {
  if (shade === 'DEFAULT') {
    return `${color}`;
  }
  return `${color}-${shade}`;
};

/**
 * Format spacing value
 * @param {string|number} value - Spacing value
 * @returns {string} Formatted spacing value
 */
export const formatSpacing = (value) => {
  if (typeof value === 'number') {
    return `${value * 0.25}rem`; // Convert to rem based on 4px base
  }
  return value;
};

/**
 * Generate focus ring classes
 * @param {string} color - Focus ring color (default: 'primary')
 * @returns {string} Focus ring classes
 */
export const focusRing = (color = 'primary') => {
  return `focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`;
};

/**
 * Generate disabled state classes
 * @returns {string} Disabled state classes
 */
export const disabledState = () => {
  return 'disabled:opacity-50 disabled:cursor-not-allowed';
};

/**
 * Generate hover state classes
 * @param {string} color - Hover color
 * @returns {string} Hover state classes
 */
export const hoverState = (color = 'primary') => {
  return `hover:bg-${color}-600 transition-colors duration-150`;
};

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
