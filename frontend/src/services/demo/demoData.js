const STORAGE_KEY = 'cleardesk_demo_data_v6';

const randomString = () => Math.random().toString(36).slice(2, 10);
const generateId = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${randomString()}`;

const defaultData = {
  users: [
    {
      id: 1,
      email: 'admin@cloudspace.com',
      first_name: 'Cloudspace',
      last_name: 'Admin',
      company_id: 101,
      company_name: 'Cloudspace Demo Corp',
      user_type_id: 1,
      role_id: 1,
      department_id: 1,
      avatar: '/placeholder-user.jpg',
      UserType: {
        id: 1,
        name: 'System Admin',
        sidebar_modules: [
          {
            module_id: 'dashboard',
            enabled: true,
            items: ['dashboard-overview', 'dashboard-analytics', 'dashboard-reports'],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'projects',
            enabled: true,
            items: [
              'projects-dashboard',
              'projects-my',
              'projects-create',
              'projects-kanban',
              'projects-calendar',
              'projects-templates',
              'projects-reports',
              'projects-analytics',
              'projects-archive',
              'projects-gantt',
              'projects-timeline',
              'projects-budget',
              'projects-team',
              'projects-tasks',
            ],
            permissions: ['view', 'create', 'edit', 'archive', 'delete', 'manage'],
          },
          {
            module_id: 'inventory',
            enabled: true,
            items: [
              'inventory-dashboard',
              'inventory-items',
              'inventory-create',
              'inventory-locations',
              'inventory-movements',
              'inventory-reports',
              'inventory-analytics',
              'inventory-forecasting',
              'inventory-barcodes',
              'inventory-audit',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'hr',
            enabled: true,
            items: [
              'hr-dashboard',
              'hr-employees',
              'hr-attendance',
              'hr-leaves',
              'hr-payroll',
              'hr-performance',
              'hr-training',
              'hr-recruitment',
              'hr-policies',
              'hr-reports',
              'hr-org-chart',
              'hr-directory',
              'hr-tasks',
              'hr-expenses',
              'hr-benefits',
              'hr-compliance',
              'hr-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'finance',
            enabled: true,
            items: [
              'finance-dashboard',
              'finance-accounts',
              'finance-transactions',
              'finance-budgets',
              'finance-reports',
              'finance-expenses',
              'finance-payroll-approval',
              'finance-invoicing',
              'finance-billing',
              'finance-reconciliation',
              'finance-forecasting',
              'finance-analytics',
              'finance-audit',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'admin',
            enabled: true,
            items: [
              'admin-dashboard',
              'admin-assets',
              'admin-documents',
              'admin-settings',
              'admin-users',
              'admin-roles',
              'admin-permissions',
              'admin-audit-logs',
              'admin-backups',
              'admin-security',
              'admin-integrations',
              'admin-api',
              'admin-notifications',
              'admin-system-config',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'sales',
            enabled: true,
            items: [
              'sales-dashboard',
              'sales-orders',
              'sales-customers',
              'sales-reports',
              'sales-forecasting',
              'sales-pipeline',
              'sales-campaigns',
              'sales-analytics',
              'sales-quotes',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'purchase',
            enabled: true,
            items: [
              'purchase-dashboard',
              'purchase-create',
              'purchase-order-create',
              'purchase-settings',
              'purchase-pending',
              'purchase-procurement',
              'purchase-finance',
              'purchase-history',
              'purchase-analytics',
              'purchase-vendors',
              'purchase-rfq',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'self-service',
            enabled: true,
            items: [
              'self-service-dashboard',
              'self-service-tasks',
              'self-service-profile',
              'self-service-time-tracking',
              'self-service-leave-requests',
              'self-service-expense-claims',
              'self-service-documents',
              'self-service-payslips',
              'self-service-benefits',
              'self-service-help',
            ],
            permissions: ['view', 'manage', 'create', 'edit'],
          },
          {
            module_id: 'collaboration',
            enabled: true,
            items: [
              'collaboration-dashboard',
              'collaboration-teams',
              'collaboration-chat',
              'collaboration-file-sharing',
              'collaboration-calendar',
              'collaboration-meetings',
              'collaboration-tasks',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'procurement',
            enabled: true,
            items: [
              'procurement-dashboard',
              'procurement-requests',
              'procurement-vendors',
              'procurement-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'payroll',
            enabled: true,
            items: [
              'payroll-dashboard',
              'payroll-employees',
              'payroll-salary',
              'payroll-deductions',
              'payroll-reports',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'expense',
            enabled: true,
            items: [
              'expense-dashboard',
              'expense-claims',
              'expense-reports',
              'expense-approvals',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'recruitment',
            enabled: true,
            items: [
              'recruitment-dashboard',
              'recruitment-jobs',
              'recruitment-candidates',
              'recruitment-interviews',
              'recruitment-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'school',
            enabled: true,
            items: [
              'school-dashboard',
              'school-students',
              'school-courses',
              'school-grades',
              'school-attendance',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'health',
            enabled: true,
            items: [
              'health-dashboard',
              'health-patients',
              'health-appointments',
              'health-medical-records',
              'health-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'office',
            enabled: true,
            items: [
              'office-dashboard',
              'office-desks',
              'office-rooms',
              'office-maintenance',
              'office-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'visitor',
            enabled: true,
            items: [
              'visitor-dashboard',
              'visitor-check-in',
              'visitor-badge',
              'visitor-logs',
              'visitor-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'mail',
            enabled: true,
            items: [
              'mail-dashboard',
              'mail-inbox',
              'mail-outbox',
              'mail-tracking',
              'mail-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'support',
            enabled: true,
            items: [
              'support-dashboard',
              'support-tickets',
              'support-knowledge-base',
              'support-analytics',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
          {
            module_id: 'compliance',
            enabled: true,
            items: [
              'compliance-dashboard',
              'compliance-policies',
              'compliance-audit',
              'compliance-reports',
            ],
            permissions: ['view', 'manage', 'create', 'edit', 'delete'],
          },
        ],
      },
      Role: {
        id: 1,
        name: 'System Administrator',
      },
    },
  ],
  notifications: [
    { id: 1, title: 'Payroll Processed', message: 'January payroll has been successfully processed.', type: 'success', created_at: '2026-02-01T10:00:00Z', company_id: 101, read_at: null },
    { id: 2, title: 'New Leave Request', message: 'Yusuf Garba has requested annual leave.', type: 'info', created_at: '2026-02-03T09:30:00Z', company_id: 101, read_at: null },
    { id: 3, title: 'Inventory Alert', message: 'Dell XPS 15 stock is running low.', type: 'warning', created_at: '2026-02-05T15:45:00Z', company_id: 101, read_at: null }
  ],
  alerts: [],
  dashboard: {
    stats: {
      projects: { total: 3, change: '+12%', changeType: 'positive' },
      tasks: { active: 15, change: '+5%', changeType: 'positive' },
      employees: { total: 18, change: '+4', changeType: 'positive' },
      revenue: { total: '₦28,500,000', change: '+15.4%', changeType: 'positive' },
    },
    projectsOverview: {
      total: 3,
      inProgress: 2,
      completed: 1,
      delayed: 0,
    },
    tasksOverview: {
      total: 25,
      completed: 10,
      overdue: 2,
    },
    financials: {
      revenue: 28500000,
      expenses: 14200000,
      profit: 14300000,
    },
    hrOverview: {
      newHires: 4,
      turnover: '2%',
      attendance: '94%',
    },
    revenueTrends: [
      { month: 'Jan', revenue: 28500000, expenses: 14200000 },
      { month: 'Feb', revenue: 15400000, expenses: 8200000 }
    ],
    activity: [
      { id: 1, user: 'Mustapha Tajuddeen', action: 'Approved system upgrade task', time: '2 hours ago', company_id: 101 },
      { id: 2, user: 'Muhammad Mansur', action: 'Processed January Payroll', time: '1 day ago', company_id: 101 },
      { id: 3, user: 'Fatima Zahra', action: 'Hired new Senior Developer', time: '3 days ago', company_id: 101 },
      { id: 4, user: 'Muhammad Alhassan', action: 'Shared Q1 Strategy Document', time: '4 days ago', company_id: 101 },
      { id: 5, user: 'Abubakar Sadiq', action: 'Approved budget for office restock', time: '5 days ago', company_id: 101 }
    ]
  },
  projects: [
    { id: 1, name: 'Q1 Market Expansion', code: 'PROJ001', status: 'in_progress', manager_id: 6, company_id: 101, created_at: '2026-01-05T08:00:00Z' },
    { id: 2, name: 'Cloudspace ERP System Upgrade', code: 'PROJ002', status: 'in_progress', manager_id: 3, company_id: 101, created_at: '2025-12-15T10:00:00Z' },
    { id: 3, name: 'Annual Shareholder Conference', code: 'PROJ003', status: 'planning', manager_id: 4, company_id: 101, created_at: '2026-02-01T09:00:00Z' },
  ],
  employees: [
    { id: 1, first_name: 'Muhammad Alhassan', last_name: 'Muhammad', employee_id: 'EMP001', designation: 'CEO', department_id: 1, email: 'ceo@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Muhammad Alhassan', last_name: 'Muhammad', email: 'ceo@cloudspace.com' } },
    { id: 2, first_name: 'Muhammad Muallayidi', last_name: 'Dalhatu', employee_id: 'EMP002', designation: 'CMO', department_id: 2, email: 'cmo@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Muhammad Muallayidi', last_name: 'Dalhatu', email: 'cmo@cloudspace.com' } },
    { id: 3, first_name: 'Mustapha Tajuddeen', last_name: 'Dantata', employee_id: 'EMP003', designation: 'CTO', department_id: 3, email: 'cto@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Mustapha Tajuddeen', last_name: 'Dantata', email: 'cto@cloudspace.com' } },
    { id: 4, first_name: 'Abubakar Sadiq', last_name: 'Ibrahim', employee_id: 'EMP004', designation: 'COO', department_id: 4, email: 'coo@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Abubakar Sadiq', last_name: 'Ibrahim', email: 'coo@cloudspace.com' } },
    { id: 5, first_name: 'Muhammad Mansur', last_name: 'Bello', employee_id: 'EMP005', designation: 'CFO', department_id: 5, email: 'cfo@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Muhammad Mansur', last_name: 'Bello', email: 'cfo@cloudspace.com' } },
    { id: 6, first_name: 'Ahmad Yahaya', last_name: 'Adam', employee_id: 'EMP006', designation: 'Project Manager', department_id: 4, email: 'pm@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Ahmad Yahaya', last_name: 'Adam', email: 'pm@cloudspace.com' } },
    { id: 7, first_name: 'Fatima Zahra', last_name: 'Usman', employee_id: 'EMP007', designation: 'HR Manager', department_id: 6, email: 'hr@cloudspace.com', status: 'active', company_id: 101, User: { first_name: 'Fatima Zahra', last_name: 'Usman', email: 'hr@cloudspace.com' } },
    { id: 8, first_name: 'Amina', last_name: 'Lawal', employee_id: 'EMP008', designation: 'Senior Software Engineer', department_id: 3, email: 'amina@cloudspace.com', status: 'active', company_id: 101 },
    { id: 9, first_name: 'Yusuf', last_name: 'Garba', employee_id: 'EMP009', designation: 'Software Engineer', department_id: 3, email: 'yusuf@cloudspace.com', status: 'active', company_id: 101 },
    { id: 10, first_name: 'Zainab', last_name: 'Salisu', employee_id: 'EMP010', designation: 'Product Designer', department_id: 3, email: 'zainab@cloudspace.com', status: 'active', company_id: 101 },
    { id: 11, first_name: 'Ibrahim', last_name: 'Musa', employee_id: 'EMP011', designation: 'Accountant', department_id: 5, email: 'ibrahim@cloudspace.com', status: 'active', company_id: 101 },
    { id: 12, first_name: 'Halima', last_name: 'Sani', employee_id: 'EMP012', designation: 'Sales Executive', department_id: 7, email: 'halima@cloudspace.com', status: 'active', company_id: 101 },
    { id: 13, first_name: 'Abdulrahman', last_name: 'Jibrin', employee_id: 'EMP013', designation: 'Marketing Specialist', department_id: 2, email: 'abdul@cloudspace.com', status: 'active', company_id: 101 },
    { id: 14, first_name: 'Maryam', last_name: 'Idris', employee_id: 'EMP014', designation: 'Operations Officer', department_id: 4, email: 'maryam@cloudspace.com', status: 'active', company_id: 101 },
    { id: 15, first_name: 'Usman', last_name: 'Kabir', employee_id: 'EMP015', designation: 'DevOps Engineer', department_id: 3, email: 'usman@cloudspace.com', status: 'active', company_id: 101 },
    { id: 16, first_name: 'Aisha', last_name: 'Bashir', employee_id: 'EMP016', designation: 'Customer Success', department_id: 7, email: 'aisha@cloudspace.com', status: 'active', employment_status: 'active', company_id: 101 },
    { id: 17, first_name: 'Kabiru', last_name: 'Suleiman', employee_id: 'EMP017', designation: 'Senior Developer', department_id: 3, email: 'kabiru@cloudspace.com', status: 'active', employment_status: 'active', company_id: 101 },
    { id: 18, first_name: 'Nana', last_name: 'Khadija', employee_id: 'EMP018', designation: 'Legal Counsel', department_id: 1, email: 'nana@cloudspace.com', status: 'active', employment_status: 'active', company_id: 101 },
  ],
  departments: [
    { id: 1, name: 'Executive', company_id: 101, employee_count: 3 },
    { id: 2, name: 'Marketing', company_id: 101, employee_count: 2 },
    { id: 3, name: 'Technology', company_id: 101, employee_count: 6 },
    { id: 4, name: 'Operations', company_id: 101, employee_count: 3 },
    { id: 5, name: 'Finance', company_id: 101, employee_count: 2 },
    { id: 6, name: 'Human Resources', company_id: 101, employee_count: 1 },
    { id: 7, name: 'Sales', company_id: 101, employee_count: 2 },
  ],
  inventory: {
    items: [
      { id: 1, name: 'Dell XPS 15', sku: 'LAP001', category: 'Laptops', quantity: 12, min_stock: 5, price: 1200000, company_id: 101, location_id: 1 },
      { id: 2, name: 'LG 27" 4K Monitor', sku: 'MON001', category: 'Monitors', quantity: 20, min_stock: 10, price: 350000, company_id: 101, location_id: 1 },
      { id: 3, name: 'Ergonomic Office Chair', sku: 'FUR001', category: 'Furniture', quantity: 30, min_stock: 5, price: 150000, company_id: 101, location_id: 1 },
      { id: 4, name: 'Logitech MX Master 3', sku: 'PER001', category: 'Peripherals', quantity: 15, min_stock: 5, price: 85000, company_id: 101, location_id: 1 }
    ],
    locations: [
      { id: 1, name: 'Main Office Warehouse', company_id: 101, type: 'internal' }
    ],
    movements: [
      { id: 1, item_id: 1, type: 'in', quantity: 15, date: '2026-01-05', company_id: 101 },
      { id: 2, item_id: 1, type: 'out', quantity: 3, date: '2026-01-15', company_id: 101, note: 'Assigned to new hires' }
    ],
  },
  purchaseRequests: [
    { id: 1, request_id: 'PR-2026-001', item_name: 'MacBook Pro M3', quantity: 2, estimated_cost: 4500000, status: 'approved', requested_by: 8, company_id: 101, created_at: '2026-01-10' },
    { id: 2, request_id: 'PR-2026-002', item_name: 'Office Supplies', quantity: 1, estimated_cost: 150000, status: 'pending', requested_by: 14, company_id: 101, created_at: '2026-02-05' }
  ],
  tasks: [
    { id: 1, title: 'Finalize Expansion Strategy', project_id: 1, status: 'completed', assigned_to: 6, priority: 'high', company_id: 101, due_date: '2026-01-20' },
    { id: 2, title: 'Market Research - Lagos', project_id: 1, status: 'in_progress', assigned_to: 13, priority: 'medium', company_id: 101, due_date: '2026-02-15' },
    { id: 3, title: 'Server Migration', project_id: 2, status: 'completed', assigned_to: 15, priority: 'critical', company_id: 101, due_date: '2026-01-15' },
    { id: 4, title: 'Frontend UI Cleanup', project_id: 2, status: 'in_progress', assigned_to: 10, priority: 'medium', company_id: 101, due_date: '2026-02-28' },
    { id: 6, title: 'Draft Shareholder Report', project_id: 3, status: 'in_progress', assigned_to: 5, priority: 'high', company_id: 101, due_date: '2026-02-15' },
    { id: 7, title: 'Security Audit', project_id: 2, status: 'completed', assigned_to: 15, priority: 'critical', company_id: 101, due_date: '2026-01-25' },
    { id: 8, title: 'Marketing Video Production', project_id: 1, status: 'in_progress', assigned_to: 2, priority: 'medium', company_id: 101, due_date: '2026-03-01' },
    { id: 9, title: 'New Employee Onboarding', status: 'completed', assigned_to: 7, priority: 'low', company_id: 101, due_date: '2026-01-10' },
    { id: 10, title: 'Update Company Policy', status: 'in_progress', assigned_to: 18, priority: 'medium', company_id: 101, due_date: '2026-02-20' },
    { id: 11, title: 'Prepare Q1 Budget', status: 'completed', assigned_to: 5, priority: 'high', company_id: 101, due_date: '2026-01-05' },
    { id: 12, title: 'Client Presentation', status: 'in_progress', assigned_to: 12, priority: 'medium', company_id: 101, due_date: '2026-02-12' },
    { id: 13, title: 'Database Backup Configuration', project_id: 2, status: 'completed', assigned_to: 15, priority: 'high', company_id: 101, due_date: '2026-01-12' },
    { id: 14, title: 'Social Media Campaign Launch', project_id: 1, status: 'completed', assigned_to: 13, priority: 'medium', company_id: 101, due_date: '2026-01-28' },
    { id: 15, title: 'Office Supplies Restock', status: 'completed', assigned_to: 14, priority: 'low', company_id: 101, due_date: '2026-01-25' }
  ],
  leaves: [
    { id: 1, employee_id: 8, leave_type: 'Annual', start_date: '2026-01-10', end_date: '2026-01-15', status: 'approved', company_id: 101 },
    { id: 2, employee_id: 12, leave_type: 'Sick', start_date: '2026-01-12', end_date: '2026-01-13', status: 'approved', company_id: 101 },
    { id: 3, employee_id: 15, leave_type: 'Casual', start_date: '2026-01-20', end_date: '2026-01-21', status: 'completed', company_id: 101 },
    { id: 4, employee_id: 9, leave_type: 'Annual', start_date: '2026-02-10', end_date: '2026-02-15', status: 'pending', company_id: 101 },
    { id: 5, employee_id: 1, leave_type: 'Annual', start_date: '2026-02-01', end_date: '2026-02-05', status: 'approved', company_id: 101 }
  ],
  payroll: {
    pending: [],
    history: [
      { id: 1, batch_name: 'January 2026 Payroll', month: 'January', year: 2026, total_amount: 12500000, status: 'paid', company_id: 101, processed_on: '2026-01-28T15:00:00Z' }
    ],
  },
  expenses: [
    { id: 1, description: 'AWS Subscription', amount: 450.00, category: 'Software', status: 'paid', company_id: 101, submitted_on: '2026-01-15T09:00:00Z' },
    { id: 2, description: 'Internet Bill Jan', amount: 80.00, category: 'Utilities', status: 'paid', company_id: 101, submitted_on: '2026-01-05T10:00:00Z' },
    { id: 3, description: 'Travel to Lagos (CMO)', amount: 1200.00, category: 'Travel', status: 'paid', company_id: 101, submitted_on: '2026-01-20T14:00:00Z' },
    { id: 4, description: 'Office Stationery', amount: 150.00, category: 'Office', status: 'paid', company_id: 101, submitted_on: '2026-01-22T11:00:00Z' },
    { id: 5, description: 'Team Lunch', amount: 300.00, category: 'Food', status: 'paid', company_id: 101, submitted_on: '2026-01-25T13:00:00Z' },
    { id: 6, description: 'Laptop Repair', amount: 200.00, category: 'Maintenance', status: 'finance_approved', company_id: 101, submitted_on: '2026-02-01T09:30:00Z' },
    { id: 7, description: 'Google Workspace', amount: 120.00, category: 'Software', status: 'hr_approved', company_id: 101, submitted_on: '2026-02-02T10:45:00Z' },
    { id: 8, description: 'Marketing Campaign Ads', amount: 5000.00, category: 'Marketing', status: 'pending_approval', company_id: 101, submitted_on: '2026-02-03T15:20:00Z' },
    { id: 9, description: 'Office Rent Jan', amount: 1500000, category: 'Rent', status: 'paid', company_id: 101, submitted_on: '2026-01-01T08:00:00Z' },
    { id: 10, description: 'Utility Bill Feb', amount: 55000, category: 'Utilities', status: 'pending_approval', company_id: 101, submitted_on: '2026-02-04T12:00:00Z' },
    { id: 11, description: 'Software License - Adobe', amount: 59.99, category: 'Software', status: 'paid', company_id: 101, submitted_on: '2026-01-10T09:00:00Z' },
    { id: 12, description: 'Business Cards Printing', amount: 45.00, category: 'Marketing', status: 'paid', company_id: 101, submitted_on: '2026-01-12T11:00:00Z' },
    { id: 13, description: 'Office Water Supply', amount: 30.00, category: 'Utilities', status: 'paid', company_id: 101, submitted_on: '2026-01-15T10:00:00Z' },
    { id: 14, description: 'Client Lunch meeting', amount: 125.00, category: 'Entertainment', status: 'paid', company_id: 101, submitted_on: '2026-01-18T13:30:00Z' },
    { id: 15, description: 'Postage & Courier', amount: 25.00, category: 'Office', status: 'paid', company_id: 101, submitted_on: '2026-01-20T15:00:00Z' },
    { id: 16, description: 'New Keyboard for Dev', amount: 110.00, category: 'Hardware', status: 'paid', company_id: 101, submitted_on: '2026-01-22T09:00:00Z' },
    { id: 17, description: 'Fuel Reimbursement', amount: 85.00, category: 'Travel', status: 'paid', company_id: 101, submitted_on: '2026-01-25T16:00:00Z' },
    { id: 18, description: 'Cloud Storage Upgrade', amount: 9.99, category: 'Software', status: 'paid', company_id: 101, submitted_on: '2026-01-28T10:00:00Z' },
    { id: 19, description: 'Workshop Materials', amount: 210.00, category: 'Training', status: 'finance_approved', company_id: 101, submitted_on: '2026-02-02T11:00:00Z' },
    { id: 20, description: 'Professional Membership', amount: 450.00, category: 'Subscriptions', status: 'pending_approval', company_id: 101, submitted_on: '2026-02-04T14:00:00Z' }
  ],
  folders: [
    { id: 1, name: 'Company Policies', access_type: 'public', company_id: 101, created_at: '2026-01-01' },
    { id: 2, name: 'Project Documents', access_type: 'department', department_id: 3, company_id: 101, created_at: '2026-01-10' }
  ],
  documents: [
    { id: 1, title: 'Employee Handbook 2026', folder_id: 1, visibility: 'public', company_id: 101, created_at: '2026-01-01', mime_type: 'application/pdf', file_size: 2048000 },
    { id: 2, title: 'Q1 Strategy', folder_id: 2, visibility: 'department', company_id: 101, created_at: '2026-01-15', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 1024000 }
  ],
  // Recruitment Module
  recruitment: {
    jobPostings: [
      { id: 1, title: 'Senior Backend Developer', department: 'Technology', type: 'Full-time', status: 'active', company_id: 101, created_at: '2026-01-15' },
      { id: 2, title: 'Sales Executive', department: 'Sales', type: 'Full-time', status: 'active', company_id: 101, created_at: '2026-01-20' }
    ],
    candidates: [
      { id: 1, name: 'John Doe', email: 'john@example.com', job_id: 1, status: 'interview', company_id: 101, applied_at: '2026-01-25' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', job_id: 1, status: 'new', company_id: 101, applied_at: '2026-02-01' }
    ],
    applications: [
      { id: 1, candidate_id: 1, job_id: 1, status: 'interviewing', company_id: 101, created_at: '2026-01-26' },
      { id: 2, candidate_id: 2, job_id: 1, status: 'new', company_id: 101, created_at: '2026-02-01' }
    ],
    interviews: [
      { id: 1, candidate_id: 1, job_id: 1, interviewer_id: 3, type: 'Technical', date: '2026-02-10T10:00:00Z', status: 'scheduled', company_id: 101 }
    ],
    evaluations: [],
    backgroundChecks: [],
    offerLetters: [],
    jobChannels: [],
  },
  // Performance Module
  performance: {
    reviewCycles: [],
    reviews: [],
    goals: [],
    feedbackRequests: [],
    pips: [],
    careerPlans: [],
    careerPaths: [],
    skillAssessments: [],
    ratingScales: [],
    templates: [],
  },
  // Training Module
  training: {
    courses: [],
    learningPaths: [],
    sessions: [],
    enrollments: [],
    instructors: [],
    certifications: [],
    progress: [],
    budgets: [],
    complianceTraining: [],
  },
  // Sales Module
  sales: {
    orders: [],
    customers: [],
    quotes: [],
    campaigns: [],
  },
  // Collaboration Module
  collaboration: {
    teams: [],
    messages: [],
    announcements: [],
    events: [],
    meetings: [],
  },
  // Admin Module
  admin: {
    assets: [],
    auditLogs: [],
    systemSettings: {},
  },
  userTypes: [
    {
      id: 1,
      name: 'admin',
      display_name: 'Administrator',
      description: 'Full system access',
      color: 'red',
      company_id: 101,
      sidebar_modules: ['dashboard', 'hr-desk', 'finance-desk', 'admin-desk', 'settings-desk']
    },
    {
      id: 2,
      name: 'employee',
      display_name: 'Employee',
      description: 'Standard employee access',
      color: 'blue',
      company_id: 101,
      sidebar_modules: ['dashboard', 'my-desk']
    }
  ],
  benefits: [
    {
      id: 1,
      name: 'Health Insurance',
      description: 'Comprehensive medical, dental, and vision coverage',
      category: 'Health',
      enrolled: true,
      premium: 150,
      coverage: 'Employee + Family',
      provider: 'HealthCorp Insurance',
      company_id: 101,
      details: {
        medical: '$500 deductible, 80/20 coinsurance',
        dental: '$50 deductible, 100% preventive',
        vision: '$25 copay for exams'
      }
    },
    {
      id: 2,
      name: 'Life Insurance',
      description: 'Basic life insurance coverage',
      category: 'Insurance',
      enrolled: true,
      premium: 25,
      coverage: '2x Annual Salary',
      provider: 'LifeSecure',
      company_id: 101,
      details: {
        basic: '2x annual salary (company paid)',
        supplemental: 'Up to 5x salary available',
        beneficiary: 'Update beneficiary information'
      }
    },
    {
      id: 4,
      name: 'Education Assistance',
      description: 'Tuition reimbursement and training programs',
      category: 'Education',
      enrolled: true,
      premium: 0,
      coverage: 'Up to $5,000/year',
      provider: 'Company Program',
      company_id: 101,
      details: {
        tuition: 'Up to $5,000 annual reimbursement',
        certification: 'Professional certification support',
        training: 'Internal and external training programs'
      }
    },
    {
      id: 3,
      name: 'Transportation Allowance',
      description: 'Monthly transportation reimbursement',
      category: 'Transportation',
      enrolled: false,
      premium: 0,
      coverage: '$200/month',
      provider: 'Company Benefit',
      company_id: 101,
      details: {
        public: 'Public transportation reimbursement',
        parking: 'Parking fee coverage',
        fuel: 'Fuel allowance for company travel'
      }
    }
  ],
};

const loadData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to parse demo data, resetting storage', error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
};

let memoryStore = loadData();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
  } catch (error) {
    console.error('Failed to persist demo data', error);
  }
};

const getCollection = (key) => {
  if (!memoryStore[key]) {
    memoryStore[key] = [];
  }
  return memoryStore[key];
};

export const demoData = {
  reset: () => {
    memoryStore = { ...defaultData };
    persist();
    return memoryStore;
  },
  getState: () => memoryStore,
  getUserByEmail: (email) => memoryStore.users.find((user) => user.email === email),

  // Company Management
  getCompanies: () => memoryStore.companies || [],
  getCompanyByCode: (code) => (memoryStore.companies || []).find((company) => company.code === code),
  addCompany: (company) => {
    if (!memoryStore.companies) memoryStore.companies = [];
    const newCompany = {
      id: generateId('company'),
      created_at: new Date().toISOString(),
      status: 'approved',
      ...company,
    };
    memoryStore.companies.push(newCompany);
    persist();
    return newCompany;
  },

  // User Management
  addUser: (user) => {
    const newUser = {
      id: generateId('user'),
      created_at: new Date().toISOString(),
      ...user,
    };
    memoryStore.users.push(newUser);
    persist();
    return newUser;
  },

  getNotifications: (companyId) => memoryStore.notifications.filter(n => !companyId || String(n.company_id) === String(companyId)),
  getAlerts: () => memoryStore.alerts,
  getDashboardStats: (companyId = 101) => {
    const employees = memoryStore.employees.filter(e => String(e.company_id) === String(companyId));
    const projects = memoryStore.projects.filter(p => String(p.company_id) === String(companyId));
    const tasks = memoryStore.tasks.filter(t => String(t.company_id) === String(companyId));
    const expenses = memoryStore.expenses.filter(e => String(e.company_id) === String(companyId));

    const totalSalary = 12500000; // Base historical
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalRevenue = 28500000;

    return {
      projects: { total: projects.length, change: '+1', changeType: 'positive' },
      tasks: { active: tasks.filter(t => t.status !== 'completed').length, change: '+5%', changeType: 'positive' },
      employees: { total: employees.length, change: '+4', changeType: 'positive' },
      revenue: { total: `₦${(totalRevenue).toLocaleString()}`, change: '+15.4%', changeType: 'positive' },
      hrOverview: {
        newHires: employees.filter(e => e.id > 14).length,
        turnover: '2%',
        attendance: '94%',
      }
    };
  },
  getProjectsOverview: (companyId = 101) => {
    const projects = memoryStore.projects.filter(p => String(p.company_id) === String(companyId));
    return {
      total: projects.length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      delayed: projects.filter(p => p.status === 'delayed').length,
    };
  },
  getTasksOverview: (companyId = 101) => {
    const tasks = memoryStore.tasks.filter(t => String(t.company_id) === String(companyId));
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
    };
  },
  getFinancials: (companyId = 101) => {
    const expenses = memoryStore.expenses.filter(e => String(e.company_id) === String(companyId));
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) + 12500000; // Adding payroll 
    return {
      revenue: 28500000,
      expenses: totalExpenses,
      profit: 28500000 - totalExpenses,
    };
  },
  getProjects: (companyId) => memoryStore.projects.filter(p => !companyId || String(p.company_id) === String(companyId)),
  getProjectById: (id) => memoryStore.projects.find((project) => project.id === Number(id)),
  addProject: (project) => {
    const newProject = { ...project, id: generateId('project'), created_at: new Date().toISOString() };
    memoryStore.projects.unshift(newProject);
    persist();
    return newProject;
  },
  updateProject: (id, update) => {
    const idx = memoryStore.projects.findIndex((project) => String(project.id) === String(id));
    if (idx >= 0) {
      memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...update };
      persist();
      return memoryStore.projects[idx];
    }
    return null;
  },
  deleteProject: (id) => {
    memoryStore.projects = memoryStore.projects.filter((project) => String(project.id) !== String(id));
    persist();
  },
  getEmployees: (companyId) => memoryStore.employees.filter(e => !companyId || String(e.company_id) === String(companyId)),
  addEmployee: (employee) => {
    const newEmployee = {
      ...employee,
      id: generateId('employee'),
      employee_id: employee.employee_id || `EMP-${Math.floor(Math.random() * 900 + 100)}`,
      User: employee.User || {
        first_name: employee.first_name || 'New',
        last_name: employee.last_name || 'Employee',
        email: employee.email || 'new.employee@example.com',
      },
      Department: memoryStore.departments.find((d) => d.id === Number(employee.department_id)) || null,
      created_at: new Date().toISOString(),
    };
    memoryStore.employees.unshift(newEmployee);
    persist();
    return newEmployee;
  },
  updateEmployee: (id, update) => {
    const idx = memoryStore.employees.findIndex((employee) => String(employee.id) === String(id));
    if (idx >= 0) {
      memoryStore.employees[idx] = {
        ...memoryStore.employees[idx],
        ...update,
      };
      persist();
      return memoryStore.employees[idx];
    }
    return null;
  },
  deleteEmployee: (id) => {
    memoryStore.employees = memoryStore.employees.filter((employee) => String(employee.id) !== String(id));
    persist();
  },
  getDepartments: (companyId) => memoryStore.departments.filter(d => !companyId || String(d.company_id) === String(companyId)),
  addDepartment: (department) => {
    const newDepartment = {
      ...department,
      id: generateId('department'),
      created_at: new Date().toISOString(),
    };
    memoryStore.departments.push(newDepartment);
    persist();
    return newDepartment;
  },
  updateDepartment: (id, update) => {
    const idx = memoryStore.departments.findIndex((dept) => String(dept.id) === String(id));
    if (idx >= 0) {
      memoryStore.departments[idx] = { ...memoryStore.departments[idx], ...update };
      persist();
      return memoryStore.departments[idx];
    }
    return null;
  },
  deleteDepartment: (id) => {
    memoryStore.departments = memoryStore.departments.filter((dept) => String(dept.id) !== String(id));
    persist();
  },
  getInventoryItems: (companyId) => memoryStore.inventory.items.filter(i => !companyId || String(i.company_id) === String(companyId)),
  addInventoryItem: (item) => {
    const newItem = {
      id: generateId('inventory-item'),
      created_at: new Date().toISOString(),
      ...item,
      location: memoryStore.inventory.locations.find((loc) => loc.id === item.location_id) || null,
    };
    memoryStore.inventory.items.unshift(newItem);
    persist();
    return newItem;
  },
  updateInventoryItem: (id, update) => {
    const idx = memoryStore.inventory.items.findIndex((item) => String(item.id) === String(id));
    if (idx >= 0) {
      memoryStore.inventory.items[idx] = {
        ...memoryStore.inventory.items[idx],
        ...update,
      };
      persist();
      return memoryStore.inventory.items[idx];
    }
    return null;
  },
  deleteInventoryItem: (id) => {
    memoryStore.inventory.items = memoryStore.inventory.items.filter((item) => String(item.id) !== String(id));
    persist();
  },
  getInventoryLocations: (companyId) => memoryStore.inventory.locations.filter(l => !companyId || String(l.company_id) === String(companyId)),
  addInventoryLocation: (location) => {
    const newLocation = {
      id: generateId('location'),
      ...location,
    };
    memoryStore.inventory.locations.push(newLocation);
    persist();
    return newLocation;
  },
  getInventoryMovements: (companyId) => memoryStore.inventory.movements.filter(m => !companyId || String(m.company_id) === String(companyId)),
  recordInventoryMovement: (movement) => {
    const newMovement = {
      id: generateId('movement'),
      created_at: new Date().toISOString(),
      ...movement,
    };
    memoryStore.inventory.movements.unshift(newMovement);
    persist();
    return newMovement;
  },
  getPurchaseRequests: (companyId) => memoryStore.purchaseRequests.filter(r => !companyId || String(r.company_id) === String(companyId)),
  addPurchaseRequest: (request) => {
    const newRequest = {
      request_id: request.request_id || `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      created_at: new Date().toISOString(),
      ...request,
    };
    memoryStore.purchaseRequests.unshift(newRequest);
    persist();
    return newRequest;
  },
  updatePurchaseRequest: (requestId, update) => {
    const idx = memoryStore.purchaseRequests.findIndex((req) => req.request_id === requestId);
    if (idx >= 0) {
      memoryStore.purchaseRequests[idx] = {
        ...memoryStore.purchaseRequests[idx],
        ...update,
      };
      persist();
      return memoryStore.purchaseRequests[idx];
    }
    return null;
  },
  getLeaves: (companyId) => memoryStore.leaves.filter(l => !companyId || String(l.company_id) === String(companyId)),
  addLeaveRequest: (leave) => {
    const newLeave = {
      id: generateId('leave'),
      status: 'pending',
      created_at: new Date().toISOString(),
      ...leave,
    };
    memoryStore.leaves.unshift(newLeave);
    persist();
    return newLeave;
  },
  updateLeaveRequest: (id, update) => {
    const idx = memoryStore.leaves.findIndex((leave) => String(leave.id) === String(id));
    if (idx >= 0) {
      memoryStore.leaves[idx] = {
        ...memoryStore.leaves[idx],
        ...update,
      };
      persist();
      return memoryStore.leaves[idx];
    }
    return null;
  },
  getPayroll: (companyId) => ({
    pending: memoryStore.payroll.pending.filter(p => !companyId || String(p.company_id) === String(companyId)),
    history: memoryStore.payroll.history.filter(p => !companyId || String(p.company_id) === String(companyId)),
  }),
  addPayrollBatch: (batch) => {
    const newBatch = {
      id: generateId('payroll'),
      status: 'pending_finance',
      submitted_on: new Date().toISOString(),
      ...batch,
    };
    memoryStore.payroll.pending.unshift(newBatch);
    persist();
    return newBatch;
  },
  approvePayrollBatch: (id, status = 'approved') => {
    const pendingIdx = memoryStore.payroll.pending.findIndex((batch) => String(batch.id) === String(id));
    if (pendingIdx >= 0) {
      const batch = memoryStore.payroll.pending.splice(pendingIdx, 1)[0];
      memoryStore.payroll.history.unshift({
        ...batch,
        status,
        processed_on: new Date().toISOString(),
      });
      persist();
      return batch;
    }
    return null;
  },
  getExpenses: (companyId) => memoryStore.expenses.filter(e => !companyId || String(e.company_id) === String(companyId)),
  addExpense: (expense) => {
    const newExpense = {
      id: generateId('expense'),
      status: 'pending_approval',
      submitted_on: new Date().toISOString(),
      ...expense,
    };
    memoryStore.expenses.unshift(newExpense);
    persist();
    return newExpense;
  },
  updateExpense: (id, update) => {
    const idx = memoryStore.expenses.findIndex((expense) => String(expense.id) === String(id));
    if (idx >= 0) {
      memoryStore.expenses[idx] = {
        ...memoryStore.expenses[idx],
        ...update,
      };
      persist();
      return memoryStore.expenses[idx];
    }
    return null;
  },
  getFolders: (filter = {}) => {
    const { access_type, parent_folder_id, owner_id, department_id, company_id } = filter;
    return memoryStore.folders.filter((folder) => {
      if (company_id && String(folder.company_id) !== String(company_id)) return false;
      if (typeof access_type === 'string' && folder.access_type !== access_type) return false;
      if (parent_folder_id !== undefined && folder.parent_folder_id !== parent_folder_id) return false;
      if (owner_id !== undefined && folder.owner_id !== owner_id) return false;
      if (department_id !== undefined && folder.department_id !== department_id) return false;
      return true;
    });
  },
  addFolder: (folder) => {
    const newFolder = {
      id: generateId('folder'),
      created_at: new Date().toISOString(),
      ...folder,
    };
    memoryStore.folders.push(newFolder);
    persist();
    return newFolder;
  },
  deleteFolder: (id) => {
    memoryStore.folders = memoryStore.folders.filter((folder) => folder.id !== id);
    memoryStore.documents = memoryStore.documents.filter((doc) => doc.folder_id !== id);
    persist();
  },
  getDocuments: (filter = {}) => {
    const { visibility, folder_id, owner_id, search, category, company_id } = filter;
    return memoryStore.documents.filter((document) => {
      if (company_id && String(document.company_id) !== String(company_id)) return false;
      if (visibility && document.visibility !== visibility) return false;
      if (folder_id !== undefined && document.folder_id !== folder_id) return false;
      if (owner_id !== undefined && document.owner_id !== owner_id) return false;
      if (category && document.category !== category) return false;
      if (search && !(`${document.title} ${document.description}`.toLowerCase().includes(search.toLowerCase()))) {
        return false;
      }
      return true;
    });
  },
  addDocument: (document) => {
    const newDocument = {
      id: generateId('document'),
      uploaded_at: new Date().toISOString(),
      ...document,
    };
    memoryStore.documents.unshift(newDocument);
    persist();
    return newDocument;
  },
  updateDocument: (id, update) => {
    const idx = memoryStore.documents.findIndex((doc) => doc.id === id);
    if (idx >= 0) {
      memoryStore.documents[idx] = {
        ...memoryStore.documents[idx],
        ...update,
      };
      persist();
      return memoryStore.documents[idx];
    }
    return null;
  },
  deleteDocument: (id) => {
    memoryStore.documents = memoryStore.documents.filter((doc) => doc.id !== id);
    persist();
  },

  // ==================== RECRUITMENT MODULE ====================
  getRecruitment: () => memoryStore.recruitment,

  // Job Postings
  getJobPostings: (companyId) => memoryStore.recruitment.jobPostings.filter(j => !companyId || String(j.company_id) === String(companyId)),
  addJobPosting: (jobPosting) => {
    const newJobPosting = {
      id: generateId('job'),
      created_at: new Date().toISOString(),
      status: 'draft',
      ...jobPosting,
    };
    memoryStore.recruitment.jobPostings.unshift(newJobPosting);
    persist();
    return newJobPosting;
  },
  updateJobPosting: (id, update) => {
    const idx = memoryStore.recruitment.jobPostings.findIndex((job) => String(job.id) === String(id));
    if (idx >= 0) {
      memoryStore.recruitment.jobPostings[idx] = { ...memoryStore.recruitment.jobPostings[idx], ...update };
      persist();
      return memoryStore.recruitment.jobPostings[idx];
    }
    return null;
  },
  deleteJobPosting: (id) => {
    memoryStore.recruitment.jobPostings = memoryStore.recruitment.jobPostings.filter((job) => String(job.id) !== String(id));
    persist();
  },

  // Candidates
  getCandidates: (companyId) => memoryStore.recruitment.candidates.filter(c => !companyId || String(c.company_id) === String(companyId)),
  addCandidate: (candidate) => {
    const newCandidate = {
      id: generateId('candidate'),
      created_at: new Date().toISOString(),
      status: 'new',
      ...candidate,
    };
    memoryStore.recruitment.candidates.unshift(newCandidate);
    persist();
    return newCandidate;
  },
  updateCandidate: (id, update) => {
    const idx = memoryStore.recruitment.candidates.findIndex((c) => String(c.id) === String(id));
    if (idx >= 0) {
      memoryStore.recruitment.candidates[idx] = { ...memoryStore.recruitment.candidates[idx], ...update };
      persist();
      return memoryStore.recruitment.candidates[idx];
    }
    return null;
  },

  // Applications
  getApplications: (companyId) => memoryStore.recruitment.applications.filter(a => !companyId || String(a.company_id) === String(companyId)),
  addApplication: (application) => {
    const newApplication = {
      id: generateId('application'),
      application_date: new Date().toISOString(),
      status: 'submitted',
      ...application,
    };
    memoryStore.recruitment.applications.unshift(newApplication);
    persist();
    return newApplication;
  },
  updateApplication: (id, update) => {
    const idx = memoryStore.recruitment.applications.findIndex((app) => String(app.id) === String(id));
    if (idx >= 0) {
      memoryStore.recruitment.applications[idx] = { ...memoryStore.recruitment.applications[idx], ...update };
      persist();
      return memoryStore.recruitment.applications[idx];
    }
    return null;
  },

  // Interviews
  getInterviews: (companyId) => memoryStore.recruitment.interviews.filter(i => !companyId || String(i.company_id) === String(companyId)),
  addInterview: (interview) => {
    const newInterview = {
      id: generateId('interview'),
      created_at: new Date().toISOString(),
      status: 'scheduled',
      ...interview,
    };
    memoryStore.recruitment.interviews.unshift(newInterview);
    persist();
    return newInterview;
  },
  updateInterview: (id, update) => {
    const idx = memoryStore.recruitment.interviews.findIndex((int) => String(int.id) === String(id));
    if (idx >= 0) {
      memoryStore.recruitment.interviews[idx] = { ...memoryStore.recruitment.interviews[idx], ...update };
      persist();
      return memoryStore.recruitment.interviews[idx];
    }
    return null;
  },

  // Evaluations
  getEvaluations: () => memoryStore.recruitment.evaluations,
  addEvaluation: (evaluation) => {
    const newEvaluation = {
      id: generateId('evaluation'),
      created_at: new Date().toISOString(),
      ...evaluation,
    };
    memoryStore.recruitment.evaluations.unshift(newEvaluation);
    persist();
    return newEvaluation;
  },

  // Background Checks
  getBackgroundChecks: () => memoryStore.recruitment.backgroundChecks,
  addBackgroundCheck: (check) => {
    const newCheck = {
      id: generateId('bgcheck'),
      created_at: new Date().toISOString(),
      status: 'pending',
      ...check,
    };
    memoryStore.recruitment.backgroundChecks.unshift(newCheck);
    persist();
    return newCheck;
  },

  // Offer Letters
  getOfferLetters: () => memoryStore.recruitment.offerLetters,
  addOfferLetter: (offer) => {
    const newOffer = {
      id: generateId('offer'),
      created_at: new Date().toISOString(),
      status: 'draft',
      ...offer,
    };
    memoryStore.recruitment.offerLetters.unshift(newOffer);
    persist();
    return newOffer;
  },
  updateOfferLetter: (id, update) => {
    const idx = memoryStore.recruitment.offerLetters.findIndex((offer) => String(offer.id) === String(id));
    if (idx >= 0) {
      memoryStore.recruitment.offerLetters[idx] = { ...memoryStore.recruitment.offerLetters[idx], ...update };
      persist();
      return memoryStore.recruitment.offerLetters[idx];
    }
    return null;
  },

  // Job Channels
  getJobChannels: () => memoryStore.recruitment.jobChannels,
  addJobChannel: (channel) => {
    const newChannel = {
      id: generateId('channel'),
      created_at: new Date().toISOString(),
      status: 'active',
      ...channel,
    };
    memoryStore.recruitment.jobChannels.push(newChannel);
    persist();
    return newChannel;
  },

  // ==================== PERFORMANCE MODULE ====================
  getPerformance: () => memoryStore.performance,

  // Review Cycles
  getReviewCycles: () => memoryStore.performance.reviewCycles,
  addReviewCycle: (cycle) => {
    const newCycle = {
      id: generateId('cycle'),
      created_at: new Date().toISOString(),
      status: 'draft',
      ...cycle,
    };
    memoryStore.performance.reviewCycles.unshift(newCycle);
    persist();
    return newCycle;
  },
  updateReviewCycle: (id, update) => {
    const idx = memoryStore.performance.reviewCycles.findIndex((c) => String(c.id) === String(id));
    if (idx >= 0) {
      memoryStore.performance.reviewCycles[idx] = { ...memoryStore.performance.reviewCycles[idx], ...update };
      persist();
      return memoryStore.performance.reviewCycles[idx];
    }
    return null;
  },

  // Reviews
  getReviews: () => memoryStore.performance.reviews,
  addReview: (review) => {
    const newReview = {
      id: generateId('review'),
      created_at: new Date().toISOString(),
      status: 'draft',
      ...review,
    };
    memoryStore.performance.reviews.unshift(newReview);
    persist();
    return newReview;
  },
  updateReview: (id, update) => {
    const idx = memoryStore.performance.reviews.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      memoryStore.performance.reviews[idx] = { ...memoryStore.performance.reviews[idx], ...update };
      persist();
      return memoryStore.performance.reviews[idx];
    }
    return null;
  },

  // Goals
  getGoals: () => memoryStore.performance.goals,
  addGoal: (goal) => {
    const newGoal = {
      id: generateId('goal'),
      created_at: new Date().toISOString(),
      status: 'not_started',
      progress: 0,
      ...goal,
    };
    memoryStore.performance.goals.unshift(newGoal);
    persist();
    return newGoal;
  },
  updateGoal: (id, update) => {
    const idx = memoryStore.performance.goals.findIndex((g) => String(g.id) === String(id));
    if (idx >= 0) {
      memoryStore.performance.goals[idx] = { ...memoryStore.performance.goals[idx], ...update };
      persist();
      return memoryStore.performance.goals[idx];
    }
    return null;
  },

  // Feedback Requests
  getFeedbackRequests: () => memoryStore.performance.feedbackRequests,
  addFeedbackRequest: (feedback) => {
    const newFeedback = {
      id: generateId('feedback'),
      created_at: new Date().toISOString(),
      status: 'pending',
      ...feedback,
    };
    memoryStore.performance.feedbackRequests.unshift(newFeedback);
    persist();
    return newFeedback;
  },

  // PIPs
  getPIPs: () => memoryStore.performance.pips,
  addPIP: (pip) => {
    const newPIP = {
      id: generateId('pip'),
      created_at: new Date().toISOString(),
      status: 'active',
      ...pip,
    };
    memoryStore.performance.pips.unshift(newPIP);
    persist();
    return newPIP;
  },
  updatePIP: (id, update) => {
    const idx = memoryStore.performance.pips.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      memoryStore.performance.pips[idx] = { ...memoryStore.performance.pips[idx], ...update };
      persist();
      return memoryStore.performance.pips[idx];
    }
    return null;
  },

  // Career Plans
  getCareerPlans: () => memoryStore.performance.careerPlans,
  addCareerPlan: (plan) => {
    const newPlan = {
      id: generateId('careerplan'),
      created_at: new Date().toISOString(),
      status: 'active',
      ...plan,
    };
    memoryStore.performance.careerPlans.unshift(newPlan);
    persist();
    return newPlan;
  },
  updateCareerPlan: (id, update) => {
    const idx = memoryStore.performance.careerPlans.findIndex((p) => String(p.id) === String(id));
    if (idx >= 0) {
      memoryStore.performance.careerPlans[idx] = { ...memoryStore.performance.careerPlans[idx], ...update };
      persist();
      return memoryStore.performance.careerPlans[idx];
    }
    return null;
  },

  // ==================== TRAINING MODULE ====================
  getTraining: () => memoryStore.training,

  // Courses
  getCourses: () => memoryStore.training.courses,
  addCourse: (course) => {
    const newCourse = {
      id: generateId('course'),
      created_at: new Date().toISOString(),
      status: 'draft',
      ...course,
    };
    memoryStore.training.courses.unshift(newCourse);
    persist();
    return newCourse;
  },
  updateCourse: (id, update) => {
    const idx = memoryStore.training.courses.findIndex((c) => String(c.id) === String(id));
    if (idx >= 0) {
      memoryStore.training.courses[idx] = { ...memoryStore.training.courses[idx], ...update };
      persist();
      return memoryStore.training.courses[idx];
    }
    return null;
  },
  deleteCourse: (id) => {
    memoryStore.training.courses = memoryStore.training.courses.filter((c) => String(c.id) !== String(id));
    persist();
  },

  // Training Sessions
  getTrainingSessions: () => memoryStore.training.sessions,
  addTrainingSession: (session) => {
    const newSession = {
      id: generateId('session'),
      created_at: new Date().toISOString(),
      status: 'scheduled',
      ...session,
    };
    memoryStore.training.sessions.unshift(newSession);
    persist();
    return newSession;
  },

  // Enrollments
  getEnrollments: () => memoryStore.training.enrollments,
  addEnrollment: (enrollment) => {
    const newEnrollment = {
      id: generateId('enrollment'),
      enrolled_at: new Date().toISOString(),
      status: 'enrolled',
      ...enrollment,
    };
    memoryStore.training.enrollments.unshift(newEnrollment);
    persist();
    return newEnrollment;
  },

  // Instructors
  getInstructors: () => memoryStore.training.instructors,
  addInstructor: (instructor) => {
    const newInstructor = {
      id: generateId('instructor'),
      created_at: new Date().toISOString(),
      status: 'active',
      ...instructor,
    };
    memoryStore.training.instructors.push(newInstructor);
    persist();
    return newInstructor;
  },

  // ==================== SALES MODULE ====================
  getSales: () => memoryStore.sales,

  // Orders
  getOrders: () => memoryStore.sales.orders,
  addOrder: (order) => {
    const newOrder = {
      id: generateId('order'),
      order_number: `ORD-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending',
      ...order,
    };
    memoryStore.sales.orders.unshift(newOrder);
    persist();
    return newOrder;
  },
  updateOrder: (id, update) => {
    const idx = memoryStore.sales.orders.findIndex((o) => String(o.id) === String(id));
    if (idx >= 0) {
      memoryStore.sales.orders[idx] = { ...memoryStore.sales.orders[idx], ...update };
      persist();
      return memoryStore.sales.orders[idx];
    }
    return null;
  },

  // Customers
  getCustomers: () => memoryStore.sales.customers,
  addCustomer: (customer) => {
    const newCustomer = {
      id: generateId('customer'),
      created_at: new Date().toISOString(),
      ...customer,
    };
    memoryStore.sales.customers.unshift(newCustomer);
    persist();
    return newCustomer;
  },
  updateCustomer: (id, update) => {
    const idx = memoryStore.sales.customers.findIndex((c) => String(c.id) === String(id));
    if (idx >= 0) {
      memoryStore.sales.customers[idx] = { ...memoryStore.sales.customers[idx], ...update };
      persist();
      return memoryStore.sales.customers[idx];
    }
    return null;
  },

  // ==================== COLLABORATION MODULE ====================
  getCollaboration: () => memoryStore.collaboration,

  // Teams
  getTeams: () => memoryStore.collaboration.teams,
  addTeam: (team) => {
    const newTeam = {
      id: generateId('team'),
      created_at: new Date().toISOString(),
      ...team,
    };
    memoryStore.collaboration.teams.push(newTeam);
    persist();
    return newTeam;
  },

  // Messages
  getMessages: () => memoryStore.collaboration.messages,
  addMessage: (message) => {
    const newMessage = {
      id: generateId('message'),
      created_at: new Date().toISOString(),
      ...message,
    };
    memoryStore.collaboration.messages.unshift(newMessage);
    persist();
    return newMessage;
  },

  // Announcements
  getAnnouncements: () => memoryStore.collaboration.announcements,
  addAnnouncement: (announcement) => {
    const newAnnouncement = {
      id: generateId('announcement'),
      created_at: new Date().toISOString(),
      ...announcement,
    };
    memoryStore.collaboration.announcements.unshift(newAnnouncement);
    persist();
    return newAnnouncement;
  },

  // Events
  getEvents: () => memoryStore.collaboration.events,
  addEvent: (event) => {
    const newEvent = {
      id: generateId('event'),
      created_at: new Date().toISOString(),
      ...event,
    };
    memoryStore.collaboration.events.unshift(newEvent);
    persist();
    return newEvent;
  },

  // ==================== ADMIN MODULE ====================
  getAdmin: () => memoryStore.admin,

  // Assets
  getAssets: () => memoryStore.admin.assets,
  addAsset: (asset) => {
    const newAsset = {
      id: generateId('asset'),
      created_at: new Date().toISOString(),
      status: 'active',
      ...asset,
    };
    memoryStore.admin.assets.unshift(newAsset);
    persist();
    return newAsset;
  },
  updateAsset: (id, update) => {
    const idx = memoryStore.admin.assets.findIndex((a) => String(a.id) === String(id));
    if (idx >= 0) {
      memoryStore.admin.assets[idx] = { ...memoryStore.admin.assets[idx], ...update };
      persist();
      return memoryStore.admin.assets[idx];
    }
    return null;
  },
  deleteAsset: (id) => {
    memoryStore.admin.assets = memoryStore.admin.assets.filter((a) => String(a.id) !== String(id));
    persist();
  },

  // Audit Logs
  getAuditLogs: () => memoryStore.admin.auditLogs,
  addAuditLog: (log) => {
    const newLog = {
      id: generateId('log'),
      timestamp: new Date().toISOString(),
      ...log,
    };
    memoryStore.admin.auditLogs.unshift(newLog);
    persist();
    return newLog;
  },

  // ==================== FINANCE ====================
  getExpenseStats: (companyId) => {
    const expenses = memoryStore.expenses.filter(e => !companyId || String(e.company_id) === String(companyId));
    const paid = expenses.filter(e => e.status === 'paid');
    const pendingPayment = expenses.filter(e => e.status === 'hr_approved' || e.status === 'finance_approved');

    return {
      pending_payment_count: pendingPayment.length,
      paid_count: paid.length,
      total_paid_amount: paid.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
      avg_payment_days: 3
    };
  },

  // ==================== BENEFITS ====================
  getBenefits: (companyId) => {
    return memoryStore.benefits.filter(b => !companyId || String(b.company_id) === String(companyId));
  },
  updateBenefitEnrollment: (benefitId, enrolled, companyId) => {
    const benefit = memoryStore.benefits.find(b => String(b.id) === String(benefitId));
    if (benefit) {
      benefit.enrolled = enrolled;
      persist();
      return benefit;
    }
    return null;
  },

  // ==================== USER TYPES ====================
  getUserTypes: (companyId) => {
    return memoryStore.userTypes.filter(ut => !companyId || String(ut.company_id) === String(companyId));
  },
  addUserType: (userType) => {
    const newUserType = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      ...userType,
    };
    memoryStore.userTypes.push(newUserType);
    persist();
    return newUserType;
  },
  updateUserType: (id, update) => {
    const idx = memoryStore.userTypes.findIndex(ut => String(ut.id) === String(id));
    if (idx >= 0) {
      memoryStore.userTypes[idx] = { ...memoryStore.userTypes[idx], ...update };
      persist();
      return memoryStore.userTypes[idx];
    }
    return null;
  },
  deleteUserType: (id) => {
    memoryStore.userTypes = memoryStore.userTypes.filter(ut => String(ut.id) !== String(id));
    persist();
  },
  // Inventory Getters
  getInventoryItems: (companyId) => {
    return memoryStore.inventory.items.filter(i => !companyId || String(i.company_id) === String(companyId));
  },
  getInventoryLocations: (companyId) => {
    return memoryStore.inventory.locations.filter(l => !companyId || String(l.company_id) === String(companyId));
  },
  getInventoryMovements: (companyId) => {
    return memoryStore.inventory.movements.filter(m => !companyId || String(m.company_id) === String(companyId));
  },

  // Dashboard Activity
  getDashboardActivity: (companyId = 101) => {
    return memoryStore.dashboard.activity.filter(a => String(a.company_id) === String(companyId));
  },

  getInventoryStats: (companyId = 101) => {
    const items = memoryStore.inventory.items.filter(i => !companyId || String(i.company_id) === String(companyId));
    const movements = memoryStore.inventory.movements.filter(m => !companyId || String(m.company_id) === String(companyId));
    const locations = memoryStore.inventory.locations.filter(l => !companyId || String(l.company_id) === String(companyId));

    return {
      stats: {
        totalItems: items.length,
        lowStockCount: items.filter(i => i.quantity <= i.min_stock).length,
        totalValue: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        totalLocations: locations.length
      },
      categoryStats: Object.entries(items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + (item.price * item.quantity);
        return acc;
      }, {})).map(([category, value]) => ({ category, totalValue: value, count: items.filter(i => i.category === category).length })),
      recentMovements: movements.slice(-5)
    };
  },

  getHRStats: (companyId = 101) => {
    const employees = memoryStore.employees.filter(e => !companyId || String(e.company_id) === String(companyId));
    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === 'active' || e.employment_status === 'active').length,
      newHires: employees.filter(e => e.hire_date && new Date(e.hire_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
      onLeave: memoryStore.leaves.filter(l => (!companyId || String(l.company_id) === String(companyId)) && l.status === 'approved').length
    };
  },

  getProjectStats: (companyId) => {
    const projects = memoryStore.projects.filter(p => !companyId || String(p.company_id) === String(companyId));
    const tasks = memoryStore.tasks.filter(t => !companyId || String(t.company_id) === String(companyId));
    return {
      total_projects: projects.length,
      in_progress_projects: projects.filter(p => p.status === 'in_progress').length,
      completed_projects: projects.filter(p => p.status === 'completed').length,
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length,
      pending_tasks: tasks.filter(t => t.status !== 'completed').length,
      at_risk_projects: projects.filter(p => p.status === 'delayed').length,
    };
  },

  getRecruitmentStats: (companyId) => {
    const jobs = memoryStore.recruitment.jobPostings.filter(j => !companyId || String(j.company_id) === String(companyId));
    const candidates = memoryStore.recruitment.candidates.filter(c => !companyId || String(c.company_id) === String(companyId));
    return {
      active_jobs: jobs.filter(j => j.status === 'active').length,
      total_candidates: candidates.length,
      interviews_scheduled: memoryStore.recruitment.interviews.filter(i => !companyId || String(i.company_id) === String(companyId)).length,
      conversion_rate: '15%'
    };
  },

  getFinanceStats: (companyId) => {
    const expenses = memoryStore.expenses.filter(e => !companyId || String(e.company_id) === String(companyId));
    const totalSalary = 12500000;
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    return {
      total_revenue: 28500000,
      total_expenses: totalExpenses + totalSalary,
      net_profit: 28500000 - (totalExpenses + totalSalary),
      pending_expenses: expenses.filter(e => e.status === 'pending_approval').length,
    };
  },
  getFinancialOverview: (companyId) => {
    return memoryStore.dashboard.financials;
  },

  getProjectsOverview: (companyId = 101) => {
    return memoryStore.projects.filter(p => !companyId || String(p.company_id) === String(companyId));
  },

  getTasksOverview: (companyId = 101) => {
    return memoryStore.tasks.filter(t => !companyId || String(t.company_id) === String(companyId));
  },

  getDashboardQuickActions: (companyId) => [
    { id: 1, title: 'Add Employee', icon: 'UserPlus', path: '/hr/employees/new' },
    { id: 2, title: 'Record Expense', icon: 'PlusCircle', path: '/finance/expenses/new' },
    { id: 3, title: 'Create Project', icon: 'Briefcase', path: '/projects/new' },
    { id: 4, title: 'Request Leave', icon: 'Calendar', path: '/self-service/leave/request' }
  ],

  getPurchaseRequestsByStatus: (status, companyId) => {
    return memoryStore.purchaseRequests.filter(r =>
      String(r.company_id) === String(companyId) && r.status === status
    );
  },

  markNotificationAsRead: (id) => {
    const notification = memoryStore.notifications.find(n => String(n.id) === String(id));
    if (notification) {
      notification.read_at = new Date().toISOString();
      persist();
    }
    return notification;
  },

  markAllNotificationsAsRead: (companyId) => {
    memoryStore.notifications
      .filter(n => String(n.company_id) === String(companyId))
      .forEach(n => {
        if (!n.read_at) n.read_at = new Date().toISOString();
      });
    persist();
  },

  deleteNotification: (id) => {
    memoryStore.notifications = memoryStore.notifications.filter(n => String(n.id) !== String(id));
    persist();
  },
};

export default demoData;
