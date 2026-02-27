import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal, FormField } from '../../design-system/components';
import { useGetMySpaceDashboardQuery, useClockInOutMutation } from '../../store/api/mySpaceApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Clock, Calendar, FileText, User, AlertCircle, BarChart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoleDashboard from '../../components/dashboard/RoleDashboard';

const MySpaceDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useGetMySpaceDashboardQuery();
  const [clockInOut] = useClockInOutMutation();
  
  console.log('[MySpaceDashboard] dashboard data:', dashboard);
  
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  const handleClockAction = async () => {
    try {
      const action = dashboard?.todayAttendance?.clockIn ? 'out' : 'in';
      console.log('[MySpaceDashboard] Clock action:', action, 'dashboard:', dashboard);
      await clockInOut({ type: action, timestamp: new Date().toISOString() }).unwrap();
      toast.success(`Successfully clocked ${action}!`);
    } catch (error) {
      console.error('[MySpaceDashboard] Clock error:', error);
      toast.error('Failed to clock in/out. Please try again.');
    }
  };

  // Don't set page title - removed to hide "My Space" from navbar
  // usePageTitle('My Space');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-2 p-6">
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <Button 
          variant={dashboard?.todayAttendance?.clockIn ? 'outline' : 'primary'}
          onClick={handleClockAction}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Clock className="h-3.5 w-3.5" />
          {dashboard?.todayAttendance?.clockIn ? 'Clock Out' : 'Clock In'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowLeaveModal(true)}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Calendar className="h-3.5 w-3.5" />
          Request Leave
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowExpenseModal(true)}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          Submit Expense
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/myspace/documents?filter=payslips')}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          View Payslip
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/myspace/profile')}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <User className="h-3.5 w-3.5" />
          Update Profile
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowIssueModal(true)}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Report Issue
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/myspace/profile?tab=attendance')}
          size="sm"
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BarChart className="h-3.5 w-3.5" />
          View Attendance
        </Button>
        
        {/* Refresh All Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh All
        </Button>
      </div>

      {/* Role-Based Dashboard - Personal Dashboard for all users in My Space */}
      <RoleDashboard />

      {/* Today's Summary */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600">Clock In Time</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {dashboard?.todayAttendance?.clockIn 
                  ? new Date(dashboard.todayAttendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Not clocked in'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Hours Worked</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {dashboard?.todayAttendance?.hoursWorked || '0.0'} hrs
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Leave Balance</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {dashboard?.leaveBalance?.available || 0} days
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/myspace/requests')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {dashboard?.recentActivity?.length > 0 ? (
              dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString()} • {activity.type}
                    </div>
                  </div>
                  <Badge variant={
                    activity.status === 'approved' ? 'success' :
                    activity.status === 'pending' ? 'warning' :
                    activity.status === 'rejected' ? 'error' : 'default'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pending Actions */}
      {dashboard?.pendingActions?.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
            <div className="space-y-3">
              {dashboard.pendingActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{action.title}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                  </div>
                  <Button size="sm" onClick={() => navigate(action.link)}>
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Modals */}
      <LeaveRequestModal 
        open={showLeaveModal} 
        onClose={() => setShowLeaveModal(false)}
        onSuccess={() => {
          setShowLeaveModal(false);
          toast.success('Leave request submitted successfully!');
        }}
      />
      
      <ExpenseSubmitModal 
        open={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)}
        onSuccess={() => {
          setShowExpenseModal(false);
          toast.success('Expense submitted successfully!');
        }}
      />
      
      <IssueReportModal 
        open={showIssueModal} 
        onClose={() => setShowIssueModal(false)}
        onSuccess={() => {
          setShowIssueModal(false);
          toast.success('Issue reported successfully!');
        }}
      />
    </div>
  );
};

// Leave Request Modal Component (3-step workflow)
const LeaveRequestModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = async () => {
    // API call would go here
    onSuccess();
    setStep(1);
    setFormData({ startDate: '', endDate: '', type: 'vacation', reason: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Request Leave" size="md">
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                s === step ? 'bg-primary-500 text-white' :
                s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Select Dates and Type</h4>
            <FormField
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <FormField
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <FormField
              type="select"
              label="Leave Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'vacation', label: 'Vacation' },
                { value: 'sick', label: 'Sick Leave' },
                { value: 'personal', label: 'Personal' },
                { value: 'unpaid', label: 'Unpaid' }
              ]}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Provide Reason</h4>
            <FormField
              type="textarea"
              label="Reason for Leave"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a brief reason for your leave request..."
              rows={5}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Review and Submit</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="font-medium">{new Date(formData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">End Date:</span>
                <span className="font-medium">{new Date(formData.endDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600">Reason:</span>
                <p className="mt-1 text-gray-900">{formData.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={step === 3 ? handleSubmit : handleNext}>
            {step === 3 ? 'Submit Request' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Expense Submit Modal Component (3-step workflow)
const ExpenseSubmitModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'travel',
    receipt: null,
    description: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = async () => {
    // API call would go here
    onSuccess();
    setStep(1);
    setFormData({ amount: '', category: 'travel', receipt: null, description: '' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit Expense" size="md">
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                s === step ? 'bg-primary-500 text-white' :
                s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Amount and Category</h4>
            <FormField
              type="number"
              label="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <FormField
              type="select"
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'travel', label: 'Travel' },
                { value: 'meals', label: 'Meals & Entertainment' },
                { value: 'supplies', label: 'Office Supplies' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'other', label: 'Other' }
              ]}
            />
            <FormField
              type="file"
              label="Receipt"
              onChange={(e) => setFormData({ ...formData, receipt: e.target.files[0] })}
              helperText="Upload receipt image or PDF"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Description</h4>
            <FormField
              type="textarea"
              label="Expense Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide details about this expense..."
              rows={5}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Review and Submit</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-lg">${parseFloat(formData.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-medium">{formData.receipt ? formData.receipt.name : 'No receipt'}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600">Description:</span>
                <p className="mt-1 text-gray-900">{formData.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={step === 3 ? handleSubmit : handleNext}>
            {step === 3 ? 'Submit Expense' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Issue Report Modal Component (3-step workflow)
const IssueReportModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'technical',
    description: '',
    priority: 'medium'
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = async () => {
    // API call would go here
    onSuccess();
    setStep(1);
    setFormData({ category: 'technical', description: '', priority: 'medium' });
  };

  return (
    <Modal open={open} onClose={onClose} title="Report Issue" size="md">
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                s === step ? 'bg-primary-500 text-white' :
                s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Select Category</h4>
            <FormField
              type="select"
              label="Issue Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'technical', label: 'Technical Issue' },
                { value: 'hr', label: 'HR Related' },
                { value: 'facilities', label: 'Facilities' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Describe the Issue</h4>
            <FormField
              type="textarea"
              label="Issue Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about the issue..."
              rows={6}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Set Priority</h4>
            <FormField
              type="select"
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low - Can wait' },
                { value: 'medium', label: 'Medium - Normal priority' },
                { value: 'high', label: 'High - Needs attention soon' },
                { value: 'urgent', label: 'Urgent - Blocking work' }
              ]}
            />
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium capitalize">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority:</span>
                <Badge variant={
                  formData.priority === 'urgent' ? 'error' :
                  formData.priority === 'high' ? 'warning' : 'default'
                }>
                  {formData.priority}
                </Badge>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600">Description:</span>
                <p className="mt-1 text-gray-900">{formData.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={step === 3 ? handleSubmit : handleNext}>
            {step === 3 ? 'Submit Issue' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MySpaceDashboard;
