-- Migration: Seed Default Dashboard Configurations (SQLite)
-- Description: Inserts default dashboard configurations for all 5 roles
-- Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2

-- System Administrator (Overview Dashboard)
INSERT INTO dashboard_configurations (role, version, configuration, is_active) VALUES (
    'system-administrator',
    1,
    '{"widgets":[{"id":"total-users","type":"metric","title":"Total Users","position":{"x":0,"y":0,"w":3,"h":2}},{"id":"system-health","type":"metric","title":"System Health","position":{"x":3,"y":0,"w":3,"h":2}},{"id":"active-sessions","type":"metric","title":"Active Sessions","position":{"x":6,"y":0,"w":3,"h":2}},{"id":"storage-usage","type":"metric","title":"Storage Usage","position":{"x":9,"y":0,"w":3,"h":2}},{"id":"user-activity","type":"chart","title":"User Activity","position":{"x":0,"y":2,"w":6,"h":4}},{"id":"system-performance","type":"chart","title":"System Performance","position":{"x":6,"y":2,"w":6,"h":4}},{"id":"recent-alerts","type":"list","title":"Recent Alerts","position":{"x":0,"y":6,"w":6,"h":4}},{"id":"audit-log","type":"list","title":"Recent Audit Log","position":{"x":6,"y":6,"w":6,"h":4}}],"quickActions":[{"id":"manage-users","label":"Manage Users","icon":"users","route":"/admin/users"},{"id":"system-settings","label":"System Settings","icon":"settings","route":"/admin/settings"},{"id":"view-logs","label":"View Logs","icon":"file-text","route":"/admin/logs"},{"id":"backup-system","label":"Backup System","icon":"database","action":"backup"}]}',
    1
);

-- Admin Dashboard
INSERT INTO dashboard_configurations (role, version, configuration, is_active) VALUES (
    'admin',
    1,
    '{"widgets":[{"id":"user-count","type":"metric","title":"Total Users","position":{"x":0,"y":0,"w":3,"h":2}},{"id":"active-users","type":"metric","title":"Active Users","position":{"x":3,"y":0,"w":3,"h":2}},{"id":"pending-approvals","type":"metric","title":"Pending Approvals","position":{"x":6,"y":0,"w":3,"h":2}},{"id":"system-alerts","type":"metric","title":"System Alerts","position":{"x":9,"y":0,"w":3,"h":2}},{"id":"user-management","type":"list","title":"Recent User Changes","position":{"x":0,"y":2,"w":6,"h":4}},{"id":"security-events","type":"list","title":"Security Events","position":{"x":6,"y":2,"w":6,"h":4}}],"quickActions":[{"id":"add-user","label":"Add User","icon":"user-plus","route":"/admin/users/new"},{"id":"manage-roles","label":"Manage Roles","icon":"shield","route":"/admin/roles"},{"id":"view-assets","label":"View Assets","icon":"package","route":"/admin/assets"}]}',
    1
);

-- HR Dashboard
INSERT INTO dashboard_configurations (role, version, configuration, is_active) VALUES (
    'hr',
    1,
    '{"widgets":[{"id":"employee-count","type":"metric","title":"Total Employees","position":{"x":0,"y":0,"w":3,"h":2}},{"id":"attendance-rate","type":"metric","title":"Attendance Rate","position":{"x":3,"y":0,"w":3,"h":2}},{"id":"open-positions","type":"metric","title":"Open Positions","position":{"x":6,"y":0,"w":3,"h":2}},{"id":"pending-leaves","type":"metric","title":"Pending Leaves","position":{"x":9,"y":0,"w":3,"h":2}},{"id":"attendance-chart","type":"chart","title":"Attendance Trends","position":{"x":0,"y":2,"w":6,"h":4}},{"id":"recruitment-pipeline","type":"chart","title":"Recruitment Pipeline","position":{"x":6,"y":2,"w":6,"h":4}},{"id":"leave-requests","type":"list","title":"Recent Leave Requests","position":{"x":0,"y":6,"w":6,"h":4}},{"id":"performance-reviews","type":"list","title":"Upcoming Reviews","position":{"x":6,"y":6,"w":6,"h":4}}],"quickActions":[{"id":"add-employee","label":"Add Employee","icon":"user-plus","route":"/hr/employees/new"},{"id":"approve-leaves","label":"Approve Leaves","icon":"calendar","route":"/hr/leaves"},{"id":"post-job","label":"Post Job","icon":"briefcase","route":"/hr/recruitment/new"},{"id":"run-payroll","label":"Run Payroll","icon":"dollar-sign","route":"/hr/payroll"}]}',
    1
);

-- Finance Dashboard
INSERT INTO dashboard_configurations (role, version, configuration, is_active) VALUES (
    'finance',
    1,
    '{"widgets":[{"id":"total-revenue","type":"metric","title":"Total Revenue","position":{"x":0,"y":0,"w":3,"h":2}},{"id":"total-expenses","type":"metric","title":"Total Expenses","position":{"x":3,"y":0,"w":3,"h":2}},{"id":"pending-invoices","type":"metric","title":"Pending Invoices","position":{"x":6,"y":0,"w":3,"h":2}},{"id":"cash-flow","type":"metric","title":"Cash Flow","position":{"x":9,"y":0,"w":3,"h":2}},{"id":"revenue-chart","type":"chart","title":"Revenue Trends","position":{"x":0,"y":2,"w":6,"h":4}},{"id":"expense-breakdown","type":"chart","title":"Expense Breakdown","position":{"x":6,"y":2,"w":6,"h":4}},{"id":"recent-transactions","type":"list","title":"Recent Transactions","position":{"x":0,"y":6,"w":6,"h":4}},{"id":"budget-alerts","type":"list","title":"Budget Alerts","position":{"x":6,"y":6,"w":6,"h":4}}],"quickActions":[{"id":"create-invoice","label":"Create Invoice","icon":"file-text","route":"/finance/invoices/new"},{"id":"record-expense","label":"Record Expense","icon":"dollar-sign","route":"/finance/expenses/new"},{"id":"view-reports","label":"View Reports","icon":"bar-chart","route":"/finance/reports"},{"id":"manage-budgets","label":"Manage Budgets","icon":"pie-chart","route":"/finance/budgets"}]}',
    1
);

-- Normal User (Personal Dashboard)
INSERT INTO dashboard_configurations (role, version, configuration, is_active) VALUES (
    'normal-user',
    1,
    '{"widgets":[{"id":"my-tasks","type":"list","title":"My Tasks","position":{"x":0,"y":0,"w":6,"h":4}},{"id":"my-notifications","type":"list","title":"My Notifications","position":{"x":6,"y":0,"w":6,"h":4}},{"id":"my-activity","type":"list","title":"My Recent Activity","position":{"x":0,"y":4,"w":6,"h":4}},{"id":"company-announcements","type":"list","title":"Company Announcements","position":{"x":6,"y":4,"w":6,"h":4}},{"id":"my-performance","type":"chart","title":"My Performance","position":{"x":0,"y":8,"w":12,"h":4}}],"quickActions":[]}',
    1
);
