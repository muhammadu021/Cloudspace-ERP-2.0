import React from 'react';
import { MODULE_ID_MAPPING } from '@/config/sidebarConfig';

/**
 * Test Component to Verify Sidebar Module ID Fix
 * 
 * This component helps verify that the module ID normalization is working correctly.
 * Access it at: /test/sidebar-fix
 */
const SidebarFixTest = () => {
  // Test cases
  const testCases = [
    {
      name: 'Old UserType, New Company',
      userModules: ['self-service', 'office', 'hr'],
      companyModules: ['my-desk', 'office-desk', 'hr-desk'],
      expectedResult: 'All 3 modules should match'
    },
    {
      name: 'New UserType, New Company',
      userModules: ['my-desk', 'office-desk', 'hr-desk'],
      companyModules: ['my-desk', 'office-desk', 'hr-desk'],
      expectedResult: 'All 3 modules should match'
    },
    {
      name: 'Mixed IDs',
      userModules: ['self-service', 'office-desk', 'hr'],
      companyModules: ['my-desk', 'office', 'hr-desk'],
      expectedResult: 'All 3 modules should match'
    },
    {
      name: 'Mismatch Test',
      userModules: ['self-service', 'finance'],
      companyModules: ['my-desk', 'hr-desk'],
      expectedResult: 'Only my-desk should match'
    }
  ];

  // Normalize function (same as in DynamicSidebar)
  const normalizeModules = (modules) => {
    return modules.map(id => MODULE_ID_MAPPING[id] || id);
  };

  // Check if module is allowed (same logic as DynamicSidebar)
  const isModuleAllowed = (moduleId, companyModules) => {
    const normalizedCompanyModules = normalizeModules(companyModules);
    const normalizedModuleId = MODULE_ID_MAPPING[moduleId] || moduleId;
    
    return normalizedCompanyModules.includes(moduleId) || 
           normalizedCompanyModules.includes(normalizedModuleId);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sidebar Module ID Fix - Test Page
        </h1>
        <p className="text-gray-600">
          This page verifies that the module ID normalization is working correctly.
        </p>
      </div>

      {/* Module ID Mapping Table */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Module ID Mapping</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Old ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  New ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(MODULE_ID_MAPPING).map(([oldId, newId]) => (
                <tr key={oldId} className={oldId !== newId ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {oldId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {newId}
                    {oldId !== newId && (
                      <span className="ml-2 text-xs text-yellow-600">(migrated)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Test Cases</h2>
        
        {testCases.map((testCase, index) => {
          const normalizedUserModules = normalizeModules(testCase.userModules);
          const normalizedCompanyModules = normalizeModules(testCase.companyModules);
          
          const results = testCase.userModules.map(moduleId => ({
            moduleId,
            normalizedId: MODULE_ID_MAPPING[moduleId] || moduleId,
            isAllowed: isModuleAllowed(moduleId, testCase.companyModules)
          }));

          const matchCount = results.filter(r => r.isAllowed).length;

          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {index + 1}. {testCase.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">User Modules (UserType)</h4>
                  <div className="space-y-1">
                    {testCase.userModules.map(id => (
                      <div key={id} className="text-sm">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
                        {MODULE_ID_MAPPING[id] && MODULE_ID_MAPPING[id] !== id && (
                          <span className="ml-2 text-xs text-gray-500">
                            → {MODULE_ID_MAPPING[id]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Company Modules (allowed_modules)</h4>
                  <div className="space-y-1">
                    {testCase.companyModules.map(id => (
                      <div key={id} className="text-sm">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Normalized Modules</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-600">User (normalized):</span>
                    <div className="font-mono bg-primary-50 px-2 py-1 rounded mt-1">
                      {JSON.stringify(normalizedUserModules)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Company (normalized):</span>
                    <div className="font-mono bg-primary-50 px-2 py-1 rounded mt-1">
                      {JSON.stringify(normalizedCompanyModules)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Match Results</h4>
                <div className="space-y-2">
                  {results.map((result, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {result.isAllowed ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-red-600">❌</span>
                      )}
                      <span className="font-mono">{result.moduleId}</span>
                      {result.normalizedId !== result.moduleId && (
                        <span className="text-gray-500">
                          (normalized: {result.normalizedId})
                        </span>
                      )}
                      <span className={result.isAllowed ? 'text-green-600' : 'text-red-600'}>
                        {result.isAllowed ? 'ALLOWED' : 'FILTERED OUT'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Expected:</span>
                  <span className="text-gray-600">{testCase.expectedResult}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-medium text-gray-700">Actual:</span>
                  <span className="text-gray-600">
                    {matchCount} of {testCase.userModules.length} modules matched
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-green-900 mb-2">
          ✅ Fix Verification
        </h2>
        <p className="text-green-800">
          If all test cases show the expected results, the module ID normalization is working correctly.
          The sidebar should now display "My Desk" with all its sub-items.
        </p>
      </div>
    </div>
  );
};

export default SidebarFixTest;
