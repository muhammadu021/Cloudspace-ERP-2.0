/**
 * Service Worker Registration and Management
 * 
 * Handles service worker registration, updates, and lifecycle events.
 * Provides offline support and asset caching for the ERP system.
 */

/**
 * Register the service worker
 * 
 * @param {Object} config - Configuration options
 * @param {Function} config.onSuccess - Callback when registration succeeds
 * @param {Function} config.onUpdate - Callback when an update is available
 * @param {Function} config.onOffline - Callback when app goes offline
 * @param {Function} config.onOnline - Callback when app comes back online
 */
export function register(config = {}) {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return;
  }
  
  // Only register in production or if explicitly enabled
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  
  if (process.env.NODE_ENV !== 'production' && !isLocalhost) {
    return;
  }
  
  window.addEventListener('load', () => {
    const swUrl = `${process.env.BASE_URL || '/'}sw.js`;
    
    if (isLocalhost) {
      // Check if a service worker still exists or not
      checkValidServiceWorker(swUrl, config);
      
      // Log additional info for localhost
      navigator.serviceWorker.ready.then(() => {
        console.log(
          'This web app is being served cache-first by a service worker. ' +
          'To learn more, visit https://cra.link/PWA'
        );
      });
    } else {
      // Register service worker
      registerValidSW(swUrl, config);
    }
  });
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('App is online');
    if (config.onOnline) {
      config.onOnline();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    if (config.onOffline) {
      config.onOffline();
    }
  });
}

/**
 * Register a valid service worker
 */
function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service worker registered:', registration);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content is available; please refresh.');
              
              if (config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');
              
              if (config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

/**
 * Check if service worker is valid
 */
function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

/**
 * Unregister the service worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service worker unregistered');
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
}

/**
 * Update the service worker
 * Forces the waiting service worker to become active
 */
export function update() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.waiting) {
          // Send message to service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload the page when the new service worker takes control
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              window.location.reload();
              refreshing = true;
            }
          });
        }
      })
      .catch((error) => {
        console.error('Error updating service worker:', error);
      });
  }
}

/**
 * Clear all caches
 * Useful for debugging or when user wants to clear cached data
 */
export function clearCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
          console.log('Cache cleared');
        }
      })
      .catch((error) => {
        console.error('Error clearing cache:', error);
      });
  }
  
  // Also clear browser caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
      });
    });
  }
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Check if service worker is supported
 */
export function isSupported() {
  return 'serviceWorker' in navigator;
}

/**
 * Get service worker registration
 */
export async function getRegistration() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready;
  }
  return null;
}

export default {
  register,
  unregister,
  update,
  clearCache,
  isStandalone,
  isSupported,
  getRegistration,
};
