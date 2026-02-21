/**
 * ProjectBudgetTab Component
 * 
 * Displays budget vs. actual spending with detailed breakdown.
 */

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Banknote,
  CreditCard,
  PieChart,
} from 'lucide-react';
import Card from '@/design-system/components/Card';
import Badge from '@/design-system/components/Badge';
import { formatCurrency } from '@/utils/formatters';

const ProjectBudgetTab = ({ project }) => {
  const budgetAllocated = project.budget_allocated || 0;
  const budgetSpent = project.budget_spent || 0;
  const budgetRemaining = budgetAllocated - budgetSpent;
  const budgetPercentage = budgetAllocated > 0 
    ? (budgetSpent / budgetAllocated) * 100 
    : 0;

  // Budget status
  const getBudgetStatus = () => {
    if (budgetPercentage > 100) return { label: 'Over Budget', variant: 'error', icon: AlertCircle };
    if (budgetPercentage > 90) return { label: 'Critical', variant: 'error', icon: AlertCircle };
    if (budgetPercentage > 75) return { label: 'Warning', variant: 'warning', icon: TrendingUp };
    return { label: 'On Track', variant: 'success', icon: CheckCircle };
  };

  const budgetStatus = getBudgetStatus();
  const StatusIcon = budgetStatus.icon;

  // Mock expense categories (in real app, this would come from API)
  const expenseCategories = [
    { name: 'Labor', amount: budgetSpent * 0.6, percentage: 60 },
    { name: 'Materials', amount: budgetSpent * 0.25, percentage: 25 },
    { name: 'Equipment', amount: budgetSpent * 0.10, percentage: 10 },
    { name: 'Other', amount: budgetSpent * 0.05, percentage: 5 },
  ];

  // Mock recent transactions (in real app, this would come from API)
  const recentTransactions = [
    {
      id: 1,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      description: 'Software licenses',
      category: 'Equipment',
      amount: 1200,
      type: 'expense',
    },
    {
      id: 2,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      description: 'Team salaries',
      category: 'Labor',
      amount: 15000,
      type: 'expense',
    },
    {
      id: 3,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      description: 'Office supplies',
      category: 'Materials',
      amount: 450,
      type: 'expense',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary-600" />
              Budget Overview
            </h3>
            <Badge variant={budgetStatus.variant}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {budgetStatus.label}
            </Badge>
          </div>

          {/* Budget Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-600">Budget Utilization</span>
              <span className="text-sm font-semibold text-neutral-900">
                {Math.min(100, budgetPercentage).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all ${
                  budgetPercentage > 100
                    ? 'bg-error-600'
                    : budgetPercentage > 90
                    ? 'bg-error-500'
                    : budgetPercentage > 75
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>
          </div>

          {/* Budget Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="h-4 w-4 text-neutral-400" />
                <span className="text-sm text-neutral-600">Allocated</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(budgetAllocated)}
              </p>
            </div>

            <div className="p-4 bg-warning-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-warning-600" />
                <span className="text-sm text-neutral-600">Spent</span>
              </div>
              <p className="text-2xl font-bold text-warning-700">
                {formatCurrency(budgetSpent)}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              budgetRemaining < 0 ? 'bg-error-50' : 'bg-success-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {budgetRemaining < 0 ? (
                  <TrendingDown className="h-4 w-4 text-error-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-success-600" />
                )}
                <span className="text-sm text-neutral-600">
                  {budgetRemaining < 0 ? 'Over Budget' : 'Remaining'}
                </span>
              </div>
              <p className={`text-2xl font-bold ${
                budgetRemaining < 0 ? 'text-error-700' : 'text-success-700'
              }`}>
                {formatCurrency(Math.abs(budgetRemaining))}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary-600" />
            Expense Breakdown
          </h3>

          <div className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">
                    {category.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600">
                      {category.percentage}%
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 min-w-[100px] text-right">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Recent Transactions
          </h3>

          {recentTransactions.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No transactions recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'expense'
                        ? 'bg-error-100 text-error-600'
                        : 'bg-success-100 text-success-600'
                    }`}>
                      {transaction.type === 'expense' ? (
                        <TrendingDown className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" size="sm">
                          {transaction.category}
                        </Badge>
                        <span className="text-xs text-neutral-500">
                          {transaction.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'expense'
                        ? 'text-error-600'
                        : 'text-success-600'
                    }`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Budget Alerts */}
      {budgetPercentage > 75 && (
        <Card>
          <div className={`p-6 ${
            budgetPercentage > 90 ? 'bg-error-50' : 'bg-warning-50'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                budgetPercentage > 90 ? 'text-error-600' : 'text-warning-600'
              }`} />
              <div>
                <h4 className={`font-semibold mb-1 ${
                  budgetPercentage > 90 ? 'text-error-900' : 'text-warning-900'
                }`}>
                  {budgetPercentage > 100
                    ? 'Budget Exceeded'
                    : budgetPercentage > 90
                    ? 'Critical Budget Alert'
                    : 'Budget Warning'}
                </h4>
                <p className="text-sm text-neutral-700">
                  {budgetPercentage > 100
                    ? `This project has exceeded its budget by ${formatCurrency(Math.abs(budgetRemaining))}. Immediate action required.`
                    : budgetPercentage > 90
                    ? `This project has used ${budgetPercentage.toFixed(1)}% of its allocated budget. Only ${formatCurrency(budgetRemaining)} remaining.`
                    : `This project has used ${budgetPercentage.toFixed(1)}% of its allocated budget. Monitor spending closely.`}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectBudgetTab;
