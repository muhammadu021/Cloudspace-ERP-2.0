import React from 'react';
import {
  DashboardLineChart,
  DashboardBarChart,
  DashboardPieChart,
  DashboardDonutChart,
  COLORS,
} from '../../../components/charts/DashboardCharts';

// Employee Distribution by Department
export const EmployeeDistributionChart = ({ employees }) => {
  if (!employees || employees.length === 0) return null;

  const deptCounts = employees.reduce((acc, emp) => {
    const dept = emp.department?.name || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(deptCounts).map(([dept, count]) => ({
    name: dept,
    value: count,
  }));

  return (
    <DashboardPieChart
      data={chartData}
      title="Employee Distribution by Department"
      height={300}
      colors={COLORS.primary}
    />
  );
};

// Leave Status Distribution
export const LeaveStatusChart = ({ leaves }) => {
  if (!leaves || leaves.length === 0) return null;

  const statusCounts = leaves.reduce((acc, leave) => {
    const status = leave.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  return (
    <DashboardDonutChart
      data={chartData}
      title="Leave Request Status"
      height={300}
      colors={[
        COLORS.warning[0],  // pending
        COLORS.success[0],  // approved
        COLORS.danger[0],   // rejected
      ]}
    />
  );
};

// Attendance Trend
export const AttendanceTrendChart = ({ attendanceData }) => {
  if (!attendanceData || attendanceData.length === 0) return null;

  return (
    <DashboardLineChart
      data={attendanceData}
      dataKeys={[
        { key: 'present', name: 'Present' },
        { key: 'absent', name: 'Absent' },
        { key: 'late', name: 'Late' },
      ]}
      title="Monthly Attendance Trend"
      height={350}
      colors={[COLORS.success[0], COLORS.danger[0], COLORS.warning[0]]}
    />
  );
};

// Department Headcount
export const DepartmentHeadcountChart = ({ departments }) => {
  if (!departments || departments.length === 0) return null;

  const chartData = departments.map(dept => ({
    name: dept.name,
    employees: dept.employee_count || 0,
    capacity: dept.capacity || 0,
  }));

  return (
    <DashboardBarChart
      data={chartData}
      dataKeys={[
        { key: 'employees', name: 'Current Employees' },
        { key: 'capacity', name: 'Capacity' },
      ]}
      title="Department Headcount vs Capacity"
      height={350}
      colors={[COLORS.primary[0], COLORS.success[0]]}
    />
  );
};

// Payroll Overview
export const PayrollOverviewChart = ({ payrollData }) => {
  if (!payrollData || payrollData.length === 0) return null;

  return (
    <DashboardBarChart
      data={payrollData}
      dataKeys={[
        { key: 'gross', name: 'Gross Salary' },
        { key: 'deductions', name: 'Deductions' },
        { key: 'net', name: 'Net Salary' },
      ]}
      title="Monthly Payroll Breakdown"
      height={350}
      colors={[COLORS.primary[0], COLORS.danger[0], COLORS.success[0]]}
      stacked={false}
    />
  );
};

// All HR Charts Component
export const AllHRCharts = ({ employees, leaves, attendanceData, departments, payrollData }) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Employee Distribution and Leave Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeDistributionChart employees={employees} />
        <LeaveStatusChart leaves={leaves} />
      </div>

      {/* Row 2: Attendance Trend */}
      {attendanceData && <AttendanceTrendChart attendanceData={attendanceData} />}

      {/* Row 3: Department Headcount and Payroll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentHeadcountChart departments={departments} />
        <PayrollOverviewChart payrollData={payrollData} />
      </div>
    </div>
  );
};

export default {
  EmployeeDistributionChart,
  LeaveStatusChart,
  AttendanceTrendChart,
  DepartmentHeadcountChart,
  PayrollOverviewChart,
  AllHRCharts,
};
