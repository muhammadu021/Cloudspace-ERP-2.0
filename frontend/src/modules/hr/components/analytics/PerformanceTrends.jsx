import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  Star, 
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const PerformanceTrends = () => {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    performanceTrends: [],
    ratingDistribution: []
  });
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    department_id: ''
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [filter]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/performance?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformanceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        report_type: 'performance',
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
          <h1 className="text-2xl font-bold text-gray-900">Performance Trend Analysis</h1>
          <p className="text-gray-600 mt-1">Track and analyze employee performance over time</p>
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

      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5.0</div>
            <p className="text-xs text-muted-foreground">+0.3 from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Rating 4.0 and above</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement Needed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12%</div>
            <p className="text-xs text-muted-foreground">Rating below 3.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.ratingDistribution.map((rating, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {rating.rating_category || 'Unknown'}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${(rating.count / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {rating.count || 0}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <LineChart className="h-16 w-16 text-gray-400" />
              <span className="ml-2 text-gray-500">Trend visualization coming soon</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-gray-400" />
              <span className="ml-2 text-gray-500">Department comparison coming soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceTrends;