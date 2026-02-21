/**
 * Dashboard API Slice
 * 
 * RTK Query API for Dashboard space operations
 * Provides real-time metrics, recent activity, and quick stats with polling
 * 
 * Features:
 * - Dashboard metrics (projects, orders, revenue, tasks)
 * - Real-time updates via polling (30 seconds)
 * - Recent activity feed
 * - Quick stats and KPIs
 * - Demo mode support with mock data
 */

import { baseApi, transformApiResponse } from './baseApi';
import { appConfig } from '@/config/appConfig';

/**
 * Generate mock dashboard data for demo mode
 */
const generateMockDashboardMetrics = () => {
  const baseRevenue = 125000;
  const variation = Math.random() * 10000 - 5000;
  
  return {
    revenue: {
      value: Math.round(baseRevenue + variation),
      trend: (Math.random() * 20 - 5).toFixed(1),
      label: 'Total Revenue',
      format: 'currency',
      period: 'This Month',
    },
    orders: {
      value: Math.round(340 + Math.random() * 20 - 10),
      trend: (Math.random() * 15 - 2).toFixed(1),
      label: 'Orders',
      format: 'number',
      period: 'This Month',
    },
    customers: {
      value: Math.round(1247 + Math.random() * 50 - 25),
      trend: (Math.random() * 10 - 3).toFixed(1),
      label: 'Active Customers',
      format: 'number',
      period: 'Total',
    },
    tasks: {
      value: Math.round(25 + Math.random() * 10),
      trend: 0,
      label: 'Pending Tasks',
      format: 'number',
      period: 'Today',
    },
    projects: {
      value: Math.round(18 + Math.random() * 4),
      trend: (Math.random() * 8 - 1).toFixed(1),
      label: 'Active Projects',
      format: 'number',
      period: 'Current',
    },
    inventory: {
      value: Math.round(450 + Math.random() * 50),
      trend: (Math.random() * 5 - 2).toFixed(1),
      label: 'Low Stock Items',
      format: 'number',
      period: 'Alert',
    },
  };
};

/**
 * Generate mock recent activity for demo mode
 */
const generateMockRecentActivity = () => {
  const activities = [
    { type: 'order', title: 'New order #', status: 'new' },
    { type: 'customer', title: 'Customer inquiry from ', status: 'pending' },
    { type: 'payment', title: 'Payment received $', status: 'completed' },
    { type: 'inventory', title: 'Low stock alert: ', status: 'warning' },
    { type: 'task', title: 'Task completed: ', status: 'completed' },
    { type: 'project', title: 'Project milestone reached: ', status: 'completed' },
    { type: 'support', title: 'Support ticket #', status: 'new' },
    { type: 'employee', title: 'New employee onboarded: ', status: 'completed' },
  ];
  
  const now = Date.now();
  const items = [];
  
  for (let i = 0; i < 8; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const minutesAgo = Math.floor(Math.random() * 180) + 1;
    const timestamp = new Date(now - minutesAgo * 60000);
    
    let title = activity.title;
    if (activity.type === 'order') {
      title += Math.floor(1000 + Math.random() * 9000);
    } else if (activity.type === 'payment') {
      title += (Math.random() * 5000 + 500).toFixed(2);
    } else if (activity.type === 'customer') {
      title += ['John Doe', 'Jane Smith', 'Acme Corp', 'Tech Solutions'][Math.floor(Math.random() * 4)];
    } else if (activity.type === 'inventory') {
      title += ['Widget A', 'Product B', 'Item C', 'Component D'][Math.floor(Math.random() * 4)];
    } else if (activity.type === 'task') {
      title += ['Review documents', 'Update report', 'Client meeting', 'Code review'][Math.floor(Math.random() * 4)];
    } else if (activity.type === 'project') {
      title += ['Phase 1', 'Design Complete', 'Testing Done', 'Launch Ready'][Math.floor(Math.random() * 4)];
    } else if (activity.type === 'support') {
      title += Math.floor(100 + Math.random() * 900);
    } else if (activity.type === 'employee') {
      title += ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Brown'][Math.floor(Math.random() * 4)];
    }
    
    items.push({
      id: `activity-${i}-${Date.now()}`,
      title,
      timestamp,
      status: activity.status,
      type: activity.type,
    });
  }
  
  return items.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Generate mock quick stats for demo mode
 */
const generateMockQuickStats = () => {
  return {
    salesTrend: [
      { name: 'Jan', value: 4000 + Math.random() * 500 },
      { name: 'Feb', value: 3000 + Math.random() * 500 },
      { name: 'Mar', value: 5000 + Math.random() * 500 },
      { name: 'Apr', value: 4500 + Math.random() * 500 },
      { name: 'May', value: 6000 + Math.random() * 500 },
      { name: 'Jun', value: 5500 + Math.random() * 500 },
    ],
    topProducts: [
      { name: 'Product A', sales: Math.round(150 + Math.random() * 50), revenue: Math.round(15000 + Math.random() * 5000) },
      { name: 'Product B', sales: Math.round(120 + Math.random() * 40), revenue: Math.round(12000 + Math.random() * 4000) },
      { name: 'Product C', sales: Math.round(100 + Math.random() * 30), revenue: Math.round(10000 + Math.random() * 3000) },
      { name: 'Product D', sales: Math.round(80 + Math.random() * 20), revenue: Math.round(8000 + Math.random() * 2000) },
      { name: 'Product E', sales: Math.round(60 + Math.random() * 15), revenue: Math.round(6000 + Math.random() * 1500) },
    ],
    projectStatus: {
      planning: Math.round(3 + Math.random() * 2),
      active: Math.round(12 + Math.random() * 4),
      onHold: Math.round(2 + Math.random() * 2),
      completed: Math.round(45 + Math.random() * 10),
    },
    supportMetrics: {
      openTickets: Math.round(15 + Math.random() * 10),
      avgResponseTime: (2.5 + Math.random() * 1.5).toFixed(1),
      satisfactionScore: (4.2 + Math.random() * 0.6).toFixed(1),
      resolvedToday: Math.round(8 + Math.random() * 5),
    },
  };
};

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp) => {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get dashboard metrics
     * Returns overall metrics for dashboard widgets
     * Polls every 30 seconds for real-time updates
     */
    getDashboardMetrics: builder.query({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        // In demo mode, return mock data
        if (appConfig.demoMode) {
          return { data: generateMockDashboardMetrics() };
        }
        
        // In production, fetch from API
        const result = await baseQuery('/dashboard/metrics');
        return result.data ? { data: result.data } : result;
      },
      transformResponse: (response) => {
        // Transform API response if needed
        return transformApiResponse(response);
      },
      providesTags: ['Dashboard'],
      // Keep data for 30 seconds
      keepUnusedDataFor: 30,
    }),
    
    /**
     * Get recent activity
     * Returns recent items and events across all spaces
     * Polls every 30 seconds for real-time updates
     */
    getRecentActivity: builder.query({
      queryFn: async (arg = {}, api, extraOptions, baseQuery) => {
        // In demo mode, return mock data
        if (appConfig.demoMode) {
          const items = generateMockRecentActivity();
          return {
            data: items.map(item => ({
              ...item,
              timestamp: formatTimestamp(item.timestamp),
            })),
          };
        }
        
        // In production, fetch from API
        const { limit = 10 } = arg;
        const result = await baseQuery({
          url: '/dashboard/activity',
          params: { limit },
        });
        
        if (result.data) {
          // Format timestamps
          const data = transformApiResponse(result.data);
          return {
            data: data.map(item => ({
              ...item,
              timestamp: formatTimestamp(item.timestamp),
            })),
          };
        }
        
        return result;
      },
      providesTags: ['Dashboard'],
      // Keep data for 30 seconds
      keepUnusedDataFor: 30,
    }),
    
    /**
     * Get quick stats
     * Returns KPI metrics and charts data
     * Polls every 60 seconds for real-time updates
     */
    getQuickStats: builder.query({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        // In demo mode, return mock data
        if (appConfig.demoMode) {
          return { data: generateMockQuickStats() };
        }
        
        // In production, fetch from API
        const result = await baseQuery('/dashboard/stats');
        return result.data ? { data: result.data } : result;
      },
      transformResponse: transformApiResponse,
      providesTags: ['Dashboard'],
      // Keep data for 60 seconds
      keepUnusedDataFor: 60,
    }),
    
    /**
     * Get widget data
     * Returns data for a specific widget type
     * Used for custom widgets with specific data requirements
     */
    getWidgetData: builder.query({
      queryFn: async ({ widgetType, config = {} }, api, extraOptions, baseQuery) => {
        // In demo mode, return appropriate mock data based on widget type
        if (appConfig.demoMode) {
          switch (widgetType) {
            case 'metrics':
              return { data: generateMockDashboardMetrics() };
            case 'activity':
              return { data: generateMockRecentActivity() };
            case 'stats':
              return { data: generateMockQuickStats() };
            default:
              return { data: {} };
          }
        }
        
        // In production, fetch from API
        const result = await baseQuery({
          url: `/dashboard/widgets/${widgetType}`,
          params: config,
        });
        return result.data ? { data: result.data } : result;
      },
      transformResponse: transformApiResponse,
      providesTags: (result, error, { widgetType }) => [
        { type: 'Widget', id: widgetType },
      ],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetRecentActivityQuery,
  useGetQuickStatsQuery,
  useGetWidgetDataQuery,
} = dashboardApi;
