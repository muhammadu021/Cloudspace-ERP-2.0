import React from 'react';

/**
 * Loading fallback component displayed during lazy route loading
 * Provides visual feedback while code chunks are being fetched
 */
const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        
        {/* Loading text */}
        <p className="text-neutral-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
