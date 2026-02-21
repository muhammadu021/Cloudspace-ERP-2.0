// This file helps identify which messaging system is being used
// If you see this in your console, you're using the NEW direct messaging system

export const MESSAGING_VERSION = {
  version: '2.0.0',
  system: 'DIRECT_MESSAGING',
  description: 'New simplified direct messaging system',
  apiEndpoint: '/api/v1/direct-messaging',
  lastUpdated: new Date().toISOString()
};

console.log('═══════════════════════════════════════════════════════════');
console.log('📨 MESSAGING SYSTEM VERSION:', MESSAGING_VERSION.version);
console.log('🔧 SYSTEM TYPE:', MESSAGING_VERSION.system);
console.log('📡 API ENDPOINT:', MESSAGING_VERSION.apiEndpoint);
console.log('═══════════════════════════════════════════════════════════');

export default MESSAGING_VERSION;
