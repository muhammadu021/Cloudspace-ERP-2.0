import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const CompensationBenchmarking = () => {
  const [loading, setLoading] = useState(true);
  const [compensationData, setCompensationData] = useState({
    salaryStats: {},
    departmentSalaries: []
  });
  const [filter, setFilter] = useState({
    department_id: '',
    position: ''
  });

  useEffect(() => {
    fetchCompensationData();
  }, [filter]);

  const fetchCompensationData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/compensation?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCompensationData(data.data);
      }
    } catch (error) {
      console.error('Error fetching compensation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        report_type: 'compensation',
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
          <h1 className="text-2xl font-bold text-gray-900">Compensation Benchmarking</h1>
          <p className="text-gray-600 mt-1">Analyze and compare compensation data</p>
        </div>
        <div className="flex space-x-3">
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
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filter.position}
              onChange={(e) => setFilter({...filter, position: e.target.value})}
            >
              <option value="">All Positions</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Sales Representative">Sales Representative</option>
              <option value="Marketing Specialist">Marketing Specialist</option>
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

      {/* Compensation KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${compensationData.salaryStats.avg_salary ? parseFloat(compensationData.salaryStats.avg_salary).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Min Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${compensationData.salaryStats.min_salary ? parseFloat(compensationData.salaryStats.min_salary).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Lowest paid position</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${compensationData.salaryStats.max_salary ? parseFloat(compensationData.salaryStats.max_salary).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Highest paid position</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Range</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${compensationData.salaryStats.std_deviation ? parseFloat(compensationData.salaryStats.std_deviation).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Standard deviation</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Salary Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Department Salary Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary Range
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {compensationData.departmentSalaries.length > 0 ? (
                  compensationData.departmentSalaries.map((dept, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.Employee?.Department?.name || 'Unknown Department'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${dept.avg_salary ? parseFloat(dept.avg_salary).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dept.employee_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(dept.avg_salary / 150000) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No department salary data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compensation Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <BarChart3 className="h-16 w-16 text-gray-400" />
            <span className="ml-2 text-gray-500">Distribution visualization coming soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompensationBenchmarking;