import React, { useState } from 'react';
import { Button, Card } from '../../design-system/components';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const HRReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTemplates = [
    { id: 'headcount', name: 'Headcount Report', description: 'Employee count by department, position, and status' },
    { id: 'attendance', name: 'Attendance Summary', description: 'Attendance statistics and trends' },
    { id: 'payroll', name: 'Payroll Summary', description: 'Payroll costs and breakdown' },
    { id: 'turnover', name: 'Turnover Analysis', description: 'Employee turnover rates and trends' },
    { id: 'performance', name: 'Performance Overview', description: 'Performance ratings and reviews' },
    { id: 'recruitment', name: 'Recruitment Metrics', description: 'Hiring pipeline and time-to-hire' }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('HR Reports & Analytics', [
    <Button key="custom" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Custom Report
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">Generate and view HR reports</p>

      {/* Report Templates */}
      <div className="grid grid-cols-3 gap-4">
        {reportTemplates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedReport(template.id)}
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Generate Report
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">248</div>
            <div className="text-xs text-green-600 mt-1">+12 this month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Avg Attendance</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">94.2%</div>
            <div className="text-xs text-green-600 mt-1">+2.1% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Turnover Rate</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">8.5%</div>
            <div className="text-xs text-red-600 mt-1">+1.2% vs last year</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Open Positions</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">15</div>
            <div className="text-xs text-gray-600 mt-1">Across 8 departments</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
