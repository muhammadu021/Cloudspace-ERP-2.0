import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const TrainingAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [trainingData, setTrainingData] = useState({
    trainingCompletion: [],
    popularTrainings: []
  });
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchTrainingData();
  }, [filter]);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/training?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTrainingData(data.data);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        report_type: 'training',
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
          <h1 className="text-2xl font-bold text-gray-900">Training Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze employee training progress</p>
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
          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Training KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainingData.trainingCompletion.reduce((sum, item) => sum + (item.count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainingData.trainingCompletion.length > 0 
                ? Math.round((trainingData.trainingCompletion.find(t => t.status === 'completed')?.count || 0) / 
                  trainingData.trainingCompletion.reduce((sum, item) => sum + (item.count || 0), 0) * 100) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of total enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trainingData.popularTrainings.length}
            </div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Training Completion Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingData.trainingCompletion.map((status, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                  {status.status || 'Unknown'}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${(status.count / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {status.count || 0}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Trainings */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Trainings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popularity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainingData.popularTrainings.length > 0 ? (
                  trainingData.popularTrainings.map((training, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {training.Course?.title || 'Unknown Training'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {training.enrollment_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        75%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(training.enrollment_count / 100) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No training data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Training Trends Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Training Trends</CardTitle>
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

export default TrainingAnalytics;