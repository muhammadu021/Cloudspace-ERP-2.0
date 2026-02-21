import { useEffect, useCallback } from 'react';

/**
 * Hook for registering keyboard shortcuts
 * @param {string|string[]} keys - Key combination (e.g., 'k', 'ctrl+k', ['ctrl+k', 'cmd+k'])
 * @param {Function} callback - Function to call when shortcut is triggered
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether the shortcut is enabled (default: true)
 * @param {boolean} options.preventDefault - Whether to prevent default behavior (default: true)
 * @param {string} options.description - Description of the shortcut for help display
 */
export const useKeyboardShortcut = (keys, callback, options = {}) => {
  const {
    enabled = true,
    preventDefault = true,
    description = '',
  } = options;

  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      const keyArray = Array.isArray(keys) ? keys : [keys];
      const matchesShortcut = keyArray.some((key) => {
        const parts = key.toLowerCase().split('+');
        const keyPart = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1);

        const keyMatches = event.key.toLowerCase() === keyPart;
        const ctrlMatches = modifiers.includes('ctrl') ? event.ctrlKey : !event.ctrlKey;
        const altMatches = modifiers.includes('alt') ? event.altKey : !event.altKey;
        const shiftMatches = modifiers.includes('shift') ? event.shiftKey : !event.shiftKey;
        const metaMatches = modifiers.includes('cmd') || modifiers.includes('meta') 
          ? event.metaKey 
          : !event.metaKey;

        return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
      });

      if (matchesShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    },
    [keys, callback, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

/**
 * Hook for managing focus trap within a container
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {boolean} active - Whether the focus trap is active
 */
export const useFocusTrap = (containerRef, active = true) => {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, active]);
};

/**
 * Hook for managing roving tabindex (keyboard navigation in lists/grids)
 * @param {React.RefObject} containerRef - Reference to the container element
 * @param {Object} options - Configuration options
 */
export const useRovingTabIndex = (containerRef, options = {}) => {
  const {
    selector = '[role="button"], [role="menuitem"], [role="option"]',
    orientation = 'vertical', // 'vertical', 'horizontal', or 'both'
    loop = true,
  } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let currentIndex = 0;

    const updateTabIndex = () => {
      const items = Array.from(container.querySelectorAll(selector));
      items.forEach((item, index) => {
        item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
      });
    };

    const handleKeyDown = (e) => {
      const items = Array.from(container.querySelectorAll(selector));
      if (items.length === 0) return;

      let handled = false;

      if ((orientation === 'vertical' || orientation === 'both') && 
          (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        handled = true;
        
        if (e.key === 'ArrowDown') {
          currentIndex = loop 
            ? (currentIndex + 1) % items.length 
            : Math.min(currentIndex + 1, items.length - 1);
        } else {
          currentIndex = loop 
            ? (currentIndex - 1 + items.length) % items.length 
            : Math.max(currentIndex - 1, 0);
        }
      }

      if ((orientation === 'horizontal' || orientation === 'both') && 
          (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handled = true;
        
        if (e.key === 'ArrowRight') {
          currentIndex = loop 
            ? (currentIndex + 1) % items.length 
            : Math.min(currentIndex + 1, items.length - 1);
        } else {
          currentIndex = loop 
            ? (currentIndex - 1 + items.length) % items.length 
            : Math.max(currentIndex - 1, 0);
        }
      }

      if (e.key === 'Home') {
        e.preventDefault();
        handled = true;
        currentIndex = 0;
      }

      if (e.key === 'End') {
        e.preventDefault();
        handled = true;
        currentIndex = items.length - 1;
      }

      if (handled) {
        updateTabIndex();
        items[currentIndex]?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    updateTabIndex();

    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, selector, orientation, loop]);
};

export default useKeyboardShortcut;
