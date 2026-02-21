import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../design-system/components';
import { useGetFinanceDashboardQuery } from '../../store/api/financeApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus, Download, FileText, LayoutDashboard, BookOpen, Receipt, Wallet, BarChart3, DollarSign, CheckCircle } from 'lucide-react';

export const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useGetFinanceDashboardQuery();

  // Set page title only (no actions in navbar)
  usePageTitle('Finance Dashboard');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/chart-of-accounts')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Chart of Accounts
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/transactions')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Receipt className="h-3.5 w-3.5" />
          Transactions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/budgets')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Wallet className="h-3.5 w-3.5" />
          Budget Management
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/reports')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Financial Reports
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/expenses')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <DollarSign className="h-3.5 w-3.5" />
          Expense Management
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/finance/payroll-approval')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Payroll Approval
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Revenue (MTD)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.revenue?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-green-600 mt-1">+12.5% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Expenses (MTD)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.expenses?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-red-600 mt-1">+5.2% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Profit (MTD)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.profit?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-green-600 mt-1">+18.3% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Cash Flow</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.cashFlow?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Available balance</div>
          </div>
        </Card>
      </div>

      {/* Budget Tracking */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
          <div className="space-y-4">
            {dashboard?.budgets?.map((budget) => (
              <div key={budget.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                    <span className="text-sm text-gray-600">
                      ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budget.percentage > 100 ? 'bg-red-500' :
                        budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <Badge
                  variant={
                    budget.percentage > 100 ? 'error' :
                    budget.percentage > 80 ? 'warning' : 'success'
                  }
                  className="ml-4"
                >
                  {budget.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {dashboard?.pendingApprovals?.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{approval.title}</div>
                  <div className="text-sm text-gray-600">{approval.submittedBy} • ${approval.amount.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-2">
            {dashboard?.recentTransactions?.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{txn.description}</div>
                  <div className="text-sm text-gray-600">{new Date(txn.date).toLocaleDateString()}</div>
                </div>
                <div className={`font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {txn.type === 'income' ? '+' : '-'}${txn.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
