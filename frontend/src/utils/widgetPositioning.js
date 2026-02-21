/**
 * Widget Positioning Utilities
 * 
 * Provides functions to calculate and validate widget positions based on type priority.
 * Ensures KPI/metric widgets appear in top rows, charts in middle, and lists at bottom.
 */

/**
 * Widget type priority for vertical ordering
 * Lower numbers appear higher on the dashboard
 */
const WIDGET_TYPE_PRIORITY = {
  metric: 0,    // KPI/metric widgets in top rows (y=0-1)
  chart: 1,     // Chart widgets in middle rows (y=2-4)
  list: 2,      // List/activity widgets in bottom rows (y=5+)
  'quick-action': 2, // Quick actions at bottom with lists
};

/**
 * Y-coordinate ranges for each widget type
 */
const Y_RANGES = {
  metric: { min: 0, max: 1 },
  chart: { min: 2, max: 4 },
  list: { min: 5, max: Infinity },
  'quick-action': { min: 5, max: Infinity },
};

/**
 * Calculate widget position based on type and index
 * 
 * @param {string} type - Widget type (metric, chart, list, quick-action)
 * @param {number} index - Widget index within its type group
 * @param {number} cols - Number of columns in grid (default 12)
 * @param {object} size - Widget size { w, h }
 * @returns {object} Position { x, y, w, h }
 */
export function calculateWidgetPosition(type, index, cols = 12, size = { w: 4, h: 2 }) {
  const range = Y_RANGES[type] || Y_RANGES.list;
  const { w, h } = size;
  
  // Calculate how many widgets fit per row
  const itemsPerRow = Math.floor(cols / w);
  
  // Calculate row and column within the type's range
  const row = Math.floor(index / itemsPerRow);
  const col = (index % itemsPerRow) * w;
  
  // Calculate y position within the type's range
  const y = range.min + (row * h);
  
  return {
    x: col,
    y: y,
    w: w,
    h: h,
  };
}

/**
 * Sort widgets by type priority
 * 
 * @param {Array} widgets - Array of widget configurations
 * @returns {Array} Sorted widgets (metrics first, then charts, then lists)
 */
export function sortWidgetsByType(widgets) {
  return [...widgets].sort((a, b) => {
    const priorityA = WIDGET_TYPE_PRIORITY[a.type] ?? 999;
    const priorityB = WIDGET_TYPE_PRIORITY[b.type] ?? 999;
    return priorityA - priorityB;
  });
}

/**
 * Validate widget position follows type ordering rules
 * 
 * @param {string} type - Widget type
 * @param {number} y - Y coordinate
 * @returns {boolean} True if position is valid for type
 */
export function validateWidgetPosition(type, y) {
  const range = Y_RANGES[type];
  if (!range) return true; // Unknown types are allowed anywhere
  
  return y >= range.min && y <= range.max;
}

/**
 * Auto-position widgets based on type priority
 * Groups widgets by type and positions them in appropriate rows
 * 
 * @param {Array} widgets - Array of widget configurations
 * @param {number} cols - Number of columns in grid (default 12)
 * @returns {Array} Widgets with calculated positions
 */
export function autoPositionWidgets(widgets, cols = 12) {
  // Group widgets by type
  const widgetsByType = {
    metric: [],
    chart: [],
    list: [],
    'quick-action': [],
  };
  
  widgets.forEach(widget => {
    const type = widget.type || 'list';
    if (widgetsByType[type]) {
      widgetsByType[type].push(widget);
    } else {
      widgetsByType.list.push(widget); // Unknown types go to list section
    }
  });
  
  // Position each type group
  const positioned = [];
  
  // Metrics in top rows (y=0-1)
  widgetsByType.metric.forEach((widget, index) => {
    const size = widget.position || { w: 3, h: 2 };
    positioned.push({
      ...widget,
      position: calculateWidgetPosition('metric', index, cols, size),
    });
  });
  
  // Charts in middle rows (y=2-4)
  widgetsByType.chart.forEach((widget, index) => {
    const size = widget.position || { w: 6, h: 4 };
    positioned.push({
      ...widget,
      position: calculateWidgetPosition('chart', index, cols, size),
    });
  });
  
  // Lists in bottom rows (y=5+)
  widgetsByType.list.forEach((widget, index) => {
    const size = widget.position || { w: 6, h: 3 };
    positioned.push({
      ...widget,
      position: calculateWidgetPosition('list', index, cols, size),
    });
  });
  
  // Quick actions in bottom rows (y=5+)
  widgetsByType['quick-action'].forEach((widget, index) => {
    const size = widget.position || { w: 6, h: 3 };
    const offset = widgetsByType.list.length; // Place after lists
    positioned.push({
      ...widget,
      position: calculateWidgetPosition('quick-action', index + offset, cols, size),
    });
  });
  
  return positioned;
}

/**
 * Get responsive position for different breakpoints
 * 
 * @param {object} position - Base position { x, y, w, h }
 * @param {string} breakpoint - Breakpoint (lg, md, sm)
 * @param {string} widgetType - Widget type for priority ordering
 * @returns {object} Adjusted position for breakpoint
 */
export function getResponsivePosition(position, breakpoint, widgetType) {
  const { x, y, w, h } = position;
  
  switch (breakpoint) {
    case 'sm':
      // Mobile: single column, maintain vertical order
      return {
        x: 0,
        y: y,
        w: 1,
        h: widgetType === 'metric' ? 2 : widgetType === 'chart' ? 4 : 3,
      };
      
    case 'md':
      // Tablet: 6 columns, adjust width
      return {
        x: x >= 6 ? x - 6 : x,
        y: y + (x >= 6 ? Math.ceil(h / 2) : 0),
        w: Math.min(w, 6),
        h: h,
      };
      
    case 'lg':
    default:
      // Desktop: use original position
      return { x, y, w, h };
  }
}

/**
 * Validate entire dashboard layout follows ordering rules
 * 
 * @param {Array} widgets - Array of widget configurations with positions
 * @returns {object} Validation result { valid, errors }
 */
export function validateDashboardLayout(widgets) {
  const errors = [];
  
  widgets.forEach(widget => {
    const { type, position } = widget;
    if (!position) {
      errors.push(`Widget ${widget.id} missing position`);
      return;
    }
    
    if (!validateWidgetPosition(type, position.y)) {
      const range = Y_RANGES[type];
      errors.push(
        `Widget ${widget.id} (type: ${type}) at y=${position.y} should be in range y=${range.min}-${range.max}`
      );
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
