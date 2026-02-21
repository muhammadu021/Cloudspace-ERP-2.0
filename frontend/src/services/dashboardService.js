import api from "./api";
import { getCompanyId } from '../utils/company';
// Note: company_id is automatically handled by the api interceptor in api.js

const dashboardService = {
  // Main dashboard data
  getDashboardData: () => {
    return api.get("/dashboard");
  },
  getStats: () => {
    return api.get("/dashboard/stats");
  },
  getRecentActivities: () => api.get("/dashboard/recent-activities"),

  // Project and task overview
  getProjectsOverview: () => api.get("/dashboard/projects-overview"),
  getTasksOverview: () => api.get("/dashboard/tasks-overview"),
  getProjectStats: () => api.get("/dashboard/project-stats"),
  getTaskStats: () => api.get("/dashboard/task-stats"),

  // Financial overview
  getFinancialOverview: () => api.get("/dashboard/financial-overview"),
  getRevenueStats: () => api.get("/dashboard/revenue-stats"),
  getExpenseStats: () => api.get("/dashboard/expense-stats"),
  getCashFlowData: () => api.get("/dashboard/cash-flow"),

  // HR overview
  getHROverview: () => api.get("/dashboard/hr-overview"),
  getEmployeeStats: () => api.get("/dashboard/employee-stats"),
  getAttendanceStats: () => api.get("/dashboard/attendance-stats"),
  getLeaveStats: () => api.get("/dashboard/leave-stats"),

  // Inventory overview
  getInventoryOverview: () => api.get("/dashboard/inventory-overview"),
  getStockLevels: () => api.get("/dashboard/stock-levels"),
  getLowStockItems: () => api.get("/dashboard/low-stock-items"),
  getInventoryMovements: () => api.get("/dashboard/inventory-movements"),

  // Sales and CRM overview
  getSalesOverview: () => api.get("/dashboard/sales-overview"),
  getCustomerStats: () => api.get("/dashboard/customer-stats"),
  getSalesTargets: () => api.get("/dashboard/sales-targets"),
  getLeadStats: () => api.get("/dashboard/lead-stats"),

  // Notifications
  getNotifications: () => api.get("/dashboard/notifications"),
  markNotificationAsRead: (id) =>
    api.patch(`/dashboard/notifications/${id}/read`),
  markAllNotificationsAsRead: () =>
    api.patch("/dashboard/notifications/mark-all-read"),
  deleteNotification: (id) => api.delete(`/dashboard/notifications/${id}`),

  // Quick actions
  getQuickActions: () => api.get("/dashboard/quick-actions"),

  // Charts and analytics
  getChartData: (chartType, params) =>
    api.get(`/dashboard/charts/${chartType}`, { params }),
  getAnalytics: (type, period) =>
    api.get(`/dashboard/analytics/${type}`, { params: { period } }),

  // Performance metrics
  getKPIs: () => api.get("/dashboard/kpis"),
  getPerformanceMetrics: () => api.get("/dashboard/performance-metrics"),

  // Recent items
  getRecentProjects: () => api.get("/dashboard/recent-projects"),
  getRecentTasks: () => api.get("/dashboard/recent-tasks"),
  getRecentFiles: () => api.get("/dashboard/recent-files"),
  getRecentTransactions: () => api.get("/dashboard/recent-transactions"),

  // Alerts and warnings
  getAlerts: () => api.get("/dashboard/alerts"),
  dismissAlert: (id) => api.patch(`/dashboard/alerts/${id}/dismiss`),

  // Calendar events
  getUpcomingEvents: () => api.get("/dashboard/upcoming-events"),
  getTodayEvents: () => api.get("/dashboard/today-events"),

  // Weather and external data
  getWeatherData: () => api.get("/dashboard/weather"),
  getExchangeRates: () => api.get("/dashboard/exchange-rates"),

  // User preferences
  getDashboardPreferences: () => api.get("/dashboard/preferences"),
  updateDashboardPreferences: (preferences) =>
    api.put("/dashboard/preferences", preferences),

  // Export functionality
  exportDashboardData: (format) =>
    api.get(`/dashboard/export/${format}`, { responseType: "blob" }),
  
  // Audit Trail
  getAuditTrail: (params) => api.get('/audit/trail', { params }),
  getAuditStats: () => api.get('/audit/stats'),
  getAuditActions: () => api.get('/audit/actions'),
  getAuditUsers: () => api.get('/audit/users'),
  exportAuditTrail: (params) => api.get('/audit/export', { params, responseType: 'blob' }),
};

export { dashboardService };
export default dashboardService;
