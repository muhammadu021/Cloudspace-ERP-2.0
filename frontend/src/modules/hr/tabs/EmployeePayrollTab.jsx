import React from 'react';
import { DataTable, Badge } from '../../../design-system/components';
import { useGetEmployeePayrollQuery } from '../../../store/api/hrApi';

export const EmployeePayrollTab = ({ employee }) => {
  const { data: payroll = [], isLoading } = useGetEmployeePayrollQuery(employee.id);

  const columns = [
    {
      key: 'period',
      label: 'Pay Period',
      sortable: true
    },
    {
      key: 'basicSalary',
      label: 'Basic Salary',
      sortable: true,
      render: (row) => `$${row.basicSalary.toLocaleString()}`
    },
    {
      key: 'allowances',
      label: 'Allowances',
      sortable: true,
      render: (row) => `$${row.allowances.toLocaleString()}`
    },
    {
      key: 'deductions',
      label: 'Deductions',
      sortable: true,
      render: (row) => `$${row.deductions.toLocaleString()}`
    },
    {
      key: 'netPay',
      label: 'Net Pay',
      sortable: true,
      render: (row) => `$${row.netPay.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = {
          paid: 'success',
          pending: 'warning',
          processing: 'info'
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Salary Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Current Salary</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            ${employee.salary?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500 mt-1">per month</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600">YTD Earnings</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            ${payroll.reduce((sum, p) => sum + p.netPay, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600">YTD Deductions</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            ${payroll.reduce((sum, p) => sum + p.deductions, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Payroll History */}
      <DataTable
        columns={columns}
        data={payroll}
        loading={isLoading}
        pageSize={20}
      />
    </div>
  );
};
