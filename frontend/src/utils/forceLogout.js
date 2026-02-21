/**
 * Force logout utility to clear all authentication data
 */

export const forceLogout = () => {
  console.log('🔄 Force logout initiated...');
  
  try {
    // Clear all localStorage
    localStorage.clear();
    console.log('✅ localStorage cleared');
    
    // Clear all sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log('✅ Cookies cleared');
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
      console.log('✅ Cache cleared');
    }
    
    console.log('🎉 Force logout completed successfully');
    
    // Redirect to login
    window.location.href = '/login';
    
  } catch (error) {
    console.error('❌ Error during force logout:', error);
    // Still try to redirect
    window.location.href = '/login';
  }
};

export const checkAuthState = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  
  console.log('🔍 Current auth state:');
  console.log('Token exists:', !!token);
  console.log('User exists:', !!user);
  
  if (token) {
    console.log('Token preview:', token.substring(0, 50) + '...');
  }
  
  return { token, user };
};