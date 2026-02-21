/**
 * Tests for preferences API
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupApiStore } from './testUtils';
import { preferencesApi } from './preferencesApi';

describe('preferencesApi', () => {
  let storeRef;

  beforeEach(() => {
    storeRef = setupApiStore(preferencesApi);
  });

  describe('getPreferences', () => {
    it('should fetch user preferences', async () => {
      const mockPreferences = {
        dashboard: { widgets: [], layout: [] },
        tableColumns: {},
        filters: {},
        quickAccess: [],
        recentRoutes: [],
        favorites: [],
        language: 'en',
        timezone: 'UTC',
      };

      // Mock the API response
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockPreferences }),
        })
      );

      const result = await storeRef.store.dispatch(
        preferencesApi.endpoints.getPreferences.initiate()
      );

      expect(result.data).toEqual(mockPreferences);
    });

    it('should handle unwrapped response', async () => {
      const mockPreferences = {
        dashboard: { widgets: [], layout: [] },
        tableColumns: {},
        filters: {},
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPreferences),
        })
      );

      const result = await storeRef.store.dispatch(
        preferencesApi.endpoints.getPreferences.initiate()
      );

      expect(result.data).toEqual(mockPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const preferences = {
        dashboard: { widgets: [{ id: '1' }], layout: [] },
        tableColumns: { users: ['name', 'email'] },
        filters: {},
      };

      const mockResponse = { data: preferences };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await storeRef.store.dispatch(
        preferencesApi.endpoints.updatePreferences.initiate(preferences)
      );

      expect(result.data).toEqual(preferences);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/preferences'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(preferences),
        })
      );
    });
  });

  describe('resetPreferences', () => {
    it('should reset user preferences', async () => {
      const mockResponse = {
        success: true,
        message: 'Preferences reset to defaults',
      };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await storeRef.store.dispatch(
        preferencesApi.endpoints.resetPreferences.initiate()
      );

      expect(result.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/preferences/reset'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});
