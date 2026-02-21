/**
 * Tests for preference utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  PREFERENCE_CATEGORIES,
  getPreferenceCategoryName,
  getPreferenceCategoryDescription,
  arePreferencesSynced,
  getSyncStatusMessage,
  validatePreferences,
  mergeWithDefaults,
  exportPreferences,
  importPreferences,
} from './preferenceUtils';

describe('preferenceUtils', () => {
  describe('getPreferenceCategoryName', () => {
    it('should return correct display names', () => {
      expect(getPreferenceCategoryName(PREFERENCE_CATEGORIES.ALL)).toBe('All Preferences');
      expect(getPreferenceCategoryName(PREFERENCE_CATEGORIES.DASHBOARD)).toBe('Dashboard Layout');
      expect(getPreferenceCategoryName(PREFERENCE_CATEGORIES.TABLES)).toBe('Table Columns');
    });

    it('should return category as fallback for unknown categories', () => {
      expect(getPreferenceCategoryName('unknown')).toBe('unknown');
    });
  });

  describe('getPreferenceCategoryDescription', () => {
    it('should return correct descriptions', () => {
      expect(getPreferenceCategoryDescription(PREFERENCE_CATEGORIES.ALL)).toContain('Reset all');
      expect(getPreferenceCategoryDescription(PREFERENCE_CATEGORIES.DASHBOARD)).toContain('dashboard');
    });

    it('should return empty string for unknown categories', () => {
      expect(getPreferenceCategoryDescription('unknown')).toBe('');
    });
  });

  describe('arePreferencesSynced', () => {
    it('should return false if timestamps are missing', () => {
      expect(arePreferencesSynced({})).toBe(false);
      expect(arePreferencesSynced({ lastSyncedAt: '2024-01-01' })).toBe(false);
      expect(arePreferencesSynced({ lastUpdatedAt: '2024-01-01' })).toBe(false);
    });

    it('should return true if timestamps are within 5 seconds', () => {
      const now = new Date().toISOString();
      const preferences = {
        lastSyncedAt: now,
        lastUpdatedAt: now,
      };
      expect(arePreferencesSynced(preferences)).toBe(true);
    });

    it('should return false if timestamps differ by more than 5 seconds', () => {
      const preferences = {
        lastSyncedAt: '2024-01-01T10:00:00Z',
        lastUpdatedAt: '2024-01-01T10:00:10Z',
      };
      expect(arePreferencesSynced(preferences)).toBe(false);
    });
  });

  describe('getSyncStatusMessage', () => {
    it('should return "No changes" if no lastUpdatedAt', () => {
      expect(getSyncStatusMessage({})).toBe('No changes');
    });

    it('should return "Synced" if preferences are synced', () => {
      const now = new Date().toISOString();
      const preferences = {
        lastSyncedAt: now,
        lastUpdatedAt: now,
      };
      expect(getSyncStatusMessage(preferences)).toBe('Synced');
    });

    it('should return "Syncing..." if preferences are not synced', () => {
      const preferences = {
        lastSyncedAt: '2024-01-01T10:00:00Z',
        lastUpdatedAt: '2024-01-01T10:00:10Z',
      };
      expect(getSyncStatusMessage(preferences)).toBe('Syncing...');
    });
  });

  describe('validatePreferences', () => {
    const validPreferences = {
      dashboard: {
        widgets: [],
        layout: [],
      },
      tableColumns: {},
      filters: {},
    };

    it('should return true for valid preferences', () => {
      expect(validatePreferences(validPreferences)).toBe(true);
    });

    it('should return false for null or non-object', () => {
      expect(validatePreferences(null)).toBe(false);
      expect(validatePreferences('string')).toBe(false);
      expect(validatePreferences(123)).toBe(false);
    });

    it('should return false if required fields are missing', () => {
      expect(validatePreferences({})).toBe(false);
      expect(validatePreferences({ dashboard: {} })).toBe(false);
    });

    it('should return false if dashboard structure is invalid', () => {
      expect(validatePreferences({
        ...validPreferences,
        dashboard: { widgets: 'not-array' },
      })).toBe(false);

      expect(validatePreferences({
        ...validPreferences,
        dashboard: { widgets: [], layout: 'not-array' },
      })).toBe(false);
    });

    it('should return false if tableColumns is not an object', () => {
      expect(validatePreferences({
        ...validPreferences,
        tableColumns: 'not-object',
      })).toBe(false);
    });

    it('should return false if filters is not an object', () => {
      expect(validatePreferences({
        ...validPreferences,
        filters: 'not-object',
      })).toBe(false);
    });
  });

  describe('mergeWithDefaults', () => {
    const defaults = {
      field1: 'default1',
      field2: 'default2',
      nested: {
        a: 1,
        b: 2,
      },
    };

    it('should merge preferences with defaults', () => {
      const preferences = {
        field1: 'custom1',
      };

      const merged = mergeWithDefaults(preferences, defaults);

      expect(merged.field1).toBe('custom1');
      expect(merged.field2).toBe('default2');
    });

    it('should merge nested objects', () => {
      const preferences = {
        nested: {
          a: 10,
        },
      };

      const merged = mergeWithDefaults(preferences, defaults);

      expect(merged.nested.a).toBe(10);
      expect(merged.nested.b).toBe(2);
    });

    it('should ignore null and undefined values', () => {
      const preferences = {
        field1: null,
        field2: undefined,
      };

      const merged = mergeWithDefaults(preferences, defaults);

      expect(merged.field1).toBe('default1');
      expect(merged.field2).toBe('default2');
    });
  });

  describe('exportPreferences', () => {
    it('should create a download link', () => {
      const preferences = { test: 'data' };
      
      // Mock DOM APIs
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      
      global.URL.createObjectURL = vi.fn(() => 'blob:url');
      global.URL.revokeObjectURL = vi.fn();
      document.createElement = vi.fn(() => mockLink);

      exportPreferences(preferences, 'test.json');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('test.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('importPreferences', () => {
    it('should parse valid JSON file', async () => {
      const validPreferences = {
        dashboard: { widgets: [], layout: [] },
        tableColumns: {},
        filters: {},
      };

      const file = new File(
        [JSON.stringify(validPreferences)],
        'preferences.json',
        { type: 'application/json' }
      );

      const result = await importPreferences(file);

      expect(result).toEqual(validPreferences);
    });

    it('should reject invalid JSON', async () => {
      const file = new File(
        ['invalid json'],
        'preferences.json',
        { type: 'application/json' }
      );

      await expect(importPreferences(file)).rejects.toThrow('Failed to parse');
    });

    it('should reject invalid preference structure', async () => {
      const invalidPreferences = { invalid: 'structure' };

      const file = new File(
        [JSON.stringify(invalidPreferences)],
        'preferences.json',
        { type: 'application/json' }
      );

      await expect(importPreferences(file)).rejects.toThrow('Invalid preference file format');
    });
  });
});
