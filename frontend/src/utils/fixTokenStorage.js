// Fix for tokens that were JSON.stringify'd
// This runs once on app load to fix any existing broken tokens

export const fixTokenStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Check if token is wrapped in quotes (JSON.stringify'd string)
    if (token && token.startsWith('"') && token.endsWith('"')) {
      console.log('🔧 Fixing token storage - removing quotes');
      // Remove the quotes
      const fixedToken = token.slice(1, -1);
      localStorage.setItem('token', fixedToken);
    }
    
    // Check if refreshToken is wrapped in quotes
    if (refreshToken && refreshToken.startsWith('"') && refreshToken.endsWith('"')) {
      console.log('🔧 Fixing refreshToken storage - removing quotes');
      // Remove the quotes
      const fixedRefreshToken = refreshToken.slice(1, -1);
      localStorage.setItem('refreshToken', fixedRefreshToken);
    }
  } catch (error) {
    console.error('Error fixing token storage:', error);
  }
};

export default fixTokenStorage;
