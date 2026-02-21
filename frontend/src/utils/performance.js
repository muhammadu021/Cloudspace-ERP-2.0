/**
 * Performance Monitoring Utilities
 * 
 * Tracks Web Vitals and custom performance metrics for the ERP system.
 * 
 * Web Vitals tracked:
 * - LCP (Largest Contentful Paint): < 1.5s target
 * - FID (First Input Delay): < 100ms target
 * - CLS (Cumulative Layout Shift): < 0.1 target
 * - FCP (First Contentful Paint): < 1.0s target
 * - TTFB (Time to First Byte): < 600ms target
 * 
 * Custom metrics:
 * - Page load time
 * - API response times
 * - Component render times
 * - User interactions
 */

/**
 * Performance thresholds based on Web Vitals recommendations
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: {
    good: 1500,      // < 1.5s
    needsImprovement: 2500,  // 1.5s - 2.5s
    poor: Infinity,  // > 2.5s
  },
  FID: {
    good: 100,       // < 100ms
    needsImprovement: 300,   // 100ms - 300ms
    poor: Infinity,  // > 300ms
  },
  CLS: {
    good: 0.1,       // < 0.1
    needsImprovement: 0.25,  // 0.1 - 0.25
    poor: Infinity,  // > 0.25
  },
  FCP: {
    good: 1000,      // < 1.0s
    needsImprovement: 1800,  // 1.0s - 1.8s
    poor: Infinity,  // > 1.8s
  },
  TTFB: {
    good: 600,       // < 600ms
    needsImprovement: 800,   // 600ms - 800ms
    poor: Infinity,  // > 800ms
  },
};

/**
 * Get performance rating based on value and thresholds
 */
function getRating(value, thresholds) {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Web Vitals tracking using native Performance API
 * Fallback implementation when web-vitals library is not available
 */
class WebVitalsTracker {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }
  
  /**
   * Track Largest Contentful Paint (LCP)
   */
  trackLCP(callback) {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const metric = {
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: getRating(
            lastEntry.renderTime || lastEntry.loadTime,
            PERFORMANCE_THRESHOLDS.LCP
          ),
          entries: [lastEntry],
        };
        
        this.metrics.LCP = metric;
        if (callback) callback(metric);
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error tracking LCP:', error);
    }
  }
  
  /**
   * Track First Input Delay (FID)
   */
  trackFID(callback) {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0];
        
        const metric = {
          name: 'FID',
          value: firstEntry.processingStart - firstEntry.startTime,
          rating: getRating(
            firstEntry.processingStart - firstEntry.startTime,
            PERFORMANCE_THRESHOLDS.FID
          ),
          entries: [firstEntry],
        };
        
        this.metrics.FID = metric;
        if (callback) callback(metric);
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error tracking FID:', error);
    }
  }
  
  /**
   * Track Cumulative Layout Shift (CLS)
   */
  trackCLS(callback) {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let clsValue = 0;
      let clsEntries = [];
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        }
        
        const metric = {
          name: 'CLS',
          value: clsValue,
          rating: getRating(clsValue, PERFORMANCE_THRESHOLDS.CLS),
          entries: clsEntries,
        };
        
        this.metrics.CLS = metric;
        if (callback) callback(metric);
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error tracking CLS:', error);
    }
  }
  
  /**
   * Track First Contentful Paint (FCP)
   */
  trackFCP(callback) {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          const metric = {
            name: 'FCP',
            value: fcpEntry.startTime,
            rating: getRating(fcpEntry.startTime, PERFORMANCE_THRESHOLDS.FCP),
            entries: [fcpEntry],
          };
          
          this.metrics.FCP = metric;
          if (callback) callback(metric);
        }
      });
      
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error tracking FCP:', error);
    }
  }
  
  /**
   * Track Time to First Byte (TTFB)
   */
  trackTTFB(callback) {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0];
      
      if (navigationEntry) {
        const metric = {
          name: 'TTFB',
          value: navigationEntry.responseStart - navigationEntry.requestStart,
          rating: getRating(
            navigationEntry.responseStart - navigationEntry.requestStart,
            PERFORMANCE_THRESHOLDS.TTFB
          ),
          entries: [navigationEntry],
        };
        
        this.metrics.TTFB = metric;
        if (callback) callback(metric);
      }
    } catch (error) {
      console.error('Error tracking TTFB:', error);
    }
  }
  
  /**
   * Get all tracked metrics
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Initialize Web Vitals tracking
 * 
 * @param {Function} onMetric - Callback function called for each metric
 * @returns {Object} Tracker instance
 */
export function initWebVitals(onMetric) {
  const tracker = new WebVitalsTracker();
  
  // Track all Web Vitals
  tracker.trackLCP(onMetric);
  tracker.trackFID(onMetric);
  tracker.trackCLS(onMetric);
  tracker.trackFCP(onMetric);
  tracker.trackTTFB(onMetric);
  
  return tracker;
}

/**
 * Send metrics to analytics service
 * 
 * @param {Object} metric - Web Vital metric
 */
export function sendToAnalytics(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: metric.rating,
    });
  }
  
  // Send to analytics service (e.g., Google Analytics, custom endpoint)
  // Example: gtag('event', metric.name, { value: metric.value, metric_rating: metric.rating });
  
  // Send to custom analytics endpoint
  if (window.analyticsEndpoint) {
    fetch(window.analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'web-vital',
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    }).catch(error => {
      console.error('Error sending analytics:', error);
    });
  }
}

/**
 * Track custom performance metric
 * 
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} metadata - Additional metadata
 */
export function trackCustomMetric(name, value, metadata = {}) {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    url: window.location.href,
    ...metadata,
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, value, metadata);
  }
  
  // Send to analytics
  if (window.analyticsEndpoint) {
    fetch(window.analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'custom-metric',
        ...metric,
      }),
    }).catch(error => {
      console.error('Error sending custom metric:', error);
    });
  }
}

/**
 * Measure API response time
 * 
 * @param {string} endpoint - API endpoint
 * @param {Function} apiCall - API call function
 * @returns {Promise} API response
 */
export async function measureApiCall(endpoint, apiCall) {
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
}

/**
 * Measure component render time
 * Use with React Profiler API
 * 
 * @param {string} id - Component ID
 * @param {string} phase - Render phase (mount or update)
 * @param {number} actualDuration - Actual render time
 */
export function onRenderCallback(id, phase, actualDuration) {
  if (actualDuration > 16) { // Only track slow renders (> 1 frame)
    trackCustomMetric('component-render-time', actualDuration, {
      component: id,
      phase,
    });
  }
}

/**
 * Create performance mark
 * 
 * @param {string} name - Mark name
 */
export function mark(name) {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name);
  }
}

/**
 * Measure performance between two marks
 * 
 * @param {string} name - Measure name
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 * @returns {number} Duration in milliseconds
 */
export function measure(name, startMark, endMark) {
  if ('performance' in window && 'measure' in performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      console.error('Error measuring performance:', error);
      return 0;
    }
  }
  return 0;
}

/**
 * Get performance summary
 * 
 * @returns {Object} Performance summary
 */
export function getPerformanceSummary() {
  const navigation = performance.getEntriesByType('navigation')[0];
  
  if (!navigation) {
    return null;
  }
  
  return {
    // Page load metrics
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    
    // Network metrics
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    
    // Total time
    totalTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

export default {
  initWebVitals,
  sendToAnalytics,
  trackCustomMetric,
  measureApiCall,
  onRenderCallback,
  mark,
  measure,
  getPerformanceSummary,
  PERFORMANCE_THRESHOLDS,
};
