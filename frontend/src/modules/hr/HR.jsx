import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HRDashboard from './HRDashboard';
import EmployeeManagement from './EmployeeManagement';
import { EmployeeDetail } from './EmployeeDetail';
import EmployeeForm from './EmployeeForm';
import LeaveManagement from './LeaveManagement';
import LeaveTypesSetup from './LeaveTypesSetup';
import LeavePolicies from './LeavePolicies';
import LeaveApprovalWorkflows from './LeaveApprovalWorkflows';
import AttendanceTracking from './AttendanceTracking';
import AttendanceReports from './AttendanceReports';
import PayrollDashboard from './PayrollDashboard';
import PayrollProcessing from './PayrollProcessing';
import PayrollRecords from './PayrollRecords';
import PayrollReports from './PayrollReports';
import PayrollAnalytics from './PayrollAnalytics';
import SalaryManagement from './SalaryManagement';
import TaxConfiguration from './TaxConfiguration';
import PerformanceReviews from './PerformanceReviews';
import PerformanceImprovementPlans from './PerformanceImprovementPlans';
import FeedbackManagement from './FeedbackManagement';
import CareerDevelopmentPlans from './CareerDevelopmentPlans';
import TrainingManagement from './TrainingManagement';
import RecruitmentManagement from './RecruitmentManagement';
import PoliciesDocuments from './PoliciesDocuments';
import OrganizationalChart from './OrganizationalChart';
import EmployeeDirectory from './EmployeeDirectory';
import StaffAccessControl from './StaffAccessControl';
import UserManagement from './UserManagement';
import ReportsAnalytics from './ReportsAnalytics';
import HrAnalytics from './HrAnalytics';
import DepartmentManager from './DepartmentManager';
import HRTaskManagement from './HRTaskManagement';
import TaskAssignment from './TaskAssignment';
import ExpenseManagement from './ExpenseManagement';

const HR = () => {
  return (
    <Routes>
      <Route index element={<HRDashboard />} />
      <Route path="dashboard" element={<HRDashboard />} />
      
      {/* Employee Management */}
      <Route path="employees" element={<EmployeeManagement />} />
      <Route path="employees/new" element={<EmployeeForm />} />
      <Route path="employees/:id" element={<EmployeeDetail />} />
      <Route path="employees/:id/edit" element={<EmployeeForm />} />
      
      {/* Department Management */}
      <Route path="departments" element={<DepartmentManager />} />
      
      {/* Leave Management */}
      <Route path="leave" element={<LeaveManagement />} />
      <Route path="leave/types" element={<LeaveTypesSetup />} />
      <Route path="leave/policies" element={<LeavePolicies />} />
      <Route path="leave/workflows" element={<LeaveApprovalWorkflows />} />
      
      {/* Leave Management (Alternative paths) */}
      <Route path="leaves" element={<LeaveManagement />} />
      <Route path="leaves/requests" element={<LeaveManagement />} />
      <Route path="leaves/apply" element={<LeaveManagement />} />
      <Route path="leaves/approvals" element={<LeaveManagement />} />
      <Route path="leaves/balances" element={<LeaveManagement />} />
      <Route path="leaves/calendar" element={<LeaveManagement />} />
      <Route path="leaves/types" element={<LeaveTypesSetup />} />
      <Route path="leaves/policies" element={<LeavePolicies />} />
      <Route path="leaves/workflows" element={<LeaveApprovalWorkflows />} />
      <Route path="leaves/reports" element={<LeaveManagement />} />
      <Route path="leaves/analytics" element={<LeaveManagement />} />
      <Route path="leaves/access" element={<StaffAccessControl />} />
      <Route path="leaves/history" element={<LeaveManagement />} />
      
      {/* Attendance */}
      <Route path="attendance" element={<AttendanceTracking />} />
      <Route path="attendance-reports" element={<AttendanceReports />} />
      
      {/* Payroll */}
      <Route path="payroll" element={<PayrollDashboard />} />
      <Route path="payroll/processing" element={<PayrollProcessing />} />
      <Route path="payroll/records" element={<PayrollRecords />} />
      <Route path="payroll/reports" element={<PayrollReports />} />
      <Route path="payroll/analytics" element={<PayrollAnalytics />} />
      <Route path="payroll/salary" element={<SalaryManagement />} />
      <Route path="payroll/tax" element={<TaxConfiguration />} />
      
      {/* Salary Management - Direct route */}
      <Route path="salary-management" element={<SalaryManagement />} />
      
      {/* Performance */}
      <Route path="performance" element={<PerformanceReviews />} />
      <Route path="performance/pips" element={<PerformanceImprovementPlans />} />
      <Route path="performance/feedback" element={<FeedbackManagement />} />
      <Route path="performance/career-plans" element={<CareerDevelopmentPlans />} />
      
      {/* Training */}
      <Route path="training" element={<TrainingManagement />} />
      
      {/* Recruitment */}
      <Route path="recruitment" element={<RecruitmentManagement />} />
      
      {/* Documents & Policies */}
      <Route path="policies" element={<PoliciesDocuments />} />
      
      {/* Organization */}
      <Route path="org-chart" element={<OrganizationalChart />} />
      <Route path="directory" element={<EmployeeDirectory />} />
      <Route path="access-control" element={<StaffAccessControl />} />
      <Route path="user-management" element={<UserManagement />} />
      <Route path="users" element={<UserManagement />} />
      
      {/* Task Management */}
      <Route path="tasks" element={<HRTaskManagement />} />
      <Route path="task-assignment" element={<TaskAssignment />} />
      
      {/* Expense Management */}
      <Route path="expenses" element={<ExpenseManagement />} />
      
      {/* Analytics */}
      <Route path="reports" element={<ReportsAnalytics />} />
      <Route path="analytics/*" element={<HrAnalytics />} />
    </Routes>
  );
};

export default HR;