import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetAdminDashboardQuery } from '../../store/api/adminApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Settings, Shield, Database, LayoutDashboard, Package, FileText, Users, ScrollText, HardDrive } from 'lucide-react';

export const AdminDashboard = () => {
  console.log('AdminDashboard component rendered');
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useGetAdminDashboardQuery();

  // Set page title only (no actions in navbar)
  usePageTitle('Admin Dashboard');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/assets')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Package className="h-3.5 w-3.5" />
          Asset Management
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/documents')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          Document Repository
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Settings className="h-3.5 w-3.5" />
          System Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Users className="h-3.5 w-3.5" />
          User Management
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/audit-logs')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <ScrollText className="h-3.5 w-3.5" />
          Audit Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/backup')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <HardDrive className="h-3.5 w-3.5" />
          Backup Management
        </Button>
      </div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">System Status</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-lg font-semibold text-gray-900">
                {dashboard?.systemStatus || 'Operational'}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">All systems running</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.activeUsers || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Currently online</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Storage Usage</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.storageUsage || '0%'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {dashboard?.storageUsed || '0 GB'} / {dashboard?.storageTotal || '0 GB'}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">System Uptime</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.uptime || '99.9%'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Last 30 days</div>
          </div>
        </Card>
      </div>

      {/* Security Alerts */}
      {dashboard?.securityAlerts && dashboard.securityAlerts.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {dashboard.securityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Badge variant="error">{alert.priority}</Badge>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{alert.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{alert.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Investigate</Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">View All Logs</Button>
          </div>
          <div className="space-y-2">
            {dashboard?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {activity.user?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                    <div className="text-xs text-gray-600">{activity.user}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
};
