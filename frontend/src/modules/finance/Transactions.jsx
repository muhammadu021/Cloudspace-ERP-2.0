import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetTransactionsQuery } from '../../store/api/financeApi';

export const Transactions = () => {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = useGetTransactionsQuery();

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'reference', label: 'Reference', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'account', label: 'Account', sortable: true, filterable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (row) => `$${row.amount?.toLocaleString() || '0'}` },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => <Badge variant={row.type === 'income' ? 'success' : 'error'}>{row.type}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Button onClick={() => navigate('/finance/transactions/new')}>New Transaction</Button>
      </div>
      <DataTable columns={columns} data={transactions} loading={isLoading} pageSize={50} searchable />
    </div>
  );
};
