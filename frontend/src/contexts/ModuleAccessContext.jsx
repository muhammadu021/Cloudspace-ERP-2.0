import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ModuleAccessContext = createContext();

export const useModuleAccess = () => {
  const context = useContext(ModuleAccessContext);
  if (!context) {
    throw new Error('useModuleAccess must be used within ModuleAccessProvider');
  }
  return context;
};

export const ModuleAccessProvider = ({ children }) => {
  const [allowedModules, setAllowedModules] = useState([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllowedModules = async () => {
    try {
      const response = await api.get('/auth/modules');
      if (response.data.success) {
        setAllowedModules(response.data.data.modules || []);
        setSubscriptionPlan(response.data.data.subscription_plan);
        setSubscriptionStatus(response.data.data.subscription_status);
      }
    } catch (error) {
      console.error('Failed to fetch allowed modules:', error);
      // Default to all modules if fetch fails
      setAllowedModules(['hr', 'finance', 'inventory', 'sales', 'projects', 'support', 'documents', 'collaboration']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedModules();
  }, []);

  const hasModuleAccess = (moduleName) => {
    return allowedModules.includes(moduleName);
  };

  const hasAnyModuleAccess = (moduleNames) => {
    return moduleNames.some(name => allowedModules.includes(name));
  };

  const value = {
    allowedModules,
    subscriptionPlan,
    subscriptionStatus,
    loading,
    hasModuleAccess,
    hasAnyModuleAccess,
    refreshModules: fetchAllowedModules
  };

  return (
    <ModuleAccessContext.Provider value={value}>
      {children}
    </ModuleAccessContext.Provider>
  );
};
