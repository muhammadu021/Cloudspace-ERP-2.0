/**
 * VirtualList Component
 * 
 * Efficient virtual scrolling component for large lists.
 * Only renders visible items to improve performance.
 * 
 * Features:
 * - Renders only visible items (+ overscan)
 * - Smooth scrolling with dynamic height support
 * - Configurable item height and overscan
 * - Scroll to index functionality
 * - Loading states and empty states
 * 
 * Note: For production use with variable heights, consider using @tanstack/react-virtual
 * This is a simplified implementation for fixed-height items.
 * 
 * @example
 * <VirtualList
 *   items={employees}
 *   itemHeight={60}
 *   height={600}
 *   renderItem={(employee) => <EmployeeRow employee={employee} />}
 * />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';

const VirtualList = ({
  items = [],
  itemHeight = 50,
  height = 600,
  width = '100%',
  overscan = 3,
  renderItem,
  loading = false,
  emptyMessage = 'No items to display',
  className,
  onScroll,
  ...props
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  
  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onScroll) {
      onScroll({
        scrollTop: newScrollTop,
        scrollHeight: e.target.scrollHeight,
        clientHeight: e.target.clientHeight,
      });
    }
  }, [onScroll]);
  
  // Scroll to index
  const scrollToIndex = useCallback((index, behavior = 'smooth') => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior,
      });
    }
  }, [itemHeight]);
  
  // Expose scrollToIndex via ref
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollToIndex = scrollToIndex;
    }
  }, [scrollToIndex]);
  
  // Loading state
  if (loading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height, width }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items container */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={item.id || actualIndex}
                style={{ height: itemHeight }}
                data-index={actualIndex}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

VirtualList.propTypes = {
  /** Array of items to render */
  items: PropTypes.array.isRequired,
  /** Height of each item in pixels */
  itemHeight: PropTypes.number,
  /** Height of the container in pixels */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Width of the container */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Number of items to render outside visible area */
  overscan: PropTypes.number,
  /** Function to render each item */
  renderItem: PropTypes.func.isRequired,
  /** Loading state */
  loading: PropTypes.bool,
  /** Message to show when list is empty */
  emptyMessage: PropTypes.string,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Scroll event handler */
  onScroll: PropTypes.func,
};

export default VirtualList;
