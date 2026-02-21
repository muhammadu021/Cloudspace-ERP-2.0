import React, { useState } from 'react';
import { DataTable, Button, Badge, FormField } from '../../design-system/components';
import { useGetAttendanceQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Download } from 'lucide-react';

export const Attendance = () => {
  const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0] });
  const { data: attendance = [], isLoading } = useGetAttendanceQuery(filters);

  const columns = [
    { key: 'employeeName', label: 'Employee', sortable: true },
    { key: 'department', label: 'Department', sortable: true, filterable: true },
    { key: 'checkIn', label: 'Check In', sortable: true },
    { key: 'checkOut', label: 'Check Out', sortable: true },
    { key: 'hoursWorked', label: 'Hours', sortable: true, render: (row) => `${row.hoursWorked}h` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = { present: 'success', late: 'warning', absent: 'error', leave: 'info' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Attendance Overview', [
    <FormField
      key="date"
      type="date"
      value={filters.date}
      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
      className="w-48"
    />,
    <Button key="export" variant="outline" size="sm">
      <Download className="h-4 w-4 mr-1" />
      Export Report
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={attendance} loading={isLoading} pageSize={50} />
    </div>
  );
};
