import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SalesDashboard from './components/SalesDashboard';
import PointOfSale from './components/PointOfSale';
import SalesOrders from './components/SalesOrders';
import CustomerManagement from './components/CustomerManagement';
import LeadsManagement from './components/LeadsManagement';
import SalesAnalytics from './components/SalesAnalytics';
import SalesReports from './components/SalesReports';
import SalesSettings from './components/SalesSettings';

const SalesDesk = () => {
  return (
    <div className="sales-desk min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/sales/dashboard" replace />} />
        <Route path="/dashboard" element={<SalesDashboard />} />
        <Route path="/pos" element={<PointOfSale />} />
        <Route path="/orders" element={<SalesOrders />} />
        <Route path="/orders/:id" element={<SalesOrders />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/leads" element={<LeadsManagement />} />
        <Route path="/analytics" element={<SalesAnalytics />} />
        <Route path="/reports" element={<SalesReports />} />
        <Route path="/settings" element={<SalesSettings />} />
      </Routes>
    </div>
  );
};

export default SalesDesk;
