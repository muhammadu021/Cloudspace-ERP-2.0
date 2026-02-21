/**
 * Filter navigation items based on allowed modules
 * @param {Array} navItems - Array of navigation items
 * @param {Array} allowedModules - Array of allowed module names
 * @returns {Array} Filtered navigation items
 */
export const filterNavigationByModules = (navItems, allowedModules) => {
  if (!allowedModules || allowedModules.length === 0) {
    return navItems;
  }

  return navItems.filter(item => {
    // If item has no module requirement, always show it
    if (!item.module) {
      return true;
    }

    // Check if module is allowed
    if (Array.isArray(item.module)) {
      // Item requires any of multiple modules
      return item.module.some(mod => allowedModules.includes(mod));
    } else {
      // Item requires single module
      return allowedModules.includes(item.module);
    }
  }).map(item => {
    // Recursively filter children if they exist
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: filterNavigationByModules(item.children, allowedModules)
      };
    }
    return item;
  });
};

/**
 * Module configuration with display names and descriptions
 */
export const MODULE_CONFIG = {
  hr: {
    name: 'Human Resources',
    description: 'Employee management, attendance, leave, payroll',
    icon: 'Users'
  },
  finance: {
    name: 'Finance & Accounting',
    description: 'Accounts, transactions, budgets, expenses',
    icon: 'CreditCard'
  },
  inventory: {
    name: 'Inventory Management',
    description: 'Stock tracking, warehouses, suppliers',
    icon: 'Package'
  },
  sales: {
    name: 'Sales & CRM',
    description: 'Customers, orders, quotations, invoices',
    icon: 'ShoppingCart'
  },
  projects: {
    name: 'Project Management',
    description: 'Tasks, milestones, team collaboration',
    icon: 'Briefcase'
  },
  support: {
    name: 'Support Desk',
    description: 'Tickets, knowledge base, customer support',
    icon: 'Headphones'
  },
  documents: {
    name: 'Document Management',
    description: 'File storage, version control, workflows',
    icon: 'FileText'
  },
  collaboration: {
    name: 'Collaboration',
    description: 'Messaging, forums, announcements',
    icon: 'MessageSquare'
  },
  admin: {
    name: 'Administration',
    description: 'System settings, user management, company setup',
    icon: 'Settings'
  }
};
