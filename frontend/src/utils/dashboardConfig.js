/**
 * Dashboard Configuration Utilities
 * Helper functions for working with dashboard configurations
 * Requirements: 3.1, 3.2, 3.3
 */

import { WIDGET_TYPES, WIDGET_CONSTRAINTS } from '../constants/dashboardConstants';

/**
 * Validate widget configuration
 * @param {object} widget - Widget configuration object
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export function validateWidget(widget) {
  const errors = [];
  
  // Check required fields
  if (!widget.id) errors.push('Widget ID is required');
  if (!widget.type) errors.push('Widget type is required');
  if (!widget.title) errors.push('Widget title is required');
  if (!widget.position) errors.push('Widget position is required');
  
  // Validate widget type
  const validTypes = Object.values(WIDGET_TYPES);
  if (widget.type && !validTypes.includes(widget.type)) {
    errors.push(`Invalid widget type: ${widget.type}`);
  }
  
  // Validate position
  if (widget.position) {
    const { x, y, w, h } = widget.position;
    
    if (typeof x !== 'number' || x < WIDGET_CONSTRAINTS.MIN_X || x > WIDGET_CONSTRAINTS.MAX_X) {
      errors.push(`Invalid x position: ${x} (must be between ${WIDGET_CONSTRAINTS.MIN_X} and ${WIDGET_CONSTRAINTS.MAX_X})`);
    }
    
    if (typeof y !== 'number' || y < 0) {
      errors.push(`Invalid y position: ${y} (must be >= 0)`);
    }
    
    if (typeof w !== 'number' || w < WIDGET_CONSTRAINTS.MIN_WIDTH || w > WIDGET_CONSTRAINTS.MAX_WIDTH) {
      errors.push(`Invalid width: ${w} (must be between ${WIDGET_CONSTRAINTS.MIN_WIDTH} and ${WIDGET_CONSTRAINTS.MAX_WIDTH})`);
    }
    
    if (typeof h !== 'number' || h < WIDGET_CONSTRAINTS.MIN_HEIGHT) {
      errors.push(`Invalid height: ${h} (must be >= ${WIDGET_CONSTRAINTS.MIN_HEIGHT})`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate dashboard configuration
 * @param {object} config - Dashboard configuration object
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export function validateDashboardConfig(config) {
  const errors = [];
  
  // Check required fields
  if (!config) {
    return { valid: false, errors: ['Configuration is required'] };
  }
  
  if (!config.widgets || !Array.isArray(config.widgets)) {
    errors.push('Widgets array is required');
  } else if (config.widgets.length === 0) {
    errors.push('At least one widget is required');
  } else {
    // Validate each widget
    config.widgets.forEach((widget, index) => {
      const validation = validateWidget(widget);
      if (!validation.valid) {
        errors.push(`Widget ${index}: ${validation.errors.join(', ')}`);
      }
    });
    
    // Check for duplicate widget IDs
    const widgetIds = config.widgets.map(w => w.id);
    const duplicates = widgetIds.filter((id, index) => widgetIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate widget IDs: ${duplicates.join(', ')}`);
    }
  }
  
  if (!config.quickActions || !Array.isArray(config.quickActions)) {
    errors.push('Quick actions array is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sort widgets by position (top to bottom, left to right)
 * @param {array} widgets - Array of widget objects
 * @returns {array} Sorted widgets
 */
export function sortWidgetsByPosition(widgets) {
  return [...widgets].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });
}

/**
 * Check if two widgets overlap
 * @param {object} widget1 - First widget
 * @param {object} widget2 - Second widget
 * @returns {boolean} True if widgets overlap
 */
export function widgetsOverlap(widget1, widget2) {
  const w1 = widget1.position;
  const w2 = widget2.position;
  
  const xOverlap = w1.x < w2.x + w2.w && w1.x + w1.w > w2.x;
  const yOverlap = w1.y < w2.y + w2.h && w1.y + w1.h > w2.y;
  
  return xOverlap && yOverlap;
}

/**
 * Find overlapping widgets in configuration
 * @param {array} widgets - Array of widget objects
 * @returns {array} Array of overlapping widget pairs
 */
export function findOverlappingWidgets(widgets) {
  const overlaps = [];
  
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (widgetsOverlap(widgets[i], widgets[j])) {
        overlaps.push([widgets[i].id, widgets[j].id]);
      }
    }
  }
  
  return overlaps;
}

/**
 * Get widgets by type
 * @param {array} widgets - Array of widget objects
 * @param {string} type - Widget type
 * @returns {array} Filtered widgets
 */
export function getWidgetsByType(widgets, type) {
  return widgets.filter(w => w.type === type);
}

/**
 * Calculate dashboard height
 * @param {array} widgets - Array of widget objects
 * @returns {number} Maximum y + h value
 */
export function calculateDashboardHeight(widgets) {
  if (!widgets || widgets.length === 0) return 0;
  
  return Math.max(...widgets.map(w => w.position.y + w.position.h));
}

/**
 * Convert layout to grid format for react-grid-layout
 * @param {array} widgets - Array of widget objects
 * @returns {array} Grid layout array
 */
export function convertToGridLayout(widgets) {
  return widgets.map(widget => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.position.w,
    h: widget.position.h,
    static: true // Make widgets non-draggable by default
  }));
}

/**
 * Merge default config with custom config
 * @param {object} defaultConfig - Default configuration
 * @param {object} customConfig - Custom configuration
 * @returns {object} Merged configuration
 */
export function mergeConfigs(defaultConfig, customConfig) {
  if (!customConfig) return defaultConfig;
  
  return {
    ...defaultConfig,
    ...customConfig,
    widgets: customConfig.widgets || defaultConfig.widgets,
    quickActions: customConfig.quickActions || defaultConfig.quickActions
  };
}
