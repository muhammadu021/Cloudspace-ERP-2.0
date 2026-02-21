/**
 * Tests for useLazyWidget Hook
 * 
 * Validates lazy loading behavior using IntersectionObserver
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useLazyWidget from './useLazyWidget';

describe('useLazyWidget', () => {
  let mockIntersectionObserver;
  let observeCallback;

  beforeEach(() => {
    // Mock IntersectionObserver
    observeCallback = null;
    mockIntersectionObserver = vi.fn(function(callback) {
      observeCallback = callback;
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
    
    global.IntersectionObserver = mockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return widgetRef and shouldFetch', () => {
    const { result } = renderHook(() => useLazyWidget());
    
    expect(result.current).toHaveProperty('widgetRef');
    expect(result.current).toHaveProperty('shouldFetch');
    expect(result.current.shouldFetch).toBe(false);
  });

  it('should create IntersectionObserver with correct options', () => {
    const options = {
      rootMargin: '100px',
      threshold: 0.5,
    };
    
    renderHook(() => useLazyWidget(options));
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        root: null,
        rootMargin: '100px',
        threshold: 0.5,
      })
    );
  });

  it('should set shouldFetch to true when widget becomes visible', async () => {
    const { result } = renderHook(() => useLazyWidget());
    
    // Initially should not fetch
    expect(result.current.shouldFetch).toBe(false);
    
    // Simulate intersection (widget becomes visible)
    if (observeCallback) {
      observeCallback([
        {
          isIntersecting: true,
          target: result.current.widgetRef.current,
        },
      ]);
    }
    
    // Wait for state update
    await waitFor(() => {
      expect(result.current.shouldFetch).toBe(true);
    });
  });

  it('should not set shouldFetch when widget is not intersecting', () => {
    const { result } = renderHook(() => useLazyWidget());
    
    // Simulate no intersection (widget not visible)
    if (observeCallback) {
      observeCallback([
        {
          isIntersecting: false,
          target: result.current.widgetRef.current,
        },
      ]);
    }
    
    expect(result.current.shouldFetch).toBe(false);
  });

  it('should set shouldFetch to true immediately if IntersectionObserver is not supported', () => {
    // Remove IntersectionObserver support
    const originalIO = global.IntersectionObserver;
    delete global.IntersectionObserver;
    
    const { result } = renderHook(() => useLazyWidget());
    
    expect(result.current.shouldFetch).toBe(true);
    
    // Restore IntersectionObserver
    global.IntersectionObserver = originalIO;
  });

  it('should use default options when none provided', () => {
    renderHook(() => useLazyWidget());
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '50px',
        threshold: 0.1,
      })
    );
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = renderHook(() => useLazyWidget());
    
    const observerInstance = mockIntersectionObserver.mock.results[0].value;
    
    unmount();
    
    expect(observerInstance.disconnect).toHaveBeenCalled();
  });
});
