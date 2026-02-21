import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PuffinLoader } from './ui/PuffinLoader';

/**
 * PermissionRoute - A route wrapper that checks user permissions
 * @param {React.ReactNode} children - The component to render if permission is granted
 * @param {string} permissionId - The permission ID required to access this route
 * @param {string} redirectTo - Where to redirect if permission is denied (default: /dashboard)
 */
const PermissionRoute = ({ children, permissionId, redirectTo = '/dashboard' }) => {
  const { user, isLoading, isAuthenticated, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffinLoader size="lg" message="Checking permissions..." />
      </div>
    );
  }

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no permission ID is specified, just check authentication
  if (!permissionId) {
    return children;
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(permissionId);

  if (!hasAccess) {
    console.warn(`Access denied: User does not have permission '${permissionId}'`);
    return <Navigate to={redirectTo} replace />;
  }

  // User has permission, render the component
  return children;
};

export default PermissionRoute;
