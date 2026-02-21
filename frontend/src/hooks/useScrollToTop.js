import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top when route changes
 * @param {Object} options - Configuration options
 * @param {string} options.behavior - Scroll behavior ('smooth' or 'auto')
 * @param {number} options.delay - Delay before scrolling (in ms)
 * @param {string} options.selector - CSS selector for the element to scroll (defaults to main content)
 */
const useScrollToTop = (options = {}) => {
  const location = useLocation();
  const {
    behavior = 'smooth',
    delay = 0,
    selector = 'main'
  } = options;

  useEffect(() => {
    const scrollToTop = () => {
      // Find the main content area or use the specified selector
      const element = document.querySelector(selector);
      
      if (element) {
        // Scroll the specific element to top
        element.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
      } else {
        // Fallback: scroll the window
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [location.pathname, behavior, delay, selector]);
};

export default useScrollToTop;