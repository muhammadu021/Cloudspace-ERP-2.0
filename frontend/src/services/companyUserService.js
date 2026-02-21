/**
 * Company User Service
 * API calls for company admin to manage users
 */

import api from './api';

const BASE_URL = '/company-users';

export const companyUserService = {
  /**
   * Get available modules for assignment (company's package modules)
   */
  getAvailableModules: async () => {
    const response = await api.get(`${BASE_URL}/available-modules`);
    return response.data;
  },

  /**
   * Get users in company
   */
  getUsers: async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getUserById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new user in company
   */
  createUser: async (userData) => {
    const response = await api.post(BASE_URL, userData);
    return response.data;
  },

  /**
   * Update user's assigned modules
   */
  updateUserModules: async (userId, assignedModules) => {
    const response = await api.patch(`${BASE_URL}/${userId}/modules`, {
      assigned_modules: assignedModules
    });
    return response.data;
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (userId, isActive) => {
    const response = await api.patch(`${BASE_URL}/${userId}/status`, {
      is_active: isActive
    });
    return response.data;
  }
};

export default companyUserService;
