import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';

const DashboardTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('DashboardTest: Fetching stats data');
        const response = await dashboardService.getStats();
        console.log('DashboardTest: Received stats data', response);
        setData(response.data);
      } catch (err) {
        console.error('DashboardTest: Error fetching data', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Dashboard Test</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {data && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Stats Data:</h3>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      {!loading && !error && !data && <p>No data available</p>}
    </div>
  );
};

export default DashboardTest;