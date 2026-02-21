import api from './api';
import { getCompanyId } from '../utils/company';

const settingsService = {
  // Personal Settings
  getProfile: () => {
    const company_id = getCompanyId();
    return api.get('/settings/profile', { params: { company_id } });
  },
  
  updateProfile: (profileData) => {
    const company_id = getCompanyId();
    return api.put('/settings/profile', { ...profileData, company_id });
  },
  
  changePassword: (passwordData) => {
    const company_id = getCompanyId();
    return api.put('/settings/change-password', { ...passwordData, company_id });
  },
  
  updateNotificationPreferences: (preferences) => {
    const company_id = getCompanyId();
    return api.put('/settings/notifications', { ...preferences, company_id });
  },
  
  updateLanguage: (language) => {
    const company_id = getCompanyId();
    return api.put('/settings/language', { language, company_id });
  },
  
  updateSignature: (signature) => {
    const company_id = getCompanyId();
    return api.put('/settings/signature', { signature, company_id });
  },

  // Workspace Settings
  getWorkspaceSettings: () => {
    const company_id = getCompanyId();
    return api.get('/settings/workspace', { params: { company_id } });
  },
  
  updateWorkspaceSettings: (settings) => {
    const company_id = getCompanyId();
    return api.put('/settings/workspace', { ...settings, company_id });
  },

  // Communication Settings
  getCommunicationSettings: () => {
    const company_id = getCompanyId();
    return api.get('/settings/communication', { params: { company_id } });
  },
  
  updateCommunicationSettings: (settings) => {
    const company_id = getCompanyId();
    return api.put('/settings/communication', { ...settings, company_id });
  }
};

export default settingsService;
