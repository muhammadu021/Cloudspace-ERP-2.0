/**
 * Breadcrumbs Component
 * 
 * Displays current navigation path and enables quick navigation to parent levels.
 * Features:
 * - Auto-generates breadcrumb trail from React Router location
 * - Click navigation to any parent level
 * - Responsive behavior (truncate on mobile, full path on desktop)
 * - Accessible with proper ARIA labels
 * - Keyboard navigation support
 * 
 * Requirements: 1.3
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../design-system/utils';

// Route label mappings for better display names
const ROUTE_LABELS = {
  // Dashboard
  dashboard: 'Dashboard',
  
  // Projects
  projects: 'Projects',
  list: 'List',
  board: 'Board',
  calendar: 'Calendar',
  templates: 'Templates',
  reports: 'Reports',
  
  // HR
  hr: 'HR',
  employees: 'Employees',
  attendance: 'Attendance',
  payroll: 'Payroll',
  recruitment: 'Recruitment',
  departments: 'Departments',
  positions: 'Positions',
  shifts: 'Shifts',
  runs: 'Runs',
  jobs: 'Job Postings',
  candidates: 'Candidates',
  
  // Finance
  finance: 'Finance',
  accounts: 'Accounts',
  transactions: 'Transactions',
  budgets: 'Budgets',
  expenses: 'Expenses',
  reconciliation: 'Reconciliation',
  settings: 'Settings',
  
  // Sales
  sales: 'Sales',
  customers: 'Customers',
  orders: 'Orders',
  leads: 'Leads',
  pos: 'Point of Sale',
  
  // Inventory
  inventory: 'Inventory',
  items: 'Items',
  locations: 'Locations',
  movements: 'Movements',
  
  // Admin
  admin: 'Admin',
  users: 'Users',
  roles: 'Roles',
  security: 'Security',
  company: 'Company',
  assets: 'Assets',
  documents: 'Documents',
  monitoring: 'Monitoring',
  logs: 'Logs',
  
  // Support
  support: 'Support',
  tickets: 'Tickets',
  faq: 'FAQ',
  analytics: 'Analytics',
  
  // Portal (My Space)
  portal: 'My Space',
  profile: 'Profile',
  requests: 'Requests',
  
  // Common actions
  new: 'New',
  edit: 'Edit',
  view: 'View',
  create: 'Create',
  custom: 'Custom',
};

/**
 * Parse route path into breadcrumb items
 * @param {string} pathname - Current route pathname
 * @returns {Array} Array of breadcrumb items
 */
const parseBreadcrumbs = (pathname) => {
  // Always start with home
  const breadcrumbs = [
    {
      label: 'Home',
      route: '/dashboard',
      icon: Home,
    }
  ];
  
  // Add Dashboard as second item if we're at dashboard root
  if (pathname === '/' || pathname === '/dashboard') {
    breadcrumbs.push({
      label: 'Dashboard',
      route: '/dashboard',
    });
    return breadcrumbs;
  }
  
  // Split path and filter empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Build breadcrumbs from segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip numeric IDs (they represent detail views)
    if (/^\d+$/.test(segment)) {
      // For ID segments, use a generic label or fetch from context
      breadcrumbs.push({
        label: `#${segment}`,
        route: currentPath,
        isId: true,
      });
    } else {
      // Use mapped label or capitalize segment
      const label = ROUTE_LABELS[segment] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbs.push({
        label,
        route: currentPath,
      });
    }
  });
  
  return breadcrumbs;
};

/**
 * Breadcrumbs Component
 */
const Breadcrumbs = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse current location into breadcrumbs
  const breadcrumbs = parseBreadcrumbs(location.pathname);
  
  // Handle breadcrumb click
  const handleClick = (route, index) => {
    // Don't navigate if it's the current page (last item)
    if (index === breadcrumbs.length - 1) {
      return;
    }
    navigate(route);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e, route, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(route, index);
    }
  };
  
  // Don't render if only home breadcrumb
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center', className)}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = crumb.icon;
          
          return (
            <li key={crumb.route} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight 
                  className="text-neutral-400 mx-1 flex-shrink-0" 
                  size={12}
                  aria-hidden="true"
                />
              )}
              
              {/* Breadcrumb item */}
              {isLast ? (
                // Current page - not clickable
                <span
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium text-neutral-900',
                    'truncate max-w-[150px] md:max-w-none'
                  )}
                  aria-current="page"
                >
                  {Icon && <Icon size={12} className="flex-shrink-0" />}
                  <span className="truncate">{crumb.label}</span>
                </span>
              ) : (
                // Parent pages - clickable
                <button
                  onClick={() => handleClick(crumb.route, index)}
                  onKeyDown={(e) => handleKeyDown(e, crumb.route, index)}
                  className={cn(
                    'flex items-center gap-1 text-xs text-neutral-600',
                    'hover:text-primary-600 transition-colors',
                    'focus:outline-none focus:ring-1 focus:ring-primary-500 rounded px-1 -mx-1',
                    'truncate max-w-[100px] md:max-w-none',
                    // Hide middle items on mobile (show only first and last)
                    index > 0 && index < breadcrumbs.length - 1 && 'hidden md:flex'
                  )}
                  aria-label={`Navigate to ${crumb.label}`}
                >
                  {Icon && <Icon size={12} className="flex-shrink-0" />}
                  <span className="truncate">{crumb.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Mobile ellipsis indicator when items are hidden */}
      {breadcrumbs.length > 2 && (
        <span 
          className="md:hidden text-neutral-400 mx-2 text-sm"
          aria-hidden="true"
        >
          ...
        </span>
      )}
    </nav>
  );
};

export default Breadcrumbs;
