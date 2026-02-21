import React, { useState, useRef, useEffect } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

/**
 * Tooltip Component
 * 
 * Accessible tooltip component with keyboard support and appropriate delays.
 * Supports both hover and focus interactions.
 * 
 * @example
 * <Tooltip content="This is helpful information">
 *   <button>Hover me</button>
 * </Tooltip>
 * 
 * @example
 * <HelpTooltip content="Explains a complex feature" />
 */

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = ({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 100,
  className = '',
  ...props
}) => {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          className={`
            z-50 overflow-hidden rounded-md bg-neutral-900 px-3 py-2 text-sm text-white
            shadow-md animate-in fade-in-0 zoom-in-95
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
            data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
            max-w-xs
            ${className}
          `}
          sideOffset={5}
          {...props}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-neutral-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
};

/**
 * HelpTooltip Component
 * 
 * A help icon with tooltip for providing contextual help.
 * Accessible via keyboard and screen readers.
 * 
 * @example
 * <HelpTooltip content="This feature allows you to..." />
 */
export const HelpTooltip = ({
  content,
  side = 'top',
  align = 'center',
  iconSize = 16,
  className = '',
  ...props
}) => {
  return (
    <Tooltip content={content} side={side} align={align} {...props}>
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          text-neutral-500 hover:text-neutral-700
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          rounded-full transition-colors
          ${className}
        `}
        aria-label="Help information"
      >
        <HelpCircle size={iconSize} />
      </button>
    </Tooltip>
  );
};

/**
 * InfoTooltip Component
 * 
 * A simple info icon with tooltip for inline help.
 * 
 * @example
 * <label>
 *   Complex Field <InfoTooltip content="Explanation of the field" />
 * </label>
 */
export const InfoTooltip = ({
  content,
  side = 'top',
  className = '',
  ...props
}) => {
  return (
    <Tooltip content={content} side={side} {...props}>
      <span
        className={`
          inline-flex items-center justify-center
          w-4 h-4 text-xs font-semibold
          text-white bg-neutral-500 hover:bg-neutral-600
          rounded-full cursor-help
          transition-colors
          ${className}
        `}
        aria-label="More information"
      >
        i
      </span>
    </Tooltip>
  );
};

export default Tooltip;
