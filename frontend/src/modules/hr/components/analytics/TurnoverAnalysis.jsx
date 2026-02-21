import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Calendar, 
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const TurnoverAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [turnoverData, setTurnoverData] = useState({
    terminatedEmployees: [],
    turnoverRate: 0,
    period: {}
  });
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    department_id: ''
  });

  useEffect(() => {
    fetchTurnoverData();
  }, [filter]);

  const fetchTurnoverData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/turnover?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTurnoverData(data.data);
      }
    } catch (error) {
      console.error('Error fetching turnover data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        report_type: 'turnover',
        format,
        ...filter
      });
      const response = await fetch(`/api/v1/hr-analytics/export?${params}`);
      const data = await response.json();
      
      if (data.success) {
        toast.success('Report exported successfully! Download link: ${data.download_url}');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Turnover Analysis</h1>
          <p className="text-gray-600 mt-1">Track and analyze employee departure patterns</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-2">
            <input
              type="date"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filter.start_date}
              onChange={(e) => setFilter({...filter, start_date: e.target.value})}
            />
            <input
              type="date"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filter.end_date}
              onChange={(e) => setFilter({...filter, end_date: e.target.value})}
            />
          </div>
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filter.department_id}
              onChange={(e) => setFilter({...filter, department_id: e.target.value})}
            >
              <option value="">All Departments</option>
              <option value="1">Engineering</option>
              <option value="2">Marketing</option>
              <option value="3">Sales</option>
              <option value="4">HR</option>
              <option value="5">Finance</option>
            </select>
          </div>
          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Turnover Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle>Turnover Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-red-600">
              {turnoverData.turnoverRate}%
            </div>
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Industry Benchmark</p>
                <p className="text-lg font-semibold">12.5%</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-red-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(turnoverData.turnoverRate, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminated Employees */}
      <Card>
        <CardHeader>
          <CardTitle>Terminated Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Termination Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turnoverData.terminatedEmployees.length > 0 ? (
                  turnoverData.terminatedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.User.first_name} {employee.User.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{employee.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.Department?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.termination_date ? new Date(employee.termination_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.termination_reason || 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No terminated employees found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Turnover Trends Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Turnover Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Trend visualization coming soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnoverAnalysis;