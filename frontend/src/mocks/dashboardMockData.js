/**
 * Mock Data for Dashboard APIs
 * 
 * Simulates backend API responses for testing the role-based dashboard system
 * without a real backend implementation.
 * 
 * Uses localStorage for persistence across page refreshes.
 */

import { getItem, setItem, STORAGE_KEYS } from '@/utils/localStorage';

// LocalStorage helpers for preferences
const loadPreferencesFromStorage = () => {
  return getItem(STORAGE_KEYS.USER_PREFERENCES, {});
};

const savePreferencesToStorage = (preferences) => {
  setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

// Mock user preferences (stored in memory AND localStorage for persistence)
let MOCK_USER_PREFERENCES_STORE = loadPreferencesFromStorage();

// Dashboard configurations for all 5 roles
export const MOCK_DASHBOARD_CONFIGS = {
  'system-administrator': {
    id: 1,
    role: 'system-administrator',
    version: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-02-27T00:00:00Z',
    configuration: {
      title: 'System Administrator Dashboard',
      description: 'Complete business overview and management',
      widgets: [
        {
          id: 'total-projects',
          type: 'metric',
          title: 'Total Projects',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { metricType: 'total-projects' },
        },
        {
          id: 'total-employees',
          type: 'metric',
          title: 'Total Employees',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: { metricType: 'total-employees' },
        },
        {
          id: 'active-tasks',
          type: 'metric',
          title: 'Active Tasks',
          position: { x: 6, y: 0, w: 3, h: 2 },
          config: { metricType: 'active-tasks' },
        },
        {
          id: 'total-revenue',
          type: 'metric',
          title: 'Total Revenue',
          position: { x: 9, y: 0, w: 3, h: 2 },
          config: { metricType: 'total-revenue' },
        },
        {
          id: 'revenue-chart',
          type: 'chart',
          title: 'Revenue Trend',
          position: { x: 0, y: 2, w: 6, h: 4 },
          config: { chartType: 'line', dataKey: 'revenue-trend' },
        },
        {
          id: 'recent-activities',
          type: 'list',
          title: 'Recent Activities',
          position: { x: 6, y: 2, w: 6, h: 4 },
          config: { listType: 'recent-activities', maxItems: 5 },
        },
        {
          id: 'project-overview',
          type: 'list',
          title: 'Project Overview',
          position: { x: 0, y: 6, w: 6, h: 3 },
          config: { listType: 'project-overview', maxItems: 5 },
        },
        {
          id: 'admin-quick-actions',
          type: 'quick-action',
          title: 'Quick Actions',
          position: { x: 6, y: 6, w: 6, h: 3 },
          config: { actionSet: 'system-admin' },
        },
      ],
      quickActions: [
        { id: 'create-project', label: 'Create Project', icon: 'Plus', route: '/projects/new' },
        { id: 'add-employee', label: 'Add Employee', icon: 'UserPlus', route: '/hr/employees/new' },
        { id: 'view-reports', label: 'View Reports', icon: 'BarChart', route: '/reports' },
        { id: 'system-settings', label: 'System Settings', icon: 'Settings', route: '/admin/settings' },
      ],
    },
  },
  
  'admin': {
    id: 2,
    role: 'admin',
    version: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    configuration: {
      title: 'Admin Dashboard',
      description: 'Company-wide overview and management',
      widgets: [
        {
          id: 'total-employees',
          type: 'metric',
          title: 'Total Employees',
          position: { x: 0, y: 0, w: 4, h: 2 },
          config: { metricType: 'total-employees' },
        },
        {
          id: 'active-projects',
          type: 'metric',
          title: 'Active Projects',
          position: { x: 4, y: 0, w: 4, h: 2 },
          config: { metricType: 'active-projects' },
        },
        {
          id: 'pending-approvals',
          type: 'metric',
          title: 'Pending Approvals',
          position: { x: 8, y: 0, w: 4, h: 2 },
          config: { metricType: 'pending-approvals' },
        },
        {
          id: 'company-performance',
          type: 'chart',
          title: 'Company Performance',
          position: { x: 0, y: 2, w: 8, h: 4 },
          config: { chartType: 'bar', dataKey: 'company-performance' },
        },
        {
          id: 'recent-activities',
          type: 'list',
          title: 'Recent Activities',
          position: { x: 8, y: 2, w: 4, h: 4 },
          config: { listType: 'recent-activities', maxItems: 6 },
        },
      ],
      quickActions: [
        { id: 'add-employee', label: 'Add Employee', icon: 'UserPlus', route: '/hr/employees/new' },
        { id: 'create-project', label: 'Create Project', icon: 'Plus', route: '/projects/new' },
        { id: 'view-reports', label: 'View Reports', icon: 'BarChart', route: '/reports' },
      ],
    },
  },
  
  'hr': {
    id: 3,
    role: 'hr',
    version: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    configuration: {
      title: 'HR Dashboard',
      description: 'Human resources management and analytics',
      widgets: [
        {
          id: 'employee-count',
          type: 'metric',
          title: 'Total Employees',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { metricType: 'employee-count' },
        },
        {
          id: 'attendance-rate',
          type: 'metric',
          title: 'Attendance Rate',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: { metricType: 'attendance-rate' },
        },
        {
          id: 'open-positions',
          type: 'metric',
          title: 'Open Positions',
          position: { x: 6, y: 0, w: 3, h: 2 },
          config: { metricType: 'open-positions' },
        },
        {
          id: 'leave-requests',
          type: 'metric',
          title: 'Pending Leave Requests',
          position: { x: 9, y: 0, w: 3, h: 2 },
          config: { metricType: 'leave-requests' },
        },
        {
          id: 'attendance-trend',
          type: 'chart',
          title: 'Attendance Trend',
          position: { x: 0, y: 2, w: 6, h: 4 },
          config: { chartType: 'line', dataKey: 'attendance-trend' },
        },
        {
          id: 'recent-hires',
          type: 'list',
          title: 'Recent Hires',
          position: { x: 6, y: 2, w: 6, h: 4 },
          config: { listType: 'recent-hires', maxItems: 5 },
        },
        {
          id: 'upcoming-reviews',
          type: 'list',
          title: 'Upcoming Performance Reviews',
          position: { x: 0, y: 6, w: 12, h: 3 },
          config: { listType: 'upcoming-reviews', maxItems: 5 },
        },
      ],
      quickActions: [
        { id: 'add-employee', label: 'Add Employee', icon: 'UserPlus', route: '/hr/employees/new' },
        { id: 'approve-leave', label: 'Approve Leave', icon: 'Calendar', route: '/hr/leave-requests' },
        { id: 'post-job', label: 'Post Job', icon: 'Briefcase', route: '/hr/recruitment/new' },
        { id: 'run-payroll', label: 'Run Payroll', icon: 'DollarSign', route: '/hr/payroll' },
      ],
    },
  },
  
  'finance': {
    id: 4,
    role: 'finance',
    version: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    configuration: {
      title: 'Finance Dashboard',
      description: 'Financial overview and management',
      widgets: [
        {
          id: 'total-revenue',
          type: 'metric',
          title: 'Total Revenue',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { metricType: 'total-revenue' },
        },
        {
          id: 'total-expenses',
          type: 'metric',
          title: 'Total Expenses',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: { metricType: 'total-expenses' },
        },
        {
          id: 'net-profit',
          type: 'metric',
          title: 'Net Profit',
          position: { x: 6, y: 0, w: 3, h: 2 },
          config: { metricType: 'net-profit' },
        },
        {
          id: 'pending-invoices',
          type: 'metric',
          title: 'Pending Invoices',
          position: { x: 9, y: 0, w: 3, h: 2 },
          config: { metricType: 'pending-invoices' },
        },
        {
          id: 'revenue-trend',
          type: 'chart',
          title: 'Revenue vs Expenses',
          position: { x: 0, y: 2, w: 8, h: 4 },
          config: { chartType: 'line', dataKey: 'revenue-expenses' },
        },
        {
          id: 'recent-transactions',
          type: 'list',
          title: 'Recent Transactions',
          position: { x: 8, y: 2, w: 4, h: 4 },
          config: { listType: 'recent-transactions', maxItems: 6 },
        },
        {
          id: 'budget-status',
          type: 'chart',
          title: 'Budget Status',
          position: { x: 0, y: 6, w: 12, h: 3 },
          config: { chartType: 'bar', dataKey: 'budget-status' },
        },
      ],
      quickActions: [
        { id: 'create-invoice', label: 'Create Invoice', icon: 'FileText', route: '/finance/invoices/new' },
        { id: 'record-expense', label: 'Record Expense', icon: 'DollarSign', route: '/finance/expenses/new' },
        { id: 'view-reports', label: 'Financial Reports', icon: 'BarChart', route: '/finance/reports' },
        { id: 'manage-budget', label: 'Manage Budget', icon: 'PieChart', route: '/finance/budgets' },
      ],
    },
  },
  
  'normal-user': {
    id: 5,
    role: 'normal-user',
    version: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    configuration: {
      widgets: [
        {
          id: 'my-tasks',
          type: 'metric',
          title: 'My Tasks',
          position: { x: 0, y: 0, w: 4, h: 2 },
          config: { metricType: 'my-tasks' },
        },
        {
          id: 'my-attendance',
          type: 'metric',
          title: 'Attendance This Month',
          position: { x: 4, y: 0, w: 4, h: 2 },
          config: { metricType: 'my-attendance' },
        },
        {
          id: 'leave-balance',
          type: 'metric',
          title: 'Leave Balance',
          position: { x: 8, y: 0, w: 4, h: 2 },
          config: { metricType: 'leave-balance' },
        },
        {
          id: 'my-projects',
          type: 'list',
          title: 'My Projects',
          position: { x: 0, y: 2, w: 6, h: 4 },
          config: { listType: 'my-projects', maxItems: 5 },
        },
        {
          id: 'recent-requests',
          type: 'list',
          title: 'Recent Requests',
          position: { x: 6, y: 2, w: 6, h: 4 },
          config: { listType: 'recent-requests', maxItems: 5 },
        },
      ],
      quickActions: [],
    },
  },
};

// Mock widget data generators
export const MOCK_WIDGET_DATA = {
  // Metrics
  'system-health': () => ({
    value: 98.5,
    label: 'System Health',
    trend: 2.3,
    format: 'percentage',
    status: 'healthy',
  }),
  
  'active-users': () => ({
    value: 247,
    label: 'Active Users',
    trend: 12,
    format: 'number',
    status: 'normal',
  }),
  
  'server-load': () => ({
    value: 45.2,
    label: 'Server Load',
    trend: -5.1,
    format: 'percentage',
    status: 'normal',
  }),
  
  'storage-usage': () => ({
    value: 67.8,
    label: 'Storage Usage',
    trend: 3.2,
    format: 'percentage',
    status: 'warning',
  }),
  
  'total-employees': () => ({
    value: 156,
    label: 'Total Employees',
    trend: 8,
    format: 'number',
    status: 'normal',
  }),
  
  'active-projects': () => ({
    value: 23,
    label: 'Active Projects',
    trend: 3,
    format: 'number',
    status: 'normal',
  }),
  
  'pending-approvals': () => ({
    value: 12,
    label: 'Pending Approvals',
    trend: -2,
    format: 'number',
    status: 'warning',
  }),
  
  'employee-count': () => ({
    value: 156,
    label: 'Total Employees',
    trend: 8,
    format: 'number',
    status: 'normal',
  }),
  
  'attendance-rate': () => ({
    value: 94.5,
    label: 'Attendance Rate',
    trend: 1.2,
    format: 'percentage',
    status: 'healthy',
  }),
  
  'open-positions': () => ({
    value: 7,
    label: 'Open Positions',
    trend: 2,
    format: 'number',
    status: 'normal',
  }),
  
  'leave-requests': () => ({
    value: 15,
    label: 'Pending Leave Requests',
    trend: 3,
    format: 'number',
    status: 'warning',
  }),
  
  'total-revenue': () => ({
    value: 1250000,
    label: 'Total Revenue',
    trend: 15.3,
    format: 'currency',
    status: 'healthy',
  }),
  
  'total-expenses': () => ({
    value: 850000,
    label: 'Total Expenses',
    trend: 8.7,
    format: 'currency',
    status: 'normal',
  }),
  
  'net-profit': () => ({
    value: 400000,
    label: 'Net Profit',
    trend: 22.1,
    format: 'currency',
    status: 'healthy',
  }),
  
  'pending-invoices': () => ({
    value: 34,
    label: 'Pending Invoices',
    trend: -5,
    format: 'number',
    status: 'warning',
  }),
  
  'my-tasks': () => ({
    value: 8,
    label: 'My Tasks',
    trend: 2,
    format: 'number',
    status: 'normal',
  }),
  
  'my-attendance': () => ({
    value: 22,
    label: 'Days Present',
    trend: 0,
    format: 'number',
    status: 'normal',
  }),
  
  'leave-balance': () => ({
    value: 12,
    label: 'Days Available',
    trend: -3,
    format: 'number',
    status: 'normal',
  }),
  
  // Charts
  'user-activity': () => ({
    data: [
      { name: 'Mon', value: 245 },
      { name: 'Tue', value: 267 },
      { name: 'Wed', value: 289 },
      { name: 'Thu', value: 256 },
      { name: 'Fri', value: 234 },
      { name: 'Sat', value: 123 },
      { name: 'Sun', value: 98 },
    ],
    xKey: 'name',
    yKey: 'value',
  }),
  
  'company-performance': () => ({
    data: [
      { name: 'Jan', value: 85 },
      { name: 'Feb', value: 88 },
      { name: 'Mar', value: 92 },
      { name: 'Apr', value: 87 },
      { name: 'May', value: 95 },
      { name: 'Jun', value: 98 },
    ],
    xKey: 'name',
    yKey: 'value',
  }),
  
  'attendance-trend': () => ({
    data: [
      { name: 'Week 1', value: 95 },
      { name: 'Week 2', value: 93 },
      { name: 'Week 3', value: 96 },
      { name: 'Week 4', value: 94 },
    ],
    xKey: 'name',
    yKey: 'value',
  }),
  
  'revenue-expenses': () => ({
    data: [
      { name: 'Jan', revenue: 180000, expenses: 120000 },
      { name: 'Feb', revenue: 195000, expenses: 135000 },
      { name: 'Mar', revenue: 210000, expenses: 145000 },
      { name: 'Apr', revenue: 225000, expenses: 150000 },
      { name: 'May', revenue: 240000, expenses: 155000 },
      { name: 'Jun', revenue: 250000, expenses: 145000 },
    ],
    xKey: 'name',
    yKeys: ['revenue', 'expenses'],
  }),
  
  'budget-status': () => ({
    data: [
      { name: 'Marketing', allocated: 50000, spent: 42000 },
      { name: 'Operations', allocated: 80000, spent: 75000 },
      { name: 'R&D', allocated: 100000, spent: 85000 },
      { name: 'Sales', allocated: 60000, spent: 58000 },
    ],
    xKey: 'name',
    yKeys: ['allocated', 'spent'],
  }),
  
  // Lists
  'system-alerts': () => ({
    items: [
      {
        id: 1,
        title: 'High CPU usage detected',
        description: 'Server load at 85%',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        severity: 'warning',
      },
      {
        id: 2,
        title: 'Backup completed successfully',
        description: 'Daily backup finished',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        severity: 'success',
      },
      {
        id: 3,
        title: 'New user registered',
        description: 'John Doe joined the system',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        severity: 'info',
      },
    ],
  }),
  
  'recent-changes': () => ({
    items: [
      {
        id: 1,
        title: 'User permissions updated',
        description: 'Admin role modified',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: 'System Admin',
      },
      {
        id: 2,
        title: 'Configuration changed',
        description: 'Email settings updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        user: 'System Admin',
      },
    ],
  }),
  
  'recent-activities': () => ({
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
  }),
  
  'recent-hires': () => ({
    items: [
      {
        id: 1,
        title: 'John Doe',
        description: 'Software Engineer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        department: 'Engineering',
      },
      {
        id: 2,
        title: 'Jane Smith',
        description: 'Product Manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        department: 'Product',
      },
      {
        id: 3,
        title: 'Bob Johnson',
        description: 'Sales Representative',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        department: 'Sales',
      },
    ],
  }),
  
  'upcoming-reviews': () => ({
    items: [
      {
        id: 1,
        title: 'Alice Williams',
        description: 'Annual performance review',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        department: 'Engineering',
      },
      {
        id: 2,
        title: 'Charlie Brown',
        description: 'Quarterly review',
        timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        department: 'Marketing',
      },
    ],
  }),
  
  'recent-transactions': () => ({
    items: [
      {
        id: 1,
        title: 'Payment received',
        description: 'Invoice #1234 - $15,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        amount: 15000,
        type: 'income',
      },
      {
        id: 2,
        title: 'Expense recorded',
        description: 'Office supplies - $450',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        amount: -450,
        type: 'expense',
      },
      {
        id: 3,
        title: 'Payment received',
        description: 'Invoice #1235 - $8,500',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        amount: 8500,
        type: 'income',
      },
    ],
  }),
  
  'my-projects': () => ({
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
  }),
  
  'recent-requests': () => ({
    items: [
      {
        id: 1,
        title: 'Leave Request',
        description: 'Vacation - Dec 20-25',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        status: 'approved',
      },
      {
        id: 2,
        title: 'Expense Claim',
        description: 'Travel expenses - $250',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        status: 'pending',
      },
    ],
  }),
};

// Mock user preferences template
export const MOCK_USER_PREFERENCES = {
  userId: 1,
  selectedDashboardType: null, // Will be set based on user role
  customLayout: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Mock analytics events storage
export const MOCK_ANALYTICS_EVENTS = [];

/**
 * Simulate API delay
 */
export const simulateDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get dashboard configuration by role
 */
export const getMockDashboardConfig = async (role) => {
  await simulateDelay(300);
  
  const config = MOCK_DASHBOARD_CONFIGS[role];
  if (!config) {
    throw new Error(`Configuration not found for role: ${role}`);
  }
  
  return config;
};

/**
 * Get widget data by type
 */
export const getMockWidgetData = async (config = {}) => {
  await simulateDelay(200);
  
  const metricType = config.metricType || config.dataKey || config.listType;
  const generator = MOCK_WIDGET_DATA[metricType];
  
  if (!generator) {
    console.warn(`No mock data generator for: ${metricType}`);
    return { data: [], message: 'No data available' };
  }
  
  return generator();
};

/**
 * Get user preferences
 */
export const getMockUserPreferences = async (userId) => {
  await simulateDelay(200);
  
  // Return stored preferences for this user, or default preferences
  const storedPreferences = MOCK_USER_PREFERENCES_STORE[userId];
  
  if (storedPreferences) {
    console.log('[MockData] Returning stored preferences for user:', userId, storedPreferences);
    return storedPreferences;
  }
  
  const defaultPreferences = {
    ...MOCK_USER_PREFERENCES,
    userId,
  };
  
  console.log('[MockData] Returning default preferences for user:', userId, defaultPreferences);
  return defaultPreferences;
};

/**
 * Update user preferences
 */
export const updateMockUserPreferences = async (userId, preferences) => {
  await simulateDelay(300);
  
  const updatedPreferences = {
    ...MOCK_USER_PREFERENCES,
    ...(MOCK_USER_PREFERENCES_STORE[userId] || {}),
    ...preferences,
    userId,
    updatedAt: new Date().toISOString(),
  };
  
  // Store the preferences in memory
  MOCK_USER_PREFERENCES_STORE[userId] = updatedPreferences;
  
  // Persist to localStorage
  savePreferencesToStorage(MOCK_USER_PREFERENCES_STORE);
  
  console.log('[MockData] Updated and persisted preferences for user:', userId, updatedPreferences);
  
  return updatedPreferences;
};

/**
 * Log analytics event
 */
export const logMockAnalyticsEvent = async (event) => {
  await simulateDelay(100);
  
  const analyticsEvent = {
    ...event,
    id: MOCK_ANALYTICS_EVENTS.length + 1,
    createdAt: new Date().toISOString(),
  };
  
  MOCK_ANALYTICS_EVENTS.push(analyticsEvent);
  console.log('Analytics Event Logged:', analyticsEvent);
  
  return analyticsEvent;
};
