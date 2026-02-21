/**
 * Mock API Interceptor
 * 
 * Intercepts fetch requests and returns mock data when VITE_USE_MOCK_DATA=true
 * Works seamlessly with RTK Query without modifying API definitions
 */

import {
  getMockDashboardConfig,
  getMockWidgetData,
  getMockUserPreferences,
  updateMockUserPreferences,
  logMockAnalyticsEvent,
} from './dashboardMockData';

/**
 * Check if mock data is enabled
 */
export const isMockDataEnabled = () => {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
};

/**
 * Parse URL to extract parameters
 */
const parseUrl = (url) => {
  const urlObj = new URL(url, window.location.origin);
  let pathname = urlObj.pathname;
  
  // Normalize pathname - remove /cleardesk prefix if present
  pathname = pathname.replace('/cleardesk/api/v1', '/api');
  pathname = pathname.replace('/api/v1', '/api');
  
  const searchParams = Object.fromEntries(urlObj.searchParams);
  
  return { pathname, searchParams };
};

/**
 * Create mock Response object
 */
const createMockResponse = (data, status = 200) => {
  const response = new Response(JSON.stringify({ data }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return Promise.resolve(response);
};

/**
 * Create mock error Response
 */
const createMockErrorResponse = (message, status = 500) => {
  const response = new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return Promise.resolve(response);
};

/**
 * Handle dashboard configuration requests
 */
const handleDashboardConfigRequest = async (pathname, method) => {
  // GET /api/dashboard/config/:role
  const configMatch = pathname.match(/\/api\/dashboard\/config\/([^\/]+)$/);
  if (configMatch && method === 'GET') {
    const role = configMatch[1];
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse(config);
    } catch (error) {
      return createMockErrorResponse(error.message, 404);
    }
  }
  
  // GET /api/dashboard/config/:role/version/:version
  const versionMatch = pathname.match(/\/api\/dashboard\/config\/([^\/]+)\/version\/(\d+)$/);
  if (versionMatch && method === 'GET') {
    const [, role, version] = versionMatch;
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse({ ...config, version: parseInt(version) });
    } catch (error) {
      return createMockErrorResponse(error.message, 404);
    }
  }
  
  // PUT /api/dashboard/config/:role
  if (configMatch && method === 'PUT') {
    const role = configMatch[1];
    try {
      const config = await getMockDashboardConfig(role);
      const updated = {
        ...config,
        version: config.version + 1,
        updatedAt: new Date().toISOString(),
      };
      return createMockResponse(updated);
    } catch (error) {
      return createMockErrorResponse(error.message, 400);
    }
  }
  
  // GET /api/dashboard/config/:role/versions
  const versionsMatch = pathname.match(/\/api\/dashboard\/config\/([^\/]+)\/versions$/);
  if (versionsMatch && method === 'GET') {
    const role = versionsMatch[1];
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse({
        versions: [
          { version: 1, createdAt: config.createdAt, isActive: true },
        ],
      });
    } catch (error) {
      return createMockErrorResponse(error.message, 404);
    }
  }
  
  return null;
};

/**
 * Handle widget data requests
 */
const handleWidgetDataRequest = async (pathname, method, body) => {
  // GET /api/dashboard/widgets/:widgetType/data
  const dataMatch = pathname.match(/\/api\/dashboard\/widgets\/([^\/]+)\/data$/);
  if (dataMatch && method === 'GET') {
    const widgetType = dataMatch[1];
    try {
      const config = body ? JSON.parse(body) : {};
      const data = await getMockWidgetData(widgetType, config);
      return createMockResponse(data);
    } catch (error) {
      return createMockErrorResponse(error.message, 500);
    }
  }
  
  // POST /api/dashboard/widgets/:widgetType/refresh
  const refreshMatch = pathname.match(/\/api\/dashboard\/widgets\/([^\/]+)\/refresh$/);
  if (refreshMatch && method === 'POST') {
    const widgetType = refreshMatch[1];
    try {
      const config = body ? JSON.parse(body) : {};
      const data = await getMockWidgetData(widgetType, config);
      return createMockResponse({
        ...data,
        refreshedAt: new Date().toISOString(),
      });
    } catch (error) {
      return createMockErrorResponse(error.message, 500);
    }
  }
  
  return null;
};

/**
 * Handle user preferences requests
 */
const handlePreferencesRequest = async (pathname, method, body) => {
  // GET /api/users/:userId/preferences/dashboard
  const getMatch = pathname.match(/\/api\/users\/([^\/]+)\/preferences\/dashboard$/);
  if (getMatch && method === 'GET') {
    const userId = getMatch[1];
    try {
      const preferences = await getMockUserPreferences(userId);
      return createMockResponse(preferences);
    } catch (error) {
      return createMockErrorResponse(error.message, 500);
    }
  }
  
  // PUT /api/users/:userId/preferences/dashboard
  if (getMatch && method === 'PUT') {
    const userId = getMatch[1];
    try {
      const preferences = body ? JSON.parse(body) : {};
      const updated = await updateMockUserPreferences(userId, preferences);
      return createMockResponse(updated);
    } catch (error) {
      return createMockErrorResponse(error.message, 400);
    }
  }
  
  return null;
};

/**
 * Handle analytics requests
 */
const handleAnalyticsRequest = async (pathname, method, body) => {
  // POST /api/analytics/dashboard/*
  const analyticsMatch = pathname.match(/\/api\/analytics\/dashboard\/([^\/]+)$/);
  if (analyticsMatch && method === 'POST') {
    const eventType = analyticsMatch[1];
    try {
      const event = body ? JSON.parse(body) : {};
      const logged = await logMockAnalyticsEvent({
        eventType,
        ...event,
      });
      return createMockResponse(logged);
    } catch (error) {
      return createMockErrorResponse(error.message, 500);
    }
  }
  
  return null;
};

/**
 * Main mock fetch interceptor
 */
export const mockFetch = async (url, options = {}) => {
  const { pathname } = parseUrl(url);
  const method = options.method || 'GET';
  const body = options.body;
  
  console.log(`🎭 Mock handler processing: ${method} ${pathname}`);
  
  // Try each handler
  let response = await handleDashboardConfigRequest(pathname, method, body);
  if (response) {
    console.log(`✅ Mock handler matched: Dashboard Config`);
    return response;
  }
  
  response = await handleWidgetDataRequest(pathname, method, body);
  if (response) {
    console.log(`✅ Mock handler matched: Widget Data`);
    return response;
  }
  
  response = await handlePreferencesRequest(pathname, method, body);
  if (response) {
    console.log(`✅ Mock handler matched: Preferences`);
    return response;
  }
  
  response = await handleAnalyticsRequest(pathname, method, body);
  if (response) {
    console.log(`✅ Mock handler matched: Analytics`);
    return response;
  }
  
  // If no mock handler matched, return error
  console.warn(`❌ No mock handler for: ${method} ${pathname}`);
  return createMockErrorResponse('Mock endpoint not implemented', 501);
};

/**
 * Install mock fetch interceptor
 */
export const installMockInterceptor = () => {
  if (!isMockDataEnabled()) {
    console.log('Mock data disabled');
    return;
  }
  
  console.log('🎭 Mock API interceptor installed');
  
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = async (url, options) => {
    // Only intercept API calls (check for both /api/ and /cleardesk/api/)
    if (typeof url === 'string' && (url.includes('/api/') || url.includes('/cleardesk/api/'))) {
      console.log(`🎭 Intercepting: ${options?.method || 'GET'} ${url}`);
      return mockFetch(url, options);
    }
    
    // Pass through non-API calls
    return originalFetch(url, options);
  };
};

/**
 * Uninstall mock fetch interceptor (for testing)
 */
export const uninstallMockInterceptor = () => {
  // This would require storing the original fetch reference
  console.log('Mock interceptor uninstalled');
};

export default {
  install: installMockInterceptor,
  uninstall: uninstallMockInterceptor,
  isMockDataEnabled,
};
