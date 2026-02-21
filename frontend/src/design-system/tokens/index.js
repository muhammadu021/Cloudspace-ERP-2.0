/**
 * Design System Tokens
 * 
 * Centralized export of all design tokens.
 */

export * from './colors';
export * from './typography';
export * from './spacing';

// Breakpoints
export const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices (large desktops)
  '2xl': '1536px', // 2X large devices (larger desktops)
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '4px',
  default: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

// Box Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
};

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
};

// Transitions
export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',
};

export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};
