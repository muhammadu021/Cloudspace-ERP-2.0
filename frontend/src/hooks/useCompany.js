import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to access current user's company information
 * @returns {Object} Company data and helper functions
 */
export const useCompany = () => {
  const { user } = useAuth();
  
  // Get the first company from the user's Companies array
  const company = user?.Companies?.[0] || null;
  const companyId = company?.id || user?.company_id || null;
  
  return {
    company,
    companyId,
    companyName: company?.name || '',
    companyCode: company?.code || '',
    allowedModules: company?.allowed_modules || [],
    isActive: company?.is_active || false,
    subscriptionStatus: company?.subscription_status || 'inactive',
  };
};

export default useCompany;
