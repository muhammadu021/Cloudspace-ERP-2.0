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
const WidgetRenderer = ({ widget, role, dashboardStats }) => {
  const metadata = getWidgetMetadata(widget.type);
  
  // Fetch widget data
  // For metric widgets, use the metricType from config as the widgetType
  // For other widgets, use the widget type itself
  const widgetType = widget.type === 'metric' && widget.config?.metricType
    ? widget.config.metricType
    : widget.type;
  
  // If dashboardStats is provided, use it directly for widgets
  let directData = null;
  if (dashboardStats) {
    // Handle metric widgets
    if (widget.type === 'metric' && widget.config?.metricType) {
      const metricType = widget.config.metricType;
      console.log('[WidgetRenderer] Using direct data for metric:', metricType, dashboardStats);
      
      if (metricType === 'total-projects') {
        directData = {
          value: dashboardStats.projects.total,
          label: 'Total Projects',
          type: 'number',
          trend: { value: 12, direction: 'up', isIncreaseBad: false },
        };
      } else if (metricType === 'total-employees') {
        directData = {
          value: dashboardStats.employees.total,
          label: 'Total Employees',
          type: 'number',
          trend: { value: 4, direction: 'up', isIncreaseBad: false },
        };
      } else if (metricType === 'active-tasks') {
        directData = {
          value: dashboardStats.tasks.active,
          label: 'Active Tasks',
          type: 'number',
          trend: { value: 5, direction: 'up', isIncreaseBad: false },
        };
      } else if (metricType === 'total-revenue') {
        directData = {
          value: 28500000,
          label: 'Total Revenue',
          type: 'currency',
          trend: { value: 15.4, direction: 'up', isIncreaseBad: false },
        };
      } else if (metricType === 'my-tasks') {
        directData = {
          value: dashboardStats.tasks.active || 0,
          label: 'My Tasks',
          type: 'number',
          trend: { value: 2, direction: 'up', isIncreaseBad: false },
        };
      } else if (metricType === 'my-attendance') {
        directData = {
          value: 22,
          label: 'Days Present',
          type: 'number',
          trend: { value: 0, direction: 'neutral', isIncreaseBad: false },
        };
      } else if (metricType === 'leave-balance') {
        directData = {
          value: 12,
          label: 'Days Available',
          type: 'number',
          trend: { value: 3, direction: 'down', isIncreaseBad: false },
        };
      }
    }
    // Handle chart widgets
    else if (widget.type === 'chart' && widget.config?.dataKey) {
      const dataKey = widget.config.dataKey;
      console.log('[WidgetRenderer] Using direct data for chart:', dataKey);
      
      if (dataKey === 'revenue-trend') {
        directData = {
          chartType: widget.config.chartType || 'line',
          data: [
            { month: 'Jan', revenue: 18500000 },
            { month: 'Feb', revenue: 22000000 },
            { month: 'Mar', revenue: 25000000 },
            { month: 'Apr', revenue: 28500000 },
          ],
          xKey: 'month',
          lines: [
            {
              dataKey: 'revenue',
              name: 'Revenue',
              color: '#3b82f6',
              strokeWidth: 2,
            }
          ],
        };
      }
    }
    // Handle list widgets
    else if (widget.type === 'list' && widget.config?.listType) {
      const listType = widget.config.listType;
      console.log('[WidgetRenderer] Using direct data for list:', listType);
      
      if (listType === 'recent-activities') {
        directData = {
          items: [
            {
              id: 1,
              title: 'New project created',
              description: 'Website Redesign project started',
              timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              user: 'Jane Smith',
            },
            {
              id: 2,
              title: 'Employee onboarded',
              description: 'John Doe completed onboarding',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              user: 'HR Team',
            },
            {
              id: 3,
              title: 'Invoice approved',
              description: 'Invoice #1234 approved for payment',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
              user: 'Finance Team',
            },
          ],
        };
      } else if (listType === 'project-overview') {
        directData = {
          items: [
            { 
              id: 1, 
              title: 'Website Redesign', 
              description: 'In Progress - 65% complete',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
            },
            { 
              id: 2, 
              title: 'Mobile App', 
              description: 'In Progress - 40% complete',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            },
            { 
              id: 3, 
              title: 'API Integration', 
              description: 'Completed - 100%',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            },
          ],
        };
      } else if (listType === 'my-projects') {
        directData = {
          items: [
            { 
              id: 1, 
              title: 'Website Redesign', 
              description: 'In Progress - 65% complete',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
              status: 'in-progress',
            },
            { 
              id: 2, 
              title: 'Mobile App Development', 
              description: 'Planning - Starting next week',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              status: 'planning',
            },
          ],
        };
      } else if (listType === 'recent-requests') {
        directData = {
          items: [
            {
              id: 1,
              title: 'Leave Request',
              description: 'Vacation - Dec 20-25',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
              status: 'approved',
              badge: { text: 'Approved', variant: 'success' },
            },
            {
              id: 2,
              title: 'Expense Claim',
              description: 'Travel expenses - $250',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
              status: 'pending',
              badge: { text: 'Pending', variant: 'warning' },
            },
          ],
        };
      }
    }
    // Handle quick-action widgets
    else if (widget.type === 'quick-action' && widget.config?.actionSet) {
      console.log('[WidgetRenderer] Using direct data for quick-action');
      directData = {
        actions: [
          { id: 'create-project', label: 'Create Project', icon: 'Plus', route: '/projects/new' },
          { id: 'add-employee', label: 'Add Employee', icon: 'UserPlus', route: '/hr/employees/new' },
          { id: 'view-reports', label: 'View Reports', icon: 'BarChart', route: '/reports' },
          { id: 'system-settings', label: 'System Settings', icon: 'Settings', route: '/admin/settings' },
        ],
      };
    }
  }
  
  const {
    data,
    loading,
    error,
    refetch,
  } = useWidgetData({
    widgetId: widget.id,
    widgetType: widgetType,
    config: widget.config,
    role,
  });

  // Use direct data if available, otherwise use fetched data
  const finalData = directData || data;

  if (!metadata) {
    console.error(`Unknown widget type: ${widget.type}`);
    return null;
  }

  // Merge default config with widget config and fetched data
  const widgetConfig = {
    ...metadata.defaultConfig,
    ...widget.config,
    ...finalData,
  };

  console.log('[WidgetRenderer] Widget:', widget.id, 'Type:', widgetType, 'Direct:', directData, 'Fetched:', data, 'Final config:', widgetConfig);

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
      lastUpdate={finalData?.updatedAt || data?.updatedAt}
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
  /** Dashboard stats from demoData */
  dashboardStats: PropTypes.object,
};

export default WidgetRenderer;
