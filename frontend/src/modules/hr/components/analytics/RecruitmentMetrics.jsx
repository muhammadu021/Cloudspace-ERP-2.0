import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Calendar, 
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const RecruitmentMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [recruitmentData, setRecruitmentData] = useState({
    recruitmentStats: [],
    timeToHire: {}
  });
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRecruitmentData();
  }, [filter]);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/recruitment?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecruitmentData(data.data);
      }
    } catch (error) {
      console.error('Error fetching recruitment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const params = new URLSearchParams({
        report_type: 'recruitment',
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
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Metrics</h1>
          <p className="text-gray-600 mt-1">Track and analyze recruitment performance</p>
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

      {/* Recruitment KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recruitmentData.timeToHire.avg_days ? recruitmentData.timeToHire.avg_days.toFixed(1) : '0'} days
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {recruitmentData.timeToHire.min_days || 0} days, 
              Max: {recruitmentData.timeToHire.max_days || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates Hired</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recruitmentData.recruitmentStats.find(s => s.status === 'hired')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">Industry benchmark: 72%</p>
          </CardContent>
        </Card>
      </div>

      {/* Recruitment Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recruitmentData.recruitmentStats.map((stat, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                  {stat.status || 'Unknown'}
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(stat.count / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {stat.count || 0}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time to Hire Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Time to Hire Trends</CardTitle>
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

export default RecruitmentMetrics;