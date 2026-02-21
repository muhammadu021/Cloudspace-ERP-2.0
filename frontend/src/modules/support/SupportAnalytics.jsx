import React, { useState } from 'react';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetSupportAnalyticsQuery } from '../../store/api/supportApi';
import { usePageTitle } from '../../hooks/usePageTitle';

export const SupportAnalytics = () => {
  const [dateRange, setDateRange] = useState('last_30_days');
  const { data: analytics, isLoading } = useGetSupportAnalyticsQuery({ dateRange });

  // Set page title and actions in the top nav bar
  usePageTitle('Support Analytics', [
    <Button key="7days" variant="outline" size="sm" onClick={() => setDateRange('last_7_days')}>
      Last 7 Days
    </Button>,
    <Button key="30days" variant="outline" size="sm" onClick={() => setDateRange('last_30_days')}>
      Last 30 Days
    </Button>,
    <Button key="90days" variant="outline" size="sm" onClick={() => setDateRange('last_90_days')}>
      Last 90 Days
    </Button>
  ]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Tickets</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.totalTickets || 0}
            </div>
            <div className="text-xs text-green-600 mt-1">
              +{analytics?.ticketGrowth || 0}% vs previous period
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Avg Response Time</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.avgResponseTime || '0h'}
            </div>
            <div className="text-xs text-green-600 mt-1">
              -{analytics?.responseTimeImprovement || 0}% improvement
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Avg Resolution Time</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.avgResolutionTime || '0h'}
            </div>
            <div className="text-xs text-green-600 mt-1">
              -{analytics?.resolutionTimeImprovement || 0}% improvement
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {analytics?.csatScore || '0%'}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Based on {analytics?.csatResponses || 0} responses
            </div>
          </div>
        </Card>
      </div>

      {/* Ticket Status Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
          <div className="grid grid-cols-4 gap-4">
            {analytics?.statusDistribution?.map((status) => (
              <div key={status.name} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{status.count}</div>
                <div className="text-sm text-gray-600 mt-1">{status.name}</div>
                <div className="text-xs text-gray-500">{status.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Agent Performance */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {analytics?.agentPerformance?.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">
                      {agent.ticketsResolved} tickets resolved
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {agent.avgResponseTime}
                    </div>
                    <div className="text-xs text-gray-600">Avg Response</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {agent.csatScore}%
                    </div>
                    <div className="text-xs text-gray-600">CSAT</div>
                  </div>
                  <Badge variant={agent.csatScore >= 90 ? 'success' : agent.csatScore >= 75 ? 'info' : 'warning'}>
                    {agent.csatScore >= 90 ? 'Excellent' : agent.csatScore >= 75 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Category Analysis */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h3>
          <div className="space-y-3">
            {analytics?.categoryAnalysis?.map((category) => (
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
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">{category.avgResolutionTime}</div>
                  <div className="text-xs text-gray-600">Avg Resolution</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
