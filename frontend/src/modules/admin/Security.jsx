import React, { useState } from 'react';
import { Card, Button, Badge, DataTable } from '../../design-system/components';
import { useGetAuditLogsQuery } from '../../store/api/adminApi';

export const Security = () => {
  const [filters, setFilters] = useState({ search: '', type: '', severity: '' });
  const { data: logs = [], isLoading } = useGetAuditLogsQuery(filters);

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (row) => new Date(row.timestamp).toLocaleString()
    },
    {
      key: 'user',
      label: 'User',
      sortable: true
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true
    },
    {
      key: 'resource',
      label: 'Resource',
      sortable: true
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: true
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={
          row.severity === 'critical' ? 'error' :
          row.severity === 'high' ? 'warning' :
          row.severity === 'medium' ? 'info' : 'default'
        }>
          {row.severity}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security & Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor security events and system audit trail
          </p>
        </div>
        <Button variant="outline">Export Logs</Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Failed Logins (24h)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">12</div>
            <div className="text-xs text-gray-600 mt-1">-15% vs yesterday</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Active Sessions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">247</div>
            <div className="text-xs text-gray-600 mt-1">Across all users</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Security Alerts</div>
            <div className="text-2xl font-bold text-red-600 mt-1">3</div>
            <div className="text-xs text-gray-600 mt-1">Requires attention</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Last Backup</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">2h ago</div>
            <div className="text-xs text-green-600 mt-1">Successful</div>
          </div>
        </Card>
      </div>

      {/* Audit Logs */}
      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        searchable
        searchPlaceholder="Search logs..."
        onSearch={(value) => setFilters({ ...filters, search: value })}
        pageSize={50}
      />
    </div>
  );
};
