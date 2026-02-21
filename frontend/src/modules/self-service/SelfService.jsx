import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import SelfServiceDashboard directly to avoid lazy loading issues
import SelfServiceDashboard from './SelfServiceDashboard';

// Lazy load other components for better performance
const ProfileManagement = lazy(() => import('./components/ProfileManagement'));
const LeaveRequests = lazy(() => import('./components/LeaveRequests'));
const ExpenseClaims = lazy(() => import('./components/ExpenseClaims'));
const PayslipAccess = lazy(() => import('./components/PayslipAccess'));
const TimeTracking = lazy(() => import('./components/TimeTracking'));
const TrainingEnrollment = lazy(() => import('./components/TrainingEnrollment'));
const Tasks = lazy(() => import('./components/Tasks'));
const TaskReporting = lazy(() => import('./TaskReporting'));
const Notifications = lazy(() => import('./components/Notifications'));
const DocumentManagement = lazy(() => import('./components/DocumentManagement'));
const Benefits = lazy(() => import('./components/Benefits'));

const SelfService = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Self Service...</p>
        </div>
      </div>
    }>
      <Routes>
        <Route index element={<SelfServiceDashboard />} />
        <Route path="profile" element={<ProfileManagement />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="expense-claims" element={<ExpenseClaims />} />
        <Route path="payslips" element={<PayslipAccess />} />
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="training" element={<TrainingEnrollment />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="my-tasks" element={<TaskReporting />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="benefits" element={<Benefits />} />
        {/* Add more self-service routes here */}
      </Routes>
    </Suspense>
  );
};

export default SelfService;