/**
 * Dashboard Analytics Utility
 * 
 * Logs dashboard and widget events to backend analytics.
 * Supports error tracking, performance monitoring, and usage analytics.
 * 
 * Requirements: 12.4, 13.1, 13.2, 13.3, 13.4, 13.5
 */

/**
 * Log widget error to backend analytics
 * 
 * @param {Object} params - Error parameters
 * @param {string} params.widgetId - Widget identifier
 * @param {string} params.widgetType - Widget type
 * @param {string} params.userRole - User role
 * @param {string} params.error - Error message
 * @param {string} [params.stack] - Error stack trace (optional)
 * @param {Object} [params.metadata] - Additional metadata (optional)
 */
export async function logWidgetError({ widgetId, widgetType, userRole, error, stack, metadata = {} }) {
  try {
    const payload = {
      event_type: 'widget_error',
      widget_id: widgetId,
      widget_type: widgetType,
      role: userRole,
      error_message: error,
      error_stack: stack,
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...metadata,
      },
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Analytics] Widget Error:', payload);
    }

    // Send to backend analytics endpoint
    const response = await fetch('/api/analytics/dashboard/widget-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      console.warn('Failed to log widget error to analytics:', response.statusText);
    }
  } catch (err) {
    // Silently fail - don't let analytics errors affect the app
    console.warn('Error logging widget error to analytics:', err);
  }
}

/**
 * Log dashboard view event
 * 
 * @param {Object} params - View parameters
 * @param {string} params.role - User role
 * @param {string} params.dashboardType - Dashboard type
 */
export async function logDashboardView({ role, dashboardType }) {
  try {
    const payload = {
      event_type: 'dashboard_view',
      role,
      dashboard_type: dashboardType,
      metadata: {
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics] Dashboard View:', payload);
    }

    await fetch('/api/analytics/dashboard/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Error logging dashboard view:', err);
  }
}

/**
 * Log widget render event
 * 
 * @param {Object} params - Render parameters
 * @param {string} params.widgetType - Widget type
 * @param {string} params.role - User role
 * @param {number} [params.loadTime] - Load time in milliseconds
 */
export async function logWidgetRender({ widgetType, role, loadTime }) {
  try {
    const payload = {
      event_type: 'widget_render',
      widget_type: widgetType,
      role,
      load_time_ms: loadTime,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics] Widget Render:', payload);
    }

    await fetch('/api/analytics/dashboard/widget-render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Error logging widget render:', err);
  }
}

/**
 * Log quick action click event
 * 
 * @param {Object} params - Action parameters
 * @param {string} params.actionId - Action identifier
 * @param {string} params.role - User role
 */
export async function logQuickAction({ actionId, role }) {
  try {
    const payload = {
      event_type: 'quick_action_click',
      action_id: actionId,
      role,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics] Quick Action:', payload);
    }

    await fetch('/api/analytics/dashboard/quick-action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Error logging quick action:', err);
  }
}

/**
 * Log dashboard switch event (System Administrator)
 * 
 * @param {Object} params - Switch parameters
 * @param {string} params.fromType - Source dashboard type
 * @param {string} params.toType - Destination dashboard type
 * @param {string} params.role - User role
 */
export async function logDashboardSwitch({ fromType, toType, role }) {
  try {
    const payload = {
      event_type: 'dashboard_switch',
      from_dashboard_type: fromType,
      to_dashboard_type: toType,
      role,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    if (import.meta.env.DEV) {
      console.log('[Analytics] Dashboard Switch:', payload);
    }

    await fetch('/api/analytics/dashboard/switch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
  } catch (err) {
    console.warn('Error logging dashboard switch:', err);
  }
}

export default {
  logWidgetError,
  logDashboardView,
  logWidgetRender,
  logQuickAction,
  logDashboardSwitch,
};
