import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingFallback from '@/components/LoadingFallback';

/**
 * Authentication guard - redirects to login if not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
export const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Permission guard - checks if user has required permission
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.permissionId - Required permission ID
 * @param {string} props.fallbackPath - Path to redirect if unauthorized (default: /dashboard)
 */
export const PermissionGuard = ({ children, permissionId, fallbackPath = '/dashboard' }) => {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!hasPermission(permissionId)) {
    // Redirect to fallback path if user doesn't have permission
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Role guard - checks if user has required role
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.roles - Required role(s)
 * @param {string} props.fallbackPath - Path to redirect if unauthorized (default: /dashboard)
 */
export const RoleGuard = ({ children, roles, fallbackPath = '/dashboard' }) => {
  const { hasRole, hasAnyRole, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  const hasRequiredRole = Array.isArray(roles) 
    ? hasAnyRole(roles) 
    : hasRole(roles);

  if (!hasRequiredRole) {
    // Redirect to fallback path if user doesn't have required role
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Module guard - checks if user has access to a module
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.moduleId - Required module ID
 * @param {string} props.fallbackPath - Path to redirect if unauthorized (default: /dashboard)
 */
export const ModuleGuard = ({ children, moduleId, fallbackPath = '/dashboard' }) => {
  const { hasModule, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!hasModule(moduleId)) {
    // Redirect to fallback path if user doesn't have module access
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

/**
 * Guest guard - redirects authenticated users away from public pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if not authenticated
 * @param {string} props.redirectPath - Path to redirect authenticated users (default: /dashboard)
 */
export const GuestGuard = ({ children, redirectPath = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    // Redirect authenticated users to dashboard
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * Combined guard - applies multiple guards in sequence
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if all guards pass
 * @param {Object} props.guards - Guard configuration
 * @param {boolean} props.guards.requireAuth - Require authentication
 * @param {string} props.guards.permissionId - Required permission ID
 * @param {string|string[]} props.guards.roles - Required role(s)
 * @param {string} props.guards.moduleId - Required module ID
 */
export const CombinedGuard = ({ children, guards = {} }) => {
  const { requireAuth, permissionId, roles, moduleId } = guards;

  let guardedContent = children;

  // Apply guards in order: auth -> module -> permission -> role
  if (moduleId) {
    guardedContent = <ModuleGuard moduleId={moduleId}>{guardedContent}</ModuleGuard>;
  }

  if (permissionId) {
    guardedContent = <PermissionGuard permissionId={permissionId}>{guardedContent}</PermissionGuard>;
  }

  if (roles) {
    guardedContent = <RoleGuard roles={roles}>{guardedContent}</RoleGuard>;
  }

  if (requireAuth !== false) {
    guardedContent = <AuthGuard>{guardedContent}</AuthGuard>;
  }

  return guardedContent;
};
