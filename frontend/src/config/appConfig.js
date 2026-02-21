export const appConfig = {
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  apiUrl: import.meta.env.VITE_API_URL || 'https://srv951352.hstgr.cloud/cleardesk/api/v1'
};

export default appConfig;
