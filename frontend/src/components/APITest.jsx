import React, { useState } from "react";
import axios from "axios";

const APITest = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    const newResults = {};

    // Test health endpoint
    try {
      const response = await axios.get("http://localhost:5050/health");
      newResults.health = { success: true, data: response.data };
    } catch (error) {
      newResults.health = { success: false, error: error.message };
    }

    // Test dashboard endpoint without auth
    try {
      const response = await axios.get(
        "http://localhost:5050/api/v1/dashboard"
      );
      newResults.dashboard = { success: true, data: response.data };
    } catch (error) {
      newResults.dashboard = {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }

    setResults(newResults);
    setTesting(false);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">API Test</h3>
      <button
        onClick={testAPI}
        disabled={testing}
        className="bg-primary px-2 py-1 rounded mb-2 disabled:opacity-50"
      >
        {testing ? "Testing..." : "Test API"}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-2">
          {Object.entries(results).map(([key, result]) => (
            <div key={key}>
              <strong>{key}:</strong>
              <span
                className={result.success ? "text-green-300" : "text-red-300"}
              >
                {result.success ? " ✅ Success" : " ❌ Failed"}
              </span>
              {result.error && (
                <div className="text-red-300 text-xs">{result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APITest;
