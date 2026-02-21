/**
 * Mock API Handlers for Dashboard
 * 
 * Intercepts RTK Query API calls and returns mock data
 * Enable/disable by setting VITE_USE_MOCK_DATA=true in .env
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
 * Mock API response wrapper
 */
const createMockResponse = (data, status = 200) => {
  return {
    data,
    status,
    ok: status >= 200 && status < 300,
  };
};

/**
 * Mock error response
 */
const createMockError = (message, status = 500) => {
  return {
    error: {
      status,
      data: { message },
    },
  };
};

/**
 * Dashboard Configuration API Handlers
 */
export const mockDashboardConfigHandlers = {
  /**
   * GET /api/dashboard/config/:role
   */
  getDashboardConfig: async (role) => {
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse(config);
    } catch (error) {
      return createMockError(error.message, 404);
    }
  },

  /**
   * GET /api/dashboard/config/:role/version/:version
   */
  getDashboardConfigVersion: async (role, version) => {
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse({ ...config, version: parseInt(version) });
    } catch (error) {
      return createMockError(error.message, 404);
    }
  },

  /**
   * PUT /api/dashboard/config/:role
   */
  updateDashboardConfig: async (role, configuration) => {
    try {
      const config = await getMockDashboardConfig(role);
      const updated = {
        ...config,
        configuration,
        version: config.version + 1,
        updatedAt: new Date().toISOString(),
      };
      return createMockResponse(updated);
    } catch (error) {
      return createMockError(error.message, 400);
    }
  },

  /**
   * GET /api/dashboard/config/:role/versions
   */
  getConfigVersions: async (role) => {
    try {
      const config = await getMockDashboardConfig(role);
      return createMockResponse({
        versions: [
          { version: 1, createdAt: config.createdAt, isActive: true },
        ],
      });
    } catch (error) {
      return createMockError(error.message, 404);
    }
  },
};

/**
 * Widget Data API Handlers
 */
export const mockWidgetDataHandlers = {
  /**
   * GET /api/dashboard/widgets/:widgetType/data
   */
  getWidgetData: async (widgetType, config = {}) => {
    try {
      const data = await getMockWidgetData(widgetType, config);
      return createMockResponse(data);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },

  /**
   * POST /api/dashboard/widgets/:widgetType/refresh
   */
  refreshWidgetData: async (widgetType, config = {}) => {
    try {
      const data = await getMockWidgetData(widgetType, config);
      return createMockResponse({
        ...data,
        refreshedAt: new Date().toISOString(),
      });
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },
};

/**
 * User Preferences API Handlers
 */
export const mockPreferencesHandlers = {
  /**
   * GET /api/users/:userId/preferences/dashboard
   */
  getDashboardPreferences: async (userId) => {
    try {
      const preferences = await getMockUserPreferences(userId);
      return createMockResponse(preferences);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },

  /**
   * PUT /api/users/:userId/preferences/dashboard
   */
  updateDashboardPreferences: async (userId, preferences) => {
    try {
      const updated = await updateMockUserPreferences(userId, preferences);
      return createMockResponse(updated);
    } catch (error) {
      return createMockError(error.message, 400);
    }
  },
};

/**
 * Analytics API Handlers
 */
export const mockAnalyticsHandlers = {
  /**
   * POST /api/analytics/dashboard/view
   */
  logDashboardView: async (event) => {
    try {
      const logged = await logMockAnalyticsEvent({
        eventType: 'dashboard-view',
        ...event,
      });
      return createMockResponse(logged);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },

  /**
   * POST /api/analytics/dashboard/widget-render
   */
  logWidgetRender: async (event) => {
    try {
      const logged = await logMockAnalyticsEvent({
        eventType: 'widget-render',
        ...event,
      });
      return createMockResponse(logged);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },

  /**
   * POST /api/analytics/dashboard/quick-action
   */
  logQuickAction: async (event) => {
    try {
      const logged = await logMockAnalyticsEvent({
        eventType: 'quick-action',
        ...event,
      });
      return createMockResponse(logged);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },

  /**
   * POST /api/analytics/dashboard/widget-error
   */
  logWidgetError: async (event) => {
    try {
      const logged = await logMockAnalyticsEvent({
        eventType: 'widget-error',
        ...event,
      });
      return createMockResponse(logged);
    } catch (error) {
      return createMockError(error.message, 500);
    }
  },
};

/**
 * Export all handlers
 */
export const mockHandlers = {
  ...mockDashboardConfigHandlers,
  ...mockWidgetDataHandlers,
  ...mockPreferencesHandlers,
  ...mockAnalyticsHandlers,
};

export default mockHandlers;
