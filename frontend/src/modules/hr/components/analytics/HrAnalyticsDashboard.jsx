import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  Download,
  Filter,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';

const HrAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalEmployees: 0,
      activeEmployees: 0,
      newHires: 0,
      pendingLeaves: 0
    },
    departmentDistribution: [],
    recentReviews: []
  });
  const [filter, setFilter] = useState({
    department_id: '',
    period: 'month'
  });

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filter);
      const response = await fetch(`/api/v1/hr-analytics/dashboard?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const response = await fetch(`/api/v1/hr-analytics/export?report_type=dashboard&format=${format}`);
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
          <h1 className="text-2xl font-bold text-gray-900">HR Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time insights into your workforce</p>
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
          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.kpis.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.kpis.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {((dashboardData.kpis.activeEmployees / dashboardData.kpis.totalEmployees) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.kpis.newHires}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.kpis.pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <PieChart className="h-16 w-16 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart visualization coming soon</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Performance Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentReviews.length > 0 ? (
                dashboardData.recentReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {review.Employee.User.first_name} {review.Employee.User.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {review.review_type} - {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="font-medium">{review.overall_rating}/5</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent performance reviews
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HrAnalyticsDashboard;