/**
 * Design System Typography Tokens
 * 
 * Typography scale and font definitions matching the design specification.
 */

export const fontFamilies = {
  sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
};

export const typeScale = {
  display: {
    fontSize: '3.75rem',      // 60px
    lineHeight: '1.1',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  h1: {
    fontSize: '2.25rem',      // 36px
    lineHeight: '1.2',
    fontWeight: '700',
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '1.875rem',     // 30px
    lineHeight: '1.3',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',       // 24px
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '0',
  },
  h4: {
    fontSize: '1.25rem',      // 20px
    lineHeight: '1.5',
    fontWeight: '600',
    letterSpacing: '0',
  },
  h5: {
    fontSize: '1.125rem',     // 18px
    lineHeight: '1.5',
    fontWeight: '600',
    letterSpacing: '0',
  },
  h6: {
    fontSize: '1rem',         // 16px
    lineHeight: '1.5',
    fontWeight: '600',
    letterSpacing: '0',
  },
  bodyLg: {
    fontSize: '1.125rem',     // 18px
    lineHeight: '1.6',
    fontWeight: '400',
  },
  body: {
    fontSize: '1rem',         // 16px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  bodySm: {
    fontSize: '0.875rem',     // 14px
    lineHeight: '1.5',
    fontWeight: '400',
  },
  caption: {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.4',
    fontWeight: '400',
  },
  overline: {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

/**
 * Helper function to apply typography styles
 * @param {string} variant - Typography variant (e.g., 'h1', 'body', 'caption')
 * @returns {object} Style object
 */
export const getTypographyStyles = (variant) => {
  return typeScale[variant] || typeScale.body;
};
