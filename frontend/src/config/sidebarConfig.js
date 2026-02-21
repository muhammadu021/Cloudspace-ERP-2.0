import { 
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  ShoppingBag,
  Truck,
  FolderKanban,
  FolderOpen,
  CreditCard,
  Wallet,
  Receipt,
  Users,
  UserPlus,
  GraduationCap,
  Heart,
  MessageSquare,
  Briefcase,
  Settings,
  UserCheck,
  Mail,
  HeadphonesIcon,
  FileCheck,
  Wrench,
  Package,
  Share2,
  FileText
} from 'lucide-react';

/**
 * CLOUDSPACE ERP - COMPREHENSIVE MODULE CONFIGURATION
 * Complete configuration with all existing sub-items preserved
 */

export const MODULE_STATUS = {
  ACTIVE: 'active',
  COMING_SOON: 'coming_soon',
  PARTIAL: 'partial'
};

export const DESK_MODULES = {
  // ==========================================
  // DASHBOARD - ACTIVE
  // ==========================================
  'dashboard': {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard and analytics',
    icon: BarChart3,
    category: 'Core',
    path: '/dashboard',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'dashboard-overview',
        name: 'Overview',
        path: '/dashboard',
        description: 'Main dashboard view',
        permissionId: 'dashboard-overview',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // MY DESK (Self-Service) - ACTIVE
  // ==========================================
  'my-desk': {
    id: 'my-desk',
    name: 'My Space',
    description: 'Personal dashboard and self-service portal',
    icon: Wrench,
    category: 'Personal',
    path: '/self-service',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'self-service-dashboard',
        name: 'My Dashboard',
        path: '/self-service',
        description: 'Personal dashboard view',
        permissionId: 'self-service-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-tasks',
        name: 'My Tasks',
        path: '/self-service/tasks',
        description: 'Personal task management',
        permissionId: 'self-service-tasks',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-profile',
        name: 'My Profile',
        path: '/self-service/profile',
        description: 'Personal profile management',
        permissionId: 'self-service-profile',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-time-tracking',
        name: 'Time Tracking',
        path: '/self-service/time-tracking',
        description: 'Track work hours and attendance',
        permissionId: 'self-service-time-tracking',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-leave-requests',
        name: 'Leave Requests',
        path: '/self-service/leave-requests',
        description: 'Submit and manage leave requests',
        permissionId: 'self-service-leave-requests',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-expense-claims',
        name: 'Expense Claims',
        path: '/self-service/expense-claims',
        description: 'Submit and track expense claims',
        permissionId: 'self-service-expense-claims',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-documents',
        name: 'My Documents',
        path: '/self-service/documents',
        description: 'Personal document management',
        permissionId: 'self-service-documents',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-payslips',
        name: 'Payslips',
        path: '/self-service/payslips',
        description: 'View and download payslips',
        permissionId: 'self-service-payslips',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'self-service-benefits',
        name: 'Benefits',
        path: '/self-service/benefits',
        description: 'View and manage employee benefits',
        permissionId: 'self-service-benefits',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // SALES DESK
  // ==========================================
  'sales-desk': {
    id: 'sales-desk',
    name: 'Sales Space',
    description: 'Sales management with Restaurant & Supermarket modes',
    icon: ShoppingCart,
    category: 'Sales',
    path: '/sales',
    status: MODULE_STATUS.ACTIVE,
    permissionId: 'sales-desk',
    subItems: [
      {
        id: 'sales-dashboard',
        name: 'Sales Dashboard',
        path: '/sales/dashboard',
        permissionId: 'sales-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-pos',
        name: 'Point of Sale',
        path: '/sales/pos',
        permissionId: 'sales-pos',
        status: MODULE_STATUS.ACTIVE,
        description: 'Restaurant & Supermarket POS'
      },
      {
        id: 'sales-orders',
        name: 'Sales Orders',
        path: '/sales/orders',
        permissionId: 'sales-orders',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-customers',
        name: 'Customer Management',
        path: '/sales/customers',
        permissionId: 'sales-customers',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-leads',
        name: 'Leads & Opportunities',
        path: '/sales/leads',
        permissionId: 'sales-leads',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-analytics',
        name: 'Sales Analytics',
        path: '/sales/analytics',
        permissionId: 'sales-analytics',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-reports',
        name: 'Sales Reports',
        path: '/sales/reports',
        permissionId: 'sales-reports',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'sales-settings',
        name: 'Settings',
        path: '/sales/settings',
        permissionId: 'sales-settings',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // PURCHASE DESK - ACTIVE
  // ==========================================
  'purchase-desk': {
    id: 'purchase-desk',
    name: 'Purchase Space',
    description: 'Employee purchase requests and approvals',
    icon: ShoppingBag,
    category: 'Operations',
    path: '/purchase-requests',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'purchase-dashboard',
        name: 'Purchase Dashboard',
        path: '/purchase-requests/dashboard',
        description: 'Purchase request overview',
        permissionId: 'purchase-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-all',
        name: 'All Requests',
        path: '/purchase-requests',
        description: 'View all purchase requests',
        permissionId: 'purchase-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-create',
        name: 'Create Request',
        path: '/purchase-requests/create',
        description: 'Create new purchase requests',
        permissionId: 'purchase-create',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-order-create',
        name: 'Create Purchase Order',
        path: '/purchase-requests/create-order',
        description: 'Create new purchase orders',
        permissionId: 'purchase-order-create',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-settings',
        name: 'Settings',
        path: '/purchase-requests/settings',
        description: 'Purchase request settings',
        permissionId: 'purchase-settings',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-pending',
        name: 'Pending Approval',
        path: '/purchase-requests/pending-approval',
        description: 'Requests pending approval',
        permissionId: 'purchase-pending',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-procurement',
        name: 'Procurement Approval',
        path: '/purchase-requests/procurement',
        description: 'Procurement approval workflow',
        permissionId: 'purchase-procurement',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-finance',
        name: 'Payment Process',
        path: '/purchase-requests/finance',
        description: 'Finance and payment processing',
        permissionId: 'purchase-finance',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'purchase-history',
        name: 'History',
        path: '/purchase-requests/history',
        description: 'Historical purchase requests',
        permissionId: 'purchase-history',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // PROCUREMENT DESK - COMING SOON
  // ==========================================
  'procurement-desk': {
    id: 'procurement-desk',
    name: 'Procurement Space',
    description: 'Supplier management and procurement workflow',
    icon: Truck,
    category: 'Operations',
    path: '/procurement',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'procurement-suppliers',
        name: 'Supplier / Vendor Database',
        path: '/procurement/suppliers',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-workflow',
        name: 'Procurement Workflow',
        path: '/procurement/workflow',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-quotations',
        name: 'Quotation Comparison',
        path: '/procurement/quotations',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-orders',
        name: 'Purchase Orders',
        path: '/procurement/orders',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-grn',
        name: 'Goods Received Notes (GRN)',
        path: '/procurement/grn',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-payment',
        name: 'Payment & Finance Approval',
        path: '/procurement/payment',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'procurement-audit',
        name: 'Audit Trail',
        path: '/procurement/audit',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  // ==========================================
  // PROJECT DESK - ACTIVE
  // ==========================================
  'project-desk': {
    id: 'project-desk',
    name: 'Project Space',
    description: 'Project management and collaboration',
    icon: FolderOpen,
    category: 'Operations',
    path: '/projects',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'projects-dashboard',
        name: 'Projects Dashboard',
        path: '/projects/dashboard',
        description: 'Project overview and metrics',
        permissionId: 'projects-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-all',
        name: 'All Projects',
        path: '/projects',
        description: 'View all projects',
        permissionId: 'projects-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      // {
      //   id: 'projects-my',
      //   name: 'My Projects',
      //   path: '/projects/my',
      //   description: 'View my assigned projects',
      //   permissionId: 'projects-my',
      //   status: MODULE_STATUS.ACTIVE
      // },
      {
        id: 'projects-new',
        name: 'Create Project',
        path: '/projects/new',
        description: 'Create new projects',
        permissionId: 'projects-create',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-kanban',
        name: 'Kanban Board',
        path: '/projects/kanban',
        description: 'Kanban project view',
        permissionId: 'projects-kanban',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-calendar',
        name: 'Calendar View',
        path: '/projects/calendar',
        description: 'Calendar project view',
        permissionId: 'projects-calendar',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-templates',
        name: 'Templates',
        path: '/projects/templates',
        description: 'Project templates',
        permissionId: 'projects-templates',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-reports',
        name: 'Reports',
        path: '/projects/reports',
        description: 'Project progress reports',
        permissionId: 'projects-reports',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-analytics',
        name: 'Analytics',
        path: '/projects/analytics',
        description: 'Project analytics and insights',
        permissionId: 'projects-analytics',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'projects-archive',
        name: 'Archived',
        path: '/projects/archive',
        description: 'Archived projects',
        permissionId: 'projects-archive',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // INVENTORY DESK - ACTIVE
  // ==========================================
  'inventory-desk': {
    id: 'inventory-desk',
    name: 'Inventory Space',
    description: 'Inventory and stock management',
    icon: Package,
    category: 'Operations',
    path: '/inventory',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'inventory-dashboard',
        name: 'Inventory Dashboard',
        path: '/inventory',
        description: 'Inventory overview and metrics',
        permissionId: 'inventory-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-items',
        name: 'Items',
        path: '/inventory/items',
        description: 'Inventory item management',
        permissionId: 'inventory-items',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-create',
        name: 'Add Item',
        path: '/inventory/items/new',
        description: 'Add new inventory items',
        permissionId: 'inventory-create',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-locations',
        name: 'Locations',
        path: '/inventory/locations',
        description: 'Inventory location management',
        permissionId: 'inventory-locations',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-movements',
        name: 'Stock Movements',
        path: '/inventory/movements',
        description: 'Track stock movements',
        permissionId: 'inventory-movements',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-reports',
        name: 'Reports',
        path: '/inventory/reports',
        description: 'Inventory reports and analytics',
        permissionId: 'inventory-reports',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'inventory-low-stock',
        name: 'Low Stock Alert',
        path: '/inventory/items?low_stock=true',
        description: 'Low stock alerts',
        permissionId: 'inventory-reports',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // FINANCE DESK - ACTIVE
  // ==========================================
  'finance-desk': {
    id: 'finance-desk',
    name: 'Finance Space',
    description: 'Financial management and accounting',
    icon: CreditCard,
    category: 'Finance',
    path: '/finance',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'finance-dashboard',
        name: 'Finance Dashboard',
        path: '/finance',
        description: 'Financial overview and metrics',
        permissionId: 'finance-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-accounts',
        name: 'Chart of Accounts',
        path: '/finance/accounts',
        description: 'Chart of accounts management',
        permissionId: 'finance-accounts',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-transactions',
        name: 'Transactions',
        path: '/finance/transactions',
        description: 'Financial transactions',
        permissionId: 'finance-transactions',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-budgets',
        name: 'Budget Management',
        path: '/finance/budgets',
        description: 'Budget planning and tracking',
        permissionId: 'finance-budgets',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-reports',
        name: 'Financial Reports',
        path: '/finance/reports',
        description: 'Financial reporting and analytics',
        permissionId: 'finance-reports',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-expenses',
        name: 'Expense Management',
        path: '/finance/expenses',
        description: 'Expense tracking and approval',
        permissionId: 'finance-expenses',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'finance-payroll-approval',
        name: 'Payroll Approval',
        path: '/finance/payroll-approval',
        description: 'Payroll approval workflow',
        permissionId: 'finance-payroll-approval',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // HR DESK - ACTIVE
  // ==========================================
  'hr-desk': {
    id: 'hr-desk',
    name: 'HR Space',
    description: 'Human resources management',
    icon: Users,
    category: 'HR',
    path: '/hr',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'hr-dashboard',
        name: 'HR Dashboard',
        path: '/hr',
        description: 'HR overview and metrics',
        permissionId: 'hr-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-employees',
        name: 'Employee Management',
        path: '/hr/employees',
        description: 'Manage employee records',
        permissionId: 'hr-employees',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-attendance',
        name: 'Attendance Tracking',
        path: '/hr/attendance',
        description: 'Track employee attendance',
        permissionId: 'hr-attendance',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-leaves',
        name: 'Leave Management',
        path: '/hr/leaves',
        description: 'Manage leave requests and policies',
        permissionId: 'hr-leaves',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-payroll',
        name: 'Payroll Processing',
        path: '/hr/payroll',
        description: 'Payroll processing and management',
        permissionId: 'hr-payroll',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-performance',
        name: 'Performance Reviews',
        path: '/hr/performance',
        description: 'Performance reviews and evaluations',
        permissionId: 'hr-performance',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-training',
        name: 'Training Management',
        path: '/hr/training',
        description: 'Employee training and development',
        permissionId: 'hr-training',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-recruitment',
        name: 'Recruitment',
        path: '/hr/recruitment',
        description: 'Hiring and recruitment process',
        permissionId: 'hr-recruitment',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-policies',
        name: 'Policies & Documents',
        path: '/hr/policies',
        description: 'HR policies and documentation',
        permissionId: 'hr-policies',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-reports',
        name: 'Reports & Analytics',
        path: '/hr/reports',
        description: 'HR reports and analytics',
        permissionId: 'hr-reports',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-org-chart',
        name: 'Organizational Chart',
        path: '/hr/org-chart',
        description: 'Company organizational structure',
        permissionId: 'hr-org-chart',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-directory',
        name: 'Employee Directory',
        path: '/hr/directory',
        description: 'Employee contact directory',
        permissionId: 'hr-directory',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-tasks',
        name: 'Task Management',
        path: '/hr/tasks',
        description: 'HR task management',
        permissionId: 'hr-tasks',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'hr-expenses',
        name: 'Expense Approval',
        path: '/hr/expenses',
        description: 'HR expense approval workflow',
        permissionId: 'hr-expenses',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // COLLABORATION DESK - ACTIVE
  // ==========================================
  'collaboration-desk': {
    id: 'collaboration-desk',
    name: 'Collaboration Space',
    description: 'Team collaboration and communication',
    icon: MessageSquare,
    category: 'Communication',
    path: '/collaboration',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'collaboration-dashboard',
        name: 'Collaboration Dashboard',
        path: '/collaboration',
        description: 'Collaboration overview',
        permissionId: 'collaboration-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'collaboration-messages',
        name: 'Messages',
        path: '/collaboration/messaging',
        description: 'Team messaging and chat',
        permissionId: 'collaboration-messages',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'collaboration-announcements',
        name: 'Announcements',
        path: '/collaboration/announcements',
        description: 'Company announcements',
        permissionId: 'collaboration-announcements',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'collaboration-calendar',
        name: 'Calendar',
        path: '/collaboration/calendar',
        description: 'Team calendar and events',
        permissionId: 'collaboration-calendar',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'collaboration-forums',
        name: 'Forums',
        path: '/collaboration/forums',
        description: 'Team discussion forums',
        permissionId: 'collaboration-forums',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'collaboration-conferences',
        name: 'Video Conferences',
        path: '/collaboration/conferences',
        description: 'Video conferencing and meetings',
        permissionId: 'collaboration-conferences',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // OFFICE DESK - ACTIVE
  // ==========================================
  'office-desk': {
    id: 'office-desk',
    name: 'Office Space',
    description: 'Office desk management and booking system',
    icon: Briefcase,
    category: 'Productivity',
    path: '/office-desk',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'office-desk-management',
        name: 'Desk Management',
        path: '/office-desk',
        description: 'Manage office desks and assignments',
        permissionId: 'office-desk-view',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'office-desk-availability',
        name: 'Desk Availability',
        path: '/office-desk?tab=availability',
        description: 'View available desks',
        permissionId: 'office-desk-view',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'office-desk-create',
        name: 'Add New Desk',
        path: '/office-desk?tab=create',
        description: 'Create new office desk',
        permissionId: 'office-desk-create',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'documents-workflow',
        name: 'Approval Workflow',
        path: '/documents/workflow',
        description: 'Document approval workflow',
        permissionId: 'documents-workflow',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'file-share-dashboard',
        name: 'File Share Dashboard',
        path: '/file-share',
        description: 'File sharing overview',
        permissionId: 'file-share-dashboard',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'file-share-my',
        name: 'My Files',
        path: '/file-share/my',
        description: 'Personal file storage',
        permissionId: 'file-share-my',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'file-share-shared',
        name: 'Shared with Me',
        path: '/file-share/shared',
        description: 'Files shared with me',
        permissionId: 'file-share-shared',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'office-desk-assign',
        name: 'Assign Desks',
        path: '/office-desk?tab=assign',
        description: 'Assign desks to employees',
        permissionId: 'office-desk-assign',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  // ==========================================
  // SETTINGS DESK - ACTIVE
  // ==========================================
  'settings-desk': {
    id: 'settings-desk',
    name: 'Settings Space',
    description: 'System settings and configuration',
    icon: Settings,
    category: 'Administration',
    path: '/settings',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'settings-dashboard',
        name: 'Settings Dashboard',
        path: '/settings/dashboard',
        description: 'Settings overview',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'settings-user-management',
        name: 'User Management',
        path: '/settings/user-management',
        description: 'Manage users and permissions',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'settings-company-users',
        name: 'Company Users',
        path: '/settings/company-users',
        description: 'Manage company users and their module access',
        permissionId: 'settings-company-users',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'settings-audit-logs',
        name: 'Audit Logs',
        path: '/settings/audit-logs',
        description: 'System audit trails',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'settings-asset-management',
        name: 'Asset Management',
        path: '/settings/asset-management',
        description: 'Manage company assets',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // ADMIN DESK - ACTIVE
  // ==========================================
  'admin-desk': {
    id: 'admin-desk',
    name: 'Admin Space',
    description: 'System administration and settings',
    icon: Settings,
    category: 'Administration',
    path: '/admin',
    status: MODULE_STATUS.ACTIVE,
    subItems: [
      {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        path: '/admin',
        description: 'Administration overview',
        permissionId: 'admin-dashboard',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-assets',
        name: 'Asset Management',
        path: '/admin/assets',
        description: 'Manage company assets',
        permissionId: 'admin-assets',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-documents',
        name: 'Document Repository',
        path: '/admin/documents',
        description: 'Central document repository',
        permissionId: 'admin-documents',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-settings',
        name: 'System Settings',
        path: '/admin/settings',
        description: 'System configuration',
        permissionId: 'admin-settings',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-users',
        name: 'User Management',
        path: '/admin/users',
        description: 'Manage system users',
        permissionId: 'admin-users',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-companies',
        name: 'Company Management',
        path: '/admin/companies',
        description: 'Manage companies and subscriptions',
        permissionId: 'admin-companies',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-audit-logs',
        name: 'Audit Logs',
        path: '/admin/audit-logs',
        description: 'System audit trails',
        permissionId: 'admin-audit-logs',
        status: MODULE_STATUS.ACTIVE
      },
      {
        id: 'admin-backups',
        name: 'Backup Management',
        path: '/admin/backups',
        description: 'Data backup and restore',
        permissionId: 'admin-backups',
        status: MODULE_STATUS.ACTIVE
      }
    ]
  },

  // ==========================================
  // COMING SOON DESKS
  // ==========================================
  'payroll-desk': {
    id: 'payroll-desk',
    name: 'Payroll Space',
    description: 'Employee payroll processing and management',
    icon: Wallet,
    category: 'HR',
    path: '/payroll',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'payroll-processing',
        name: 'Employee Payroll Processing',
        path: '/payroll/processing',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'payroll-payslips',
        name: 'Payslip Generation & Distribution',
        path: '/payroll/payslips',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'payroll-benefits',
        name: 'Benefits & Incentive Tracking',
        path: '/payroll/benefits',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'payroll-approvals',
        name: 'Payroll Approvals',
        path: '/payroll/approvals',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'payroll-integration',
        name: 'Integration with HR & Finance',
        path: '/payroll/integration',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'expense-desk': {
    id: 'expense-desk',
    name: 'Expense Space',
    description: 'Employee expense claims and approvals',
    icon: Receipt,
    category: 'Finance',
    path: '/expenses',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'expense-claims',
        name: 'Employee Expense Claims',
        path: '/expenses/claims',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'expense-approval',
        name: 'Approval Workflow',
        path: '/expenses/approval',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'expense-tracking',
        name: 'Expense Tracking & Reporting',
        path: '/expenses/tracking',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'expense-finance',
        name: 'Integration with Finance Desk',
        path: '/expenses/finance',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'recruitment-desk': {
    id: 'recruitment-desk',
    name: 'Recruitment Space',
    description: 'Applicant tracking and onboarding',
    icon: UserPlus,
    category: 'HR',
    path: '/recruitment',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'recruitment-tracking',
        name: 'Applicant Tracking',
        path: '/recruitment/tracking',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'recruitment-onboarding',
        name: 'Onboarding Process Management',
        path: '/recruitment/onboarding',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'recruitment-hr',
        name: 'Integration with HR Desk',
        path: '/recruitment/hr',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'school-desk': {
    id: 'school-desk',
    name: 'School Space',
    description: 'School management system',
    icon: GraduationCap,
    category: 'Specialized',
    path: '/school',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'school-students',
        name: 'Student Registration & Records',
        path: '/school/students',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-fees',
        name: 'Fees & Payment Management',
        path: '/school/fees',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-staff-payroll',
        name: 'Staff Payroll Integration',
        path: '/school/staff-payroll',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-attendance',
        name: 'Attendance (Students & Staff)',
        path: '/school/attendance',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-timetable',
        name: 'Timetable Scheduling',
        path: '/school/timetable',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-exams',
        name: 'Exams & Grades',
        path: '/school/exams',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-parents',
        name: 'Parent Communication',
        path: '/school/parents',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-inventory',
        name: 'Inventory & Asset Tracking',
        path: '/school/inventory',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'school-reports',
        name: 'Academic & Financial Reports',
        path: '/school/reports',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'health-desk': {
    id: 'health-desk',
    name: 'Health Space',
    description: 'Healthcare management system',
    icon: Heart,
    category: 'Specialized',
    path: '/health',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'health-patients',
        name: 'Patient Records (EMR)',
        path: '/health/patients',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-appointments',
        name: 'Appointment Scheduling',
        path: '/health/appointments',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-staff',
        name: 'Doctor & Staff Management',
        path: '/health/staff',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-pharmacy',
        name: 'Pharmacy & Inventory',
        path: '/health/pharmacy',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-billing',
        name: 'Billing & Payments',
        path: '/health/billing',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-lab',
        name: 'Lab Management',
        path: '/health/lab',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-inpatient',
        name: 'In/Out-Patient Management',
        path: '/health/inpatient',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-hr-payroll',
        name: 'HR & Payroll Integration',
        path: '/health/hr-payroll',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'health-reports',
        name: 'Medical & Financial Reports',
        path: '/health/reports',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'visitor-desk': {
    id: 'visitor-desk',
    name: 'Visitor Space',
    description: 'Visitor management system',
    icon: UserCheck,
    category: 'Operations',
    path: '/visitor',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'visitor-registration',
        name: 'Visitor Registration',
        path: '/visitor/registration',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'visitor-tracking',
        name: 'Sign-In / Sign-Out Tracking',
        path: '/visitor/tracking',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'visitor-badges',
        name: 'Digital Badge Generation',
        path: '/visitor/badges',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'visitor-notifications',
        name: 'Notifications to Host',
        path: '/visitor/notifications',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'visitor-analytics',
        name: 'Visitor Analytics',
        path: '/visitor/analytics',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'mail-desk': {
    id: 'mail-desk',
    name: 'Mail Space',
    description: 'Professional email management',
    icon: Mail,
    category: 'Communication',
    path: '/mail',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'mail-domains',
        name: 'Domain Registration & Renewal',
        path: '/mail/domains',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'mail-accounts',
        name: 'Professional Email Accounts',
        path: '/mail/accounts',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'mail-integration',
        name: 'Office Desk Integration',
        path: '/mail/integration',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'mail-security',
        name: 'Spam & Security Management',
        path: '/mail/security',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'mail-setup',
        name: 'Setup via ERP Portal',
        path: '/mail/setup',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'support-desk': {
    id: 'support-desk',
    name: 'Support Space',
    description: 'Customer support and helpdesk',
    icon: HeadphonesIcon,
    category: 'Support',
    path: '/support',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'support-tickets',
        name: 'Support Tickets',
        path: '/support/tickets',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'support-categories',
        name: 'Ticket Categories',
        path: '/support/categories',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'support-faq',
        name: 'FAQ Library',
        path: '/support/faq',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'support-analytics',
        name: 'Support Analytics',
        path: '/support/analytics',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  },

  'compliance-desk': {
    id: 'compliance-desk',
    name: 'Compliance Space',
    description: 'Tax compliance and regulatory management',
    icon: FileCheck,
    category: 'Finance',
    path: '/compliance',
    status: MODULE_STATUS.COMING_SOON,
    badge: 'Coming Soon',
    subItems: [
      {
        id: 'compliance-vat',
        name: 'Auto-calculate VAT & Taxes',
        path: '/compliance/vat',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'compliance-export',
        name: 'Export-ready Tax Files',
        path: '/compliance/export',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'compliance-finance',
        name: 'Finance Desk Integration',
        path: '/compliance/finance',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'compliance-alerts',
        name: 'Compliance Alerts & Deadlines',
        path: '/compliance/alerts',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      },
      {
        id: 'compliance-audit',
        name: 'Audit Reporting Dashboard',
        path: '/compliance/audit',
        status: MODULE_STATUS.COMING_SOON,
        badge: 'Coming Soon'
      }
    ]
  }
};

// Convert to array format for easier iteration
export const DESK_MODULES_ARRAY = Object.values(DESK_MODULES);

// Backward compatibility alias
export const SIDEBAR_MODULES_ARRAY = DESK_MODULES_ARRAY;
export const SIDEBAR_MODULES = DESK_MODULES;

// Group modules by category
export const groupModulesByCategory = () => {
  const grouped = {};
  DESK_MODULES_ARRAY.forEach(module => {
    if (!grouped[module.category]) {
      grouped[module.category] = [];
    }
    grouped[module.category].push(module);
  });
  return grouped;
};

// Get module by ID
export const getModuleById = (moduleId) => {
  return DESK_MODULES[moduleId] || null;
};

// Get active modules only
export const getActiveModules = () => {
  return DESK_MODULES_ARRAY.filter(module => module.status === MODULE_STATUS.ACTIVE);
};

// Get coming soon modules
export const getComingSoonModules = () => {
  return DESK_MODULES_ARRAY.filter(module => module.status === MODULE_STATUS.COMING_SOON);
};

// Module ID mapping for backward compatibility with backend
export const MODULE_ID_MAPPING = {
  'dashboard': 'dashboard',
  'self-service': 'my-desk',
  'sales': 'sales-desk',
  'purchase-requests': 'purchase-desk',
  'procurement': 'procurement-desk',
  'projects': 'project-desk',
  'inventory': 'inventory-desk',
  'finance': 'finance-desk',
  'payroll': 'payroll-desk',
  'expense': 'expense-desk',
  'hr': 'hr-desk',
  'recruitment': 'recruitment-desk',
  'school': 'school-desk',
  'health': 'health-desk',
  'collaboration': 'collaboration-desk',
  'office': 'office-desk',
  'documents': 'office-desk',
  'file-share': 'office-desk',
  'admin': 'admin-desk',
  'visitor': 'visitor-desk',
  'mail': 'mail-desk',
  'support': 'support-desk',
  'compliance': 'compliance-desk'
};

// Convert to format expected by DynamicSidebar
export const getSidebarModulesForDynamicSidebar = () => {
  const modules = {};
  
  // Add modules with their IDs
  Object.values(DESK_MODULES).forEach(module => {
    modules[module.id] = {
      id: module.id,
      name: module.name,
      icon: module.icon,
      path: module.path,
      status: module.status,
      badge: module.badge,
      subItems: module.subItems.map(item => ({
        id: item.id,
        name: item.name,
        path: item.path,
        status: item.status,
        badge: item.badge,
        permissionId: item.permissionId
      }))
    };
  });
  
  // Add backward compatibility mappings
  Object.entries(MODULE_ID_MAPPING).forEach(([oldId, newId]) => {
    if (modules[newId] && oldId !== newId) {
      modules[oldId] = modules[newId];
    }
  });
  
  return modules;
};

export default DESK_MODULES;
