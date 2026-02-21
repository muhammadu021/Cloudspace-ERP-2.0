/**
 * Permission mapping and utility functions for frontend permission checking
 * Maps routes and components to their corresponding permission item IDs
 */

// Comprehensive mapping of routes to permission item IDs
export const PERMISSION_MAPPING = {
  // Dashboard
  '/dashboard': 'dashboard-overview',
  
  // Self Service
  '/self-service': 'self-service-dashboard',
  '/self-service/tasks': 'self-service-tasks',
  '/self-service/profile': 'self-service-profile',
  '/self-service/time-tracking': 'self-service-time-tracking',
  '/self-service/leave-requests': 'self-service-leave-requests',
  '/self-service/expense-claims': 'self-service-expense-claims',
  '/self-service/documents': 'self-service-documents',
  '/self-service/payslips': 'self-service-payslips',
  '/self-service/benefits': 'self-service-benefits',
  
  // Purchase Requests
  '/purchase-requests': 'purchase-dashboard',
  '/purchase-requests/dashboard': 'purchase-dashboard',
  '/purchase-requests/create': 'purchase-create',
  '/purchase-requests/create-order': 'purchase-order-create',
  '/purchase-requests/settings': 'purchase-settings',
  '/purchase-requests/pending-approval': 'purchase-pending',
  '/purchase-requests/procurement': 'purchase-procurement',
  '/purchase-requests/finance': 'purchase-finance',
  '/purchase-requests/history': 'purchase-history',
  
  // Projects
  '/projects': 'projects-dashboard',
  '/projects/dashboard': 'projects-dashboard',
  '/projects/my': 'projects-my',
  '/projects/create': 'projects-create',
  '/projects/new': 'projects-create',
  '/projects/kanban': 'projects-kanban',
  '/projects/calendar': 'projects-calendar',
  '/projects/templates': 'projects-templates',
  '/projects/reports': 'projects-reports',
  '/projects/analytics': 'projects-analytics',
  '/projects/archive': 'projects-archive',
  
  // Inventory
  '/inventory': 'inventory-dashboard',
  '/inventory/items': 'inventory-items',
  '/inventory/items/new': 'inventory-create',
  '/inventory/locations': 'inventory-locations',
  '/inventory/movements': 'inventory-movements',
  '/inventory/reports': 'inventory-reports',
  
  // HR
  '/hr': 'hr-dashboard',
  '/hr/employees': 'hr-employees',
  '/hr/attendance': 'hr-attendance',
  '/hr/leaves': 'hr-leaves',
  '/hr/payroll': 'hr-payroll',
  '/hr/performance': 'hr-performance',
  '/hr/training': 'hr-training',
  '/hr/recruitment': 'hr-recruitment',
  '/hr/policies': 'hr-policies',
  '/hr/reports': 'hr-reports',
  '/hr/org-chart': 'hr-org-chart',
  '/hr/directory': 'hr-directory',
  '/hr/tasks': 'hr-tasks',
  '/hr/expenses': 'hr-expenses',
  
  // Finance
  '/finance': 'finance-dashboard',
  '/finance/accounts': 'finance-accounts',
  '/finance/transactions': 'finance-transactions',
  '/finance/budgets': 'finance-budgets',
  '/finance/reports': 'finance-reports',
  '/finance/expenses': 'finance-expenses',
  '/finance/payroll-approval': 'finance-payroll-approval',
  
  // Admin
  '/admin': 'admin-dashboard',
  '/admin/assets': 'admin-assets',
  '/admin/documents': 'admin-documents',
  '/admin/settings': 'admin-settings',
  '/admin/users': 'admin-users',
  '/admin/audit-logs': 'admin-audit-logs',
  '/admin/backups': 'admin-backups',
  
  // Collaboration
  '/collaboration': 'collaboration-dashboard',
  '/collaboration/messages': 'collaboration-messages',
  '/collaboration/announcements': 'collaboration-announcements',
  '/collaboration/calendar': 'collaboration-calendar',
  '/collaboration/forums': 'collaboration-forums',
  '/collaboration/conferences': 'collaboration-conferences',
  
  // File Share
  '/file-share': 'file-share-dashboard',
  '/file-share/my': 'file-share-my',
  '/file-share/shared': 'file-share-shared',
  '/file-share/team': 'file-share-team',
  '/file-share/upload': 'file-share-upload',
  
  // Documents
  '/documents': 'documents-dashboard',
  '/documents/all': 'documents-all',
  '/documents/my': 'documents-my',
  '/documents/pending': 'documents-pending',
  '/documents/templates': 'documents-templates',
  '/documents/new': 'documents-create',
  '/documents/workflow': 'documents-workflow'
};

// Reverse mapping for quick lookups
export const ROUTE_TO_PERMISSION = Object.fromEntries(
  Object.entries(PERMISSION_MAPPING).map(([route, permission]) => [route, permission])
);

/**
 * Normalize user permissions from API response into a more queryable format
 * @param {Array} sidebarModules - Array of sidebar modules from user type
 * @returns {Object} Normalized permissions object
 */
export const normalizeUserPermissions = (sidebarModules) => {
  const permissions = {
    modules: {},
    items: new Set(),
    moduleItems: {}
  };
  
  if (!Array.isArray(sidebarModules)) {
    return permissions;
  }
  
  sidebarModules.forEach(module => {
    const { module_id, enabled, permissions: modulePermissions, items, sub_items } = module;
    
    // Use sub_items if items is not present (for backward compatibility)
    const moduleItems = items || sub_items || [];
    
    if (enabled) {
      // Store module-level permissions
      permissions.modules[module_id] = {
        enabled: true,
        permissions: modulePermissions || [],
        items: moduleItems
      };
      
      // Store individual items for quick lookup
      if (Array.isArray(moduleItems)) {
        moduleItems.forEach(item => {
          permissions.items.add(item);
        });
        permissions.moduleItems[module_id] = moduleItems;
      }
    }
  });
  
  return permissions;
};

/**
 * Serialize permissions for storage (convert Set to Array)
 * @param {Object} permissions - Normalized permissions object
 * @returns {Object} Serializable permissions object
 */
export const serializePermissions = (permissions) => {
  if (!permissions) return null;
  
  return {
    modules: permissions.modules,
    items: Array.from(permissions.items || []),
    moduleItems: permissions.moduleItems
  };
};

/**
 * Deserialize permissions from storage (convert Array back to Set)
 * @param {Object} storedPermissions - Stored permissions object
 * @returns {Object} Normalized permissions object with Set
 */
export const deserializePermissions = (storedPermissions) => {
  if (!storedPermissions) return null;
  
  return {
    modules: storedPermissions.modules || {},
    items: new Set(storedPermissions.items || []),
    moduleItems: storedPermissions.moduleItems || {}
  };
};

/**
 * Check if user has permission for a specific item
 * @param {Object} userPermissions - Normalized user permissions
 * @param {string} itemId - Permission item ID to check
 * @returns {boolean} Whether user has permission
 */
export const hasItemPermission = (userPermissions, itemId) => {
  if (!userPermissions || !itemId) {
    return false;
  }
  
  return userPermissions.items.has(itemId);
};

/**
 * Check if user has access to a specific route
 * @param {Object} userPermissions - Normalized user permissions
 * @param {string} route - Route path to check
 * @returns {boolean} Whether user has access to the route
 */
export const hasRoutePermission = (userPermissions, route) => {
  if (!userPermissions || !route) {
    return false;
  }
  
  const permissionId = ROUTE_TO_PERMISSION[route];
  if (!permissionId) {
    // If no specific permission mapping exists, deny access
    return false;
  }
  
  return hasItemPermission(userPermissions, permissionId);
};

/**
 * Check if user has access to a module
 * @param {Object} userPermissions - Normalized user permissions
 * @param {string} moduleId - Module ID to check
 * @returns {boolean} Whether user has access to the module
 */
export const hasModulePermission = (userPermissions, moduleId) => {
  if (!userPermissions || !moduleId) {
    return false;
  }
  
  return userPermissions.modules[moduleId]?.enabled || false;
};

/**
 * Get all allowed items for a specific module
 * @param {Object} userPermissions - Normalized user permissions
 * @param {string} moduleId - Module ID
 * @returns {Array} Array of allowed item IDs for the module
 */
export const getModuleItems = (userPermissions, moduleId) => {
  if (!userPermissions || !moduleId) {
    return [];
  }
  
  return userPermissions.moduleItems[moduleId] || [];
};

/**
 * Filter sub-items based on user permissions
 * @param {Array} subItems - Array of sub-items with path property
 * @param {Object} userPermissions - Normalized user permissions
 * @returns {Array} Filtered array of sub-items user has access to
 */
export const filterSubItemsByPermissions = (subItems, userPermissions) => {
  if (!Array.isArray(subItems) || !userPermissions) {
    return [];
  }
  
  return subItems.filter(subItem => {
    const hasPermission = hasRoutePermission(userPermissions, subItem.path);
    return hasPermission;
  });
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} userPermissions - Normalized user permissions
 * @param {Array} permissionIds - Array of permission IDs to check
 * @returns {boolean} Whether user has any of the permissions
 */
export const hasAnyPermission = (userPermissions, permissionIds) => {
  if (!userPermissions || !Array.isArray(permissionIds)) {
    return false;
  }
  
  return permissionIds.some(permissionId => hasItemPermission(userPermissions, permissionId));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} userPermissions - Normalized user permissions
 * @param {Array} permissionIds - Array of permission IDs to check
 * @returns {boolean} Whether user has all of the permissions
 */
export const hasAllPermissions = (userPermissions, permissionIds) => {
  if (!userPermissions || !Array.isArray(permissionIds)) {
    return false;
  }
  
  return permissionIds.every(permissionId => hasItemPermission(userPermissions, permissionId));
};

/**
 * Get user's permission level for a module (read, write, admin, etc.)
 * @param {Object} userPermissions - Normalized user permissions
 * @param {string} moduleId - Module ID
 * @returns {Array} Array of permission levels
 */
export const getModulePermissionLevels = (userPermissions, moduleId) => {
  if (!userPermissions || !moduleId) {
    return [];
  }
  
  return userPermissions.modules[moduleId]?.permissions || [];
};

export default {
  PERMISSION_MAPPING,
  ROUTE_TO_PERMISSION,
  normalizeUserPermissions,
  serializePermissions,
  deserializePermissions,
  hasItemPermission,
  hasRoutePermission,
  hasModulePermission,
  getModuleItems,
  filterSubItemsByPermissions,
  hasAnyPermission,
  hasAllPermissions,
  getModulePermissionLevels
};