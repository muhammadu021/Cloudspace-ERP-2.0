/**
 * Accessibility utilities for keyboard navigation and focus management
 */

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - The container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export const getFocusableElements = (container) => {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
};

/**
 * Trap focus within a container (for modals, dialogs, etc.)
 * @param {HTMLElement} container - The container element
 * @returns {Function} Cleanup function to remove event listeners
 */
export const trapFocus = (container) => {
  if (!container) return () => {};

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return () => {};

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

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Restore focus to a previously focused element
 * @param {HTMLElement} element - The element to restore focus to
 */
export const restoreFocus = (element) => {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
};

/**
 * Get the next focusable element in the DOM
 * @param {HTMLElement} currentElement - The current focused element
 * @param {HTMLElement} container - Optional container to limit search
 * @returns {HTMLElement|null} The next focusable element
 */
export const getNextFocusableElement = (currentElement, container = document.body) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return focusableElements[0] || null;
  
  return focusableElements[currentIndex + 1] || focusableElements[0];
};

/**
 * Get the previous focusable element in the DOM
 * @param {HTMLElement} currentElement - The current focused element
 * @param {HTMLElement} container - Optional container to limit search
 * @returns {HTMLElement|null} The previous focusable element
 */
export const getPreviousFocusableElement = (currentElement, container = document.body) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);
  
  if (currentIndex === -1) return focusableElements[focusableElements.length - 1] || null;
  
  return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
};

/**
 * Check if an element is visible and not hidden
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} True if element is visible
 */
export const isElementVisible = (element) => {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
};

/**
 * Announce message to screen readers
 * @param {string} message - The message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Create a skip link for keyboard navigation
 * @param {string} targetId - The ID of the target element
 * @param {string} label - The label for the skip link
 * @returns {HTMLElement} The skip link element
 */
export const createSkipLink = (targetId, label = 'Skip to main content') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  });

  return skipLink;
};

/**
 * Ensure logical focus order by checking tabindex values
 * @param {HTMLElement} container - The container to check
 * @returns {Object} Report of focus order issues
 */
export const checkFocusOrder = (container = document.body) => {
  const focusableElements = getFocusableElements(container);
  const issues = [];

  focusableElements.forEach((element, index) => {
    const tabindex = parseInt(element.getAttribute('tabindex') || '0', 10);
    
    // Check for positive tabindex (anti-pattern)
    if (tabindex > 0) {
      issues.push({
        element,
        issue: 'positive-tabindex',
        message: `Element has positive tabindex (${tabindex}), which can disrupt natural focus order`,
      });
    }

    // Check if element is visible
    if (!isElementVisible(element)) {
      issues.push({
        element,
        issue: 'hidden-focusable',
        message: 'Element is focusable but not visible',
      });
    }
  });

  return {
    totalFocusable: focusableElements.length,
    issues,
    hasIssues: issues.length > 0,
  };
};

/**
 * Add keyboard navigation to a list of items
 * @param {HTMLElement} container - The container element
 * @param {Object} options - Configuration options
 */
export const addListKeyboardNavigation = (container, options = {}) => {
  const {
    itemSelector = '[role="listitem"], li',
    orientation = 'vertical',
    loop = true,
    onSelect = null,
  } = options;

  if (!container) return () => {};

  let currentIndex = 0;

  const updateFocus = () => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    });
    items[currentIndex]?.focus();
  };

  const handleKeyDown = (e) => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    if (items.length === 0) return;

    let handled = false;

    // Vertical navigation
    if (orientation === 'vertical' || orientation === 'both') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handled = true;
        currentIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handled = true;
        currentIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
      }
    }

    // Horizontal navigation
    if (orientation === 'horizontal' || orientation === 'both') {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handled = true;
        currentIndex = loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handled = true;
        currentIndex = loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
      }
    }

    // Home/End keys
    if (e.key === 'Home') {
      e.preventDefault();
      handled = true;
      currentIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      handled = true;
      currentIndex = items.length - 1;
    }

    // Enter/Space to select
    if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
      e.preventDefault();
      onSelect(items[currentIndex], currentIndex);
    }

    if (handled) {
      updateFocus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  updateFocus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
};

export default {
  getFocusableElements,
  trapFocus,
  restoreFocus,
  getNextFocusableElement,
  getPreviousFocusableElement,
  isElementVisible,
  announceToScreenReader,
  createSkipLink,
  checkFocusOrder,
  addListKeyboardNavigation,
};
