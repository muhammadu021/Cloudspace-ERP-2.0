import api from './api';

export const salesService = {
  // Sales CRUD
  getSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`),
  createSale: (data) => api.post('/sales', data),
  updateSaleStatus: (id, data) => api.patch(`/sales/${id}/status`, data),
  cancelSale: (id, reason) => api.post(`/sales/${id}/cancel`, { cancellation_reason: reason }),

  // Analytics & Stats
  getSalesStats: (params) => api.get('/sales/stats', { params }),
  getSalesAnalytics: (params) => api.get('/sales/analytics', { params }),
  getDashboardSummary: () => api.get('/sales/dashboard-summary'),

  // Dashboard specific - combines multiple API calls
  getDashboardData: async (params = {}) => {
    try {
      const [analytics, recentSales] = await Promise.all([
        api.get('/sales/analytics', { params }),
        api.get('/sales', { params: { ...params, limit: 10, page: 1 } })
      ]);
      return { analytics: analytics.data, recentSales: recentSales.data };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { analytics: null, recentSales: { data: { sales: [] } } };
    }
  }
};

export default salesService;
