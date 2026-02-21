/**
 * Widget Registry Tests
 * Tests for widget registration and validation
 * Requirements: 3.5, 8.2, 8.4, 8.5
 */

import { 
  validateWidgetType, 
  validateWidgetInterface, 
  registerWidget,
  WIDGET_TYPES,
  WIDGET_SIZES,
  WIDGET_REGISTRY
} from './widgetRegistry';

describe('Widget Registry Validation', () => {
  describe('validateWidgetType', () => {
    it('should validate existing widget types', () => {
      const result = validateWidgetType(WIDGET_TYPES.METRIC);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid widget types', () => {
      const result = validateWidgetType('invalid-type');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid widget type');
    });

    it('should reject missing widget type', () => {
      const result = validateWidgetType(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject non-string widget type', () => {
      const result = validateWidgetType(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('validateWidgetInterface', () => {
    const validWidgetDefinition = {
      type: 'test-widget',
      name: 'Test Widget',
      description: 'A test widget',
      icon: 'Test',
      defaultSize: WIDGET_SIZES.MEDIUM,
      allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
      defaultConfig: { title: 'Test' },
      factory: (config) => null
    };

    it('should validate a complete widget definition', () => {
      const result = validateWidgetInterface(validWidgetDefinition);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject widget definition missing required properties', () => {
      const incomplete = { type: 'test' };
      const result = validateWidgetInterface(incomplete);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Missing required property'))).toBe(true);
    });

    it('should reject widget definition with invalid defaultSize', () => {
      const invalid = { ...validWidgetDefinition, defaultSize: 'invalid-size' };
      const result = validateWidgetInterface(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid defaultSize'))).toBe(true);
    });

    it('should reject widget definition with non-array allowedSizes', () => {
      const invalid = { ...validWidgetDefinition, allowedSizes: 'not-an-array' };
      const result = validateWidgetInterface(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('allowedSizes must be an array'))).toBe(true);
    });

    it('should reject widget definition with non-function factory', () => {
      const invalid = { ...validWidgetDefinition, factory: 'not-a-function' };
      const result = validateWidgetInterface(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('factory must be a function'))).toBe(true);
    });

    it('should reject null widget definition', () => {
      const result = validateWidgetInterface(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Widget definition must be an object');
    });
  });

  describe('registerWidget', () => {
    const validWidgetDefinition = {
      type: 'custom-widget',
      name: 'Custom Widget',
      description: 'A custom widget for testing',
      icon: 'Custom',
      defaultSize: WIDGET_SIZES.MEDIUM,
      allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
      defaultConfig: { title: 'Custom' },
      factory: (config) => null
    };

    // Clean up after each test
    afterEach(() => {
      // Remove test widget if it was registered
      if (WIDGET_REGISTRY['custom-widget']) {
        delete WIDGET_REGISTRY['custom-widget'];
      }
    });

    it('should successfully register a valid widget', () => {
      const result = registerWidget('custom-widget', validWidgetDefinition);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(WIDGET_REGISTRY['custom-widget']).toBeDefined();
    });

    it('should reject registration of already registered widget', () => {
      // Register once
      registerWidget('custom-widget', validWidgetDefinition);
      // Try to register again
      const result = registerWidget('custom-widget', validWidgetDefinition);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });

    it('should reject registration with invalid widget interface', () => {
      const invalid = { type: 'custom-widget', name: 'Test' }; // Missing required properties
      const result = registerWidget('custom-widget', invalid);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Widget interface validation failed');
    });

    it('should reject registration when type mismatch', () => {
      const mismatch = { ...validWidgetDefinition, type: 'different-type' };
      const result = registerWidget('custom-widget', mismatch);
      expect(result.success).toBe(false);
      expect(result.error).toContain('does not match registration type');
    });

    it('should reject registration with null widget type', () => {
      const result = registerWidget(null, validWidgetDefinition);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
