import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Progress,
  Switch,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Calculator,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  FileCheck,
  Send,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Activity,
  Target,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Unlock,
  Lock,
  Info,
  ArrowRight
} from 'lucide-react';
import payrollService, { PayrollStatusUtils } from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PayrollProcessingInterface = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('batch-processing');
  
  // State for processing
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [validationResults, setValidationResults] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(null);
  const [approvalQueue, setApprovalQueue] = useState([]);
  
  // Form states
  const [batchForm, setBatchForm] = useState({
    period_id: '',
    employee_ids: [],
    batch_size: 10,
    skip_validation: false,
    department_filter: '',
    reprocess_existing: false
  });

  const [approvalForm, setApprovalForm] = useState({
    selected_payrolls: [],
    comments: '',
    rejection_reason: ''
  });

  // Dialog states
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedPeriodForStatus, setSelectedPeriodForStatus] = useState(null);
  const [statusChangeNotes, setStatusChangeNotes] = useState('');

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'approval-workflow') {
      loadApprovalQueue();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading initial data...');
      
      const [periodsResponse, employeesResponse, departmentsResponse] = await Promise.all([
        payrollService.getPayrollPeriods({ limit: 50 }), // Get all periods, not just open ones
        employeeService.getEmployees({ employment_status: 'active', limit: 100 }),
        employeeService.getDepartments()
      ]);
      
      console.log('API Responses:', {
        periods: periodsResponse,
        employees: employeesResponse,
        departments: departmentsResponse
      });
      
      const periods = periodsResponse.data?.periods || [];
      setPayrollPeriods(periods);
      
      // Auto-select current month period if available
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const currentPeriod = periods.find(period => {
        const startDate = new Date(period.start_date);
        return startDate.getMonth() === currentMonth && 
               startDate.getFullYear() === currentYear &&
               (period.status === 'open' || period.status === 'draft');
      });
      
      if (currentPeriod && !batchForm.period_id) {
        setBatchForm(prev => ({ ...prev, period_id: currentPeriod.id.toString() }));
        console.log('Auto-selected current month period:', currentPeriod.name);
      }
      
      // Process employees data
      const employeesData = employeesResponse.data?.data?.employees || employeesResponse.data?.employees || [];
      console.log('Raw employees data:', employeesData);
      
      const processedEmployees = employeesData.map(emp => ({
        id: emp.id,
        name: emp.User ? `${emp.User.first_name} ${emp.User.last_name}` : 'Unknown',
        employee_id: emp.employee_id,
        department_id: emp.department_id,
        department: emp.Department?.name || 'Unknown',
        employment_status: emp.employment_status,
        email: emp.User?.email
      }));
      setEmployees(processedEmployees);
      
      // Process departments data
      const departmentsData = departmentsResponse.data?.data?.departments || departmentsResponse.data?.departments || [];
      setDepartments(departmentsData);
      
      console.log(`Loaded ${processedEmployees.length} active employees and ${departmentsData.length} departments`);
      
      if (processedEmployees.length === 0) {
        console.warn('No active employees found. Check API response structure.');
        toast.warning('No active employees found. Please check employee data.');
      }
    } catch (error) {
      toast.error('Failed to load initial data');
      console.error('Load initial data error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalQueue = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getApprovalQueue();
      setApprovalQueue(response.data?.payrolls || []);
    } catch (error) {
      toast.error('Failed to load approval queue');
      console.error('Load approval queue error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBatch = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      if (!batchForm.period_id) {
        setFormErrors({ period_id: 'Please select a payroll period' });
        return;
      }

      const filteredEmployees = getFilteredEmployees();
      const validationData = {
        period_id: batchForm.period_id,
        employee_ids: batchForm.employee_ids.length > 0 ? batchForm.employee_ids : filteredEmployees.map(emp => emp.id)
      };

      const response = await payrollService.validatePayrollBatch(validationData);
      setValidationResults(response.data);
      setShowValidationDialog(true);
      
      toast.success(`Validation completed for ${response.data.total_employees} employees`);
    } catch (error) {
      const errorMessage = error.message || 'Failed to validate payroll batch';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBatchProcess = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      if (!batchForm.period_id) {
        setFormErrors({ period_id: 'Please select a payroll period' });
        return;
      }

      // Check period status before processing
      const selectedPeriod = payrollPeriods.find(p => p.id.toString() === batchForm.period_id);
      if (selectedPeriod && !payrollService.canProcessPeriod(selectedPeriod.status)) {
        toast.error(`Cannot process payroll. Period status is "${selectedPeriod.status}". Please open the period first.`);
        setFormErrors({ 
          period_status: `Period must be "open" for processing. Current status: ${selectedPeriod.status}` 
        });
        return;
      }

      const filteredEmployees = getFilteredEmployees();
      if (filteredEmployees.length === 0) {
        toast.error('No active employees found for processing. Please check employee data.');
        return;
      }

      const batchData = {
        period_id: batchForm.period_id,
        employee_ids: batchForm.employee_ids.length > 0 ? batchForm.employee_ids : filteredEmployees.map(emp => emp.id),
        batch_size: batchForm.batch_size,
        skip_validation: batchForm.skip_validation,
        options: {
          reprocess: batchForm.reprocess_existing
        }
      };

      // Start processing with progress tracking
      setProcessingProgress({
        isProcessing: true,
        progress: 0,
        status: 'Starting batch processing...',
        processed: 0,
        total: filteredEmployees.length,
        errors: []
      });
      
      setShowProcessingDialog(true);

      // Use enhanced processing method with status check
      const response = await payrollService.processPayrollWithStatusCheck(batchData);
      
      // Update progress to completion
      setProcessingProgress(prev => ({
        ...prev,
        isProcessing: false,
        progress: 100,
        status: 'Batch processing completed successfully!',
        processed: response.data.processed_count,
        total: response.data.processed_count + response.data.error_count,
        errors: response.data.errors || []
      }));

      toast.success(`Processed payroll for ${response.data.processed_count} employees`);
      
      if (response.data.error_count > 0) {
        toast.warning(`${response.data.error_count} employees had processing errors`);
      }

      // Reload data to reflect changes
      loadInitialData();

      // Auto-close dialog after 3 seconds
      setTimeout(() => {
        setShowProcessingDialog(false);
        setProcessingProgress(null);
      }, 3000);
      
    } catch (error) {
      setProcessingProgress(prev => ({
        ...prev,
        isProcessing: false,
        status: 'Processing failed: ' + (error.message || 'Unknown error'),
        actionable: error.actionable,
        action: error.action
      }));
      
      const errorMessage = error.message || 'Failed to process payroll batch';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
      
      // Handle actionable errors
      if (error.actionable && error.action === 'open_period') {
        const selectedPeriod = payrollPeriods.find(p => p.id.toString() === batchForm.period_id);
        if (selectedPeriod) {
          setSelectedPeriodForStatus(selectedPeriod);
          setShowStatusDialog(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setLoading(true);
      
      if (approvalForm.selected_payrolls.length === 0) {
        toast.error('Please select payroll records to submit for approval');
        return;
      }

      const submissionData = {
        payroll_ids: approvalForm.selected_payrolls,
        comments: approvalForm.comments
      };

      const response = await payrollService.submitForApproval(submissionData);
      
      toast.success(`Submitted ${response.data.submitted_count} payroll records for approval`);
      setApprovalForm({ selected_payrolls: [], comments: '', rejection_reason: '' });
      setShowApprovalDialog(false);
      loadApprovalQueue();
      
    } catch (error) {
      toast.error('Failed to submit payroll for approval');
      console.error('Submit for approval error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollIds) => {
    try {
      setLoading(true);
      
      const approvalData = {
        payroll_ids: payrollIds,
        comments: approvalForm.comments
      };

      const response = await payrollService.approvePayroll(approvalData);
      
      toast.success(`Approved ${response.data.approved_count} payroll records`);
      loadApprovalQueue();
      
    } catch (error) {
      toast.error('Failed to approve payroll');
      console.error('Approve payroll error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayroll = async () => {
    try {
      setLoading(true);
      
      if (!approvalForm.rejection_reason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }

      const rejectionData = {
        payroll_ids: approvalForm.selected_payrolls,
        rejection_reason: approvalForm.rejection_reason
      };

      const response = await payrollService.rejectPayroll(rejectionData);
      
      toast.success(`Rejected ${response.data.rejected_count} payroll records`);
      setApprovalForm({ selected_payrolls: [], comments: '', rejection_reason: '' });
      setShowRejectionDialog(false);
      loadApprovalQueue();
      
    } catch (error) {
      toast.error('Failed to reject payroll');
      console.error('Reject payroll error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityBadge = (priorityScore) => {
    if (priorityScore >= 100) {
      return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
    } else if (priorityScore >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Low Priority</Badge>;
    }
  };

  const getFilteredEmployees = () => {
    if (!batchForm.department_filter) {
      return employees;
    }
    return employees.filter(emp => emp.department_id.toString() === batchForm.department_filter);
  };

  const getSortedPeriods = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return [...payrollPeriods].sort((a, b) => {
      const aDate = new Date(a.start_date);
      const bDate = new Date(b.start_date);
      
      // Current month periods first
      const aIsCurrent = aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear;
      const bIsCurrent = bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
      
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;
      
      // Then by date (most recent first)
      return bDate - aDate;
    });
  };

  const handlePeriodStatusChange = async (periodId, newStatus) => {
    try {
      setLoading(true);
      
      await payrollService.updatePayrollPeriodStatus(periodId, newStatus, statusChangeNotes);
      
      toast.success(`Period status updated to ${newStatus}`);
      setShowStatusDialog(false);
      setSelectedPeriodForStatus(null);
      setStatusChangeNotes('');
      
      // Reload data
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to update period status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPeriod = async (periodId) => {
    try {
      setLoading(true);
      
      await payrollService.openPayrollPeriod(periodId, 'Opened for payroll processing');
      
      toast.success('Period opened for processing');
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to open period: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPeriod = () => {
    return payrollPeriods.find(p => p.id.toString() === batchForm.period_id);
  };

  const renderPeriodStatusInfo = () => {
    const selectedPeriod = getSelectedPeriod();
    if (!selectedPeriod) return null;
    
    const canProcess = payrollService.canProcessPeriod(selectedPeriod.status);
    const statusColor = payrollService.getStatusColor(selectedPeriod.status);
    const statusDescription = payrollService.getStatusDescription(selectedPeriod.status);
    
    return (
      <Alert className={canProcess ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">Period Status:</span>
                <Badge className={statusColor}>
                  {selectedPeriod.status.charAt(0).toUpperCase() + selectedPeriod.status.slice(1)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">{statusDescription}</div>
            </div>
            {!canProcess && (
              <Button
                size="sm"
                onClick={() => handleOpenPeriod(selectedPeriod.id)}
                className="flex items-center gap-2"
              >
                <Unlock className="w-3 h-3" />
                Open Period
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Processing Interface</h1>
          <p className="text-gray-600">Batch processing, validation, and approval workflows</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch-processing" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Batch Processing
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="approval-workflow" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Approval Workflow
          </TabsTrigger>
        </TabsList>

        {/* Batch Processing Tab */}
        <TabsContent value="batch-processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Batch Payroll Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Period Status Information */}
              {renderPeriodStatusInfo()}
              
              {/* Processing Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="period_id">Payroll Period *</Label>
                    <Select
                      value={batchForm.period_id}
                      onValueChange={(value) => setBatchForm(prev => ({ ...prev, period_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payroll period" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSortedPeriods().map((period) => {
                          const currentDate = new Date();
                          const startDate = new Date(period.start_date);
                          const isCurrent = startDate.getMonth() === currentDate.getMonth() && 
                                          startDate.getFullYear() === currentDate.getFullYear();
                          const canProcess = payrollService.canProcessPeriod(period.status);
                          
                          return (
                            <SelectItem key={period.id} value={period.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span>{period.name}</span>
                                  {isCurrent && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${payrollService.getStatusColor(period.status)}`}>
                                    {period.status}
                                  </Badge>
                                  {canProcess ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" title="Ready for processing" />
                                  ) : (
                                    <AlertTriangle className="w-3 h-3 text-yellow-600" title="Not ready for processing" />
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {formErrors.period_id && (
                      <p className="text-sm text-red-600">{formErrors.period_id}</p>
                    )}
                    {formErrors.period_status && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {formErrors.period_status}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="department_filter">Department Filter</Label>
                    <Select
                      value={batchForm.department_filter}
                      onValueChange={(value) => setBatchForm(prev => ({ ...prev, department_filter: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="batch_size">Batch Size</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={batchForm.batch_size}
                      onChange={(e) => setBatchForm(prev => ({ ...prev, batch_size: parseInt(e.target.value) }))}
                    />
                    <small className="text-gray-500">Number of employees to process per batch (1-50)</small>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Processing Options</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={batchForm.skip_validation}
                        onCheckedChange={(checked) => setBatchForm(prev => ({ ...prev, skip_validation: checked }))}
                      />
                      <Label>Skip Validation</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={batchForm.reprocess_existing}
                        onCheckedChange={(checked) => setBatchForm(prev => ({ ...prev, reprocess_existing: checked }))}
                      />
                      <Label>Reprocess Existing Records</Label>
                    </div>
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Processing Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div>Period: {payrollPeriods.find(p => p.id.toString() === batchForm.period_id)?.name || 'Not selected'}</div>
                      <div>Employees: {getFilteredEmployees().length} active employees {batchForm.department_filter ? '(filtered by department)' : ''}</div>
                      <div>Batch Size: {batchForm.batch_size} employees per batch</div>
                      <div>Total Batches: {Math.ceil(getFilteredEmployees().length / batchForm.batch_size)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleValidateBatch}
                  disabled={loading || !batchForm.period_id}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {loading ? 'Validating...' : 'Validate Batch'}
                </Button>
                
                <Button 
                  onClick={handleBatchProcess}
                  disabled={loading || !batchForm.period_id}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Start Batch Processing'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Employees Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Active Employees ({getFilteredEmployees().length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : getFilteredEmployees().length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-primary">{employees.length}</div>
                      <div className="text-sm text-blue-800">Total Active Staff</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{getFilteredEmployees().length}</div>
                      <div className="text-sm text-green-800">Will Be Processed</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">{departments.length}</div>
                      <div className="text-sm text-purple-800">Departments</div>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredEmployees().slice(0, 10).map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <span className="font-mono text-sm">{employee.employee_id}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{employee.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">{employee.email}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              {employee.employment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {getFilteredEmployees().length > 10 && (
                    <div className="text-center py-2 text-sm text-gray-500">
                      Showing 10 of {getFilteredEmployees().length} employees
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Active Employees Found</h3>
                  <p>No active employees match the current filter criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Payroll Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationResults ? (
                <div className="space-y-6">
                  {/* Validation Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-2xl font-bold">{validationResults.total_employees}</div>
                            <div className="text-sm text-gray-600">Total Employees</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold text-green-600">{validationResults.valid_employees}</div>
                            <div className="text-sm text-gray-600">Valid</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">{validationResults.employees_with_warnings}</div>
                            <div className="text-sm text-gray-600">Warnings</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="text-2xl font-bold text-red-600">{validationResults.employees_with_errors}</div>
                            <div className="text-sm text-gray-600">Errors</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Validation Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Validation Details</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issues</TableHead>
                          <TableHead>Warnings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationResults.validation_results.map((result) => (
                          <TableRow key={result.employee_id}>
                            <TableCell>
                              <div className="font-medium">{result.employee_name}</div>
                            </TableCell>
                            <TableCell>{result.department}</TableCell>
                            <TableCell>
                              {result.status === 'valid' ? (
                                <Badge className="bg-green-100 text-green-800">Valid</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Error</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {result.issues.length > 0 && (
                                <ul className="text-sm text-red-600">
                                  {result.issues.map((issue, index) => (
                                    <li key={index}>• {issue}</li>
                                  ))}
                                </ul>
                              )}
                            </TableCell>
                            <TableCell>
                              {result.warnings.length > 0 && (
                                <ul className="text-sm text-yellow-600">
                                  {result.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Processing Recommendation */}
                  <Alert className={validationResults.summary.can_process ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {validationResults.summary.can_process ? (
                        <span className="text-green-800">
                          ✅ Validation passed! You can proceed with batch processing.
                        </span>
                      ) : (
                        <span className="text-red-800">
                          ❌ Validation failed! Please fix {validationResults.summary.total_issues} issues before processing.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Validation Results</h3>
                  <p>Run batch validation to see detailed results here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Workflow Tab */}
        <TabsContent value="approval-workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Approval Queue
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadApprovalQueue}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {approvalQueue.length > 0 ? (
                <div className="space-y-4">
                  {/* Queue Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-2xl font-bold">{approvalQueue.length}</div>
                            <div className="text-sm text-gray-600">Pending Approval</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {approvalQueue.filter(p => p.priority_score >= 100).length}
                            </div>
                            <div className="text-sm text-gray-600">High Priority</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {payrollService.formatCurrency(approvalQueue.reduce((sum, p) => sum + parseFloat(p.net_salary), 0), 'NGN')}
                            </div>
                            <div className="text-sm text-gray-600">Total Amount</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {Math.round(approvalQueue.reduce((sum, p) => sum + p.days_pending, 0) / approvalQueue.length || 0)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Days Pending</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Approval Queue Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setApprovalForm(prev => ({
                                  ...prev,
                                  selected_payrolls: approvalQueue.map(p => p.id)
                                }));
                              } else {
                                setApprovalForm(prev => ({
                                  ...prev,
                                  selected_payrolls: []
                                }));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Days Pending</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvalQueue.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={approvalForm.selected_payrolls.includes(payroll.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setApprovalForm(prev => ({
                                    ...prev,
                                    selected_payrolls: [...prev.selected_payrolls, payroll.id]
                                  }));
                                } else {
                                  setApprovalForm(prev => ({
                                    ...prev,
                                    selected_payrolls: prev.selected_payrolls.filter(id => id !== payroll.id)
                                  }));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payroll.Employee?.User ? 
                                  `${payroll.Employee.User.first_name} ${payroll.Employee.User.last_name}` : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {payroll.Employee?.employee_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{payroll.Employee?.Department?.name}</TableCell>
                          <TableCell>{payroll.PayrollPeriod?.name}</TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {payrollService.formatCurrency(payroll.net_salary, payroll.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(payroll.priority_score)}
                          </TableCell>
                          <TableCell>
                            <span className={payroll.days_pending > 3 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                              {payroll.days_pending} days
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Open payroll details
                                }}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprovePayroll([payroll.id])}
                                className="text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setApprovalForm(prev => ({
                                    ...prev,
                                    selected_payrolls: [payroll.id]
                                  }));
                                  setShowRejectionDialog(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Bulk Actions */}
                  {approvalForm.selected_payrolls.length > 0 && (
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center">
                        {approvalForm.selected_payrolls.length} selected
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleApprovePayroll(approvalForm.selected_payrolls)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectionDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Selected
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
                  <p>All payroll records have been processed and approved.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Results Dialog */}
      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Validation Results</DialogTitle>
          </DialogHeader>
          {validationResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{validationResults.total_employees}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{validationResults.valid_employees}</div>
                  <div className="text-sm text-gray-600">Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{validationResults.employees_with_warnings}</div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{validationResults.employees_with_errors}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
              
              <Alert className={validationResults.summary.can_process ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationResults.summary.can_process ? (
                    <span className="text-green-800">
                      ✅ Validation passed! You can proceed with batch processing.
                    </span>
                  ) : (
                    <span className="text-red-800">
                      ❌ Validation failed! Please fix {validationResults.summary.total_issues} issues before processing.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
                  Close
                </Button>
                {validationResults.summary.can_process && (
                  <Button onClick={() => {
                    setShowValidationDialog(false);
                    handleBatchProcess();
                  }}>
                    Proceed with Processing
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Processing Progress Dialog */}
      <Dialog open={showProcessingDialog} onOpenChange={setShowProcessingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Processing Progress</DialogTitle>
          </DialogHeader>
          {processingProgress && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">{processingProgress.status}</div>
                <Progress value={processingProgress.progress} className="w-full" />
                <div className="text-sm text-gray-500 mt-2">
                  {processingProgress.processed} of {processingProgress.total} processed
                </div>
              </div>
              
              {processingProgress.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Processing Errors</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {processingProgress.errors.map((error, index) => (
                      <li key={index}>• {error.employee_name}: {error.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Actionable Error Handling */}
              {processingProgress.actionable && processingProgress.action === 'open_period' && (
                <Alert className="border-primary-200 bg-primary-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800">
                        The payroll period needs to be opened before processing can continue.
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const selectedPeriod = getSelectedPeriod();
                          if (selectedPeriod) {
                            handleOpenPeriod(selectedPeriod.id);
                            setShowProcessingDialog(false);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Unlock className="w-3 h-3" />
                        Open Period
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {!processingProgress.isProcessing && (
                <div className="flex justify-end gap-2">
                  {processingProgress.actionable && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProcessingDialog(false);
                        // Trigger the appropriate action
                        if (processingProgress.action === 'open_period') {
                          const selectedPeriod = getSelectedPeriod();
                          if (selectedPeriod) {
                            setSelectedPeriodForStatus(selectedPeriod);
                            setShowStatusDialog(true);
                          }
                        }
                      }}
                    >
                      Fix Issue
                    </Button>
                  )}
                  <Button onClick={() => setShowProcessingDialog(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payroll Records</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Rejection Reason *</Label>
              <Textarea
                value={approvalForm.rejection_reason}
                onChange={(e) => setApprovalForm(prev => ({ ...prev, rejection_reason: e.target.value }))}
                placeholder="Please provide a detailed reason for rejection"
                rows={4}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionDialog(false);
                  setApprovalForm(prev => ({ ...prev, rejection_reason: '' }));
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectPayroll}
                disabled={!approvalForm.rejection_reason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Payroll
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Period Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Period Status</DialogTitle>
          </DialogHeader>
          {selectedPeriodForStatus && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Period Information</h4>
                <div className="space-y-1 text-sm">
                  <div>Name: {selectedPeriodForStatus.name}</div>
                  <div>Current Status: 
                    <Badge className={`ml-2 ${payrollService.getStatusColor(selectedPeriodForStatus.status)}`}>
                      {selectedPeriodForStatus.status}
                    </Badge>
                  </div>
                  <div>Description: {payrollService.getStatusDescription(selectedPeriodForStatus.status)}</div>
                </div>
              </div>
              
              <div>
                <Label>Available Status Changes</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {payrollService.getNextValidStatus(selectedPeriodForStatus.status).map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      onClick={() => handlePeriodStatusChange(selectedPeriodForStatus.id, status)}
                      className="flex items-center justify-between p-3 h-auto"
                    >
                      <div className="text-left">
                        <div className="font-medium">
                          Change to: <Badge className={payrollService.getStatusColor(status)}>{status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {payrollService.getStatusDescription(status)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
              
              {payrollService.getNextValidStatus(selectedPeriodForStatus.status).length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No status changes are available for this period in its current state.
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="status_notes">Notes (Optional)</Label>
                <Textarea
                  value={statusChangeNotes}
                  onChange={(e) => setStatusChangeNotes(e.target.value)}
                  placeholder="Add notes about this status change"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusDialog(false);
                    setSelectedPeriodForStatus(null);
                    setStatusChangeNotes('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollProcessingInterface;