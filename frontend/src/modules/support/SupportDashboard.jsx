import React from 'react';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetSupportDashboardQuery } from '../../store/api/supportApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus, Download, Settings } from 'lucide-react';

export const SupportDashboard = () => {
  const { data: dashboard, isLoading } = useGetSupportDashboardQuery();

  // Set page title and actions in the top nav bar
  usePageTitle('Support Dashboard', [
    <Button key="add" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      New Ticket
    </Button>,
    <Button key="export" variant="outline" size="sm">
      <Download className="h-4 w-4 mr-1" />
      Export
    </Button>,
    <Button key="settings" variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-1" />
      Settings
    </Button>
  ]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Open Tickets</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.openTickets || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Requires attention</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.avgResponseTime || '0h'}
            </div>
            <div className="text-xs text-green-600 mt-1">-12% vs last week</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Resolved (Today)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.resolvedToday || 0}
            </div>
            <div className="text-xs text-green-600 mt-1">+8% vs yesterday</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">CSAT Score</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.csatScore || '0%'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Customer satisfaction</div>
          </div>
        </Card>
      </div>

      {/* Ticket Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Distribution by Category</h3>
          <div className="space-y-3">
            {dashboard?.ticketsByCategory?.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.count} tickets</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
                <Badge variant="info" className="ml-4">
                  {category.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Assigned Tickets */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Assigned Tickets</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {dashboard?.assignedTickets?.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    ticket.priority === 'urgent' ? 'error' :
                    ticket.priority === 'high' ? 'warning' :
                    ticket.priority === 'medium' ? 'info' : 'default'
                  }>
                    {ticket.priority}
                  </Badge>
                  <div>
                    <div className="font-medium text-gray-900">{ticket.subject}</div>
                    <div className="text-sm text-gray-600">
                      #{ticket.ticketNumber} • {ticket.customer}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <Button size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-2">
            {dashboard?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                  <div className="text-xs text-gray-600">
                    Ticket #{activity.ticketNumber} • {activity.agent}
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
