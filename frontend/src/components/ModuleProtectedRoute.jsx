import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModuleAccess } from '../contexts/ModuleAccessContext';
import { Alert, AlertDescription } from './ui';
import { Lock } from 'lucide-react';

const ModuleProtectedRoute = ({ module, children }) => {
  const { hasModuleAccess, loading, subscriptionPlan } = useModuleAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasModuleAccess(module)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <Lock className="h-5 w-5 text-orange-600" />
            <AlertDescription className="ml-2">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Module Access Restricted
              </h3>
              <p className="text-orange-800 mb-4">
                Your current subscription plan ({subscriptionPlan || 'Basic'}) does not include access to the <strong>{module}</strong> module.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/settings/subscription'}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Go Back
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
};

export default ModuleProtectedRoute;
