/**
 * Service Worker for ERP System
 * 
 * Provides offline support and asset caching for improved performance.
 * 
 * Features:
 * - Cache-first strategy for static assets (JS, CSS, images, fonts)
 * - Network-first strategy for API calls with fallback
 * - Offline page support
 * - Automatic cache cleanup
 * - Version-based cache management
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `erp-cache-${CACHE_VERSION}`;
const API_CACHE_NAME = `erp-api-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
];

// Cache duration in seconds
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60, // 7 days for static assets
  API: 5 * 60, // 5 minutes for API responses
  IMAGES: 30 * 24 * 60 * 60, // 30 days for images
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - handle requests with appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // API requests - network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
    return;
  }
  
  // Static assets - cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }
  
  // HTML pages - network-first with offline fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }
  
  // Default - network-first
  event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 * Good for static assets that don't change often
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if cache is still fresh
      const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time'));
      const now = new Date();
      const age = (now - cacheTime) / 1000; // age in seconds
      
      const maxAge = getMaxAge(request.url);
      
      if (age < maxAge) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      
      // Add cache timestamp
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first strategy failed:', error);
    
    // Try cache as last resort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first strategy
 * Try network first, fall back to cache
 * Good for API calls and dynamic content
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      
      // Add cache timestamp
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      cache.put(request, cachedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving stale data from cache');
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Network-first with offline fallback
 * For HTML pages
 */
async function networkFirstWithOffline(request) {
  try {
    return await networkFirstStrategy(request, CACHE_NAME);
  } catch (error) {
    console.log('[Service Worker] Serving offline page');
    const cache = await caches.open(CACHE_NAME);
    return cache.match(OFFLINE_URL);
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.woff', '.woff2', '.ttf', '.eot', '.ico'
  ];
  
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

/**
 * Get max age for cache based on asset type
 */
function getMaxAge(url) {
  if (url.includes('/api/')) {
    return CACHE_DURATION.API;
  }
  
  if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) {
    return CACHE_DURATION.IMAGES;
  }
  
  return CACHE_DURATION.STATIC;
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
