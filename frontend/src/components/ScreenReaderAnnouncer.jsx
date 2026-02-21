import React, { useEffect, useRef } from 'react';

/**
 * Screen Reader Announcer Component
 * Provides ARIA live regions for dynamic content announcements
 */
const ScreenReaderAnnouncer = ({ message, priority = 'polite', clearAfter = 1000 }) => {
  const announcerRef = useRef(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      announcerRef.current.textContent = message;

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          if (announcerRef.current) {
            announcerRef.current.textContent = '';
          }
        }, clearAfter);

        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
};

/**
 * Hook for announcing messages to screen readers
 */
export const useScreenReaderAnnounce = () => {
  const announce = (message, priority = 'polite') => {
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

  return { announce };
};

export default ScreenReaderAnnouncer;
