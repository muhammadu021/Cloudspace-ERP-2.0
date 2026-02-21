import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PuffinLoader } from './ui/PuffinLoader';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffinLoader size="lg" message="Authenticating..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated or auth not required, render children
  return children;
}

export default ProtectedRoute