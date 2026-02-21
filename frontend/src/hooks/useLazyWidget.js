/**
 * useLazyWidget Hook
 * 
 * Implements lazy loading for dashboard widgets using IntersectionObserver.
 * Defers widget data loading until the widget becomes visible in the viewport.
 * 
 * Requirements: 7.1
 * 
 * @example
 * const { widgetRef, shouldFetch } = useLazyWidget();
 * 
 * return (
 *   <div ref={widgetRef}>
 *     {shouldFetch && <WidgetContent />}
 *   </div>
 * );
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for lazy loading widgets based on viewport visibility
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.rootMargin - Margin around root (default: '50px')
 * @param {number} options.threshold - Visibility threshold (default: 0.1)
 * @returns {Object} - { widgetRef, shouldFetch }
 */
const useLazyWidget = (options = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
  } = options;

  const widgetRef = useRef(null);
  const [shouldFetch, setShouldFetch] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, fetch immediately
    if (!('IntersectionObserver' in window)) {
      setShouldFetch(true);
      return;
    }

    // Create IntersectionObserver instance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When widget becomes visible, trigger data fetch
          if (entry.isIntersecting) {
            setShouldFetch(true);
            // Once visible, stop observing
            if (observerRef.current && entry.target) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: null, // Use viewport as root
        rootMargin,
        threshold,
      }
    );

    // Start observing the widget element
    const currentWidget = widgetRef.current;
    if (currentWidget && observerRef.current) {
      observerRef.current.observe(currentWidget);
    }

    // Cleanup observer on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold]);

  return {
    widgetRef,
    shouldFetch,
  };
};

export default useLazyWidget;
