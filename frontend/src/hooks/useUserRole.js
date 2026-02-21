/**
 * useUserRole Hook
 * 
 * Custom hook to extract and map user role from Redux auth state.
 * Maps UserType to dashboard role identifier.
 * 
 * Requirements: 1.6
 */

import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAuthLoading } from '@/store/slices/authSlice';
import { getUserRole, isSystemAdministrator } from '@/utils/roleMapping';

/**
 * Hook to get user role information
 * 
 * @returns {Object} Role information
 * @returns {string} role - Dashboard role identifier (system-administrator, admin, hr, finance, normal-user)
 * @returns {string} userType - Original UserType from user object
 * @returns {boolean} isSystemAdmin - True if user is System Administrator
 * @returns {boolean} loading - True if auth state is loading
 */
export function useUserRole() {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  
  // Extract UserType from user object - handle both string and object formats
  const userType = user?.UserType?.name || user?.UserType || user?.userType || null;
  
  // Debug logging
  console.log('useUserRole Debug:', {
    user,
    userType,
    'UserType object': user?.UserType,
    'UserType.name': user?.UserType?.name,
  });
  
  // Map UserType to dashboard role
  const role = userType ? getUserRole(userType) : null;
  
  // Check if System Administrator
  const isSystemAdmin = userType ? isSystemAdministrator(userType) : false;
  
  console.log('useUserRole Result:', {
    role,
    userType,
    isSystemAdmin,
    loading,
  });
  
  return {
    role,
    userType,
    isSystemAdmin,
    loading,
  };
}
