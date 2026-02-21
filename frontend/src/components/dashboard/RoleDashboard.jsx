/**
 * RoleDashboard Container Component
 * 
 * Main orchestrator for role-based dashboard system.
 * Handles route context detection, role detection, preferences, and configuration loading.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.1, 2.3, 2.4, 2.5, 2.6, 13.1
 */

import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/design-system/utils';
import { useUserRole } from '@/hooks/useUserRole';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import DashboardTypeSelector from './DashboardTypeSelector';
import DashboardContent from './DashboardContent';
import Alert from '@/design-system/components/Alert';

/**
 * Role Dashboard Container Component
 * 
 * Detects context (My Space vs main Dashboard) and renders appropriate dashboard.
 * System Administrators can switch dashboard types in main Dashboard context only.
 */
const RoleDashboard = () => {
  const location = useLocation();
  const { role, userType, isSystemAdmin, loading: roleLoading } = useUserRole();
  
  // Detect route context
  const isMySpaceContext = useMemo(() => {
    return location.pathname.includes('/myspace');
  }, [location.pathname]);
  
  // Get dashboard preferences (only for System Admin)
  const {
    selectedDashboardType,
    setDashboardType,
    loading: preferencesLoading,
    error: preferencesError,
  } = useDashboardPreferences({
    skip: !isSystemAdmin || isMySpaceContext, // Skip if not System Admin or in My Space
  });
  
  console.log('[RoleDashboard] Preferences:', {
    selectedDashboardType,
    preferencesLoading,
    preferencesError: preferencesError?.message,
    skip: !isSystemAdmin || isMySpaceContext,
  });
  
  // Determine effective dashboard type
  const effectiveDashboardType = useMemo(() => {
    // In My Space context, always use Personal Dashboard (normal-user)
    if (isMySpaceContext) {
      console.log('[RoleDashboard] Using normal-user for My Space context');
      return 'normal-user';
    }
    
    // In main Dashboard context
    // System Admin can switch, others use their role
    if (isSystemAdmin && selectedDashboardType) {
      console.log('[RoleDashboard] System Admin selected:', selectedDashboardType);
      return selectedDashboardType;
    }
    
    console.log('[RoleDashboard] Using default role:', role);
    return role;
  }, [isMySpaceContext, isSystemAdmin, selectedDashboardType, role]);
  
  // Debug logging (after all values are defined)
  console.log('[RoleDashboard] State:', {
    role,
    userType,
    isSystemAdmin,
    roleLoading,
    pathname: location.pathname,
    isMySpaceContext,
    selectedDashboardType,
    effectiveDashboardType,
  });
  
  console.log('[RoleDashboard] Effective dashboard type:', effectiveDashboardType);
  
  // Fetch dashboard configuration
  const {
    config,
    loading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useDashboardConfig({
    role: effectiveDashboardType,
    skip: !effectiveDashboardType,
  });
  
  console.log('[RoleDashboard] Config:', config ? `${config.role} - ${config.configuration?.title}` : 'null');
  
  // Log analytics event for dashboard view
  useEffect(() => {
    if (effectiveDashboardType && config) {
      // Analytics logging would go here
      console.log('Dashboard View Analytics:', {
        role: effectiveDashboardType,
        userType,
        context: isMySpaceContext ? 'myspace' : 'dashboard',
        timestamp: new Date().toISOString(),
      });
    }
  }, [effectiveDashboardType, config, userType, isMySpaceContext]);
  
  /**
   * Handle dashboard type change (System Admin only)
   */
  const handleDashboardTypeChange = async (newType) => {
    console.log('[RoleDashboard] Dashboard type change requested:', { from: effectiveDashboardType, to: newType });
    
    try {
      await setDashboardType(newType);
      
      console.log('[RoleDashboard] Dashboard type changed successfully');
      
      // Log analytics event for dashboard switch
      console.log('Dashboard Switch Analytics:', {
        from: effectiveDashboardType,
        to: newType,
        userType,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[RoleDashboard] Failed to change dashboard type:', error);
    }
  };
  
  /**
   * Handle global refresh
   */
  const handleGlobalRefresh = async () => {
    try {
      await refetchConfig();
      // Additional refresh logic for widgets would go here
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  };
  
  // Loading state
  if (roleLoading || configLoading || (isSystemAdmin && !isMySpaceContext && preferencesLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Error state - Configuration error
  if (configError) {
    return (
      <div className="p-6">
        <Alert
          variant="error"
          title="Failed to Load Dashboard"
          message={
            configError?.message ||
            'Unable to load dashboard configuration. Please try again or contact support.'
          }
          action={{
            label: 'Retry',
            onClick: refetchConfig,
          }}
        />
      </div>
    );
  }
  
  // Error state - Preferences error (System Admin only)
  if (preferencesError && isSystemAdmin && !isMySpaceContext) {
    return (
      <div className="p-6">
        <Alert
          variant="warning"
          title="Failed to Load Preferences"
          message="Using default dashboard. Your preferences could not be loaded."
        />
      </div>
    );
  }
  
  // No role detected
  if (!role) {
    return (
      <div className="p-6">
        <Alert
          variant="error"
          title="Access Denied"
          message="Unable to determine your role. Please log in again."
        />
      </div>
    );
  }
  
  // No configuration available
  if (!config) {
    return (
      <div className="p-6">
        <Alert
          variant="info"
          title="Dashboard Not Configured"
          message="This dashboard hasn't been configured yet. Contact your administrator."
        />
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-2', isMySpaceContext ? '' : 'p-6')}>
      {/* Dashboard Type Selector (System Admin only, main Dashboard context only) */}
      {isSystemAdmin && !isMySpaceContext && (
        <div className="flex items-center justify-end pb-2">
          <DashboardTypeSelector
            selectedType={effectiveDashboardType}
            onChange={handleDashboardTypeChange}
          />
        </div>
      )}
      
      {/* Dashboard Content */}
      <DashboardContent
        config={config.configuration || config}
        role={effectiveDashboardType}
        onRefresh={handleGlobalRefresh}
        lastUpdate={config.updatedAt}
      />
    </div>
  );
};

export default RoleDashboard;
