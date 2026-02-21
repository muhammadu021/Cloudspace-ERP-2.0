/**
 * Lazy Loading Utilities
 * 
 * Utilities for lazy loading heavy components with loading states.
 * Helps reduce initial bundle size by loading components on demand.
 */

import React, { lazy, Suspense } from 'react';

/**
 * Loading fallback component for lazy-loaded components
 */
const LoadingFallback = ({ height = 200, message = 'Loading...' }) => (
  <div 
    className="flex items-center justify-center w-full"
    style={{ minHeight: height }}
  >
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  </div>
);

/**
 * Wrapper for lazy-loaded components with Suspense boundary
 * 
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} fallbackProps - Props for loading fallback
 * @returns {React.Component} Lazy-loaded component with Suspense
 * 
 * @example
 * const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));
 */
export const lazyLoad = (importFunc, fallbackProps = {}) => {
  const LazyComponent = lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingFallback {...fallbackProps} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a lazy-loaded component
 * Useful for preloading components before they're needed
 * 
 * @param {Function} importFunc - Dynamic import function
 * 
 * @example
 * const HeavyComponent = lazy(() => import('./HeavyComponent'));
 * preloadComponent(() => import('./HeavyComponent'));
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

/**
 * Lazy load with retry logic
 * Retries loading if it fails (useful for network issues)
 * 
 * @param {Function} importFunc - Dynamic import function
 * @param {number} retries - Number of retries
 * @returns {Promise} Component promise
 */
export const lazyLoadWithRetry = (importFunc, retries = 3) => {
  return new Promise((resolve, reject) => {
    const attemptLoad = (attemptsLeft) => {
      importFunc()
        .then(resolve)
        .catch((error) => {
          if (attemptsLeft === 1) {
            reject(error);
            return;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, retries - attemptsLeft) * 1000;
          setTimeout(() => attemptLoad(attemptsLeft - 1), delay);
        });
    };
    
    attemptLoad(retries);
  });
};

/**
 * Create a lazy-loaded component with retry logic
 * 
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} Lazy-loaded component
 * 
 * @example
 * const PDFViewer = lazyWithRetry(() => import('./PDFViewer'), {
 *   retries: 3,
 *   fallbackHeight: 400,
 *   fallbackMessage: 'Loading PDF viewer...'
 * });
 */
export const lazyWithRetry = (importFunc, options = {}) => {
  const {
    retries = 3,
    fallbackHeight = 200,
    fallbackMessage = 'Loading...',
  } = options;
  
  const LazyComponent = lazy(() => lazyLoadWithRetry(importFunc, retries));
  
  return (props) => (
    <Suspense 
      fallback={
        <LoadingFallback 
          height={fallbackHeight} 
          message={fallbackMessage} 
        />
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default lazyLoad;
