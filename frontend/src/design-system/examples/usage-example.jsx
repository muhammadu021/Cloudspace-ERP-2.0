/**
 * Design System Usage Examples
 * 
 * This file demonstrates how to use the design system tokens and utilities.
 * These examples will be expanded as components are implemented.
 */

import React from 'react';
import { colors, typeScale, spacing } from '@design-system/tokens';
import { cn, focusRing, disabledState } from '@design-system/utils';

/**
 * Example: Using Color Tokens
 */
export const ColorExample = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-h2">Color Examples</h2>
      
      {/* Using Tailwind classes */}
      <div className="flex gap-4">
        <div className="bg-primary-500 text-white px-4 py-2 rounded">
          Primary Button
        </div>
        <div className="bg-success-500 text-white px-4 py-2 rounded">
          Success Button
        </div>
        <div className="bg-error-500 text-white px-4 py-2 rounded">
          Error Button
        </div>
      </div>
      
      {/* Using inline styles with tokens */}
      <div 
        style={{ 
          backgroundColor: colors.primary[500],
          color: 'white',
          padding: spacing[4],
          borderRadius: '6px'
        }}
      >
        Using color tokens directly
      </div>
    </div>
  );
};

/**
 * Example: Using Typography Tokens
 */
export const TypographyExample = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-h1">Heading 1</h1>
      <h2 className="text-h2">Heading 2</h2>
      <h3 className="text-h3">Heading 3</h3>
      <p className="text-body">
        This is body text using the design system typography scale.
      </p>
      <p className="text-body-sm text-neutral-600">
        This is small body text with neutral color.
      </p>
      <p className="text-caption text-neutral-500">
        This is caption text for helper information.
      </p>
    </div>
  );
};

/**
 * Example: Using Spacing Tokens
 */
export const SpacingExample = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-h2">Spacing Examples</h2>
      
      {/* Using Tailwind spacing classes */}
      <div className="p-4 bg-neutral-100 rounded">
        Padding: 16px (spacing-4)
      </div>
      
      <div className="flex gap-6">
        <div className="p-2 bg-primary-100 rounded">Gap: 24px</div>
        <div className="p-2 bg-primary-100 rounded">Between</div>
        <div className="p-2 bg-primary-100 rounded">Items</div>
      </div>
    </div>
  );
};

/**
 * Example: Using Utility Functions
 */
export const UtilityExample = () => {
  const buttonClasses = cn(
    'px-4 py-2 rounded',
    'bg-primary-500 text-white',
    'transition-colors duration-150',
    focusRing('primary'),
    disabledState()
  );
  
  return (
    <div className="space-y-4">
      <h2 className="text-h2">Utility Function Examples</h2>
      
      <button className={buttonClasses}>
        Button with utilities
      </button>
      
      <button className={buttonClasses} disabled>
        Disabled button
      </button>
    </div>
  );
};

/**
 * Example: Responsive Design
 */
export const ResponsiveExample = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-h2">Responsive Design</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-primary-100 rounded">
          1 column on mobile, 2 on tablet, 3 on desktop
        </div>
        <div className="p-4 bg-primary-100 rounded">
          Responsive grid
        </div>
        <div className="p-4 bg-primary-100 rounded">
          Using breakpoints
        </div>
      </div>
    </div>
  );
};

/**
 * Complete Example Component
 */
export const DesignSystemExample = () => {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-h1 mb-2">Design System Examples</h1>
        <p className="text-body text-neutral-600">
          Demonstrating the usage of design system tokens and utilities.
        </p>
      </div>
      
      <ColorExample />
      <TypographyExample />
      <SpacingExample />
      <UtilityExample />
      <ResponsiveExample />
    </div>
  );
};

export default DesignSystemExample;
