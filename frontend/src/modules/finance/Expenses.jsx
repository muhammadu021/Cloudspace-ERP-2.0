import React from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetExpensesQuery, useApproveExpenseMutation } from '../../store/api/financeApi';

export const Expenses = () => {
  const { data: expenses = [], isLoading } = useGetExpensesQuery();
  const [approveExpense] = useApproveExpenseMutation();

  const handleApprove = async (id) => {
    await approveExpense({ id, status: 'approved' });
  };

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'category', label: 'Category', sortable: true, filterable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (row) => `$${row.amount?.toLocaleString() || '0'}` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = { approved: 'success', pending: 'warning', rejected: 'error' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => row.status === 'pending' && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleApprove(row.id)}>Approve</Button>
          <Button variant="outline" size="sm">Reject</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expense Claims</h1>
        <Button>Submit Expense</Button>
      </div>
      <DataTable columns={columns} data={expenses} loading={isLoading} pageSize={50} />
    </div>
  );
};
