import React from 'react';
import { Button, Card } from '../../design-system/components';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const SalesReports = () => {
  const reportTemplates = [
    { id: 'sales-summary', name: 'Sales Summary', description: 'Overall sales performance' },
    { id: 'customer-analysis', name: 'Customer Analysis', description: 'Customer behavior and trends' },
    { id: 'product-performance', name: 'Product Performance', description: 'Best and worst selling products' },
    { id: 'sales-forecast', name: 'Sales Forecast', description: 'Projected sales trends' }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Sales Reports', [
    <Button key="custom" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Custom Report
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
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
