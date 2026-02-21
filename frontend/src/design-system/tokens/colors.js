/**
 * Design System Color Tokens
 * 
 * Centralized color definitions matching the Tailwind configuration.
 * Use these tokens for programmatic color access in JavaScript.
 */

export const colors = {
  // Primary Colors (Indigo-based)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Base
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Secondary Colors (Slate-based)
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Base
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Semantic Colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Base
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Base
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Base
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Base
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

/**
 * Color Usage Guidelines
 * 
 * - Primary: Main actions, links, active states, brand elements
 * - Secondary: Secondary actions, less prominent UI elements
 * - Success: Confirmations, successful operations, positive indicators
 * - Warning: Cautions, pending states, attention needed
 * - Error: Errors, destructive actions, critical alerts
 * - Info: Informational messages, tips, neutral notifications
 * - Neutral: Text, borders, backgrounds, disabled states
 */

export const colorUsage = {
  primary: 'Main actions, links, active states, brand elements',
  secondary: 'Secondary actions, less prominent UI elements',
  success: 'Confirmations, successful operations, positive indicators',
  warning: 'Cautions, pending states, attention needed',
  error: 'Errors, destructive actions, critical alerts',
  info: 'Informational messages, tips, neutral notifications',
  neutral: 'Text, borders, backgrounds, disabled states',
};
