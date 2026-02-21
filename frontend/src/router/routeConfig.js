/**
 * Route configuration and metadata for the ERP system
 * Defines the 8 core spaces and their route structures
 */

/**
 * Space definitions for the ERP system
 * Each space represents a major functional area
 */
export const SPACES = {
  DASHBOARD: {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    alwaysVisible: true,
    description: 'Overview and key metrics',
  },
  PROJECTS: {
    id: 'projects',
    name: 'Projects',
    path: '/projects',
    icon: 'FolderKanban',
    permissionId: 'projects-view',
    description: 'Project management and tracking',
  },
  INVENTORY: {
    id: 'inventory',
    name: 'Inventory',
    path: '/inventory',
    icon: 'Package',
    permissionId: 'inventory-view',
    description: 'Stock and inventory management',
  },
  HR: {
    id: 'hr',
    name: 'HR',
    path: '/hr',
    icon: 'Users',
    permissionId: 'hr-view',
    description: 'Human resources management',
  },
  FINANCE: {
    id: 'finance',
    name: 'Finance',
    path: '/finance',
    icon: 'DollarSign',
    permissionId: 'finance-view',
    description: 'Financial management',
  },
  SALES: {
    id: 'sales',
    name: 'Sales',
    path: '/sales',
    icon: 'ShoppingCart',
    permissionId: 'sales-view',
    description: 'Sales and customer management',
  },
  ADMIN: {
    id: 'admin',
    name: 'Admin',
    path: '/admin',
    icon: 'Settings',
    permissionId: 'admin-view',
    description: 'System administration',
  },
  SUPPORT: {
    id: 'support',
    name: 'Support',
    path: '/support',
    icon: 'Headphones',
    permissionId: 'support-view',
    description: 'Customer support and tickets',
  },
  MY_SPACE: {
    id: 'myspace',
    name: 'My Space',
    path: '/myspace',
    icon: 'User',
    alwaysVisible: true,
    description: 'Personal workspace and self-service',
  },
};

/**
 * Space categories for sidebar organization
 * Groups spaces into logical categories
 */
export const SPACE_CATEGORIES = {
  OVERVIEW: {
    id: 'overview',
    name: 'Overview',
    spaces: ['dashboard'],
  },
  OPERATIONS: {
    id: 'operations',
    name: 'Operations',
    spaces: ['projects', 'inventory'],
  },
  PEOPLE: {
    id: 'people',
    name: 'People',
    spaces: ['hr', 'myspace'],
  },
  FINANCE: {
    id: 'finance',
    name: 'Finance',
    spaces: ['finance', 'sales'],
  },
  SUPPORT: {
    id: 'support',
    name: 'Support',
    spaces: ['support'],
  },
  SYSTEM: {
    id: 'system',
    name: 'System',
    spaces: ['admin'],
  },
};

/**
 * Route metadata for breadcrumb generation and navigation
 */
export const ROUTE_METADATA = {
  // Dashboard routes
  '/dashboard': { title: 'Dashboard', space: 'dashboard' },
  '/simple-dashboard': { title: 'Simple Dashboard', space: 'dashboard' },
  '/audit-trail': { title: 'Audit Trail', space: 'dashboard' },

  // Projects routes
  '/projects': { title: 'Projects', space: 'projects' },
  '/projects/dashboard': { title: 'Project Dashboard', space: 'projects' },
  '/projects/kanban': { title: 'Kanban Board', space: 'projects' },
  '/projects/calendar': { title: 'Calendar', space: 'projects' },
  '/projects/new': { title: 'New Project', space: 'projects' },
  '/projects/create': { title: 'Create Project', space: 'projects' },
  '/projects/templates': { title: 'Templates', space: 'projects' },
  '/projects/reports': { title: 'Reports', space: 'projects' },
  '/projects/analytics': { title: 'Analytics', space: 'projects' },
  '/projects/archive': { title: 'Archive', space: 'projects' },

  // Inventory routes
  '/inventory': { title: 'Inventory', space: 'inventory' },
  '/inventory/items': { title: 'Items', space: 'inventory' },
  '/inventory/locations': { title: 'Locations', space: 'inventory' },
  '/inventory/movements': { title: 'Movements', space: 'inventory' },
  '/inventory/reports': { title: 'Reports', space: 'inventory' },

  // HR routes
  '/hr': { title: 'HR', space: 'hr' },
  '/hr/employees': { title: 'Employees', space: 'hr' },
  '/hr/attendance': { title: 'Attendance', space: 'hr' },
  '/hr/payroll': { title: 'Payroll', space: 'hr' },
  '/hr/recruitment': { title: 'Recruitment', space: 'hr' },
  '/hr/reports': { title: 'Reports', space: 'hr' },

  // Finance routes
  '/finance': { title: 'Finance', space: 'finance' },
  '/finance/dashboard': { title: 'Finance Dashboard', space: 'finance' },
  '/finance/accounts': { title: 'Accounts', space: 'finance' },
  '/finance/transactions': { title: 'Transactions', space: 'finance' },
  '/finance/budgets': { title: 'Budgets', space: 'finance' },
  '/finance/reports': { title: 'Reports', space: 'finance' },

  // Sales routes
  '/sales': { title: 'Sales', space: 'sales' },
  '/sales/dashboard': { title: 'Sales Dashboard', space: 'sales' },
  '/sales/customers': { title: 'Customers', space: 'sales' },
  '/sales/orders': { title: 'Orders', space: 'sales' },
  '/sales/leads': { title: 'Leads', space: 'sales' },
  '/sales/pos': { title: 'Point of Sale', space: 'sales' },
  '/sales/reports': { title: 'Reports', space: 'sales' },

  // Admin routes
  '/admin': { title: 'Admin', space: 'admin' },
  '/admin/users': { title: 'Users', space: 'admin' },
  '/admin/roles': { title: 'Roles', space: 'admin' },
  '/admin/settings': { title: 'Settings', space: 'admin' },
  '/admin/companies': { title: 'Companies', space: 'admin' },
  '/admin/monitoring': { title: 'Monitoring', space: 'admin' },

  // Support routes
  '/support': { title: 'Support', space: 'support' },
  '/support/tickets': { title: 'Tickets', space: 'support' },
  '/support/faq': { title: 'FAQ', space: 'support' },
  '/support/analytics': { title: 'Analytics', space: 'support' },

  // My Space routes
  '/myspace': { title: 'My Space', space: 'myspace' },
  '/myspace/profile': { title: 'Profile', space: 'myspace' },
  '/myspace/requests': { title: 'Requests', space: 'myspace' },
  '/myspace/documents': { title: 'Documents', space: 'myspace' },
};

/**
 * Get route metadata by path
 * @param {string} path - Route path
 * @returns {Object|null} Route metadata or null if not found
 */
export const getRouteMetadata = (path) => {
  return ROUTE_METADATA[path] || null;
};

/**
 * Get space by ID
 * @param {string} spaceId - Space ID
 * @returns {Object|null} Space configuration or null if not found
 */
export const getSpace = (spaceId) => {
  return Object.values(SPACES).find(space => space.id === spaceId) || null;
};

/**
 * Get spaces by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of space configurations
 */
export const getSpacesByCategory = (categoryId) => {
  const category = SPACE_CATEGORIES[categoryId.toUpperCase()];
  if (!category) return [];
  
  return category.spaces
    .map(spaceId => getSpace(spaceId))
    .filter(Boolean);
};

/**
 * Check if a space is always visible (doesn't require permissions)
 * @param {string} spaceId - Space ID
 * @returns {boolean} True if space is always visible
 */
export const isSpaceAlwaysVisible = (spaceId) => {
  const space = getSpace(spaceId);
  return space?.alwaysVisible === true;
};

/**
 * Get all visible spaces for a user based on permissions
 * @param {Function} hasPermission - Permission check function
 * @returns {Array} Array of visible space configurations
 */
export const getVisibleSpaces = (hasPermission) => {
  return Object.values(SPACES).filter(space => {
    // Always show spaces marked as alwaysVisible
    if (space.alwaysVisible) return true;
    
    // Check permission for other spaces
    if (space.permissionId) {
      return hasPermission(space.permissionId);
    }
    
    return false;
  });
};

/**
 * Generate breadcrumb trail from current path
 * @param {string} pathname - Current path
 * @returns {Array} Array of breadcrumb items
 */
export const generateBreadcrumbs = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const metadata = getRouteMetadata(currentPath);
    
    breadcrumbs.push({
      label: metadata?.title || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath,
      isLast: index === segments.length - 1,
    });
  });
  
  return breadcrumbs;
};
