import React from 'react';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 */
const SkipLinks = () => {
  const handleSkipClick = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Remove tabindex after blur to restore natural tab order
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        onClick={(e) => handleSkipClick(e, 'main-content')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        onClick={(e) => handleSkipClick(e, 'navigation')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to navigation
      </a>
      <a
        href="#search"
        onClick={(e) => handleSkipClick(e, 'search')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to search
      </a>
    </div>
  );
};

export default SkipLinks;
