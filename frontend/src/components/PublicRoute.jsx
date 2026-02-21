import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PuffinLoader } from './ui/PuffinLoader';

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffinLoader size="xl" message="Loading..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

export default PublicRoute;