import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePageHeader } from '../contexts/PageHeaderContext';
import { PuffinLoader } from './ui/PuffinLoader';
import NavigationSidebar from './NavigationSidebar';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import UserProfileMenu from './UserProfileMenu';
import Breadcrumbs from './Breadcrumbs';
import EnhancedScrollToTop from './EnhancedScrollToTop';
import { useNavigate } from 'react-router-dom';

const Layout = () => {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { pageTitle, pageActions } = usePageHeader();
  const navigate = useNavigate();
  
  // Track sidebar collapsed state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('nav-sidebar-collapsed');
    return stored ? JSON.parse(stored) : false;
  });
  
  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('nav-sidebar-collapsed');
      setSidebarCollapsed(stored ? JSON.parse(stored) : false);
    };
    
    // Check every 100ms for changes (sidebar updates localStorage)
    const interval = setInterval(handleStorageChange, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    navigate("/login");
  };
  // console.log('🏠 Layout render - Auth state:', {
  //   isLoading,
  //   isAuthenticated,
  //   user: user ? {
  //     id: user.id,
  //     email: user.email,
  //     first_name: user.first_name,
  //     last_name: user.last_name,
  //     UserType: user.UserType ? {
  //       name: user.UserType.name,
  //       sidebar_modules: user.UserType.sidebar_modules ? 'Present' : 'Missing'
  //     } : 'Missing',
  //     Role: user.Role ? { name: user.Role.name } : 'Missing'
  //   } : 'Missing'
  // });

  if (isLoading) {
    // console.log('⏳ Layout - Still loading, showing loader');
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffinLoader size="lg" message="Loading application..." />
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    // console.log('❌ Layout - Not authenticated or no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Enhanced scroll to top on route change */}
      <EnhancedScrollToTop 
        behavior="smooth" 
        delay={100} 
        selector="main"
        showIndicator={true}
        indicatorThreshold={300}
      />
      
      {/* New Navigation Sidebar - replaces DynamicSidebar */}
      <NavigationSidebar userPermissions={null} user={user} onLogout={handleLogout} theme={theme} onThemeToggle={toggleTheme} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0 lg:ml-28' : 'ml-0 lg:ml-72'
      }`}>
        {/* Header with Search, Page Title, and Navbar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="flex items-center px-6 py-2 gap-4">
            {/* Left: Breadcrumbs */}
            <div className="flex-shrink-0 min-w-0">
              <Breadcrumbs />
            </div>
            
            {/* Center: Search */}
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-sm">
                <GlobalSearch />
              </div>
            </div>
            
            {/* Right: Notification Center */}
            <div className="flex-shrink-0">
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;