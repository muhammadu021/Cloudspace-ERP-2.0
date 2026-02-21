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
  FileText,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
  History,
  GitCompare,
  Calculator
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PayrollRecords = () => {
  // Fixed Compare icon import issue
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all-records');
  
  // State for records
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [historySummary, setHistorySummary] = useState({});
  const [comparisonData, setComparisonData] = useState(null);
  const [analytics, setAnalytics] = useState({});
  
  // Dialog states
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form states
  const [filters, setFilters] = useState({
    period_id: '',
    employee_id: '',
    department_id: '',
    status: '',
    year: new Date().getFullYear().toString(),
    page: 1,
    limit: 10
  });

  const [historyFilters, setHistoryFilters] = useState({
    year: '',
    status: '',
    period_type: '',
    page: 1,
    limit: 10
  });

  const [comparisonForm, setComparisonForm] = useState({
    employee_id: '',
    selected_periods: []
  });

  const [editForm, setEditForm] = useState({
    basic_salary: '',
    gross_salary: '',
    net_salary: '',
    total_deductions: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPayrollRecords();
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [periodsResponse] = await Promise.all([
        payrollService.getPayrollPeriods({ limit: 50 })
      ]);
      
      setPayrollPeriods(periodsResponse.data?.periods || []);
      
      // Mock employees and departments data
      setEmployees([
        { id: 1, name: 'John Doe', employee_id: 'EMP001', department_id: 1, department: 'Engineering' },
        { id: 2, name: 'Jane Smith', employee_id: 'EMP002', department_id: 2, department: 'Marketing' },
        { id: 3, name: 'Mike Johnson', employee_id: 'EMP003', department_id: 3, department: 'Sales' },
        { id: 4, name: 'Sarah Wilson', employee_id: 'EMP004', department_id: 1, department: 'Engineering' },
        { id: 5, name: 'David Brown', employee_id: 'EMP005', department_id: 4, department: 'HR' }
      ]);
      
      setDepartments([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Marketing' },
        { id: 3, name: 'Sales' },
        { id: 4, name: 'HR' },
        { id: 5, name: 'Finance' }
      ]);
    } catch (error) {
      toast.error('Failed to load initial data');
      console.error('Load initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollRecords = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrollRecords(filters);
      setPayrollRecords(response.data?.payrolls || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load payroll records');
      console.error('Load payroll records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeHistory = async (employeeId) => {
    try {
      setLoading(true);
      const response = await payrollService.getEmployeePayrollHistory(employeeId, historyFilters);
      setEmployeeHistory(response.data?.payrolls || []);
      setHistorySummary(response.data?.summary || {});
      setPagination(response.data?.pagination || {});
    } catch (error) {
      toast.error('Failed to load employee payroll history');
      console.error('Load employee history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsFilters = {
        year: filters.year,
        department_id: filters.department_id,
        employee_id: filters.employee_id
      };
      const response = await payrollService.getPayrollAnalytics(analyticsFilters);
      setAnalytics(response.data?.analytics || {});
    } catch (error) {
      toast.error('Failed to load payroll analytics');
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (recordId) => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrollRecord(recordId);
      setSelectedRecord(response.data?.payroll);
      setShowRecordDialog(true);
    } catch (error) {
      toast.error('Failed to load payroll record');
      console.error('View record error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setEditForm({
      basic_salary: record.basic_salary || '',
      gross_salary: record.gross_salary || '',
      net_salary: record.net_salary || '',
      total_deductions: record.total_deductions || '',
      notes: record.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      await payrollService.updatePayrollRecord(selectedRecord.id, editForm);
      
      toast.success('Payroll record updated successfully');
      setShowEditDialog(false);
      setSelectedRecord(null);
      setEditForm({
        basic_salary: '',
        gross_salary: '',
        net_salary: '',
        total_deductions: '',
        notes: ''
      });
      loadPayrollRecords();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update payroll record';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this payroll record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await payrollService.deletePayrollRecord(recordId);
      
      toast.success('Payroll record deleted successfully');
      loadPayrollRecords();
      
    } catch (error) {
      toast.error('Failed to delete payroll record');
      console.error('Delete record error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployeeHistory = (employee) => {
    setSelectedEmployee(employee);
    setHistoryFilters(prev => ({ ...prev, page: 1 }));
    loadEmployeeHistory(employee.id);
    setShowHistoryDialog(true);
  };

  const handleComparePayrolls = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      if (!comparisonForm.employee_id || comparisonForm.selected_periods.length < 2) {
        setFormErrors({ 
          comparison: 'Please select an employee and at least 2 periods for comparison' 
        });
        return;
      }

      const response = await payrollService.getPayrollComparison(
        comparisonForm.employee_id, 
        comparisonForm.selected_periods
      );
      
      setComparisonData(response.data?.comparison);
      setShowComparisonDialog(true);
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to load payroll comparison';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
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

  const formatTrend = (value) => {
    const isPositive = value > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Records</h1>
          <p className="text-gray-600">Individual employee payroll records and history</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Records
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowComparisonDialog(true)}
          >
            <GitCompare className="w-4 h-4" />
            Compare Payrolls
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-records" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            All Records
          </TabsTrigger>
          <TabsTrigger value="employee-history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Employee History
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* All Records Tab */}
        <TabsContent value="all-records" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="filter_period">Payroll Period</Label>
                  <Select
                    value={filters.period_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, period_id: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Periods</SelectItem>
                      {payrollPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_employee">Employee</Label>
                  <Select
                    value={filters.employee_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, employee_id: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} ({employee.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_department">Department</Label>
                  <Select
                    value={filters.department_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_year">Year</Label>
                  <Select
                    value={filters.year}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, year: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Payroll Records
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPayrollRecords}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {record.Employee?.User ? 
                                  `${record.Employee.User.first_name} ${record.Employee.User.last_name}` : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.Employee?.employee_id} • {record.Employee?.Department?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{record.PayrollPeriod?.name}</div>
                              <div className="text-sm text-gray-500">
                                {record.PayrollPeriod?.period_type?.replace('_', ' ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {payrollService.formatCurrency(record.basic_salary, record.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {payrollService.formatCurrency(record.gross_salary, record.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-red-600">
                              {payrollService.formatCurrency(record.total_deductions, record.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">
                              {payrollService.formatCurrency(record.net_salary, record.currency)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewRecord(record.id)}
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {['draft', 'rejected'].includes(record.status) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                  title="Edit Record"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {record.status === 'draft' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEmployeeHistory(record.Employee)}
                                title="View History"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                        {pagination.totalItems} records
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.currentPage <= 1}
                          onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pagination.currentPage >= pagination.totalPages}
                          onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee History Tab */}
        <TabsContent value="employee-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Select an Employee</h3>
                <p>Choose an employee from the records table to view their payroll history.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="comparison_employee">Employee</Label>
                    <Select
                      value={comparisonForm.employee_id}
                      onValueChange={(value) => setComparisonForm(prev => ({ ...prev, employee_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id.toString()}>
                            {employee.name} ({employee.employee_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="comparison_periods">Periods (Select multiple)</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!comparisonForm.selected_periods.includes(value)) {
                          setComparisonForm(prev => ({
                            ...prev,
                            selected_periods: [...prev.selected_periods, value]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add periods to compare" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollPeriods.map((period) => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Periods */}
                {comparisonForm.selected_periods.length > 0 && (
                  <div>
                    <Label>Selected Periods:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {comparisonForm.selected_periods.map((periodId) => {
                        const period = payrollPeriods.find(p => p.id.toString() === periodId);
                        return (
                          <Badge key={periodId} variant="outline" className="flex items-center gap-1">
                            {period?.name}
                            <button
                              onClick={() => setComparisonForm(prev => ({
                                ...prev,
                                selected_periods: prev.selected_periods.filter(id => id !== periodId)
                              }))}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

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

                <Button 
                  onClick={handleComparePayrolls}
                  disabled={loading || !comparisonForm.employee_id || comparisonForm.selected_periods.length < 2}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4" />
                  {loading ? 'Comparing...' : 'Compare Payrolls'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : analytics.overview ? (
                <div className="space-y-6">
                  {/* Overview Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-2xl font-bold">{analytics.overview.total_records}</div>
                            <div className="text-sm text-gray-600">Total Records</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {payrollService.formatCurrency(analytics.overview.avg_gross)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Gross Salary</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {payrollService.formatCurrency(analytics.overview.avg_net)}
                            </div>
                            <div className="text-sm text-gray-600">Avg Net Salary</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-5 h-5 text-orange-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {payrollService.formatCurrency(analytics.overview.total_gross)}
                            </div>
                            <div className="text-sm text-gray-600">Total Gross</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(analytics.status_distribution || {}).map(([status, count]) => (
                          <div key={status} className="text-center">
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-gray-600 capitalize">
                              {status.replace('_', ' ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Earners */}
                  {analytics.top_earners && analytics.top_earners.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Earners</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Employee</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Total Gross</TableHead>
                              <TableHead>Total Net</TableHead>
                              <TableHead>Records</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.top_earners.slice(0, 5).map((earner, index) => (
                              <TableRow key={earner.employee_id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">#{index + 1}</Badge>
                                    <span className="font-medium">{earner.employee_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{earner.department}</TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {payrollService.formatCurrency(earner.total_gross)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">
                                    {payrollService.formatCurrency(earner.total_net)}
                                  </span>
                                </TableCell>
                                <TableCell>{earner.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
                  <p>No payroll data available for the selected filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Details Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Name: </span>
                      {selectedRecord.Employee?.User ? 
                        `${selectedRecord.Employee.User.first_name} ${selectedRecord.Employee.User.last_name}` : 
                        'N/A'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Employee ID: </span>
                      {selectedRecord.Employee?.employee_id}
                    </div>
                    <div>
                      <span className="font-medium">Department: </span>
                      {selectedRecord.Employee?.Department?.name}
                    </div>
                    <div>
                      <span className="font-medium">Email: </span>
                      {selectedRecord.Employee?.User?.email}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Period Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Period: </span>
                      {selectedRecord.PayrollPeriod?.name}
                    </div>
                    <div>
                      <span className="font-medium">Type: </span>
                      {selectedRecord.PayrollPeriod?.period_type?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Pay Date: </span>
                      {new Date(selectedRecord.pay_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Status: </span>
                      {getStatusBadge(selectedRecord.status)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Salary Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Salary Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-3">Earnings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Basic Salary:</span>
                          <span className="font-medium">
                            {payrollService.formatCurrency(selectedRecord.basic_salary, selectedRecord.currency)}
                          </span>
                        </div>
                        {selectedRecord.allowances && Object.entries(selectedRecord.allowances).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">
                              {payrollService.formatCurrency(value, selectedRecord.currency)}
                            </span>
                          </div>
                        ))}
                        {selectedRecord.overtime_amount > 0 && (
                          <div className="flex justify-between">
                            <span>Overtime:</span>
                            <span className="font-medium">
                              {payrollService.formatCurrency(selectedRecord.overtime_amount, selectedRecord.currency)}
                            </span>
                          </div>
                        )}
                        {selectedRecord.bonus > 0 && (
                          <div className="flex justify-between">
                            <span>Bonus:</span>
                            <span className="font-medium">
                              {payrollService.formatCurrency(selectedRecord.bonus, selectedRecord.currency)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Gross Salary:</span>
                          <span className="text-green-600">
                            {payrollService.formatCurrency(selectedRecord.gross_salary, selectedRecord.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-600 mb-3">Deductions</h4>
                      <div className="space-y-2">
                        {selectedRecord.tax_deductions && Object.entries(selectedRecord.tax_deductions).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">
                              {payrollService.formatCurrency(value, selectedRecord.currency)}
                            </span>
                          </div>
                        ))}
                        {selectedRecord.other_deductions && Object.entries(selectedRecord.other_deductions).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">
                              {payrollService.formatCurrency(value, selectedRecord.currency)}
                            </span>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total Deductions:</span>
                          <span className="text-red-600">
                            {payrollService.formatCurrency(selectedRecord.total_deductions, selectedRecord.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-primary mb-3">Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Worked Days:</span>
                          <span className="font-medium">{selectedRecord.worked_days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Leave Days:</span>
                          <span className="font-medium">{selectedRecord.leave_days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overtime Hours:</span>
                          <span className="font-medium">{selectedRecord.overtime_hours}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Net Salary:</span>
                          <span className="text-primary">
                            {payrollService.formatCurrency(selectedRecord.net_salary, selectedRecord.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Processed By: </span>
                      {selectedRecord.ProcessedBy?.User ? 
                        `${selectedRecord.ProcessedBy.User.first_name} ${selectedRecord.ProcessedBy.User.last_name}` : 
                        'N/A'
                      }
                    </div>
                    <div>
                      <span className="font-medium">Processed Date: </span>
                      {new Date(selectedRecord.created_at).toLocaleDateString()}
                    </div>
                    {selectedRecord.ApprovedBy && (
                      <>
                        <div>
                          <span className="font-medium">Approved By: </span>
                          {`${selectedRecord.ApprovedBy.User.first_name} ${selectedRecord.ApprovedBy.User.last_name}`}
                        </div>
                        <div>
                          <span className="font-medium">Approved Date: </span>
                          {new Date(selectedRecord.approved_at).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                  {selectedRecord.notes && (
                    <div className="mt-4">
                      <span className="font-medium">Notes: </span>
                      <p className="mt-1 text-gray-600">{selectedRecord.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payroll Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basic_salary">Basic Salary</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.basic_salary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, basic_salary: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="gross_salary">Gross Salary</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.gross_salary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gross_salary: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_deductions">Total Deductions</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.total_deductions}
                  onChange={(e) => setEditForm(prev => ({ ...prev, total_deductions: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="net_salary">Net Salary</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.net_salary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, net_salary: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
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
                  setShowEditDialog(false);
                  setSelectedRecord(null);
                  setEditForm({
                    basic_salary: '',
                    gross_salary: '',
                    net_salary: '',
                    total_deductions: '',
                    notes: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Record'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payroll History - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{historySummary.total_records || 0}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {payrollService.formatCurrency(historySummary.avg_gross || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Gross</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {payrollService.formatCurrency(historySummary.avg_net || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Net</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">
                      {payrollService.formatCurrency(historySummary.total_net || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                  </CardContent>
                </Card>
              </div>

              {/* History Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.PayrollPeriod?.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(record.pay_date).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payrollService.formatCurrency(record.basic_salary, record.currency)}
                      </TableCell>
                      <TableCell>
                        {payrollService.formatCurrency(record.gross_salary, record.currency)}
                      </TableCell>
                      <TableCell>
                        {payrollService.formatCurrency(record.total_deductions, record.currency)}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {payrollService.formatCurrency(record.net_salary, record.currency)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRecord(record.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll Comparison</DialogTitle>
          </DialogHeader>
          {comparisonData ? (
            <div className="space-y-6">
              {/* Employee Info */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-lg font-semibold">
                    {comparisonData.employee?.User ? 
                      `${comparisonData.employee.User.first_name} ${comparisonData.employee.User.last_name}` : 
                      'N/A'
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    Comparing {comparisonData.periods?.length} payroll periods
                  </div>
                </CardContent>
              </Card>

              {/* Trends */}
              {comparisonData.periods?.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Gross Salary</div>
                        {formatTrend(comparisonData.trends?.gross_salary_change || 0)}
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Net Salary</div>
                        {formatTrend(comparisonData.trends?.net_salary_change || 0)}
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">Deductions</div>
                        {formatTrend(comparisonData.trends?.deductions_change || 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Period Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Basic Salary</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Worked Days</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.periods?.map((period, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{period.period?.name}</div>
                              <div className="text-sm text-gray-500">
                                {period.period?.period_type?.replace('_', ' ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payrollService.formatCurrency(period.basic_salary)}
                          </TableCell>
                          <TableCell>
                            {payrollService.formatCurrency(period.gross_salary)}
                          </TableCell>
                          <TableCell>
                            {payrollService.formatCurrency(period.total_deductions)}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold">
                              {payrollService.formatCurrency(period.net_salary)}
                            </span>
                          </TableCell>
                          <TableCell>{period.worked_days}</TableCell>
                          <TableCell>
                            {getStatusBadge(period.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comparison_employee">Employee</Label>
                  <Select
                    value={comparisonForm.employee_id}
                    onValueChange={(value) => setComparisonForm(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} ({employee.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="comparison_periods">Periods (Select multiple)</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!comparisonForm.selected_periods.includes(value)) {
                        setComparisonForm(prev => ({
                          ...prev,
                          selected_periods: [...prev.selected_periods, value]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add periods to compare" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Periods */}
              {comparisonForm.selected_periods.length > 0 && (
                <div>
                  <Label>Selected Periods:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {comparisonForm.selected_periods.map((periodId) => {
                      const period = payrollPeriods.find(p => p.id.toString() === periodId);
                      return (
                        <Badge key={periodId} variant="outline" className="flex items-center gap-1">
                          {period?.name}
                          <button
                            onClick={() => setComparisonForm(prev => ({
                              ...prev,
                              selected_periods: prev.selected_periods.filter(id => id !== periodId)
                            }))}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

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

                <Button 
                onClick={handleComparePayrolls}
                disabled={loading || !comparisonForm.employee_id || comparisonForm.selected_periods.length < 2}
                className="flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                {loading ? 'Comparing...' : 'Compare Payrolls'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollRecords;