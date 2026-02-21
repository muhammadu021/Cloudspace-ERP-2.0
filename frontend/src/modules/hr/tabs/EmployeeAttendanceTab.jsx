import React from 'react';
import { DataTable, Badge } from '../../../design-system/components';
import { useGetEmployeeAttendanceQuery } from '../../../store/api/hrApi';

export const EmployeeAttendanceTab = ({ employee }) => {
  const { data: attendance = [], isLoading } = useGetEmployeeAttendanceQuery(employee.id);

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      key: 'checkIn',
      label: 'Check In',
      sortable: true
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      sortable: true
    },
    {
      key: 'hoursWorked',
      label: 'Hours Worked',
      sortable: true,
      render: (row) => `${row.hoursWorked}h`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = {
          present: 'success',
          late: 'warning',
          absent: 'error',
          leave: 'info'
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Days</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {attendance.length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600">Present</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {attendance.filter(a => a.status === 'present').length}
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Late</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">
            {attendance.filter(a => a.status === 'late').length}
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-red-600">Absent</div>
          <div className="text-2xl font-bold text-red-900 mt-1">
            {attendance.filter(a => a.status === 'absent').length}
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <DataTable
        columns={columns}
        data={attendance}
        loading={isLoading}
        pageSize={20}
      />
    </div>
  );
};
