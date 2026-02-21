/**
 * Custom Icon Mapping Configuration
 * Maps module IDs to custom icon files in /public/icons
 */

export const CUSTOM_ICON_MAPPING = {
  'dashboard': '/icons/myDesk.png',
  'my-desk': '/icons/myDesk.png',
  'sales-desk': '/icons/SalesDesk.png',
  'purchase-desk': '/icons/PurchaseDesk.png',
  'procurement-desk': '/icons/Procurement.png',
  'project-desk': '/icons/ProjectDesk.png',
  'inventory-desk': '/icons/OfficeDesk.png', // Using OfficeDesk as fallback
  'finance-desk': '/icons/FinanceDesk.png',
  'payroll-desk': '/icons/PayrollDesk.png',
  'expense-desk': '/icons/ExpenseDesk.png',
  'hr-desk': '/icons/HRdesk.png',
  'recruitment-desk': '/icons/RecruitmentDesk.png',
  'school-desk': '/icons/SchoolDesk.png',
  'health-desk': '/icons/HealthDesk.png',
  'collaboration-desk': '/icons/CollaborationDesk.png',
  'office-desk': '/icons/OfficeDesk.png',
  'admin-desk': '/icons/AdminDesk.png',
  'settings-desk': '/icons/Settings.png',
  'visitor-desk': '/icons/VisitorDesk.png',
  'mail-desk': '/icons/MailDesk.png',
  'support-desk': '/icons/SupportDesk.png',
  'compliance-desk': '/icons/ComplinceDesk.png',
  'cloud-desk': '/icons/CloudDesk.png',
};

/**
 * Get custom icon path for a module
 * @param {string} moduleId - The module ID
 * @returns {string|null} - The icon path or null if not found
 */
export const getCustomIcon = (moduleId) => {
  return CUSTOM_ICON_MAPPING[moduleId] || null;
};

/**
 * Check if a module has a custom icon
 * @param {string} moduleId - The module ID
 * @returns {boolean} - True if custom icon exists
 */
export const hasCustomIcon = (moduleId) => {
  return moduleId in CUSTOM_ICON_MAPPING;
};

export default CUSTOM_ICON_MAPPING;
