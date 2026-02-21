import React from 'react';
import {
  DashboardLineChart,
  DashboardBarChart,
  DashboardPieChart,
  DashboardDonutChart,
  COLORS,
} from '../charts/DashboardCharts';

// Purchase Request Status Distribution
export const PurchaseStatusChart = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const statusCounts = requests.reduce((acc, req) => {
    const status = req.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }));

  return (
    <DashboardPieChart
      data={chartData}
      title="Purchase Request Status Distribution"
      height={300}
      colors={[
        COLORS.primary[0],
        COLORS.warning[0],
        COLORS.purple[0],
        COLORS.success[0],
        COLORS.danger[0],
      ]}
    />
  );
};

// Purchase Request by Department
export const PurchaseByDepartmentChart = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const deptData = requests.reduce((acc, req) => {
    const dept = req.department || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = { count: 0, amount: 0 };
    }
    acc[dept].count++;
    acc[dept].amount += parseFloat(req.amount || 0);
    return acc;
  }, {});

  const chartData = Object.entries(deptData).map(([dept, data]) => ({
    name: dept,
    requests: data.count,
    amount: Math.round(data.amount),
  }));

  return (
    <DashboardBarChart
      data={chartData}
      dataKeys={[
        { key: 'requests', name: 'Number of Requests' },
        { key: 'amount', name: 'Total Amount (₦)' },
      ]}
      title="Purchase Requests by Department"
      height={350}
      colors={[COLORS.primary[0], COLORS.success[0]]}
    />
  );
};

// Purchase Request Priority Distribution
export const PurchasePriorityChart = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const priorityCounts = requests.reduce((acc, req) => {
    const priority = req.priority || 'low';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(priorityCounts).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
  }));

  return (
    <DashboardDonutChart
      data={chartData}
      title="Priority Distribution"
      height={300}
      colors={[
        COLORS.danger[0],   // urgent
        COLORS.warning[0],  // high
        COLORS.primary[0],  // medium
        COLORS.success[0],  // low
      ]}
    />
  );
};

// Monthly Purchase Trend
export const MonthlyPurchaseTrendChart = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const monthlyData = requests.reduce((acc, req) => {
    const date = new Date(req.created_at);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { count: 0, amount: 0 };
    }
    acc[monthYear].count++;
    acc[monthYear].amount += parseFloat(req.amount || 0);
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      name: month,
      requests: data.count,
      amount: Math.round(data.amount),
    }))
    .slice(-12); // Last 12 months

  return (
    <DashboardLineChart
      data={chartData}
      dataKeys={[
        { key: 'requests', name: 'Number of Requests' },
        { key: 'amount', name: 'Total Amount (₦)' },
      ]}
      title="Monthly Purchase Trend"
      height={350}
      colors={[COLORS.primary[0], COLORS.success[0]]}
    />
  );
};

// Stage Progress Chart
export const StageProgressChart = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return null;
  }

  const stageCounts = requests.reduce((acc, req) => {
    const stage = req.current_stage || 'unknown';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(stageCounts).map(([stage, count]) => ({
    name: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
  }));

  return (
    <DashboardPieChart
      data={chartData}
      title="Workflow Stage Distribution"
      height={300}
      colors={[
        COLORS.warning[0],
        COLORS.purple[0],
        COLORS.primary[0],
        COLORS.teal[0],
        COLORS.success[0],
      ]}
    />
  );
};

// All Purchase Charts Component
export const AllPurchaseCharts = ({ requests }) => {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Create some purchase requests to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Status and Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PurchaseStatusChart requests={requests} />
        <PurchasePriorityChart requests={requests} />
      </div>

      {/* Row 2: Department Analysis */}
      <PurchaseByDepartmentChart requests={requests} />

      {/* Row 3: Stage Progress and Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StageProgressChart requests={requests} />
        <MonthlyPurchaseTrendChart requests={requests} />
      </div>
    </div>
  );
};

export default {
  PurchaseStatusChart,
  PurchaseByDepartmentChart,
  PurchasePriorityChart,
  MonthlyPurchaseTrendChart,
  StageProgressChart,
  AllPurchaseCharts,
};
