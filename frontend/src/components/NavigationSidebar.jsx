import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  User,
  DollarSign,
  ShoppingCart,
  Settings,
  X,
  Menu,
  Headphones,
  MessageSquare,
  FileText,
  Share2,
  Briefcase,
  UserPlus,
  GraduationCap,
  Heart,
  Building2,
  Mail,
  ClipboardCheck,
  Calculator,
  Wallet,
} from 'lucide-react';
import { cn } from '../design-system/utils';
import UserProfileMenu from './UserProfileMenu';

/**
 * NavigationSidebar Component
 * 
 * Primary navigation interface providing access to all system spaces.
 * Features:
 * - Flat list of 22 spaces (no categories)
 * - Permission-based visibility (Dashboard and My Space always visible)
 * - Active space highlighting
 * - Hover tooltips (< 100ms)
 * - Responsive behavior (icon-only < 1024px, drawer on mobile)
 * - Keyboard navigation support
 * - Scrollable navigation for many spaces
 * 
 * @param {Object} userPermissions - Object with space permissions from backend
 *   Example: { projects: true, inventory: false, hr: true, ... }
 *   Dashboard and My Space are always visible (default spaces)
 * 
 * Requirements: 3.1, 3.3, 3.4, 3.6, 1.1
 */

// Space configuration with icons and routes (in display order)
const ALL_SPACES = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
    isDefault: true, // Always visible
  },
  {
    id: 'mySpace',
    label: 'My Space',
    icon: User,
    route: '/myspace',
    isDefault: true, // Always visible
  },
  {
    id: 'projects',
    label: 'Project Space',
    icon: FolderKanban,
    route: '/projects',
  },
  {
    id: 'inventory',
    label: 'Inventory Space',
    icon: Package,
    route: '/inventory',
  },
  {
    id: 'hr',
    label: 'HR Space',
    icon: Users,
    route: '/hr',
  },
  {
    id: 'finance',
    label: 'Finance Space',
    icon: DollarSign,
    route: '/finance',
  },
  {
    id: 'admin',
    label: 'Admin Space',
    icon: Settings,
    route: '/admin',
  },
  {
    id: 'sales',
    label: 'Sales Space',
    icon: ShoppingCart,
    route: '/sales',
  },
  {
    id: 'support',
    label: 'Support Space',
    icon: Headphones,
    route: '/support',
  },
  {
    id: 'collaboration',
    label: 'Collaboration Space',
    icon: MessageSquare,
    route: '/collaboration',
  },
  {
    id: 'documents',
    label: 'Document Space',
    icon: FileText,
    route: '/documents',
  },
  {
    id: 'fileShare',
    label: 'File Share Space',
    icon: Share2,
    route: '/file-share',
  },
  {
    id: 'purchaseRequests',
    label: 'Procurement Space',
    icon: Briefcase,
    route: '/purchase-requests',
  },
  {
    id: 'recruitment',
    label: 'Recruitment Space',
    icon: UserPlus,
    route: '/recruitment',
  },
  {
    id: 'training',
    label: 'School Space',
    icon: GraduationCap,
    route: '/training',
  },
  {
    id: 'health',
    label: 'Health Space',
    icon: Heart,
    route: '/health',
  },
  {
    id: 'office',
    label: 'Office Space',
    icon: Building2,
    route: '/office-desk',
  },
  {
    id: 'visitor',
    label: 'Visitor Space',
    icon: User,
    route: '/visitor',
  },
  {
    id: 'mail',
    label: 'Mail Space',
    icon: Mail,
    route: '/mail',
  },
  {
    id: 'compliance',
    label: 'Compliance Space',
    icon: ClipboardCheck,
    route: '/compliance',
  },
  {
    id: 'expense',
    label: 'Expense Space',
    icon: Calculator,
    route: '/expenses',
  },
  {
    id: 'payroll',
    label: 'Payroll Space',
    icon: Wallet,
    route: '/payroll',
  },
];

// Local storage keys
const STORAGE_KEYS = {
  COLLAPSED: 'nav-sidebar-collapsed',
};

const NavigationSidebar = ({ userPermissions = null, user, onLogout, theme, onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };
  
  // State management
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.COLLAPSED);
    return stored ? JSON.parse(stored) : false;
  });
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredSpace, setHoveredSpace] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Filter spaces based on permissions
  // For now, show all spaces. When backend is ready, filter based on userPermissions
  const visibleSpaces = useMemo(() => {
    if (!userPermissions) {
      // Show all spaces when permissions not loaded yet
      return ALL_SPACES;
    }
    
    // Filter spaces based on permissions
    // Default spaces (Dashboard, My Space) are always visible
    return ALL_SPACES.filter(space => 
      space.isDefault || userPermissions[space.id]
    );
  }, [userPermissions]);
  
  // Determine active space based on current route
  const activeSpace = visibleSpaces.find(space => 
    location.pathname.startsWith(space.route)
  )?.id || null;
  
  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLAPSED, JSON.stringify(collapsed));
  }, [collapsed]);
  
  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Navigate to space
  const handleSpaceClick = (space) => {
    navigate(space.route);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  
  // Handle tooltip positioning
  const handleMouseEnter = (e, spaceId) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.right + 8, y: rect.top });
      setHoveredSpace(spaceId);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredSpace(null);
  };
  
  // Render space item
  const renderSpaceItem = (space) => {
    const Icon = space.icon;
    const isActive = activeSpace === space.id;
    
    return (
      <button
        key={space.id}
        onClick={() => handleSpaceClick(space)}
        onKeyDown={(e) => handleKeyDown(e, () => handleSpaceClick(space))}
        onMouseEnter={(e) => handleMouseEnter(e, space.id)}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
          'hover:bg-[#E8F5E9] focus:outline-none focus:ring-1 focus:ring-[#1B4422] focus:ring-offset-1',
          isActive && 'bg-green-100 text-[#1B4422] font-medium',
          !isActive && 'text-neutral-700 hover:text-[#1B4422]',
          collapsed && 'justify-center px-2'
        )}
        aria-label={space.label}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon 
          className={cn(
            'flex-shrink-0 transition-colors',
            isActive ? 'text-[#1B4422]' : 'text-neutral-500'
          )} 
          size={20} 
        />
        {!collapsed && (
          <span className="text-sm truncate">{space.label}</span>
        )}
      </button>
    );
  };
  
  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header with clickable logo - reduced padding */}
      <div className={cn(
        'flex items-center p-2',
        'justify-center' // Always center the logo
      )}>
        {/* Clickable logo that toggles sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center justify-center p-2 rounded-lg hover:bg-neutral-100 transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-[#1B4422]',
            'hidden lg:flex'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <img 
            src="/icon.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain"
          />
        </button>
        
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} className="text-neutral-600" />
        </button>
      </div>
      
      {/* Navigation - hide scrollbar */}
      <nav 
        className="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        aria-label="Main navigation"
      >
        {/* All Spaces */}
        <div className="space-y-0.5">
          {visibleSpaces.map(space => renderSpaceItem(space))}
        </div>
      </nav>
      
      {/* User Profile at Bottom - reduced padding */}
      <div className="p-2">
        <UserProfileMenu 
          user={user}
          onLogout={onLogout}
          theme={theme}
          onThemeToggle={onThemeToggle}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
  
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          'fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg',
          'lg:hidden',
          mobileOpen && 'hidden'
        )}
        aria-label="Open menu"
      >
        <Menu size={24} className="text-neutral-700" />
      </button>
      
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-4 left-4 h-[calc(100vh-2rem)] bg-white z-50',
          'transition-all duration-300 ease-in-out',
          'rounded-2xl shadow-xl',
          // Desktop
          'hidden lg:block',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile drawer
          'lg:translate-x-0',
          mobileOpen ? 'block translate-x-0 w-64 top-0 left-0 h-full rounded-none' : '-translate-x-full'
        )}
        aria-label="Navigation sidebar"
      >
        {sidebarContent}
      </aside>
      
      {/* Tooltip for collapsed state */}
      {collapsed && hoveredSpace && (
        <div
          className="fixed z-50 px-3 py-2 bg-neutral-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          role="tooltip"
        >
          {ALL_SPACES.find(s => s.id === hoveredSpace)?.label}
        </div>
      )}
    </>
  );
};

export default NavigationSidebar;
