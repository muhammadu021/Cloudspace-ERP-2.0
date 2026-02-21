import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls to top when route changes
 * Place this component inside your Router but outside of Routes
 */
const ScrollToTop = ({ 
  behavior = 'smooth', 
  delay = 100,
  selector = 'main'
}) => {
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      // Find the main content area
      const mainElement = document.querySelector(selector);
      
      if (mainElement) {
        // Scroll the main content area to top
        mainElement.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
        
        console.log(`Scrolled to top for route: ${location.pathname}`);
      } else {
        // Fallback: scroll the window
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
        
        console.log(`Window scrolled to top for route: ${location.pathname}`);
      }
    };

    // Small delay to ensure the new content is rendered
    const timeoutId = setTimeout(scrollToTop, delay);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, behavior, delay, selector]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;