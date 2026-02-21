import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, Badge } from '../../design-system/components';
import { useGetEmployeeQuery } from '../../store/api/hrApi';
import { EmployeeInfoTab } from './tabs/EmployeeInfoTab';
import { EmployeeAttendanceTab } from './tabs/EmployeeAttendanceTab';
import { EmployeePayrollTab } from './tabs/EmployeePayrollTab';
import { EmployeeDocumentsTab } from './tabs/EmployeeDocumentsTab';
import { EmployeePerformanceTab } from './tabs/EmployeePerformanceTab';

export const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useGetEmployeeQuery(id);
  const [activeTab, setActiveTab] = useState('info');

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!employee) {
    return <div className="p-6">Employee not found</div>;
  }

  const tabs = [
    { id: 'info', label: 'Information', component: EmployeeInfoTab },
    { id: 'attendance', label: 'Attendance', component: EmployeeAttendanceTab },
    { id: 'payroll', label: 'Payroll', component: EmployeePayrollTab },
    { id: 'documents', label: 'Documents', component: EmployeeDocumentsTab },
    { id: 'performance', label: 'Performance', component: EmployeePerformanceTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
            {employee.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600">{employee.position}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">{employee.department}</span>
              <Badge variant={employee.status === 'active' ? 'success' : 'neutral'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/hr/employees')}>
            Back to List
          </Button>
          <Button>Edit Employee</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {ActiveComponent && <ActiveComponent employee={employee} />}
      </div>
    </div>
  );
};
