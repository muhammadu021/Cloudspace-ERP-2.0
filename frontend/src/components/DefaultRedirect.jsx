import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SIDEBAR_MODULES_ARRAY } from '@/config/sidebarConfig';

const DefaultRedirect = () => {
  const { user } = useAuth();
  
  // Get company's allowed modules - Companies is an array, get first company
  const userCompany = user?.Companies?.[0] || null;
  const companyAllowedModules = userCompany?.allowed_modules || [];
  
  console.log('=== DefaultRedirect ===');
  console.log('Company:', userCompany?.name);
  console.log('Company allowed modules:', companyAllowedModules);
  
  let firstPath = '/dashboard'; // fallback
  
  // If company has allowed modules, use the first one
  if (companyAllowedModules.length > 0) {
    for (const moduleId of companyAllowedModules) {
      const moduleConfig = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
      console.log('Checking module:', moduleId, 'found:', !!moduleConfig, 'path:', moduleConfig?.path);
      
      if (moduleConfig && moduleConfig.path) {
        firstPath = moduleConfig.path;
        console.log('Selected path:', firstPath);
        break;
      }
    }
  }
  
  console.log('Final redirect to:', firstPath);
  
  return <Navigate to={firstPath} replace />;
};

export default DefaultRedirect;
