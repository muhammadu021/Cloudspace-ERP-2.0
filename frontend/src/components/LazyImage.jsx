/**
 * LazyImage Component
 * 
 * Optimized image component with lazy loading using Intersection Observer.
 * Supports responsive images, placeholders, and error handling.
 * 
 * Features:
 * - Native lazy loading with Intersection Observer fallback
 * - Responsive srcset support
 * - Blur placeholder while loading
 * - Error state handling
 * - Fade-in animation on load
 * 
 * @example
 * <LazyImage
 *   src="/images/product.jpg"
 *   alt="Product"
 *   width={400}
 *   height={300}
 *   placeholder="/images/product-thumb.jpg"
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';

const LazyImage = ({
  src,
  alt = '',
  width,
  height,
  className,
  placeholder,
  srcSet,
  sizes,
  objectFit = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    // Check if browser supports IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      // Fallback: load immediately
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Error state
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-neutral-100 text-neutral-400',
          className
        )}
        style={{ width, height }}
        {...props}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full blur-sm',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill'
          )}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {!placeholder && !isLoaded && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill'
          )}
          {...props}
        />
      )}
    </div>
  );
};

LazyImage.propTypes = {
  /** Image source URL */
  src: PropTypes.string.isRequired,
  /** Alt text for accessibility */
  alt: PropTypes.string,
  /** Image width */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Image height */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Placeholder image (low-res or thumbnail) */
  placeholder: PropTypes.string,
  /** Responsive image sources */
  srcSet: PropTypes.string,
  /** Responsive image sizes */
  sizes: PropTypes.string,
  /** Object fit style */
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill']),
  /** Callback when image loads */
  onLoad: PropTypes.func,
  /** Callback when image fails to load */
  onError: PropTypes.func,
};

export default LazyImage;
