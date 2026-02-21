import React from 'react';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetBudgetsQuery } from '../../store/api/financeApi';

export const Budgets = () => {
  const { data: budgets = [], isLoading } = useGetBudgetsQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <Button>Create Budget</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                  <p className="text-sm text-gray-600">{budget.period}</p>
                </div>
                <Badge
                  variant={
                    budget.percentage > 100 ? 'error' :
                    budget.percentage > 80 ? 'warning' : 'success'
                  }
                >
                  {budget.percentage}% Used
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allocated</span>
                  <span className="font-medium">${budget.allocated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium">${budget.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className={`font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(budget.remaining).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${
                      budget.percentage > 100 ? 'bg-red-500' :
                      budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
