import api from './api'
import { getCompanyId } from '../utils/company'

export const userService = {
  // User management
  getUsers: (params) => {
    const company_id = getCompanyId();
    return api.get('/users', { params: { ...params, company_id } });
  },
  getUserById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/users/${id}`, { params: { company_id } });
  },
  createUser: (userData) => {
    const company_id = getCompanyId();
    return api.post('/users', { ...userData, company_id });
  },
  updateUser: (id, userData) => {
    const company_id = getCompanyId();
    return api.put(`/users/${id}`, { ...userData, company_id });
  },
  deleteUser: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/users/${id}`, { params: { company_id } });
  },
  activateUser: (id) => {
    const company_id = getCompanyId();
    return api.patch(`/users/${id}/activate`, { company_id });
  },
  deactivateUser: (id) => {
    const company_id = getCompanyId();
    return api.patch(`/users/${id}/deactivate`, { company_id });
  },
  
  // Profile management
  getProfile: () => {
    const company_id = getCompanyId();
    return api.get('/users/profile', { params: { company_id } });
  },
  updateProfile: (profileData) => {
    const company_id = getCompanyId();
    return api.put('/users/profile', { ...profileData, company_id });
  },
  changePassword: (passwordData) => {
    const company_id = getCompanyId();
    return api.put('/users/change-password', { ...passwordData, company_id });
  },
  uploadAvatar: (formData) => {
    const company_id = getCompanyId();
    formData.append('company_id', company_id);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Role and permission management
  getRoles: () => {
    const company_id = getCompanyId();
    return api.get('/users/roles', { params: { company_id } });
  },
  getPermissions: () => {
    const company_id = getCompanyId();
    return api.get('/users/permissions', { params: { company_id } });
  },
  assignRole: (userId, roleId) => {
    const company_id = getCompanyId();
    return api.post(`/users/${userId}/assign-role`, { roleId, company_id });
  },
  removeRole: (userId, roleId) => {
    const company_id = getCompanyId();
    return api.delete(`/users/${userId}/remove-role/${roleId}`, { params: { company_id } });
  },
  
  // User preferences
  getPreferences: () => {
    const company_id = getCompanyId();
    return api.get('/users/preferences', { params: { company_id } });
  },
  updatePreferences: (preferences) => {
    const company_id = getCompanyId();
    return api.put('/users/preferences', { ...preferences, company_id });
  },
  
  // User activity
  getUserActivity: (userId, params) => {
    const company_id = getCompanyId();
    return api.get(`/users/${userId}/activity`, { params: { ...params, company_id } });
  },
  getUserSessions: (userId) => {
    const company_id = getCompanyId();
    return api.get(`/users/${userId}/sessions`, { params: { company_id } });
  },
  terminateSession: (sessionId) => {
    const company_id = getCompanyId();
    return api.delete(`/users/sessions/${sessionId}`, { params: { company_id } });
  },
  
  // Bulk operations
  bulkActivate: (userIds) => {
    const company_id = getCompanyId();
    return api.post('/users/bulk-activate', { userIds, company_id });
  },
  bulkDeactivate: (userIds) => {
    const company_id = getCompanyId();
    return api.post('/users/bulk-deactivate', { userIds, company_id });
  },
  bulkDelete: (userIds) => {
    const company_id = getCompanyId();
    return api.post('/users/bulk-delete', { userIds, company_id });
  },
  
  // User statistics
  getUserStats: () => {
    const company_id = getCompanyId();
    return api.get('/users/stats', { params: { company_id } });
  },
  getUserLoginHistory: (userId, params) => {
    const company_id = getCompanyId();
    return api.get(`/users/${userId}/login-history`, { params: { ...params, company_id } });
  },
}