import { storage } from './storage';

// Helper function to get company_id from stored user data
export const getCompanyId = () => {
  try {
    // First check if company_id is stored directly
    const directCompanyId = storage.getItem('company_id');
    if (directCompanyId) {
      return parseInt(directCompanyId, 10);
    }
    
    // Then check user object
    const userStr = storage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.company_id || user?.Companies?.[0]?.id || user?.Company?.id;
    }
  } catch (error) {
    console.warn('Failed to get company_id:', error);
  }
  return null;
};

export default { getCompanyId };
