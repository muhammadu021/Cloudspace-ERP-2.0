import { 
  BarChart3, 
  FolderOpen, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  Wrench, 
  MessageSquare, 
  Share2, 
  FileText
} from 'lucide-react';

import { ROUTE_TO_PERMISSION } from '@/utils/permissions';

/**
 * Centralized sidebar configuration
 * This is the single source of truth for all sidebar modules and their sub-items
 * Used by both DynamicSidebar and Enhanced User Management
 */

// Helper function to generate permission item ID from route
const getPermissionId = (path) => {
  return ROUTE_TO_PERMISSION[path] || null;
};

// All available modules with their configurations
export const SIDEBAR_MODULES = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    description: "Main dashboard and analytics",
    icon: BarChart3,
    category: "Core",
    path: "/dashboard",
    subItems: [
      {
        id: "dashboard-overview",
        name: "Overview",
        path: "/dashboard",
        description: "Main dashboard view",
        permissionId: "dashboard-overview",
      },
    ],
  },

  "self-service": {
    id: "self-service",
    name: "Self Service",
    description: "Employee self-service portal",
    icon: Wrench,
    category: "Core",
    path: "/self-service",
    subItems: [
      {
        id: "self-service-dashboard",
        name: "My Dashboard",
        path: "/self-service",
        description: "Personal dashboard view",
        permissionId: "self-service-dashboard",
      },
      {
        id: "self-service-tasks",
        name: "My Tasks",
        path: "/self-service/tasks",
        description: "Personal task management",
        permissionId: "self-service-tasks",
      },
      {
        id: "self-service-profile",
        name: "My Profile",
        path: "/self-service/profile",
        description: "Personal profile management",
        permissionId: "self-service-profile",
      },
      {
        id: "self-service-time-tracking",
        name: "Time Tracking",
        path: "/self-service/time-tracking",
        description: "Track work hours and attendance",
        permissionId: "self-service-time-tracking",
      },
      {
        id: "self-service-leave-requests",
        name: "Leave Requests",
        path: "/self-service/leave-requests",
        description: "Submit and manage leave requests",
        permissionId: "self-service-leave-requests",
      },
      {
        id: "self-service-expense-claims",
        name: "Expense Claims",
        path: "/self-service/expense-claims",
        description: "Submit and track expense claims",
        permissionId: "self-service-expense-claims",
      },
      {
        id: "self-service-documents",
        name: "My Documents",
        path: "/self-service/documents",
        description: "Personal document management",
        permissionId: "self-service-documents",
      },
      {
        id: "self-service-payslips",
        name: "Payslips",
        path: "/self-service/payslips",
        description: "View and download payslips",
        permissionId: "self-service-payslips",
      },
      {
        id: "self-service-benefits",
        name: "Benefits",
        path: "/self-service/benefits",
        description: "View and manage employee benefits",
        permissionId: "self-service-benefits",
      },
    ],
  },

  projects: {
    id: "projects",
    name: "Projects",
    description: "Project management and tracking",
    icon: FolderOpen,
    category: "Management",
    path: "/projects",
    subItems: [
      {
        id: "projects-dashboard",
        name: "Projects Dashboard",
        path: "/projects/dashboard",
        description: "Project overview and metrics",
        permissionId: "projects-dashboard",
      },
      {
        id: "projects-all",
        name: "All Projects",
        path: "/projects",
        description: "View all projects",
        permissionId: "projects-dashboard",
      },
      // {
      //   id: "projects-my",
      //   name: "My Projects",
      //   path: "/projects/my",
      //   description: "View my assigned projects",
      //   permissionId: "projects-my",
      // },

      {
        id: "projects-new",
        name: "Create Project",
        path: "/projects/new",
        description: "Create new projects",
        permissionId: "projects-create",
      },
      {
        id: "projects-kanban",
        name: "Kanban Board",
        path: "/projects/kanban",
        description: "Kanban project view",
        permissionId: "projects-kanban",
      },
      {
        id: "projects-calendar",
        name: "Calendar View",
        path: "/projects/calendar",
        description: "Calendar project view",
        permissionId: "projects-calendar",
      },
      {
        id: "projects-templates",
        name: "Templates",
        path: "/projects/templates",
        description: "Project templates",
        permissionId: "projects-templates",
      },
      {
        id: "projects-reports",
        name: "Reports",
        path: "/projects/reports",
        description: "Project progress reports",
        permissionId: "projects-reports",
      },
      {
        id: "projects-analytics",
        name: "Analytics",
        path: "/projects/analytics",
        description: "Project analytics and insights",
        permissionId: "projects-analytics",
      },
      {
        id: "projects-archive",
        name: "Archived",
        path: "/projects/archive",
        description: "Archived projects",
        permissionId: "projects-archive",
      },
    ],
  },

  inventory: {
    id: "inventory",
    name: "Inventory",
    description: "Inventory and stock management",
    icon: Package,
    category: "Operations",
    path: "/inventory",
    subItems: [
      {
        id: "inventory-dashboard",
        name: "Inventory Dashboard",
        path: "/inventory",
        description: "Inventory overview and metrics",
        permissionId: "inventory-dashboard",
      },
      {
        id: "inventory-items",
        name: "Items",
        path: "/inventory/items",
        description: "Inventory item management",
        permissionId: "inventory-items",
      },
      {
        id: "inventory-create",
        name: "Add Item",
        path: "/inventory/items/new",
        description: "Add new inventory items",
        permissionId: "inventory-create",
      },
      {
        id: "inventory-locations",
        name: "Locations",
        path: "/inventory/locations",
        description: "Inventory location management",
        permissionId: "inventory-locations",
      },
      {
        id: "inventory-movements",
        name: "Stock Movements",
        path: "/inventory/movements",
        description: "Track stock movements",
        permissionId: "inventory-movements",
      },
      {
        id: "inventory-reports",
        name: "Reports",
        path: "/inventory/reports",
        description: "Inventory reports and analytics",
        permissionId: "inventory-reports",
      },
      {
        id: "inventory-low-stock",
        name: "Low Stock Alert",
        path: "/inventory/items?low_stock=true",
        description: "Low stock alerts",
        permissionId: "inventory-reports",
      },
    ],
  },

  hr: {
    id: "hr",
    name: "Human Resources",
    description: "Employee and HR management",
    icon: Users,
    category: "Management",
    path: "/hr",
    subItems: [
      {
        id: "hr-dashboard",
        name: "HR Dashboard",
        path: "/hr",
        description: "HR overview and metrics",
        permissionId: "hr-dashboard",
      },
      {
        id: "hr-employees",
        name: "Employee Management",
        path: "/hr/employees",
        description: "Manage employee records",
        permissionId: "hr-employees",
      },
      {
        id: "hr-attendance",
        name: "Attendance Tracking",
        path: "/hr/attendance",
        description: "Track employee attendance",
        permissionId: "hr-attendance",
      },
      {
        id: "hr-leaves",
        name: "Leave Management",
        path: "/hr/leaves",
        description: "Manage leave requests and policies",
        permissionId: "hr-leaves",
      },
      {
        id: "hr-payroll",
        name: "Payroll Processing",
        path: "/hr/payroll",
        description: "Payroll processing and management",
        permissionId: "hr-payroll",
      },
      {
        id: "hr-performance",
        name: "Performance Reviews",
        path: "/hr/performance",
        description: "Performance reviews and evaluations",
        permissionId: "hr-performance",
      },
      {
        id: "hr-training",
        name: "Training Management",
        path: "/hr/training",
        description: "Employee training and development",
        permissionId: "hr-training",
      },
      {
        id: "hr-recruitment",
        name: "Recruitment",
        path: "/hr/recruitment",
        description: "Hiring and recruitment process",
        permissionId: "hr-recruitment",
      },
      {
        id: "hr-policies",
        name: "Policies & Documents",
        path: "/hr/policies",
        description: "HR policies and documentation",
        permissionId: "hr-policies",
      },
      {
        id: "hr-reports",
        name: "Reports & Analytics",
        path: "/hr/reports",
        description: "HR reports and analytics",
        permissionId: "hr-reports",
      },
      {
        id: "hr-org-chart",
        name: "Organizational Chart",
        path: "/hr/org-chart",
        description: "Company organizational structure",
        permissionId: "hr-org-chart",
      },
      {
        id: "hr-directory",
        name: "Employee Directory",
        path: "/hr/directory",
        description: "Employee contact directory",
        permissionId: "hr-directory",
      },
      {
        id: "hr-tasks",
        name: "Task Management",
        path: "/hr/tasks",
        description: "HR task management",
        permissionId: "hr-tasks",
      },
      {
        id: "hr-expenses",
        name: "Expense Approval",
        path: "/hr/expenses",
        description: "HR expense approval workflow",
        permissionId: "hr-expenses",
      },
    ],
  },

  "purchase-requests": {
    id: "purchase-requests",
    name: "Purchase Requests",
    description: "Purchase request workflow",
    icon: ShoppingCart,
    category: "Operations",
    path: "/purchase-requests",
    subItems: [
      {
        id: "purchase-dashboard",
        name: "Purchase Dashboard",
        path: "/purchase-requests/dashboard",
        description: "Purchase request overview",
        permissionId: "purchase-dashboard",
      },
      {
        id: "purchase-all",
        name: "All Requests",
        path: "/purchase-requests",
        description: "View all purchase requests",
        permissionId: "purchase-dashboard",
      },
      {
        id: "purchase-create",
        name: "Create Request",
        path: "/purchase-requests/create",
        description: "Create new purchase requests",
        permissionId: "purchase-create",
      },
      {
        id: "purchase-order-create",
        name: "Create Purchase Order",
        path: "/purchase-requests/create-order",
        description: "Create new purchase orders",
        permissionId: "purchase-order-create",
      },
      {
        id: "purchase-settings",
        name: "Settings",
        path: "/purchase-requests/settings",
        description: "Purchase request settings",
        permissionId: "purchase-settings",
      },
      {
        id: "purchase-pending",
        name: "Pending Approval",
        path: "/purchase-requests/pending-approval",
        description: "Requests pending approval",
        permissionId: "purchase-pending",
      },
      {
        id: "purchase-procurement",
        name: "Procurement Approval",
        path: "/purchase-requests/procurement",
        description: "Procurement approval workflow",
        permissionId: "purchase-procurement",
      },
      {
        id: "purchase-finance",
        name: "Payment Process",
        path: "/purchase-requests/finance",
        description: "Finance and payment processing",
        permissionId: "purchase-finance",
      },
      {
        id: "purchase-history",
        name: "History",
        path: "/purchase-requests/history",
        description: "Historical purchase requests",
        permissionId: "purchase-history",
      },
    ],
  },

  finance: {
    id: "finance",
    name: "Finance",
    description: "Financial management",
    icon: CreditCard,
    category: "Management",
    path: "/finance",
    subItems: [
      {
        id: "finance-dashboard",
        name: "Finance Dashboard",
        path: "/finance",
        description: "Financial overview and metrics",
        permissionId: "finance-dashboard",
      },
      {
        id: "finance-accounts",
        name: "Chart of Accounts",
        path: "/finance/accounts",
        description: "Chart of accounts management",
        permissionId: "finance-accounts",
      },
      {
        id: "finance-transactions",
        name: "Transactions",
        path: "/finance/transactions",
        description: "Financial transactions",
        permissionId: "finance-transactions",
      },
      {
        id: "finance-budgets",
        name: "Budget Management",
        path: "/finance/budgets",
        description: "Budget planning and tracking",
        permissionId: "finance-budgets",
      },
      {
        id: "finance-reports",
        name: "Financial Reports",
        path: "/finance/reports",
        description: "Financial reporting and analytics",
        permissionId: "finance-reports",
      },
      {
        id: "finance-expenses",
        name: "Expense Management",
        path: "/finance/expenses",
        description: "Expense tracking and approval",
        permissionId: "finance-expenses",
      },
      {
        id: "finance-payroll-approval",
        name: "Payroll Approval",
        path: "/finance/payroll-approval",
        description: "Payroll approval workflow",
        permissionId: "finance-payroll-approval",
      },
    ],
  },

  admin: {
    id: "admin",
    name: "Administration",
    description: "System administration",
    icon: Settings,
    category: "Admin",
    path: "/admin",
    subItems: [
      {
        id: "admin-dashboard",
        name: "Admin Dashboard",
        path: "/admin",
        description: "Administration overview",
        permissionId: "admin-dashboard",
      },
      {
        id: "admin-assets",
        name: "Asset Management",
        path: "/admin/assets",
        description: "Manage company assets",
        permissionId: "admin-assets",
      },
      {
        id: "admin-documents",
        name: "Document Repository",
        path: "/admin/documents",
        description: "Central document repository",
        permissionId: "admin-documents",
      },
      {
        id: "admin-settings",
        name: "System Settings",
        path: "/admin/settings",
        description: "System configuration",
        permissionId: "admin-settings",
      },
      {
        id: "admin-users",
        name: "User Management",
        path: "/admin/users",
        description: "Manage system users",
        permissionId: "admin-users",
      },
      {
        id: "admin-companies",
        name: "Company Management",
        path: "/admin/companies",
        description: "Manage companies and subscriptions",
        permissionId: "admin-companies",
      },
      {
        id: "admin-audit-logs",
        name: "Audit Logs",
        path: "/admin/audit-logs",
        description: "System audit trails",
        permissionId: "admin-audit-logs",
      },
      {
        id: "admin-backups",
        name: "Backup Management",
        path: "/admin/backups",
        description: "Data backup and restore",
        permissionId: "admin-backups",
      },
    ],
  },

  collaboration: {
    id: "collaboration",
    name: "Collaboration",
    description: "Team collaboration tools",
    icon: MessageSquare,
    category: "Communication",
    path: "/collaboration",
    subItems: [
      {
        id: "collaboration-dashboard",
        name: "Collaboration Dashboard",
        path: "/collaboration",
        description: "Collaboration overview",
        permissionId: "collaboration-dashboard",
      },
      {
        id: "collaboration-messages",
        name: "Messages",
        path: "/collaboration/messaging",
        description: "Team messaging and chat",
        permissionId: "collaboration-messages",
      },
      {
        id: "collaboration-announcements",
        name: "Announcements",
        path: "/collaboration/announcements",
        description: "Company announcements",
        permissionId: "collaboration-announcements",
      },
      {
        id: "collaboration-calendar",
        name: "Calendar",
        path: "/collaboration/calendar",
        description: "Team calendar and events",
        permissionId: "collaboration-calendar",
      },
      {
        id: "collaboration-forums",
        name: "Forums",
        path: "/collaboration/forums",
        description: "Team discussion forums",
        permissionId: "collaboration-forums",
      },
      {
        id: "collaboration-conferences",
        name: "Video Conferences",
        path: "/collaboration/conferences",
        description: "Video conferencing and meetings",
        permissionId: "collaboration-conferences",
      },
    ],
  },

  'file-share': {
    id: 'file-share',
    name: 'File Sharing',
    description: 'File sharing and collaboration',
    icon: Share2,
    category: 'Communication',
    path: '/file-share',
    subItems: [
      {
        id: 'file-share-dashboard',
        name: 'File Share Dashboard',
        path: '/file-share',
        description: 'File sharing overview',
        permissionId: 'file-share-dashboard'
      },
      {
        id: 'file-share-my',
        name: 'My Files',
        path: '/file-share/my',
        description: 'Personal file storage',
        permissionId: 'file-share-my'
      },
      {
        id: 'file-share-shared',
        name: 'Shared with Me',
        path: '/file-share/shared',
        description: 'Files shared with me',
        permissionId: 'file-share-shared'
      },
      {
        id: 'file-share-upload',
        name: 'Upload Files',
        path: '/file-share/upload',
        description: 'Upload new files',
        permissionId: 'file-share-upload'
      }
    ]
  },

  documents: {
    id: 'documents',
    name: 'Documents',
    description: 'Document workflow and storage',
    icon: FileText,
    category: 'Communication',
    path: '/documents',
    subItems: [
      {
        id: 'documents-dashboard',
        name: 'Documents Dashboard',
        path: '/documents',
        description: 'Document management overview',
        permissionId: 'documents-dashboard'
      },
      {
        id: 'documents-all',
        name: 'All Documents',
        path: '/documents/all',
        description: 'View all documents',
        permissionId: 'documents-all'
      },
      {
        id: 'documents-categories',
        name: 'Categories',
        path: '/documents/categories',
        description: 'Document categories',
        permissionId: 'documents-categories'
      },
      {
        id: 'documents-create',
        name: 'Create Document',
        path: '/documents/new',
        description: 'Create new documents',
        permissionId: 'documents-create'
      },
      {
        id: 'documents-workflow',
        name: 'Approval Workflow',
        path: '/documents/workflow',
        description: 'Document approval workflow',
        permissionId: 'documents-workflow'
      }
    ]
  }
};

// Convert to array format for easier iteration
export const SIDEBAR_MODULES_ARRAY = Object.values(SIDEBAR_MODULES);

// Group modules by category
export const groupModulesByCategory = () => {
  const grouped = {};
  SIDEBAR_MODULES_ARRAY.forEach(module => {
    if (!grouped[module.category]) {
      grouped[module.category] = [];
    }
    grouped[module.category].push(module);
  });
  return grouped;
};

// Get module by ID
export const getModuleById = (moduleId) => {
  return SIDEBAR_MODULES[moduleId] || null;
};

// Get all sub-items for a module
export const getModuleSubItems = (moduleId) => {
  const module = SIDEBAR_MODULES[moduleId];
  return module ? module.subItems : [];
};

// Get sub-item by ID within a module
export const getSubItemById = (moduleId, subItemId) => {
  const module = SIDEBAR_MODULES[moduleId];
  if (!module || !module.subItems) return null;
  return module.subItems.find(item => item.id === subItemId) || null;
};

// Convert sidebar modules to the format expected by DynamicSidebar (legacy compatibility)
export const getSidebarModulesForDynamicSidebar = () => {
  const modules = {};
  Object.values(SIDEBAR_MODULES).forEach(module => {
    modules[module.id] = {
      id: module.id,
      name: module.name,
      icon: module.icon,
      path: module.path,
      subItems: module.subItems.map(item => ({
        id: item.id,
        name: item.name,
        path: item.path
      }))
    };
  });
  return modules;
};

export default SIDEBAR_MODULES;