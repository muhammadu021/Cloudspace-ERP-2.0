/**
 * Widget Registry
 * 
 * Central registry for available dashboard widgets.
 * Provides widget metadata, default configurations, and factory functions.
 * Requirements: 3.5, 8.2, 8.4, 8.5
 */

import MetricCard from './MetricCard';
import ChartWidget from './ChartWidget';
import ListWidget from './ListWidget';
import QuickActionWidget from './QuickActionWidget';
import { VALID_WIDGET_TYPES } from '../../utils/widgetValidation';

/**
 * Widget type definitions
 */
export const WIDGET_TYPES = {
  METRIC: 'metric',
  CHART: 'chart',
  LIST: 'list',
  QUICK_ACTION: 'quick-action',
};

/**
 * Widget size definitions
 */
export const WIDGET_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

/**
 * Widget registry with metadata and factory functions
 */
export const WIDGET_REGISTRY = {
  [WIDGET_TYPES.METRIC]: {
    type: WIDGET_TYPES.METRIC,
    name: 'Metric Card',
    description: 'Display a single KPI with trend indicator',
    icon: 'TrendingUp',
    defaultSize: WIDGET_SIZES.SMALL,
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultConfig: {
      title: 'Metric',
      value: 0,
      label: 'Total',
      trend: 0,
      format: 'number',
    },
    factory: (config) => (
      <MetricCard
        value={config.value}
        label={config.label}
        trend={config.trend}
        format={config.format}
      />
    ),
  },
  
  [WIDGET_TYPES.CHART]: {
    type: WIDGET_TYPES.CHART,
    name: 'Chart Widget',
    description: 'Display data visualization (line, bar, pie, donut)',
    icon: 'BarChart',
    defaultSize: WIDGET_SIZES.MEDIUM,
    allowedSizes: [WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultConfig: {
      title: 'Chart',
      chartType: 'line',
      data: [],
      xKey: 'name',
      yKey: 'value',
    },
    factory: (config) => (
      <ChartWidget
        title={config.title}
        chartType={config.chartType}
        data={config.data}
        xKey={config.xKey}
        yKey={config.yKey}
      />
    ),
  },
  
  [WIDGET_TYPES.LIST]: {
    type: WIDGET_TYPES.LIST,
    name: 'List Widget',
    description: 'Display recent items or activity feed',
    icon: 'List',
    defaultSize: WIDGET_SIZES.MEDIUM,
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM, WIDGET_SIZES.LARGE],
    defaultConfig: {
      title: 'Recent Items',
      items: [],
      maxItems: 5,
      showTimestamp: true,
    },
    factory: (config) => (
      <ListWidget
        title={config.title}
        items={config.items}
        maxItems={config.maxItems}
        showTimestamp={config.showTimestamp}
      />
    ),
  },
  
  [WIDGET_TYPES.QUICK_ACTION]: {
    type: WIDGET_TYPES.QUICK_ACTION,
    name: 'Quick Actions',
    description: 'Buttons for common actions',
    icon: 'Zap',
    defaultSize: WIDGET_SIZES.SMALL,
    allowedSizes: [WIDGET_SIZES.SMALL, WIDGET_SIZES.MEDIUM],
    defaultConfig: {
      title: 'Quick Actions',
      actions: [],
    },
    factory: (config) => (
      <QuickActionWidget
        title={config.title}
        actions={config.actions}
      />
    ),
  },
};

/**
 * Get widget metadata by type
 * @param {string} type - Widget type
 * @returns {object} Widget metadata
 */
export const getWidgetMetadata = (type) => {
  return WIDGET_REGISTRY[type] || null;
};

/**
 * Get all available widget types
 * @returns {array} Array of widget metadata
 */
export const getAvailableWidgets = () => {
  return Object.values(WIDGET_REGISTRY);
};

/**
 * Create widget instance from configuration
 * @param {object} config - Widget configuration
 * @returns {object} Widget instance
 */
export const createWidget = (config) => {
  const metadata = getWidgetMetadata(config.type);
  
  if (!metadata) {
    console.error(`Unknown widget type: ${config.type}`);
    return null;
  }

  return {
    id: config.id || `widget-${Date.now()}`,
    type: config.type,
    title: config.title || metadata.name,
    size: config.size || metadata.defaultSize,
    visible: config.visible !== undefined ? config.visible : true,
    config: { ...metadata.defaultConfig, ...config.config },
    component: metadata.factory({ ...metadata.defaultConfig, ...config.config }),
  };
};

/**
 * Validate widget configuration
 * @param {object} config - Widget configuration
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export const validateWidget = (config) => {
  const errors = [];

  if (!config.id) {
    errors.push('Widget ID is required');
  }

  if (!config.type) {
    errors.push('Widget type is required');
  }

  const metadata = getWidgetMetadata(config.type);
  if (!metadata) {
    errors.push(`Invalid widget type: ${config.type}`);
  } else {
    if (config.size && !metadata.allowedSizes.includes(config.size)) {
      errors.push(`Invalid size for widget type ${config.type}: ${config.size}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get default widget configuration by type
 * @param {string} type - Widget type
 * @returns {object} Default configuration
 */
export const getDefaultWidgetConfig = (type) => {
  const metadata = getWidgetMetadata(type);
  
  if (!metadata) {
    return null;
  }

  return {
    id: `widget-${type}-${Date.now()}`,
    type,
    title: metadata.name,
    size: metadata.defaultSize,
    visible: true,
    config: { ...metadata.defaultConfig },
  };
};

/**
 * Validate widget type against VALID_WIDGET_TYPES
 * Requirements: 3.5, 8.2
 * @param {string} widgetType - Widget type to validate
 * @returns {object} Validation result { valid: boolean, error: string }
 */
export const validateWidgetType = (widgetType) => {
  if (!widgetType) {
    return { valid: false, error: 'Widget type is required' };
  }

  if (typeof widgetType !== 'string') {
    return { valid: false, error: 'Widget type must be a string' };
  }

  if (!VALID_WIDGET_TYPES.includes(widgetType)) {
    return { 
      valid: false, 
      error: `Invalid widget type: ${widgetType}. Must be one of: ${VALID_WIDGET_TYPES.join(', ')}` 
    };
  }

  if (!WIDGET_REGISTRY[widgetType]) {
    return { 
      valid: false, 
      error: `Widget type ${widgetType} is not registered in the widget registry` 
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate widget interface (required properties and methods)
 * Requirements: 8.4, 8.5
 * @param {object} widgetDefinition - Widget definition object
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
export const validateWidgetInterface = (widgetDefinition) => {
  const errors = [];

  if (!widgetDefinition || typeof widgetDefinition !== 'object') {
    return { valid: false, errors: ['Widget definition must be an object'] };
  }

  // Required properties
  const requiredProps = ['type', 'name', 'description', 'defaultSize', 'allowedSizes', 'defaultConfig', 'factory'];
  
  for (const prop of requiredProps) {
    if (!(prop in widgetDefinition)) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Validate type
  if (widgetDefinition.type) {
    if (typeof widgetDefinition.type !== 'string') {
      errors.push('Widget type must be a string');
    }
  }

  // Validate name
  if (widgetDefinition.name && typeof widgetDefinition.name !== 'string') {
    errors.push('Widget name must be a string');
  }

  // Validate description
  if (widgetDefinition.description && typeof widgetDefinition.description !== 'string') {
    errors.push('Widget description must be a string');
  }

  // Validate defaultSize
  if (widgetDefinition.defaultSize) {
    const validSizes = Object.values(WIDGET_SIZES);
    if (!validSizes.includes(widgetDefinition.defaultSize)) {
      errors.push(`Invalid defaultSize: ${widgetDefinition.defaultSize}. Must be one of: ${validSizes.join(', ')}`);
    }
  }

  // Validate allowedSizes
  if (widgetDefinition.allowedSizes) {
    if (!Array.isArray(widgetDefinition.allowedSizes)) {
      errors.push('allowedSizes must be an array');
    } else {
      const validSizes = Object.values(WIDGET_SIZES);
      for (const size of widgetDefinition.allowedSizes) {
        if (!validSizes.includes(size)) {
          errors.push(`Invalid size in allowedSizes: ${size}`);
        }
      }
    }
  }

  // Validate defaultConfig
  if (widgetDefinition.defaultConfig && typeof widgetDefinition.defaultConfig !== 'object') {
    errors.push('defaultConfig must be an object');
  }

  // Validate factory function
  if (widgetDefinition.factory) {
    if (typeof widgetDefinition.factory !== 'function') {
      errors.push('factory must be a function');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Register a new widget in the registry with validation
 * Requirements: 8.2, 8.4, 8.5
 * @param {string} widgetType - Widget type identifier
 * @param {object} widgetDefinition - Widget definition object
 * @returns {object} Registration result { success: boolean, error: string }
 */
export const registerWidget = (widgetType, widgetDefinition) => {
  // Validate widget type
  const typeValidation = validateWidgetType(widgetType);
  if (!typeValidation.valid) {
    // For new widgets, we only check if it's a valid type string format
    if (!widgetType || typeof widgetType !== 'string') {
      return { 
        success: false, 
        error: typeValidation.error 
      };
    }
  }

  // Check if widget already exists
  if (WIDGET_REGISTRY[widgetType]) {
    return { 
      success: false, 
      error: `Widget type ${widgetType} is already registered` 
    };
  }

  // Validate widget interface
  const interfaceValidation = validateWidgetInterface(widgetDefinition);
  if (!interfaceValidation.valid) {
    return { 
      success: false, 
      error: `Widget interface validation failed: ${interfaceValidation.errors.join(', ')}` 
    };
  }

  // Ensure the type in definition matches the registration type
  if (widgetDefinition.type !== widgetType) {
    return { 
      success: false, 
      error: `Widget definition type (${widgetDefinition.type}) does not match registration type (${widgetType})` 
    };
  }

  // Register the widget
  try {
    WIDGET_REGISTRY[widgetType] = widgetDefinition;
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to register widget: ${error.message}` 
    };
  }
};
