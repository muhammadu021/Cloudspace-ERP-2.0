/**
 * Help Articles Database
 * 
 * Comprehensive help articles for all major features in the ERP system.
 * Organized by category for easy navigation and search.
 */

export const helpCategories = [
  { id: 'dashboard', name: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'projects', name: 'Projects', icon: 'FolderKanban' },
  { id: 'hr', name: 'Human Resources', icon: 'Users' },
  { id: 'finance', name: 'Finance', icon: 'DollarSign' },
  { id: 'sales', name: 'Sales', icon: 'ShoppingCart' },
  { id: 'inventory', name: 'Inventory', icon: 'Package' },
  { id: 'admin', name: 'Administration', icon: 'Settings' },
  { id: 'support', name: 'Support', icon: 'LifeBuoy' },
  { id: 'portal', name: 'My Space', icon: 'User' },
  { id: 'general', name: 'General', icon: 'HelpCircle' },
];

export const helpArticles = [
  // Dashboard
  {
    id: 'dashboard-overview',
    category: 'dashboard',
    title: 'Dashboard Overview',
    summary: 'Learn how to use and customize your dashboard',
    content: `
# Dashboard Overview

The dashboard is your central hub for monitoring key metrics and accessing frequently used features.

## Key Features

- **Customizable Widgets**: Add, remove, and rearrange widgets to suit your needs
- **Real-time Metrics**: View up-to-date information about your business
- **Quick Actions**: Access common tasks directly from the dashboard

## Customizing Your Dashboard

1. Click the "Edit Dashboard" button in the top right
2. Drag widgets to rearrange them
3. Click the "+" button to add new widgets
4. Click the "×" on a widget to remove it
5. Click "Save" to persist your changes

## Available Widgets

- **Metric Cards**: Display single KPIs with trend indicators
- **Charts**: Visualize data with line, bar, or pie charts
- **Lists**: Show recent items or activity feeds
- **Quick Actions**: Buttons for common operations
    `,
    tags: ['dashboard', 'widgets', 'customization', 'getting-started'],
  },
  {
    id: 'dashboard-widgets',
    category: 'dashboard',
    title: 'Managing Dashboard Widgets',
    summary: 'Add, remove, and configure dashboard widgets',
    content: `
# Managing Dashboard Widgets

Widgets are modular components that display information on your dashboard.

## Adding Widgets

1. Click "Edit Dashboard"
2. Click the "Add Widget" button
3. Select the widget type from the list
4. Configure widget settings
5. Click "Add" to place it on your dashboard

## Widget Types

- **Metric Card**: Single KPI with optional trend
- **Chart Widget**: Data visualization
- **List Widget**: Recent items or activity
- **Quick Action**: Action buttons
- **Table Widget**: Compact data table

## Configuring Widgets

Each widget can be configured with:
- Title and description
- Data source and filters
- Refresh interval
- Size (small, medium, large)
    `,
    tags: ['dashboard', 'widgets', 'configuration'],
  },

  // Projects
  {
    id: 'projects-overview',
    category: 'projects',
    title: 'Projects Overview',
    summary: 'Manage projects, tasks, and team collaboration',
    content: `
# Projects Overview

The Projects space helps you manage projects, tasks, timelines, and resources.

## Key Features

- **Project Management**: Create and track projects
- **Task Management**: Assign and monitor tasks
- **Timeline View**: Visualize project schedules
- **Resource Allocation**: Manage team assignments
- **Budget Tracking**: Monitor project costs

## Creating a Project

1. Navigate to Projects > List
2. Click "New Project"
3. Fill in project details (name, description, dates)
4. Assign a project manager
5. Add team members
6. Set budget and milestones
7. Click "Create"

## Project Views

- **List View**: All projects with filters
- **Board View**: Kanban-style project board
- **Calendar View**: Projects on a timeline
- **Templates**: Pre-configured project templates
    `,
    tags: ['projects', 'tasks', 'management', 'getting-started'],
  },
  {
    id: 'projects-tasks',
    category: 'projects',
    title: 'Managing Tasks',
    summary: 'Create, assign, and track project tasks',
    content: `
# Managing Tasks

Tasks are the building blocks of project execution.

## Creating Tasks

1. Open a project
2. Go to the Tasks tab
3. Click "Add Task"
4. Enter task details
5. Assign to a team member
6. Set due date and priority
7. Click "Save"

## Task Properties

- **Title**: Brief description of the task
- **Description**: Detailed information
- **Assignee**: Team member responsible
- **Status**: Todo, In Progress, Review, Done
- **Priority**: Low, Medium, High
- **Due Date**: Deadline for completion
- **Estimated Hours**: Time estimate
- **Dependencies**: Related tasks

## Inline Editing

Click on any task field to edit it directly without opening a form.
    `,
    tags: ['projects', 'tasks', 'workflow'],
  },

  // HR
  {
    id: 'hr-overview',
    category: 'hr',
    title: 'Human Resources Overview',
    summary: 'Manage employees, attendance, payroll, and recruitment',
    content: `
# Human Resources Overview

The HR space provides comprehensive employee management capabilities.

## Key Features

- **Employee Management**: Maintain employee records
- **Attendance Tracking**: Monitor work hours and leaves
- **Payroll Processing**: Calculate and process salaries
- **Recruitment**: Manage job postings and candidates
- **Reports**: Generate HR analytics and reports

## HR Categories

1. **Employee Management**: Directory, departments, positions
2. **Attendance**: Time tracking, shifts, schedules
3. **Payroll**: Salary processing, runs, reports
4. **Recruitment**: Job postings, candidate pipeline
5. **Reports**: Analytics and custom reports

## Quick Actions

- Add new employee
- Process attendance
- Run payroll
- Post job opening
- Generate report
    `,
    tags: ['hr', 'employees', 'management', 'getting-started'],
  },
  {
    id: 'hr-employees',
    category: 'hr',
    title: 'Managing Employees',
    summary: 'Add, edit, and manage employee information',
    content: `
# Managing Employees

Maintain comprehensive employee records and information.

## Adding an Employee

1. Navigate to HR > Employees
2. Click "Add Employee"
3. Fill in personal information
4. Set employment details (department, position, manager)
5. Configure salary and benefits
6. Upload documents
7. Click "Save"

## Employee Information Tabs

- **Info**: Personal and employment details
- **Attendance**: Work hours and leave records
- **Payroll**: Salary and payment history
- **Documents**: Contracts, certificates, etc.
- **Performance**: Reviews and evaluations

## Bulk Operations

Select multiple employees to:
- Update department or position
- Send notifications
- Export data
- Generate reports
    `,
    tags: ['hr', 'employees', 'onboarding'],
  },

  // Finance
  {
    id: 'finance-overview',
    category: 'finance',
    title: 'Finance Overview',
    summary: 'Manage accounts, transactions, budgets, and reports',
    content: `
# Finance Overview

The Finance space handles all financial operations and reporting.

## Key Features

- **Accounts Management**: Chart of accounts
- **Transactions**: Record income and expenses
- **Budgets**: Plan and track budgets
- **Expense Claims**: Submit and approve expenses
- **Reports**: Financial statements and analytics

## Financial Dashboard

View key metrics:
- Revenue and expenses
- Profit and loss
- Cash flow
- Budget vs. actual
- Pending approvals

## Quick Actions

- Record transaction
- Create budget
- Approve expense
- Generate report
- Reconcile accounts
    `,
    tags: ['finance', 'accounting', 'management', 'getting-started'],
  },
  {
    id: 'finance-transactions',
    category: 'finance',
    title: 'Recording Transactions',
    summary: 'How to record income and expense transactions',
    content: `
# Recording Transactions

Track all financial transactions in your business.

## Creating a Transaction

1. Navigate to Finance > Transactions
2. Click "New Transaction"
3. Select type (Income or Expense)
4. Choose account from chart of accounts
5. Enter amount and date
6. Add description and reference
7. Attach supporting documents
8. Click "Save"

## Transaction Properties

- **Type**: Income or Expense
- **Category**: Transaction category
- **Account**: Associated account
- **Amount**: Transaction value
- **Date**: Transaction date
- **Description**: Details
- **Reference**: Invoice/receipt number
- **Status**: Pending, Cleared, Reconciled

## Bulk Operations

Import transactions from:
- Bank statements (CSV)
- Accounting software
- Spreadsheets
    `,
    tags: ['finance', 'transactions', 'accounting'],
  },

  // Sales
  {
    id: 'sales-overview',
    category: 'sales',
    title: 'Sales Overview',
    summary: 'Manage customers, orders, leads, and sales analytics',
    content: `
# Sales Overview

The Sales space helps you manage customer relationships and sales processes.

## Key Features

- **Customer Management**: Maintain customer database
- **Order Processing**: Create and track orders
- **Lead Management**: Track sales pipeline
- **Point of Sale**: Quick checkout interface
- **Analytics**: Sales performance metrics

## Sales Dashboard

Monitor:
- Sales overview and trends
- Pipeline value
- Conversion rates
- Top customers
- Recent orders

## Quick Actions

- Add customer
- Create order
- Add lead
- Process sale
- Generate quote
    `,
    tags: ['sales', 'customers', 'management', 'getting-started'],
  },
  {
    id: 'sales-orders',
    category: 'sales',
    title: 'Processing Orders',
    summary: 'Create and manage customer orders',
    content: `
# Processing Orders

Efficiently create and track customer orders.

## Creating an Order

1. Navigate to Sales > Orders
2. Click "New Order"
3. Select customer (or create new)
4. Add products to order
5. Review pricing and discounts
6. Set shipping address
7. Choose payment method
8. Click "Create Order"

## Order Status

- **Draft**: Being prepared
- **Pending**: Awaiting confirmation
- **Confirmed**: Approved and processing
- **Shipped**: Out for delivery
- **Delivered**: Completed
- **Cancelled**: Cancelled order

## Auto-population

The system automatically:
- Fills customer information
- Suggests related products
- Calculates totals and tax
- Applies customer discounts
    `,
    tags: ['sales', 'orders', 'processing'],
  },

  // Inventory
  {
    id: 'inventory-overview',
    category: 'inventory',
    title: 'Inventory Overview',
    summary: 'Manage stock items, locations, and movements',
    content: `
# Inventory Overview

The Inventory space provides real-time stock management.

## Key Features

- **Item Management**: Track all inventory items
- **Location Management**: Multi-warehouse support
- **Stock Movements**: Track ins, outs, and transfers
- **Alerts**: Low stock and reorder notifications
- **Reports**: Inventory valuation and analysis

## Inventory Dashboard

View:
- Total items and value
- Low stock alerts
- Out of stock items
- Recent movements
- Location summaries

## Quick Actions

- Add item
- Adjust stock
- Transfer stock
- Generate report
- Scan barcode
    `,
    tags: ['inventory', 'stock', 'management', 'getting-started'],
  },
  {
    id: 'inventory-adjustments',
    category: 'inventory',
    title: 'Stock Adjustments',
    summary: 'How to adjust inventory quantities',
    content: `
# Stock Adjustments

Quickly adjust inventory quantities without complex forms.

## Making an Adjustment

1. Find the item in inventory list
2. Click the adjustment icon
3. Select adjustment type:
   - Add: Increase quantity
   - Remove: Decrease quantity
   - Set to: Set exact quantity
4. Enter quantity
5. Add reason code
6. Enter reference (optional)
7. Click "Save"

## Adjustment Types

- **Add**: Receiving stock, returns
- **Remove**: Sales, damage, theft
- **Set to**: Physical count correction
- **Transfer**: Move between locations

## Tracking

All adjustments are logged with:
- Date and time
- User who made adjustment
- Reason and reference
- Before and after quantities
    `,
    tags: ['inventory', 'stock', 'adjustments'],
  },

  // Admin
  {
    id: 'admin-overview',
    category: 'admin',
    title: 'Administration Overview',
    summary: 'System settings, users, roles, and security',
    content: `
# Administration Overview

The Admin space provides centralized system management.

## Key Features

- **User Management**: Create and manage users
- **Role Management**: Define permissions
- **System Settings**: Configure system behavior
- **Security**: Audit logs and security settings
- **Assets**: Track company assets
- **Documents**: Manage system documents

## Admin Categories

1. **Users**: User accounts and access
2. **Roles**: Permission management
3. **Settings**: System configuration
4. **Security**: Audit and security
5. **Assets**: Asset tracking
6. **Documents**: Document management

## System Health

Monitor:
- Active users
- Storage usage
- System uptime
- Recent activity
- Security alerts
    `,
    tags: ['admin', 'settings', 'management', 'getting-started'],
  },
  {
    id: 'admin-users',
    category: 'admin',
    title: 'Managing Users',
    summary: 'Create and manage user accounts',
    content: `
# Managing Users

Control user access and permissions.

## Adding a User

1. Navigate to Admin > Users
2. Click "Add User"
3. Enter user details (name, email)
4. Assign role
5. Set permissions
6. Send invitation email
7. Click "Create"

## User Roles

- **Admin**: Full system access
- **Manager**: Department management
- **Employee**: Standard access
- **Viewer**: Read-only access

## Bulk Operations

Select multiple users to:
- Assign roles
- Activate/deactivate
- Send notifications
- Export user list
- Reset passwords

## Security

- Enforce strong passwords
- Enable two-factor authentication
- Set session timeouts
- Monitor login attempts
    `,
    tags: ['admin', 'users', 'security'],
  },

  // Support
  {
    id: 'support-overview',
    category: 'support',
    title: 'Support Overview',
    summary: 'Manage tickets, FAQs, and customer support',
    content: `
# Support Overview

The Support space helps manage customer support operations.

## Key Features

- **Ticket Management**: Track support requests
- **FAQ Management**: Knowledge base articles
- **Analytics**: Support metrics and reports
- **Team Collaboration**: Internal notes and assignments

## Support Dashboard

Monitor:
- Open tickets
- Response time
- Resolution time
- Customer satisfaction
- Ticket distribution

## Quick Actions

- Create ticket
- Assign ticket
- Resolve ticket
- Add FAQ
- View analytics
    `,
    tags: ['support', 'tickets', 'management', 'getting-started'],
  },
  {
    id: 'support-tickets',
    category: 'support',
    title: 'Managing Tickets',
    summary: 'Create and resolve support tickets',
    content: `
# Managing Tickets

Efficiently handle customer support requests.

## Creating a Ticket

1. Navigate to Support > Tickets
2. Click "New Ticket"
3. Select customer
4. Enter subject and description
5. Set category and priority
6. Assign to team member
7. Click "Create"

## Ticket Properties

- **Subject**: Brief description
- **Description**: Detailed information
- **Category**: Type of issue
- **Priority**: Low, Medium, High, Urgent
- **Status**: New, Open, Pending, Resolved, Closed
- **Assignee**: Responsible team member

## Quick Actions

Without leaving the ticket view:
- Assign to team member
- Change priority
- Escalate issue
- Resolve ticket
- Close ticket
- Merge duplicates

## FAQ Suggestions

The system suggests relevant FAQ articles based on ticket content to help resolve issues faster.
    `,
    tags: ['support', 'tickets', 'workflow'],
  },

  // My Space (Portal)
  {
    id: 'portal-overview',
    category: 'portal',
    title: 'My Space Overview',
    summary: 'Personal dashboard and self-service actions',
    content: `
# My Space Overview

Your personal workspace for common tasks and information.

## Key Features

- **Quick Actions**: Common tasks in one click
- **Profile Management**: Update your information
- **Document Access**: View personal documents
- **Request History**: Track your requests
- **Today's Summary**: Hours worked, leave balance

## Quick Actions

- Clock In/Out
- Request Leave
- Submit Expense
- Report Issue
- View Payslip
- Update Profile
- Access Documents
- View Schedule

## Instant Actions

Some actions like Clock In/Out work instantly without opening forms, providing immediate feedback.

## Request Tracking

View status of all your requests:
- Leave requests
- Expense claims
- Issue reports
- Document requests
    `,
    tags: ['portal', 'self-service', 'getting-started'],
  },

  // General
  {
    id: 'navigation-tips',
    category: 'general',
    title: 'Navigation Tips',
    summary: 'Tips for efficient navigation in the ERP system',
    content: `
# Navigation Tips

Learn how to navigate the ERP system efficiently.

## Sidebar Navigation

- Click on space names to access different areas
- Use Quick Access for frequently used features
- Collapse sidebar for more screen space
- Hover over icons for tooltips

## Global Search

Press **Cmd/Ctrl + K** to open global search:
- Search for pages and features
- Find customers, projects, employees
- Access recent searches
- Get results in under 200ms

## Breadcrumbs

Use breadcrumbs at the top to:
- See your current location
- Navigate to parent pages
- Understand page hierarchy

## Keyboard Shortcuts

- **Cmd/Ctrl + K**: Global search
- **Cmd/Ctrl + B**: Toggle sidebar
- **Cmd/Ctrl + /**: Show shortcuts
- **Esc**: Close modals and dialogs

## Recent Routes

Access your last 10 visited pages from the Quick Access menu.
    `,
    tags: ['navigation', 'shortcuts', 'tips', 'getting-started'],
  },
  {
    id: 'keyboard-shortcuts',
    category: 'general',
    title: 'Keyboard Shortcuts',
    summary: 'Complete list of keyboard shortcuts',
    content: `
# Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts.

## Global Shortcuts

- **Cmd/Ctrl + K**: Open global search
- **Cmd/Ctrl + B**: Toggle sidebar
- **Cmd/Ctrl + /**: Show shortcuts help
- **Cmd/Ctrl + ,**: Open settings
- **Esc**: Close modal/dialog

## Navigation

- **Arrow Keys**: Navigate lists and menus
- **Enter**: Select item
- **Tab**: Move to next field
- **Shift + Tab**: Move to previous field

## Actions

- **Cmd/Ctrl + S**: Save
- **Cmd/Ctrl + N**: New item
- **Cmd/Ctrl + E**: Edit
- **Cmd/Ctrl + D**: Delete
- **Cmd/Ctrl + P**: Print

## Tables

- **Space**: Select row
- **Cmd/Ctrl + A**: Select all
- **Arrow Keys**: Navigate cells
- **Enter**: Edit cell

## Forms

- **Tab**: Next field
- **Shift + Tab**: Previous field
- **Enter**: Submit form
- **Esc**: Cancel

Press **Cmd/Ctrl + /** anytime to see available shortcuts for the current page.
    `,
    tags: ['shortcuts', 'keyboard', 'productivity', 'tips'],
  },
];

/**
 * Search help articles
 * @param {string} query - Search query
 * @param {string} category - Optional category filter
 * @returns {Array} Matching articles
 */
export const searchHelpArticles = (query, category = null) => {
  if (!query && !category) return helpArticles;

  let results = helpArticles;

  // Filter by category if provided
  if (category) {
    results = results.filter(article => article.category === category);
  }

  // Search by query if provided
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(lowerQuery);
      const summaryMatch = article.summary.toLowerCase().includes(lowerQuery);
      const contentMatch = article.content.toLowerCase().includes(lowerQuery);
      const tagsMatch = article.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      return titleMatch || summaryMatch || contentMatch || tagsMatch;
    });
  }

  return results;
};

/**
 * Get article by ID
 * @param {string} id - Article ID
 * @returns {Object|null} Article or null if not found
 */
export const getHelpArticle = (id) => {
  return helpArticles.find(article => article.id === id) || null;
};

/**
 * Get articles by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Articles in category
 */
export const getArticlesByCategory = (categoryId) => {
  return helpArticles.filter(article => article.category === categoryId);
};
