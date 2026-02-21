import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * PermissionGuard component for conditional rendering based on user permissions
 */
const PermissionGuard = ({ 
  permission, 
  route, 
  module, 
  mode = 'item', 
  children, 
  fallback = null, 
  hideOnFail = true 
}) => {
  const { 
    hasPermission, 
    hasRoute, 
    hasModule, 
    hasAnyOf, 
    hasAllOf 
  } = useAuth();

  let hasAccess = false;

  // Determine access based on mode and provided props
  switch (mode) {
    case 'item':
      if (permission) {
        hasAccess = hasPermission(permission);
      }
      break;
      
    case 'route':
      if (route) {
        hasAccess = hasRoute(route);
      }
      break;
      
    case 'module':
      if (module) {
        hasAccess = hasModule(module);
      }
      break;
      
    case 'any':
      if (Array.isArray(permission)) {
        hasAccess = hasAnyOf(permission);
      } else if (permission) {
        hasAccess = hasPermission(permission);
      }
      break;
      
    case 'all':
      if (Array.isArray(permission)) {
        hasAccess = hasAllOf(permission);
      } else if (permission) {
        hasAccess = hasPermission(permission);
      }
      break;
      
    default:
      console.warn(`Unknown permission mode: ${mode}`);
      hasAccess = false;
  }

  // Render based on access and configuration
  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return hideOnFail ? null : children;
};

export default PermissionGuard;