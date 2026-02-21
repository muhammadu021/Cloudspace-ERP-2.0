import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useState } from 'react';

/**
 * Example component demonstrating company_id usage
 * This is for reference only - delete if not needed
 */
function CompanyIdExample() {
  const { user } = useAuth();
  const { companyId, companyName, allowedModules } = useCompany();
  const [testResult, setTestResult] = useState(null);

  const testApiCall = async () => {
    try {
      // company_id is automatically added to this request
      const response = await api.get('/employees');
      setTestResult({
        success: true,
        message: 'API call successful! company_id was automatically included.',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Company ID Integration Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current Company Info:</h2>
        <p><strong>Company ID:</strong> {companyId || 'Not available'}</p>
        <p><strong>Company Name:</strong> {companyName || 'Not available'}</p>
        <p><strong>Allowed Modules:</strong> {allowedModules.join(', ') || 'None'}</p>
      </div>

      <div className="bg-primary-50 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">User Data Structure:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            userId: user?.id,
            email: user?.email,
            company_id: user?.company_id,
            Companies: user?.Companies?.map(c => ({
              id: c.id,
              name: c.name,
              code: c.code,
              allowed_modules: c.allowed_modules
            }))
          }, null, 2)}
        </pre>
      </div>

      <button
        onClick={testApiCall}
        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary"
      >
        Test API Call (Check Console)
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-semibold">{testResult.message}</p>
          {testResult.data && (
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>User logs in → JWT token includes companyId</li>
          <li>User data (with Companies array) stored in localStorage</li>
          <li>Axios interceptor reads company_id from localStorage</li>
          <li>company_id automatically added to ALL API requests as:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Header: X-Company-Id</li>
              <li>Query param (GET requests)</li>
              <li>Body field (POST/PUT/PATCH)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default CompanyIdExample;
