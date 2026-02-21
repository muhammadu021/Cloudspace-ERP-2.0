import React from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetPayrollRunsQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Play } from 'lucide-react';

export const Payroll = () => {
  const { data: payrollRuns = [], isLoading } = useGetPayrollRunsQuery();

  const columns = [
    { key: 'period', label: 'Pay Period', sortable: true },
    { key: 'employeeCount', label: 'Employees', sortable: true },
    { key: 'totalAmount', label: 'Total Amount', sortable: true, render: (row) => `$${row.totalAmount?.toLocaleString()}` },
    { key: 'processedDate', label: 'Processed Date', sortable: true, render: (row) => new Date(row.processedDate).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = { paid: 'success', pending: 'warning', processing: 'info' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Payroll Processing', [
    <Button key="process" variant="primary" size="sm">
      <Play className="h-4 w-4 mr-1" />
      Process Payroll
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={payrollRuns} loading={isLoading} pageSize={50} />
    </div>
  );
};
