import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

/**
 * Debug version of Company Management
 * Use this to troubleshoot if the main page isn't working
 *
 * To use: Replace CompanyManagement with CompanyManagementDebug in App.jsx
 */
const CompanyManagementDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    token: null,
    tokenValid: false,
    apiReachable: false,
    companiesResponse: null,
    statsResponse: null,
    error: null,
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const info = { ...debugInfo };

    // Check 1: Token exists
    const token = localStorage.getItem("token");
    info.token = token ? "Token found" : "No token";
    info.tokenValid = !!token;

    // Check 2: Try to fetch companies
    if (token) {
      try {
        const response = await fetch(
          "http://localhost:5050/api/v1/companies?page=1&limit=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        info.apiReachable = response.ok;
        info.companiesResponse = {
          status: response.status,
          success: data.success,
          message: data.message,
          companiesCount: data.data?.companies?.length || 0,
          companies: data.data?.companies || [],
        };
      } catch (error) {
        info.error = error.message;
        info.apiReachable = false;
      }

      // Check 3: Try to fetch stats
      try {
        const response = await fetch(
          "http://localhost:5050/api/v1/companies/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        info.statsResponse = {
          status: response.status,
          success: data.success,
          data: data.data,
        };
      } catch (error) {
        info.statsResponse = { error: error.message };
      }
    }

    setDebugInfo(info);
  };

  const StatusIcon = ({ status }) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Debug Mode Active
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              This is a diagnostic page to help troubleshoot Company Management
              issues.
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Company Management - Diagnostics
      </h1>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {/* Token Check */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                1. Authentication Token
              </h3>
              <p className="text-sm text-gray-600 mt-1">{debugInfo.token}</p>
            </div>
            <StatusIcon status={debugInfo.tokenValid} />
          </div>
        </div>

        {/* API Reachability */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                2. API Reachability
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {debugInfo.apiReachable
                  ? "API is reachable"
                  : "Cannot reach API"}
              </p>
            </div>
            <StatusIcon status={debugInfo.apiReachable} />
          </div>
        </div>

        {/* Companies Response */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            3. Companies API Response
          </h3>
          {debugInfo.companiesResponse ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status Code:</span>
                <span
                  className={`font-medium ${
                    debugInfo.companiesResponse.status === 200
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {debugInfo.companiesResponse.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Success:</span>
                <span
                  className={`font-medium ${
                    debugInfo.companiesResponse.success
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {debugInfo.companiesResponse.success ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Companies Found:</span>
                <span className="font-medium text-gray-900">
                  {debugInfo.companiesResponse.companiesCount}
                </span>
              </div>
              {debugInfo.companiesResponse.message && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  Message: {debugInfo.companiesResponse.message}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No response yet</p>
          )}
        </div>

        {/* Companies List */}
        {debugInfo.companiesResponse?.companies?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              4. Companies Data
            </h3>
            <div className="space-y-3">
              {debugInfo.companiesResponse.companies.map((company, index) => (
                <div key={company.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Code:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.code}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Plan:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.subscription_plan}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.subscription_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Users:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.user_count || 0} / {company.max_users}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Storage:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {company.max_storage_gb} GB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Response */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            5. Statistics API Response
          </h3>
          {debugInfo.statsResponse ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status Code:</span>
                <span
                  className={`font-medium ${
                    debugInfo.statsResponse.status === 200
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {debugInfo.statsResponse.status}
                </span>
              </div>
              {debugInfo.statsResponse.data && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <pre className="text-xs text-gray-700 overflow-auto">
                    {JSON.stringify(debugInfo.statsResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No response yet</p>
          )}
        </div>

        {/* Error Display */}
        {debugInfo.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-sm text-red-700">{debugInfo.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Re-run Diagnostics
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Cache & Re-login
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            What to Check
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>All checks should show green checkmarks</li>
            <li>Status codes should be 200</li>
            <li>At least 1 company should be found (Puffin Group)</li>
            <li>If any check fails, see the error message above</li>
            <li>If token is missing, try logging out and back in</li>
            <li>
              If API is unreachable, check backend is running on port 5050
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanyManagementDebug;
