import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationSidebar from './NavigationSidebar';

/**
 * NavigationSidebar Example
 * 
 * Demonstrates the NavigationSidebar component with routing.
 * This example shows:
 * - Sidebar with all 6 categories and 8 spaces
 * - Collapsible/expandable behavior
 * - Active space highlighting
 * - Responsive behavior (desktop, tablet, mobile)
 * - State persistence
 */

// Mock page components for demonstration
const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Dashboard</h1>
    <p className="text-neutral-600">Welcome to the Dashboard space.</p>
  </div>
);

const ProjectsPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Projects</h1>
    <p className="text-neutral-600">Manage your projects here.</p>
  </div>
);

const InventoryPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Inventory</h1>
    <p className="text-neutral-600">Track inventory items and stock levels.</p>
  </div>
);

const HRPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Human Resources</h1>
    <p className="text-neutral-600">Manage employees and HR processes.</p>
  </div>
);

const PortalPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">My Space</h1>
    <p className="text-neutral-600">Your personal self-service portal.</p>
  </div>
);

const FinancePage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Finance</h1>
    <p className="text-neutral-600">Manage financial transactions and budgets.</p>
  </div>
);

const SalesPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Sales</h1>
    <p className="text-neutral-600">Track customers, orders, and sales performance.</p>
  </div>
);

const AdminPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Administration</h1>
    <p className="text-neutral-600">System administration and settings.</p>
  </div>
);

const SupportPage = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-neutral-800 mb-4">Support</h1>
    <p className="text-neutral-600">Manage support tickets and customer inquiries.</p>
  </div>
);

const NavigationSidebarExample = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-neutral-50">
        {/* Navigation Sidebar */}
        <NavigationSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/*" element={<ProjectsPage />} />
              <Route path="/inventory/*" element={<InventoryPage />} />
              <Route path="/hr/*" element={<HRPage />} />
              <Route path="/portal/*" element={<PortalPage />} />
              <Route path="/finance/*" element={<FinancePage />} />
              <Route path="/sales/*" element={<SalesPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
              <Route path="/support/*" element={<SupportPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default NavigationSidebarExample;
