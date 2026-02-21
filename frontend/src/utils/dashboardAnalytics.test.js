/**
 * Dashboard Analytics Tests
 * 
 * Tests for dashboard analytics logging functions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logWidgetError,
  logDashboardView,
  logWidgetRender,
  logQuickAction,
  logDashboardSwitch,
} from './dashboardAnalytics';

describe('dashboardAnalytics', () => {
  let fetchMock;

  beforeEach(() => {
    // Mock fetch
    fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, id: 'test-id' }),
      })
    );
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logWidgetError', () => {
    it('logs widget error with required fields', async () => {
      await logWidgetError({
        widgetId: 'test-widget',
        widgetType: 'metric',
        userRole: 'admin',
        error: 'Test error',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/widget-error',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
      );

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.event_type).toBe('widget_error');
      expect(body.widget_id).toBe('test-widget');
      expect(body.widget_type).toBe('metric');
      expect(body.role).toBe('admin');
      expect(body.error_message).toBe('Test error');
      expect(body.metadata).toBeDefined();
      expect(body.metadata.timestamp).toBeDefined();
    });

    it('includes error stack when provided', async () => {
      await logWidgetError({
        widgetId: 'test-widget',
        widgetType: 'metric',
        userRole: 'admin',
        error: 'Test error',
        stack: 'Error stack trace',
      });

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.error_stack).toBe('Error stack trace');
    });

    it('includes custom metadata', async () => {
      await logWidgetError({
        widgetId: 'test-widget',
        widgetType: 'metric',
        userRole: 'admin',
        error: 'Test error',
        metadata: {
          errorType: 'fetch_error',
          customField: 'custom value',
        },
      });

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.metadata.errorType).toBe('fetch_error');
      expect(body.metadata.customField).toBe('custom value');
    });

    it('handles fetch errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(
        logWidgetError({
          widgetId: 'test-widget',
          widgetType: 'metric',
          userRole: 'admin',
          error: 'Test error',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('logDashboardView', () => {
    it('logs dashboard view with required fields', async () => {
      await logDashboardView({
        role: 'admin',
        dashboardType: 'admin',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/view',
        expect.objectContaining({
          method: 'POST',
        })
      );

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.event_type).toBe('dashboard_view');
      expect(body.role).toBe('admin');
      expect(body.dashboard_type).toBe('admin');
    });
  });

  describe('logWidgetRender', () => {
    it('logs widget render with required fields', async () => {
      await logWidgetRender({
        widgetType: 'chart',
        role: 'finance',
        loadTime: 245,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/widget-render',
        expect.objectContaining({
          method: 'POST',
        })
      );

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.event_type).toBe('widget_render');
      expect(body.widget_type).toBe('chart');
      expect(body.role).toBe('finance');
      expect(body.load_time_ms).toBe(245);
    });
  });

  describe('logQuickAction', () => {
    it('logs quick action with required fields', async () => {
      await logQuickAction({
        actionId: 'add-employee',
        role: 'hr',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/quick-action',
        expect.objectContaining({
          method: 'POST',
        })
      );

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.event_type).toBe('quick_action_click');
      expect(body.action_id).toBe('add-employee');
      expect(body.role).toBe('hr');
    });
  });

  describe('logDashboardSwitch', () => {
    it('logs dashboard switch with required fields', async () => {
      await logDashboardSwitch({
        fromType: 'overview',
        toType: 'hr',
        role: 'system-administrator',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/switch',
        expect.objectContaining({
          method: 'POST',
        })
      );

      const callArgs = fetchMock.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.event_type).toBe('dashboard_switch');
      expect(body.from_dashboard_type).toBe('overview');
      expect(body.to_dashboard_type).toBe('hr');
      expect(body.role).toBe('system-administrator');
    });
  });
});
