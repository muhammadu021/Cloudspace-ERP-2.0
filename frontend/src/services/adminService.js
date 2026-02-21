import api from './api'
import { getCompanyId } from '../utils/company'

export const adminService = {
  // Dashboard
  getAdminDashboard: () => {
    const company_id = getCompanyId();
    return api.get('/admin/dashboard', { params: { company_id } });
  },

  // Asset Management
  getAssets: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/assets', { params: { ...params, company_id } });
  },
  getAssetById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/admin/assets/${id}`, { params: { company_id } });
  },
  createAsset: (assetData) => {
    const company_id = getCompanyId();
    return api.post('/admin/assets', { ...assetData, company_id });
  },
  updateAsset: (id, assetData) => {
    const company_id = getCompanyId();
    return api.put(`/admin/assets/${id}`, { ...assetData, company_id });
  },
  deleteAsset: (id, permanent = false) => {
    const company_id = getCompanyId();
    return api.delete(`/admin/assets/${id}`, { 
      params: { permanent, company_id } 
    });
  },

  // Document Repository
  getDocuments: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/documents', { params: { ...params, company_id } });
  },

  // System Settings
  getSystemSettings: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/settings', { params: { ...params, company_id } });
  },
  updateSystemSettings: (settings) => {
    const company_id = getCompanyId();
    return api.put('/admin/settings', { ...settings, company_id });
  },

  // User Management
  getAllUsers: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/users', { params: { ...params, company_id } });
  },

  createUser: (userData) => {
    const company_id = getCompanyId();
    return api.post('/admin/users', { ...userData, company_id });
  },

  updateUser: (userId, userData) => {
    const company_id = getCompanyId();
    return api.put(`/admin/users/${userId}`, { ...userData, company_id });
  },

  deleteUser: (userId) => {
    const company_id = getCompanyId();
    return api.delete(`/admin/users/${userId}`, { params: { company_id } });
  },

  getUserById: (userId) => {
    const company_id = getCompanyId();
    return api.get(`/admin/users/${userId}`, { params: { company_id } });
  },

  resetUserPassword: (userId, passwordData) => {
    const company_id = getCompanyId();
    return api.put(`/admin/users/${userId}/reset-password`, { ...passwordData, company_id });
  },

  // User Type Management
  getUserTypes: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/user-types', { params: { ...params, company_id } });
  },
  getUserTypeById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/admin/user-types/${id}`, { params: { company_id } });
  },
  createUserType: (userTypeData) => {
    const company_id = getCompanyId();
    return api.post('/admin/user-types', { ...userTypeData, company_id });
  },
  updateUserType: (id, userTypeData) => {
    const company_id = getCompanyId();
    return api.put(`/admin/user-types/${id}`, { ...userTypeData, company_id });
  },
  deleteUserType: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/admin/user-types/${id}`, { params: { company_id } });
  },
  assignUserType: (userId, userTypeId) => {
    const company_id = getCompanyId();
    return api.patch(`/admin/users/${userId}/user-type`, { user_type_id: userTypeId, company_id });
  },
  getUsersByType: (userTypeId, params) => {
    const company_id = getCompanyId();
    return api.get(`/admin/user-types/${userTypeId}/users`, { params: { ...params, company_id } });
  },
  getAvailableModules: () => {
    const company_id = getCompanyId();
    return api.get('/admin/modules', { params: { company_id } });
  },
  validateUserTypePermissions: (permissions) => {
    const company_id = getCompanyId();
    return api.post('/admin/user-types/validate-permissions', { permissions, company_id });
  },

  // Permissions Management
  getPermissions: () => {
    const company_id = getCompanyId();
    return api.get('/admin/permissions', { params: { company_id } });
  },
  updateUserPermissions: (data) => {
    const company_id = getCompanyId();
    return api.put('/admin/permissions', { ...data, company_id });
  },

  // Roles Management
  getRoles: () => {
    const company_id = getCompanyId();
    return api.get('/admin/roles', { params: { company_id } });
  },
  createRole: (roleData) => {
    const company_id = getCompanyId();
    return api.post('/admin/roles', { ...roleData, company_id });
  },
  updateRole: (id, roleData) => {
    const company_id = getCompanyId();
    return api.put(`/admin/roles/${id}`, { ...roleData, company_id });
  },
  deleteRole: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/admin/roles/${id}`, { params: { company_id } });
  },

  // Audit Logs
  getAuditLogs: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/audit-logs', { params: { ...params, company_id } });
  },

  // Backup Management
  getBackups: (params) => {
    const company_id = getCompanyId();
    return api.get('/admin/backups', { params: { ...params, company_id } });
  },
  createBackup: (backupData) => {
    const company_id = getCompanyId();
    return api.post('/admin/backups', { ...backupData, company_id });
  },
  deleteBackup: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/admin/backups/${id}`, { params: { company_id } });
  },

  // System Monitoring
  getSystemHealth: () => {
    const company_id = getCompanyId();
    return api.get('/admin/system-health', { params: { company_id } });
  },
  getDatabaseStats: () => {
    const company_id = getCompanyId();
    return api.get('/admin/database-stats', { params: { company_id } });
  },

  // Notifications
  createNotification: (notificationData) => {
    const company_id = getCompanyId();
    return api.post('/admin/notifications', { ...notificationData, company_id });
  },

  // Utility functions
  getAssetCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'computer', label: 'Computer Equipment' },
          { value: 'furniture', label: 'Furniture' },
          { value: 'vehicle', label: 'Vehicles' },
          { value: 'machinery', label: 'Machinery' },
          { value: 'software', label: 'Software' },
          { value: 'mobile', label: 'Mobile Devices' },
          { value: 'network', label: 'Network Equipment' },
          { value: 'office', label: 'Office Equipment' },
          { value: 'security', label: 'Security Equipment' },
          { value: 'other', label: 'Other' }
        ]
      }
    }
  }),

  getAssetStatuses: () => Promise.resolve({
    data: {
      data: {
        statuses: [
          { value: 'active', label: 'Active', color: 'green' },
          { value: 'inactive', label: 'Inactive', color: 'gray' },
          { value: 'maintenance', label: 'Under Maintenance', color: 'yellow' },
          { value: 'disposed', label: 'Disposed', color: 'red' },
          { value: 'lost', label: 'Lost', color: 'orange' },
          { value: 'stolen', label: 'Stolen', color: 'red' }
        ]
      }
    }
  }),

  getDepreciationMethods: () => Promise.resolve({
    data: {
      data: {
        methods: [
          { value: 'straight_line', label: 'Straight Line' },
          { value: 'declining_balance', label: 'Declining Balance' },
          { value: 'sum_of_years', label: 'Sum of Years Digits' },
          { value: 'none', label: 'No Depreciation' }
        ]
      }
    }
  }),

  getBackupTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'full', label: 'Full Backup', description: 'Complete backup of all data' },
          { value: 'incremental', label: 'Incremental Backup', description: 'Backup of changes since last backup' },
          { value: 'differential', label: 'Differential Backup', description: 'Backup of changes since last full backup' }
        ]
      }
    }
  }),

  getNotificationTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'info', label: 'Information', color: 'blue' },
          { value: 'success', label: 'Success', color: 'green' },
          { value: 'warning', label: 'Warning', color: 'yellow' },
          { value: 'error', label: 'Error', color: 'red' }
        ]
      }
    }
  }),

  getTargetTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'all', label: 'All Users' },
          { value: 'users', label: 'Specific Users' },
          { value: 'departments', label: 'Departments' },
          { value: 'roles', label: 'Roles' }
        ]
      }
    }
  }),

  getUserTypeColors: () => Promise.resolve({
    data: {
      data: {
        colors: [
          { value: 'blue', label: 'Blue', hex: '#3B82F6' },
          { value: 'green', label: 'Green', hex: '#10B981' },
          { value: 'purple', label: 'Purple', hex: '#8B5CF6' },
          { value: 'yellow', label: 'Yellow', hex: '#F59E0B' },
          { value: 'red', label: 'Red', hex: '#EF4444' },
          { value: 'gray', label: 'Gray', hex: '#6B7280' }
        ]
      }
    }
  }),

  getDefaultUserTypes: () => Promise.resolve({
    data: {
      data: {
        userTypes: [
          {
            name: 'super_admin',
            display_name: 'Super Administrator',
            description: 'Full system access with all permissions',
            color: 'red',
            is_system: true,
            permissions: {
              dashboard: ['read'],
              projects: ['read', 'create', 'update', 'delete'],
              inventory: ['read', 'create', 'update', 'delete'],
              hr: ['read', 'create', 'update', 'delete'],
              finance: ['read', 'create', 'update', 'delete', 'approve'],
              admin: ['read', 'create', 'update', 'delete', 'manage'],
              collaboration: ['read', 'create', 'update', 'delete'],
              file_share: ['read', 'create', 'update', 'delete', 'share'],
              documents: ['read', 'create', 'update', 'delete', 'approve']
            }
          },
          {
            name: 'hr_manager',
            display_name: 'HR Manager',
            description: 'Human Resources management with payroll access',
            color: 'blue',
            is_system: false,
            permissions: {
              dashboard: ['read'],
              hr: ['read', 'create', 'update', 'delete'],
              finance: ['read'],
              collaboration: ['read', 'create', 'update'],
              file_share: ['read', 'create', 'share'],
              documents: ['read', 'create', 'update']
            }
          },
          {
            name: 'finance_manager',
            display_name: 'Finance Manager',
            description: 'Financial management with approval authority',
            color: 'green',
            is_system: false,
            permissions: {
              dashboard: ['read'],
              finance: ['read', 'create', 'update', 'delete', 'approve'],
              hr: ['read'],
              collaboration: ['read', 'create'],
              file_share: ['read', 'create'],
              documents: ['read', 'create', 'approve']
            }
          },
          {
            name: 'project_manager',
            display_name: 'Project Manager',
            description: 'Project management and team coordination',
            color: 'purple',
            is_system: false,
            permissions: {
              dashboard: ['read'],
              projects: ['read', 'create', 'update', 'delete'],
              inventory: ['read'],
              collaboration: ['read', 'create', 'update', 'delete'],
              file_share: ['read', 'create', 'update', 'share'],
              documents: ['read', 'create', 'update']
            }
          },
          {
            name: 'employee',
            display_name: 'Regular Employee',
            description: 'Standard employee access with self-service',
            color: 'gray',
            is_system: false,
            permissions: {
              dashboard: ['read'],
              collaboration: ['read', 'create'],
              file_share: ['read', 'create'],
              documents: ['read']
            }
          }
        ]
      }
    }
  }),

  getSystemCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'general', label: 'General Settings' },
          { value: 'company', label: 'Company Information' },
          { value: 'system', label: 'System Configuration' },
          { value: 'security', label: 'Security Settings' },
          { value: 'email', label: 'Email Configuration' },
          { value: 'notification', label: 'Notification Settings' },
          { value: 'backup', label: 'Backup Settings' },
          { value: 'integration', label: 'Integration Settings' }
        ]
      }
    }
  }),

  // User Type Utilities
  formatUserTypePermissions: (permissions) => {
    const moduleNames = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      inventory: 'Inventory',
      hr: 'Human Resources',
      finance: 'Finance',
      admin: 'Administration',
      collaboration: 'Collaboration',
      file_share: 'File Sharing',
      documents: 'Document Management'
    };
    
    return Object.entries(permissions).map(([moduleId, perms]) => ({
      module: moduleNames[moduleId] || moduleId,
      permissions: perms,
      count: perms.length
    }));
  },

  validateUserTypeData: (userTypeData) => {
    const errors = [];
    
    if (!userTypeData.name || userTypeData.name.trim().length === 0) {
      errors.push('User type name is required');
    }
    
    if (!userTypeData.display_name || userTypeData.display_name.trim().length === 0) {
      errors.push('Display name is required');
    }
    
    if (userTypeData.name && !/^[a-z_]+$/.test(userTypeData.name)) {
      errors.push('Name must contain only lowercase letters and underscores');
    }
    
    if (!userTypeData.permissions || Object.keys(userTypeData.permissions).length === 0) {
      errors.push('At least one module permission must be assigned');
    }
    
    return errors;
  }
}

export default adminService