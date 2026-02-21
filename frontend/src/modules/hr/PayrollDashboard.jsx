import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Separator
} from '@/components/ui';
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Send,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Settings,
  CreditCard,
  Calculator,
  PieChart,
  Activity,
  Briefcase,
  Building,
  UserCheck,
  Receipt,
  Zap,
  RefreshCw
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import PayrollProcessingInterface from './PayrollProcessingInterface';
import PayrollRecords from './PayrollRecords';
import PayslipGeneration from './PayslipGeneration';
import PayrollAnalytics from './PayrollAnalytics';

const PayrollDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    handleError, 
    handleOperationError, 
    handleValidationError, 
    showSuccess, 
    showWarning,
    withErrorHandling 
  } = useErrorHandler();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    recentPeriods: [],
    pendingApprovals: [],
    analytics: {}
  });
  
  // State for payroll periods
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  
  // Dialog states
  const [showCreatePeriodDialog, setShowCreatePeriodDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  // Form state for creating period
  const [periodFormData, setPeriodFormData] = useState({
    name: '',
    period_type: 'monthly',
    start_date: '',
    end_date: '',
    pay_date: '',
    cutoff_date: '',
    currency: 'NGN',
    exchange_rate: 1.0,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'periods') {
      loadPayrollPeriods();
    } else if (activeTab === 'records') {
      loadPayrollRecords();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        const [summaryResponse, periodsResponse, analyticsResponse] = await Promise.all([
          payrollService.getPayrollSummary(),
          payrollService.getPayrollPeriods({ limit: 10 }),
          payrollService.getPayrollAnalytics({ year: new Date().getFullYear() })
        ]);
        
        // Sort periods to show current month first
        const periods = periodsResponse.data?.periods || [];
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const sortedPeriods = periods.sort((a, b) => {
          const aDate = new Date(a.start_date);
          const bDate = new Date(b.start_date);
          
          // Current month periods first
          const aIsCurrent = aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear;
          const bIsCurrent = bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
          
          if (aIsCurrent && !bIsCurrent) return -1;
          if (!aIsCurrent && bIsCurrent) return 1;
          
          // Then by date (most recent first)
          return bDate - aDate;
        }).slice(0, 5);
        
        setDashboardData({
          summary: summaryResponse.data?.summary || {},
          recentPeriods: sortedPeriods,
          analytics: analyticsResponse.data || {}
        });
      },
      'load dashboard data',
      {
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false)
      }
    );
  };

  const loadPayrollPeriods = async () => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        const response = await payrollService.getPayrollPeriods();
        setPayrollPeriods(response.data?.periods || []);
      },
      'load payroll periods',
      {
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false)
      }
    );
  };

  const loadPayrollRecords = async () => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        const response = await payrollService.getPayrollRecords();
        setPayrollRecords(response.data?.payrolls || []);
      },
      'load payroll records',
      {
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false)
      }
    );
  };

  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    
    await withErrorHandling(
      async () => {
        setLoading(true);
        setFormErrors({});

        // Client-side validation
        const validationErrors = payrollService.validatePayrollPeriod(periodFormData);
        if (validationErrors.length > 0) {
          setFormErrors({ general: validationErrors });
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        await payrollService.createPayrollPeriod(periodFormData);
        
        setShowCreatePeriodDialog(false);
        resetPeriodForm();
        loadPayrollPeriods();
        loadDashboardData();
      },
      'create payroll period',
      {
        successMessage: 'Payroll period created successfully',
        onSuccess: () => setLoading(false),
        onError: (error) => {
          setLoading(false);
          // Handle validation errors from server
          const validationErrors = handleValidationError(error);
          if (validationErrors) {
            setFormErrors(validationErrors);
          }
        }
      }
    );
  };

  const handleProcessPayroll = async (periodId) => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        
        const response = await payrollService.processPayroll({
          period_id: periodId
        });
        
        showSuccess(`Processed payroll for ${response.data.processed_count} employees`);
        
        if (response.data.error_count > 0) {
          showWarning(`${response.data.error_count} employees had processing errors`);
        }
        
        loadPayrollRecords();
        loadDashboardData();
      },
      'process payroll',
      {
        showLoading: true,
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false)
      }
    );
  };

  const handleSubmitToFinance = async (periodId) => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        
        const response = await payrollService.submitToFinance({
          period_id: periodId,
          submitted_by: user.id,
          submission_notes: 'Payroll processed and ready for finance approval'
        });
        
        loadPayrollPeriods();
        loadDashboardData();
      },
      'submit payroll to Finance',
      {
        successMessage: 'Payroll submitted to Finance for approval',
        showLoading: true,
        onSuccess: () => setLoading(false),
        onError: () => setLoading(false)
      }
    );
  };

  const resetPeriodForm = () => {
    setPeriodFormData({
      name: '',
      period_type: 'monthly',
      start_date: '',
      end_date: '',
      pay_date: '',
      cutoff_date: '',
      currency: 'USD',
      exchange_rate: 1.0,
      notes: ''
    });
    setFormErrors({});
  };

  // Auto-generate period for current/next month
  const generateCurrentMonthPeriod = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Check if we're past the 25th of the month, if so, generate for next month
    const targetDate = now.getDate() > 25 ? new Date(currentYear, currentMonth + 1, 1) : now;
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    
    // Generate period dates
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0); // Last day of month
    const payDate = new Date(targetYear, targetMonth + 1, 5); // 5th of next month
    const cutoffDate = new Date(targetYear, targetMonth, 25); // 25th of current month
    
    // Format dates for input fields
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Generate period name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const periodName = `${monthNames[targetMonth]} ${targetYear}`;
    
    // Set form data
    setPeriodFormData({
      name: periodName,
      period_type: 'monthly',
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      pay_date: formatDate(payDate),
      cutoff_date: formatDate(cutoffDate),
      currency: 'USD',
      exchange_rate: 1.0,
      notes: `Auto-generated period for ${periodName}`
    });
    
    // Open the create dialog
    setShowCreatePeriodDialog(true);
  };

  const handleAutoGeneratePeriod = async () => {
    await withErrorHandling(
      async () => {
        setLoading(true);
        
        // Check if current month period already exists
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Check if we're past the 25th of the month, if so, check for next month
        const targetDate = now.getDate() > 25 ? new Date(currentYear, currentMonth + 1, 1) : now;
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        
        const existingPeriod = payrollPeriods.find(period => {
          const periodDate = new Date(period.start_date);
          return periodDate.getMonth() === targetMonth && periodDate.getFullYear() === targetYear;
        });
        
        if (existingPeriod) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          throw new Error(`Payroll period for ${monthNames[targetMonth]} ${targetYear} already exists`);
        }
        
        // Generate period data
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0);
        const payDate = new Date(targetYear, targetMonth + 1, 5);
        const cutoffDate = new Date(targetYear, targetMonth, 25);
        
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };
        
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const periodName = `${monthNames[targetMonth]} ${targetYear}`;
        
        const periodData = {
          name: periodName,
          period_type: 'monthly',
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          pay_date: formatDate(payDate),
          cutoff_date: formatDate(cutoffDate),
          currency: 'NGN',
          exchange_rate: 1.0,
          notes: `Auto-generated period for ${periodName}`
        };
        
        // Validate the period data
        const validationErrors = payrollService.validatePayrollPeriod(periodData);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        // Create the period
        await payrollService.createPayrollPeriod(periodData);
        
        loadPayrollPeriods();
        loadDashboardData();
        
        return { periodName };
      },
      'auto-generate payroll period',
      {
        showLoading: true,
        onSuccess: (result) => {
          setLoading(false);
          showSuccess(`Auto-generated payroll period for ${result.periodName}`);
        },
        onError: () => setLoading(false)
      }
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      open: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: Activity },
      hr_approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      submitted_to_finance: { color: 'bg-orange-100 text-orange-800', icon: Send },
      finance_approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      paid: { color: 'bg-purple-100 text-purple-800', icon: CreditCard },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Processing System</h1>
          <p className="text-gray-600">Advanced payroll management with automated calculations and compliance</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Reports
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="periods" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Periods
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Records
          </TabsTrigger>
          <TabsTrigger value="payslips" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Payslips
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Period Generation Alert */}
          {(() => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            // Check if we're past the 25th of the month, if so, check for next month
            const targetDate = now.getDate() > 25 ? new Date(currentYear, currentMonth + 1, 1) : now;
            const targetMonth = targetDate.getMonth();
            const targetYear = targetDate.getFullYear();
            
            const existingPeriod = dashboardData.recentPeriods.find(period => {
              const periodDate = new Date(period.start_date);
              return periodDate.getMonth() === targetMonth && periodDate.getFullYear() === targetYear;
            });
            
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            if (!existingPeriod) {
              return (
                <Alert className="border-primary-200 bg-primary-50">
                  <Zap className="h-4 w-4 text-primary" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <strong className="text-blue-800">Period Generation Needed:</strong>
                      <span className="text-primary-700 ml-2">
                        No payroll period found for {monthNames[targetMonth]} {targetYear}. 
                        {now.getDate() > 25 ? 'Generate next month\'s period now.' : 'Generate current month\'s period now.'}
                      </span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-300 text-primary-700 hover:bg-blue-100"
                        onClick={handleAutoGeneratePeriod}
                        disabled={loading}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-Generate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-blue-300 text-primary-700 hover:bg-blue-100"
                        onClick={() => setActiveTab('periods')}
                      >
                        Go to Periods
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Payroll This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {payrollService.formatCurrency(dashboardData.summary?.total_payroll || 0)}
                </div>
                <p className="text-xs text-gray-500">
                  {dashboardData.summary?.employees_paid || 0} employees paid
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {dashboardData.summary?.active_employees || 0}
                </div>
                <p className="text-xs text-gray-500">
                  {dashboardData.summary?.new_employees || 0} new this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {dashboardData.summary?.pending_approvals || 0}
                </div>
                <p className="text-xs text-gray-500">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardData.summary?.avg_processing_time || '2.5'}h
                </div>
                <p className="text-xs text-gray-500">
                  Average processing time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('periods')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Manage Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create and manage payroll periods</p>
                <Button className="w-full">
                  Manage Periods
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('processing')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Process Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Run payroll calculations and processing</p>
                <Button className="w-full">
                  Process Payroll
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('payslips')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Generate Payslips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Create and distribute payslips</p>
                <Button className="w-full">
                  Generate Payslips
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/salary-management')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Salary Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage employee salary components</p>
                <Button className="w-full">
                  Manage Salaries
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/tax-configuration')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Tax Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure tax rules and compliance</p>
                <Button className="w-full">
                  Configure Taxes
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('analytics')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">View payroll analytics and reports</p>
                <Button className="w-full">
                  View Reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payroll Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentPeriods.map((period) => {
                    const currentDate = new Date();
                    const startDate = new Date(period.start_date);
                    const isCurrent = startDate.getMonth() === currentDate.getMonth() && 
                                    startDate.getFullYear() === currentDate.getFullYear();
                    
                    return (
                      <div key={period.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrent ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-primary">
                              {payrollService.formatPeriodMonth(period)}
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payrollService.formatPeriodDateRange(period)} • {period.period_type.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            Pay Date: {new Date(period.pay_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(period.status)}
                        </div>
                      </div>
                    );
                  })}
                  {dashboardData.recentPeriods.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No recent payroll periods
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Gross Pay</span>
                    <span className="font-semibold">
                      {payrollService.formatCurrency(dashboardData.summary?.total_gross || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Deductions</span>
                    <span className="font-semibold text-red-600">
                      {payrollService.formatCurrency(dashboardData.summary?.total_deductions || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Taxes</span>
                    <span className="font-semibold text-red-600">
                      {payrollService.formatCurrency(dashboardData.summary?.total_taxes || 0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Net Pay</span>
                    <span className="font-bold text-green-600">
                      {payrollService.formatCurrency(dashboardData.summary?.total_net || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Periods Tab */}
        <TabsContent value="periods" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payroll Periods</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleAutoGeneratePeriod}
                    disabled={loading}
                  >
                    <Zap className="w-4 h-4" />
                    Auto-Generate Current Month
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={generateCurrentMonthPeriod}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Quick Generate
                  </Button>
                  <Dialog open={showCreatePeriodDialog} onOpenChange={setShowCreatePeriodDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Period
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Payroll Period</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreatePeriod} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Period Name *</Label>
                          <Input
                            value={periodFormData.name}
                            onChange={(e) => setPeriodFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., January 2024"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="period_type">Period Type *</Label>
                          <Select
                            value={periodFormData.period_type}
                            onValueChange={(value) => setPeriodFormData(prev => ({ ...prev, period_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="start_date">Start Date *</Label>
                          <Input
                            type="date"
                            value={periodFormData.start_date}
                            onChange={(e) => setPeriodFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="end_date">End Date *</Label>
                          <Input
                            type="date"
                            value={periodFormData.end_date}
                            onChange={(e) => setPeriodFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pay_date">Pay Date *</Label>
                          <Input
                            type="date"
                            value={periodFormData.pay_date}
                            onChange={(e) => setPeriodFormData(prev => ({ ...prev, pay_date: e.target.value }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cutoff_date">Cutoff Date</Label>
                          <Input
                            type="date"
                            value={periodFormData.cutoff_date}
                            onChange={(e) => setPeriodFormData(prev => ({ ...prev, cutoff_date: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          value={periodFormData.notes}
                          onChange={(e) => setPeriodFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes for this period"
                          rows={3}
                        />
                      </div>

                      {/* Form Errors */}
                      {Object.keys(formErrors).length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <ul className="list-disc list-inside">
                              {Object.entries(formErrors).map(([field, errors]) => (
                                Array.isArray(errors) ? errors.map((error, index) => (
                                  <li key={`${field}-${index}`}>{error}</li>
                                )) : <li key={field}>{errors}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCreatePeriodDialog(false);
                            resetPeriodForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Period'}
                        </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period Name</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Pay Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollPeriods.map((period) => (
                      <TableRow key={period.id}>
                        <TableCell>
                          <div className="font-medium">{period.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-primary">
                            {payrollService.formatPeriodMonth(period)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {period.period_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {payrollService.formatPeriodDateRange(period)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(period.pay_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(period.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(period.processed_employees / period.total_employees) * 100} 
                              className="w-16" 
                            />
                            <span className="text-sm text-gray-500">
                              {period.processed_employees}/{period.total_employees}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPeriod(period);
                                // Open details dialog
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {period.status === 'open' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleProcessPayroll(period.id)}
                                className="text-primary hover:text-primary-700"
                                title="Process Payroll"
                              >
                                <Calculator className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {period.status === 'hr_approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSubmitToFinance(period.id)}
                                className="text-green-600 hover:text-green-700"
                                title="Submit to Finance"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-4">
          <PayrollProcessingInterface />
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <PayrollRecords />
        </TabsContent>

        <TabsContent value="payslips" className="space-y-4">
          <PayslipGeneration />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <PayrollAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollDashboard;