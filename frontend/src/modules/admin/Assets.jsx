import React, { useState } from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetAssetsQuery } from '../../store/api/adminApi';

export const Assets = () => {
  const [filters, setFilters] = useState({ search: '', category: '', status: '' });
  const { data: assets = [], isLoading } = useGetAssetsQuery(filters);

  const columns = [
    {
      key: 'assetId',
      label: 'Asset ID',
      sortable: true,
      width: '120px'
    },
    {
      key: 'name',
      label: 'Asset Name',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant="info">{row.category}</Badge>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'active' ? 'success' :
          row.status === 'maintenance' ? 'warning' :
          row.status === 'retired' ? 'neutral' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'purchaseDate',
      label: 'Purchase Date',
      sortable: true,
      render: (row) => new Date(row.purchaseDate).toLocaleDateString()
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (row) => `$${row.value?.toLocaleString() || 0}`
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage company assets
          </p>
        </div>
        <Button>Add Asset</Button>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        loading={isLoading}
        searchable
        searchPlaceholder="Search assets..."
        onSearch={(value) => setFilters({ ...filters, search: value })}
        pageSize={50}
      />
    </div>
  );
};
