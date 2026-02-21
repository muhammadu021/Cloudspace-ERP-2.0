/**
 * usePerformance Hook
 * 
 * React hook for tracking performance metrics in components.
 * 
 * @example
 * function MyComponent() {
 *   const { trackMetric, metrics } = usePerformance();
 *   
 *   useEffect(() => {
 *     trackMetric('component-mount');
 *   }, []);
 *   
 *   return <div>...</div>;
 * }
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackCustomMetric, mark, measure } from '@/utils/performance';

/**
 * Hook for tracking component performance
 * 
 * @param {string} componentName - Name of the component
 * @returns {Object} Performance tracking utilities
 */
export function usePerformance(componentName) {
  const mountTimeRef = useRef(null);
  const renderCountRef = useRef(0);
  
  // Track component mount
  useEffect(() => {
    mountTimeRef.current = performance.now();
    mark(`${componentName}-mount-start`);
    
    return () => {
      // Track component unmount
      const mountDuration = performance.now() - mountTimeRef.current;
      trackCustomMetric('component-lifetime', mountDuration, {
        component: componentName,
        renderCount: renderCountRef.current,
      });
    };
  }, [componentName]);
  
  // Track render count
  useEffect(() => {
    renderCountRef.current += 1;
  });
  
  /**
   * Track a custom metric for this component
   */
  const trackMetric = useCallback((metricName, value, metadata = {}) => {
    trackCustomMetric(metricName, value, {
      component: componentName,
      ...metadata,
    });
  }, [componentName]);
  
  /**
   * Start a performance measurement
   */
  const startMeasure = useCallback((measureName) => {
    mark(`${componentName}-${measureName}-start`);
  }, [componentName]);
  
  /**
   * End a performance measurement
   */
  const endMeasure = useCallback((measureName) => {
    mark(`${componentName}-${measureName}-end`);
    const duration = measure(
      `${componentName}-${measureName}`,
      `${componentName}-${measureName}-start`,
      `${componentName}-${measureName}-end`
    );
    
    trackMetric(measureName, duration);
    return duration;
  }, [componentName, trackMetric]);
  
  return {
    trackMetric,
    startMeasure,
    endMeasure,
    renderCount: renderCountRef.current,
  };
}

/**
 * Hook for tracking API call performance
 * 
 * @returns {Function} Wrapper function for API calls
 */
export function useApiPerformance() {
  const trackApiCall = useCallback(async (endpoint, apiCall) => {
    const startTime = performance.now();
    
    try {
      const response = await apiCall();
      const duration = performance.now() - startTime;
      
      trackCustomMetric('api-response-time', duration, {
        endpoint,
        status: 'success',
      });
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      trackCustomMetric('api-response-time', duration, {
        endpoint,
        status: 'error',
        error: error.message,
      });
      
      throw error;
    }
  }, []);
  
  return trackApiCall;
}

/**
 * Hook for tracking user interactions
 * 
 * @returns {Function} Track interaction function
 */
export function useInteractionTracking() {
  const trackInteraction = useCallback((interactionType, metadata = {}) => {
    trackCustomMetric('user-interaction', performance.now(), {
      type: interactionType,
      ...metadata,
    });
  }, []);
  
  return trackInteraction;
}

export default usePerformance;
