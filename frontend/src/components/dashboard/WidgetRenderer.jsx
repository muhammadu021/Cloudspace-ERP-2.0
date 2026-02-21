/**
 * WidgetRenderer Component
 * 
 * Renders a dashboard widget with data fetching and error handling.
 * Transforms widget configuration into actual React components.
 */

import PropTypes from 'prop-types';
import DashboardWidget from './DashboardWidget';
import { getWidgetMetadata } from './widgetRegistry';
import { useWidgetData } from '@/hooks/useWidgetData';

/**
 * Widget Renderer Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.widget - Widget configuration
 * @param {string} props.role - User role
 */
const WidgetRenderer = ({ widget, role }) => {
  const metadata = getWidgetMetadata(widget.type);
  
  // Fetch widget data
  const {
    data,
    loading,
    error,
    refetch,
  } = useWidgetData({
    widgetId: widget.id,
    widgetType: widget.type,
    config: widget.config,
    role,
  });

  if (!metadata) {
    console.error(`Unknown widget type: ${widget.type}`);
    return null;
  }

  // Merge default config with widget config and fetched data
  const widgetConfig = {
    ...metadata.defaultConfig,
    ...widget.config,
    ...data,
  };

  // Create widget component using factory
  const WidgetComponent = metadata.factory(widgetConfig);

  return (
    <DashboardWidget
      id={widget.id}
      title={widget.title || metadata.name}
      size={widget.size || metadata.defaultSize}
      widgetType={widget.type}
      role={role}
      config={widgetConfig}
      loading={loading}
      error={error}
      onRefresh={refetch}
      lastUpdate={data?.updatedAt}
    >
      {WidgetComponent}
    </DashboardWidget>
  );
};

WidgetRenderer.propTypes = {
  /** Widget configuration */
  widget: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    size: PropTypes.string,
    config: PropTypes.object,
    position: PropTypes.object,
  }).isRequired,
  /** User role */
  role: PropTypes.string.isRequired,
};

export default WidgetRenderer;
