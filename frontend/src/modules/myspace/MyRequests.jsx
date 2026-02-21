import React, { useState } from 'react';
import { Card, DataTable, Badge, Button, Tabs } from '../../design-system/components';
import { useGetMyRequestsQuery } from '../../store/api/mySpaceApi';

const MyRequests = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: requests = [], isLoading } = useGetMyRequestsQuery({ type: activeTab });

  const tabs = [
    { id: 'all', label: 'All Requests', content: <RequestsTable requests={requests} isLoading={isLoading} /> },
    { id: 'leave', label: 'Leave Requests', content: <RequestsTable requests={requests.filter(r => r.type === 'leave')} isLoading={isLoading} /> },
    { id: 'expense', label: 'Expenses', content: <RequestsTable requests={requests.filter(r => r.type === 'expense')} isLoading={isLoading} /> },
    { id: 'issue', label: 'Issues', content: <RequestsTable requests={requests.filter(r => r.type === 'issue')} isLoading={isLoading} /> }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and track your submitted requests
        </p>
      </div>

      <Tabs tabs={tabs} defaultTab="all" onTabChange={setActiveTab} />
    </div>
  );
};

const RequestsTable = ({ requests, isLoading }) => {
  const columns = [
    {
      key: 'id',
      label: 'Request ID',
      sortable: true,
      width: '120px'
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant="default">
          {row.type}
        </Badge>
      )
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true
    },
    {
      key: 'date',
      label: 'Submitted',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'approved' ? 'success' :
          row.status === 'pending' ? 'warning' :
          row.status === 'rejected' ? 'error' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="outline" size="sm">
          View Details
        </Button>
      )
    }
  ];

  return (
    <Card>
      <div className="p-6">
        <DataTable
          columns={columns}
          data={requests}
          loading={isLoading}
          searchable
          searchPlaceholder="Search requests..."
          pageSize={20}
        />
      </div>
    </Card>
  );
};

export default MyRequests;
