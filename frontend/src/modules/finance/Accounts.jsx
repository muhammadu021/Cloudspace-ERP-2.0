import React from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetAccountsQuery } from '../../store/api/financeApi';

export const Accounts = () => {
  const { data: accounts = [], isLoading } = useGetAccountsQuery();

  const columns = [
    { key: 'code', label: 'Account Code', sortable: true, width: '120px' },
    { key: 'name', label: 'Account Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'balance', label: 'Balance', sortable: true, render: (row) => `$${row.balance?.toLocaleString() || '0'}` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
        <Button>Add Account</Button>
      </div>
      <DataTable columns={columns} data={accounts} loading={isLoading} pageSize={50} searchable searchPlaceholder="Search accounts..." />
    </div>
  );
};
