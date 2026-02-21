import React from 'react';
import { Button, Card } from '../../design-system/components';

export const InventoryReports = () => {
  const reportTemplates = [
    { id: 'stock-levels', name: 'Stock Levels Report', description: 'Current stock levels by item and location' },
    { id: 'movements', name: 'Movement Report', description: 'Stock movements over time' },
    { id: 'valuation', name: 'Inventory Valuation', description: 'Total inventory value by category' },
    { id: 'aging', name: 'Aging Report', description: 'Items by age and turnover rate' },
    { id: 'reorder', name: 'Reorder Report', description: 'Items below reorder level' },
    { id: 'locations', name: 'Location Report', description: 'Stock distribution by location' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
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
