import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * Enhanced ScrollToTop component with visual feedback and additional features
 */
const EnhancedScrollToTop = ({ 
  behavior = 'smooth', 
  delay = 100,
  selector = 'main',
  showIndicator = false,
  indicatorThreshold = 300
}) => {
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle route change scroll
  useEffect(() => {
    const scrollToTop = () => {
      setIsScrolling(true);
      
      // Find the main content area
      const mainElement = document.querySelector(selector);
      
      if (mainElement) {
        // Scroll the main content area to top
        mainElement.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
        
        console.log(`📜 Scrolled to top for route: ${location.pathname}`);
      } else {
        // Fallback: scroll the window
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: behavior
        });
        
        console.log(`📜 Window scrolled to top for route: ${location.pathname}`);
      }
      
      // Reset scrolling state after animation
      setTimeout(() => setIsScrolling(false), behavior === 'smooth' ? 500 : 100);
    };

    // Small delay to ensure the new content is rendered
    const timeoutId = setTimeout(scrollToTop, delay);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, behavior, delay, selector]);

  // Handle scroll button visibility
  useEffect(() => {
    if (!showIndicator) return;

    const handleScroll = () => {
      const mainElement = document.querySelector(selector);
      if (mainElement) {
        setShowScrollButton(mainElement.scrollTop > indicatorThreshold);
      }
    };

    const mainElement = document.querySelector(selector);
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [selector, indicatorThreshold, showIndicator]);

  const handleScrollButtonClick = () => {
    const mainElement = document.querySelector(selector);
    if (mainElement) {
      mainElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Scroll indicator (optional) */}
      {isScrolling && (
        <div className="fixed top-4 right-4 z-50 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-pulse">
        
        </div>
      )}
      
      {/* Scroll to top button (optional) */}
      {showIndicator && showScrollButton && (
        <button
          onClick={handleScrollButtonClick}
          className="fixed bottom-6 right-6 z-50 bg-primary-500 hover:bg-primary text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default EnhancedScrollToTop;