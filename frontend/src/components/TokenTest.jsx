import React, { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';

const TokenTest = () => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [localStorageAvailable, setLocalStorageAvailable] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const isAvailable = storage.isAvailable();
      setLocalStorageAvailable(isAvailable);
      
      if (isAvailable) {
        const token = storage.getItem('token');
        const user = storage.getItem('user');
        const permissions = storage.getItem('permissions', []);
        
        setTokenInfo({
          token,
          user,
          permissions,
          tokenExists: !!token,
          userExists: !!user
        });
      }
    };

    checkToken();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Token Test</h2>
      <p>LocalStorage Available: {localStorageAvailable ? 'Yes' : 'No'}</p>
      {tokenInfo && (
        <div>
          <p>Token exists: {tokenInfo.tokenExists ? 'Yes' : 'No'}</p>
          <p>User exists: {tokenInfo.userExists ? 'Yes' : 'No'}</p>
          <h3 className="text-lg font-semibold mt-4">Token:</h3>
          <p className="break-words">{tokenInfo.token || 'No token found'}</p>
          <h3 className="text-lg font-semibold mt-4">User:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {tokenInfo.user ? JSON.stringify(tokenInfo.user, null, 2) : 'No user found'}
          </pre>
          <h3 className="text-lg font-semibold mt-4">Permissions:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(tokenInfo.permissions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TokenTest;