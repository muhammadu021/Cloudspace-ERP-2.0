/**
 * UserProfileMenu Component
 * 
 * Displays user profile menu with quick access to settings and logout.
 * Features:
 * - User avatar and name display
 * - Quick access to profile settings
 * - Theme toggle (light/dark mode)
 * - Preferences link
 * - Logout button
 * - Keyboard accessible
 * 
 * Requirements: 15.7, 15.3
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Moon, Sun, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../design-system/utils';

const UserProfileMenu = ({ user, onLogout, theme, onThemeToggle, collapsed = false }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.email || 'User';
  };

  // Get user role
  const getUserRole = () => {
    if (!user) return '';
    return user.Role?.name || user.role || user.UserType?.name || '';
  };

  const handleProfileClick = () => {
    navigate('/portal/profile');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full',
            'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
            isOpen && 'bg-neutral-100',
            collapsed && 'justify-center px-2'
          )}
          aria-label="User menu"
        >
          {/* Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={getDisplayName()}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          {/* User info (hidden when collapsed) */}
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-neutral-900 leading-tight truncate">
                  {getDisplayName()}
                </p>
                {getUserRole() && (
                  <p className="text-xs text-neutral-500 leading-tight truncate">
                    {getUserRole()}
                  </p>
                )}
              </div>

              <ChevronDown
                className={cn(
                  'h-4 w-4 text-neutral-500 transition-transform flex-shrink-0',
                  isOpen && 'transform rotate-180'
                )}
              />
            </>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] rounded-lg bg-white shadow-lg border border-neutral-200 p-1 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end"
        >
          {/* User info header */}
          <div className="px-3 py-2 border-b border-neutral-200 mb-1">
            <p className="text-sm font-medium text-neutral-900">
              {getDisplayName()}
            </p>
            {user?.email && (
              <p className="text-xs text-neutral-500 truncate">
                {user.email}
              </p>
            )}
            {getUserRole() && (
              <p className="text-xs text-neutral-400 mt-1">
                {getUserRole()}
              </p>
            )}
          </div>

          {/* Profile */}
          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
              'focus:outline-none focus:bg-neutral-100',
              'transition-colors'
            )}
            onSelect={handleProfileClick}
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenu.Item>

          {/* Settings */}
          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer',
              'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
              'focus:outline-none focus:bg-neutral-100',
              'transition-colors'
            )}
            onSelect={handleSettingsClick}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </DropdownMenu.Item>

          {/* Theme Toggle */}
          {onThemeToggle && (
            <>
              <DropdownMenu.Separator className="h-px bg-neutral-200 my-1" />
              <DropdownMenu.Item
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer',
                  'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
                  'focus:outline-none focus:bg-neutral-100',
                  'transition-colors'
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  onThemeToggle();
                }}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </DropdownMenu.Item>
            </>
          )}

          {/* Logout */}
          <DropdownMenu.Separator className="h-px bg-neutral-200 my-1" />
          <DropdownMenu.Item
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer',
              'text-red-600 hover:bg-red-50 hover:text-red-700',
              'focus:outline-none focus:bg-red-50',
              'transition-colors'
            )}
            onSelect={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default UserProfileMenu;
