import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FinanceDashboard } from './FinanceDashboard';
import AccountsManagement from './AccountsManagement';
import ChartOfAccounts from './ChartOfAccounts';
import TransactionsManagement from './TransactionsManagement';
import BudgetManagement from './BudgetManagement';
import FinancialReports from './FinancialReports';
import ExpenseManagement from './ExpenseManagement';
import PayrollApproval from './PayrollApproval';

const Finance = () => {
  return (
    <Routes>
      <Route index element={<FinanceDashboard />} />
      <Route path="accounts" element={<AccountsManagement />} />
      <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
      <Route path="transactions" element={<TransactionsManagement />} />
      <Route path="budgets" element={<BudgetManagement />} />
      <Route path="reports" element={<FinancialReports />} />
      <Route path="expenses" element={<ExpenseManagement />} />
      <Route path="payroll-approval" element={<PayrollApproval />} />
    </Routes>
  );
};

export default Finance;