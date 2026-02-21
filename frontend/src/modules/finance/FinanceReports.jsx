import React, { useState } from 'react';
import { Button, Card } from '../../design-system/components';

export const FinanceReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTemplates = [
    { id: 'pl', name: 'Profit & Loss', description: 'Income and expenses summary' },
    { id: 'balance', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
    { id: 'cashflow', name: 'Cash Flow Statement', description: 'Cash inflows and outflows' },
    { id: 'budget', name: 'Budget vs Actual', description: 'Budget performance analysis' },
    { id: 'expenses', name: 'Expense Report', description: 'Detailed expense breakdown' },
    { id: 'revenue', name: 'Revenue Report', description: 'Revenue analysis by source' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <Button>Custom Report</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {reportTemplates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">Generate Report</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
