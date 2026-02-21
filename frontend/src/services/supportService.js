import api from './api';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const supportService = {
  // ============================================================================
  // TICKETS
  // ============================================================================
  
  // Create a new support ticket
  createTicket: async (ticketData) => {
    const company_id = getCompanyId();
    const response = await api.post('/support/tickets', { ...ticketData, company_id });
    return response.data;
  },

  // Get all tickets with filters
  getTickets: async (params = {}) => {
    const response = await api.get('/support/tickets', { params });
    return response.data;
  },

  // Get ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/support/tickets/${id}`);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, updates) => {
    const response = await api.put(`/support/tickets/${id}`, updates);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/support/tickets/${id}`);
    return response.data;
  },

  // ============================================================================
  // COMMENTS
  // ============================================================================

  // Add comment to ticket
  addComment: async (ticketId, commentData) => {
    const response = await api.post(`/support/tickets/${ticketId}/comments`, commentData);
    return response.data;
  },

  // Get ticket comments
  getTicketComments: async (ticketId, includeInternal = false) => {
    const response = await api.get(`/support/tickets/${ticketId}/comments`, {
      params: { include_internal: includeInternal }
    });
    return response.data;
  },

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  // Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/support/categories', categoryData);
    return response.data;
  },

  // Get all categories
  getCategories: async (isActive = null) => {
    const params = isActive !== null ? { is_active: isActive } : {};
    const response = await api.get('/support/categories', { params });
    return response.data;
  },

  // Update category
  updateCategory: async (id, updates) => {
    const response = await api.put(`/support/categories/${id}`, updates);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id) => {
    const response = await api.delete(`/support/categories/${id}`);
    return response.data;
  },

  // ============================================================================
  // FAQs
  // ============================================================================

  // Create FAQ
  createFAQ: async (faqData) => {
    const response = await api.post('/support/faqs', faqData);
    return response.data;
  },

  // Get all FAQs
  getFAQs: async (params = {}) => {
    const response = await api.get('/support/faqs', { params });
    return response.data;
  },

  // Get FAQ by ID
  getFAQById: async (id) => {
    const response = await api.get(`/support/faqs/${id}`);
    return response.data;
  },

  // Update FAQ
  updateFAQ: async (id, updates) => {
    const response = await api.put(`/support/faqs/${id}`, updates);
    return response.data;
  },

  // Delete FAQ
  deleteFAQ: async (id) => {
    const response = await api.delete(`/support/faqs/${id}`);
    return response.data;
  },

  // Vote on FAQ helpfulness
  voteFAQ: async (id, helpful) => {
    const response = await api.post(`/support/faqs/${id}/vote`, { helpful });
    return response.data;
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  // Get support analytics
  getAnalytics: async (startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/support/analytics', { params });
    return response.data;
  }
};

export default supportService;
