/**
 * PerformanceMonitor Component
 * 
 * Development tool for monitoring performance metrics in real-time.
 * Only renders in development mode.
 * 
 * Features:
 * - Real-time Web Vitals display
 * - Performance warnings
 * - Metric history
 * - Toggle visibility
 * 
 * @example
 * // Add to App.jsx in development
 * {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
 */

import React, { useState, useEffect } from 'react';
import { initWebVitals, PERFORMANCE_THRESHOLDS } from '@/utils/performance';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    // Initialize Web Vitals tracking
    const tracker = initWebVitals((metric) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name]: metric,
      }));
    });
    
    // Show monitor after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      tracker.disconnect();
    };
  }, []);
  
  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const getColorClass = (rating) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const formatValue = (name, value) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };
  
  const metricOrder = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
  const orderedMetrics = metricOrder
    .filter(name => metrics[name])
    .map(name => metrics[name]);
  
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 z-[9999]"
        style={{ fontFamily: 'monospace' }}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          📊 Performance
        </button>
      </div>
    );
  }
  
  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md"
      style={{ fontFamily: 'monospace' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-bold text-sm text-gray-900">Performance Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="p-4 space-y-2">
        {orderedMetrics.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Collecting metrics...
          </div>
        ) : (
          orderedMetrics.map((metric) => (
            <div
              key={metric.name}
              className={`flex items-center justify-between px-3 py-2 rounded border ${getColorClass(metric.rating)}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">{metric.name}</span>
                <span className="text-xs opacity-75">
                  {metric.name === 'LCP' && 'Largest Contentful Paint'}
                  {metric.name === 'FID' && 'First Input Delay'}
                  {metric.name === 'CLS' && 'Cumulative Layout Shift'}
                  {metric.name === 'FCP' && 'First Contentful Paint'}
                  {metric.name === 'TTFB' && 'Time to First Byte'}
                </span>
              </div>
              <span className="font-bold text-sm">
                {formatValue(metric.name, metric.value)}
              </span>
            </div>
          ))
        )}
      </div>
      
      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Needs Improvement</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
