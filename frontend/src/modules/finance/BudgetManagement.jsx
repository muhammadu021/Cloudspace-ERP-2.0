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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Banknote,
  FileText,
  Download,
  PieChart
} from 'lucide-react';
import {financeService} from '../../services/financeService';
import {projectService} from '../../services/projectService';
import {departmentService} from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { hrService } from '../../services/hrService';

const BudgetManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('budgets');
  
  // Budget Details state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailBudget, setDetailBudget] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Budget Items state
  const [showItemsDialog, setShowItemsDialog] = useState(false);
  const [budgetItems, setBudgetItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', description: '', category: '', quantity: 1, unit_price: '' });
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [budgetForm, setBudgetForm] = useState({
    name: '',
    type: 'monthly',
    period_start: '',
    period_end: '',
    project_id: '',
    department_id: '',
    account_id: '',
    budgeted_amount: '',
    description: '',
    breakdown: []
  });

  const [breakdownItem, setBreakdownItem] = useState({ category: '', amount: '', description: '' });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    department_id: '',
    project_id: '',
    start_date: '',
    end_date: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [accountsResponse, budgetsResponse, departmentsResponse, projectsResponse] = await Promise.all([
        financeService.getAccounts({ is_active: true }),
        financeService.getBudgets(),
        hrService.getDepartments(),
        projectService.getProjects()
      ]);
      
      setAccounts(accountsResponse?.data?.data?.accounts || []);
      setBudgets(budgetsResponse?.data?.data?.budgets || []);
      setDepartments(departmentsResponse?.data?.data?.departments || []);
      setProjects(projectsResponse?.data?.data?.projects || []);
    } catch (error) {
      toast.error('Failed to load initial data');
      console.error('Load initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoading(true);
      
      // Clean up filters - remove empty strings to avoid validation errors
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await financeService.getBudgets(cleanedFilters);
      setBudgets(response?.data?.data?.budgets || []);
    } catch (error) {
      toast.error('Failed to load budgets');
      console.error('Load budgets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setIsEditing(false);
    setBudgetForm({
      name: '',
      type: 'monthly',
      period_start: '',
      period_end: '',
      project_id: '',
      department_id: '',
      account_id: '',
      budgeted_amount: '',
      description: '',
      breakdown: []
    });
    setBreakdownItem({ category: '', amount: '', description: '' });
    setFormErrors({});
    setShowBudgetDialog(true);
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setIsEditing(true);
    // Convert items back to breakdown format for editing
    const existingBreakdown = (budget.items || []).map(item => ({
      id: item.id,
      category: item.category || item.name,
      amount: item.unit_price,
      description: item.description || ''
    }));
    setBudgetForm({
      name: budget.name || '',
      type: budget.type || 'monthly',
      period_start: budget.period_start ? budget.period_start.split('T')[0] : '',
      period_end: budget.period_end ? budget.period_end.split('T')[0] : '',
      project_id: budget.project_id || '',
      department_id: budget.department_id || '',
      account_id: budget.account_id || '',
      budgeted_amount: budget.budgeted_amount || '',
      description: budget.description || '',
      breakdown: existingBreakdown
    });
    setFormErrors({});
    setShowBudgetDialog(true);
  };

  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      console.log('Submitting budget with breakdown:', budgetForm.breakdown);

      if (isEditing) {
        await financeService.updateBudget(selectedBudget.id, budgetForm);
        toast.success('Budget updated successfully');
      } else {
        await financeService.createBudget(budgetForm);
        toast.success('Budget created successfully');
      }
      
      setShowBudgetDialog(false);
      loadBudgets();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save budget';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await financeService.deleteBudget(budgetId);
      toast.success('Budget deleted successfully');
      loadBudgets();
    } catch (error) {
      toast.error('Failed to delete budget');
      console.error('Delete budget error:', error);
    } finally {
      setLoading(false);
    }
  };

  // View Budget Details handler
  const handleViewDetails = async (budget) => {
    setLoadingDetails(true);
    setShowDetailsDialog(true);
    try {
      const response = await financeService.getBudgetById(budget.id);
      const fullBudget = response?.data?.data?.budget;
      console.log('Budget details response:', fullBudget);
      console.log('Budget items:', fullBudget?.items);
      setDetailBudget(fullBudget || budget);
      setDetailItems(fullBudget?.items || []);
    } catch (error) {
      console.error('Error fetching budget details:', error);
      setDetailBudget(budget);
      setDetailItems([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Budget Items handlers
  const handleViewItems = async (budget) => {
    setSelectedBudget(budget);
    try {
      const response = await financeService.getBudgetItems(budget.id);
      setBudgetItems(response?.data?.data?.items || []);
    } catch (error) {
      setBudgetItems([]);
    }
    setShowItemsDialog(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemForm({ name: '', description: '', category: '', quantity: 1, unit_price: '' });
    setShowItemForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({ name: item.name, description: item.description || '', category: item.category || '', quantity: item.quantity, unit_price: item.unit_price });
    setShowItemForm(true);
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        await financeService.updateBudgetItem(editingItem.id, itemForm);
        toast.success('Item updated');
      } else {
        await financeService.createBudgetItem(selectedBudget.id, itemForm);
        toast.success('Item added');
      }
      setShowItemForm(false);
      handleViewItems(selectedBudget);
      loadBudgets();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    try {
      await financeService.deleteBudgetItem(itemId);
      toast.success('Item deleted');
      handleViewItems(selectedBudget);
      loadBudgets();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const calculateBudgetProgress = (budget) => {
    // Calculate progress based on actual vs budgeted amounts
    const budgetedAmount = parseFloat(budget.budgeted_amount) || 0;
    const actualAmount = parseFloat(budget.actual_amount) || 0;
    const percentage = budgetedAmount > 0 ? (actualAmount / budgetedAmount) * 100 : 0;
    
    return {
      spent: actualAmount,
      percentage: Math.min(percentage, 100),
      remaining: budgetedAmount - actualAmount,
      status: percentage > 100 ? 'over' : percentage > 90 ? 'warning' : 'good'
    };
  };

  const getBudgetStatusColor = (status) => {
    const colors = {
      good: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      over: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.good;
  };

  const budgetTypes = [
    { value: 'annual', label: 'Annual' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'project', label: 'Project' },
    { value: 'department', label: 'Department' }
  ];

  const exportBudgetReport = (format) => {
    const reportData = budgets.map(b => {
      const progress = calculateBudgetProgress(b);
      return {
        name: b.name,
        type: b.type,
        department: b.Department?.name || '-',
        project: b.Project?.name || '-',
        period: `${new Date(b.period_start).toLocaleDateString()} - ${new Date(b.period_end).toLocaleDateString()}`,
        budgeted: parseFloat(b.budgeted_amount) || 0,
        actual: progress.spent,
        variance: progress.remaining,
        utilization: progress.percentage.toFixed(1) + '%',
        status: progress.status
      };
    });

    if (format === 'csv') {
      const headers = ['Name', 'Type', 'Department', 'Project', 'Period', 'Budgeted', 'Actual', 'Variance', 'Utilization', 'Status'];
      const csv = [headers.join(','), ...reportData.map(r => 
        [r.name, r.type, r.department, r.project, r.period, r.budgeted, r.actual, r.variance, r.utilization, r.status].join(',')
      )].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      toast.success('Report exported');
    }
  };

  const getReportSummary = () => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + (parseFloat(b.budgeted_amount) || 0), 0);
    const totalActual = budgets.reduce((sum, b) => sum + (parseFloat(b.actual_amount) || 0), 0);
    const byType = budgetTypes.map(t => ({
      type: t.label,
      count: budgets.filter(b => b.type === t.value).length,
      budgeted: budgets.filter(b => b.type === t.value).reduce((sum, b) => sum + (parseFloat(b.budgeted_amount) || 0), 0),
      actual: budgets.filter(b => b.type === t.value).reduce((sum, b) => sum + (parseFloat(b.actual_amount) || 0), 0)
    })).filter(t => t.count > 0);
    const byDepartment = departments.map(d => ({
      name: d.name,
      count: budgets.filter(b => b.department_id === d.id).length,
      budgeted: budgets.filter(b => b.department_id === d.id).reduce((sum, b) => sum + (parseFloat(b.budgeted_amount) || 0), 0),
      actual: budgets.filter(b => b.department_id === d.id).reduce((sum, b) => sum + (parseFloat(b.actual_amount) || 0), 0)
    })).filter(d => d.count > 0);
    const overBudget = budgets.filter(b => calculateBudgetProgress(b).status === 'over');
    const warningBudget = budgets.filter(b => calculateBudgetProgress(b).status === 'warning');

    return { totalBudgeted, totalActual, byType, byDepartment, overBudget, warningBudget };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600">Plan and track budgets across departments and projects</p>
        </div>
        
        <Button onClick={handleCreateBudget} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Budget
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budgets</p>
                <p className="text-2xl font-bold text-primary">{budgets.length}</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
                <p className="text-2xl font-bold text-green-600">
                  {financeService.formatCurrency(
                    budgets.reduce((sum, budget) => sum + parseFloat(budget.budgeted_amount || 0), 0)
                  )}
                </p>
              </div>
              <Banknote className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                <p className="text-2xl font-bold text-purple-600">
                  {budgets.filter(b => b.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Over Budget</p>
                <p className="text-2xl font-bold text-red-600">
                  {budgets.filter(b => {
                    const progress = calculateBudgetProgress(b);
                    return progress.status === 'over';
                  }).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Budgets
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          {/* Filters */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search budgets..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Budget Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {budgetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={filters.department_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
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
              <Label htmlFor="project">Project</Label>
              <Select
                value={filters.project_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  type: '',
                  status: '',
                  department_id: '',
                  project_id: '',
                  start_date: '',
                  end_date: ''
                })}
                className="flex items-center gap-2"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets ({budgets.length})</CardTitle>
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
                  <TableHead>Budget Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Budgeted Amount</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  const progress = calculateBudgetProgress(budget);
                  return (
                    <TableRow key={budget.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{budget.name}</p>
                          {budget.Department && (
                            <p className="text-sm text-gray-500">{budget.Department.name}</p>
                          )}
                          {budget.Project && (
                            <p className="text-sm text-gray-500">{budget.Project.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {budget.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(budget.period_start).toLocaleDateString()}</p>
                          <p className="text-gray-500">to {new Date(budget.period_end).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {financeService.formatCurrency(budget.budgeted_amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Spent: {financeService.formatCurrency(progress.spent)}</span>
                            <span>{progress.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={progress.percentage} 
                            className={`h-2 ${
                              progress.status === 'over' ? 'bg-red-100' : 
                              progress.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                            }`}
                          />
                          <p className="text-xs text-gray-500">
                            Remaining: {financeService.formatCurrency(progress.remaining)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBudgetStatusColor(progress.status)}>
                          {progress.status === 'over' ? 'Over Budget' : 
                           progress.status === 'warning' ? 'Warning' : 'On Track'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(budget)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBudget(budget)}
                            title="Edit Budget"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete Budget"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Report Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Budget Reports
                </CardTitle>
                <Button onClick={() => exportBudgetReport('csv')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          {(() => {
            const summary = getReportSummary();
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Total Budgeted</p>
                      <p className="text-2xl font-bold text-primary">{financeService.formatCurrency(summary.totalBudgeted)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Total Actual Spent</p>
                      <p className="text-2xl font-bold text-green-600">{financeService.formatCurrency(summary.totalActual)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">Total Variance</p>
                      <p className={`text-2xl font-bold ${summary.totalBudgeted - summary.totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {financeService.formatCurrency(summary.totalBudgeted - summary.totalActual)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Budget by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Budget by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Budgeted</TableHead>
                          <TableHead className="text-right">Actual</TableHead>
                          <TableHead className="text-right">Variance</TableHead>
                          <TableHead className="text-right">Utilization</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.byType.map((t) => (
                          <TableRow key={t.type}>
                            <TableCell className="font-medium">{t.type}</TableCell>
                            <TableCell className="text-right">{t.count}</TableCell>
                            <TableCell className="text-right">{financeService.formatCurrency(t.budgeted)}</TableCell>
                            <TableCell className="text-right">{financeService.formatCurrency(t.actual)}</TableCell>
                            <TableCell className={`text-right ${t.budgeted - t.actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {financeService.formatCurrency(t.budgeted - t.actual)}
                            </TableCell>
                            <TableCell className="text-right">{t.budgeted > 0 ? ((t.actual / t.budgeted) * 100).toFixed(1) : 0}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Budget by Department */}
                {summary.byDepartment.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Budget by Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Budgets</TableHead>
                            <TableHead className="text-right">Budgeted</TableHead>
                            <TableHead className="text-right">Actual</TableHead>
                            <TableHead className="text-right">Variance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.byDepartment.map((d) => (
                            <TableRow key={d.name}>
                              <TableCell className="font-medium">{d.name}</TableCell>
                              <TableCell className="text-right">{d.count}</TableCell>
                              <TableCell className="text-right">{financeService.formatCurrency(d.budgeted)}</TableCell>
                              <TableCell className="text-right">{financeService.formatCurrency(d.actual)}</TableCell>
                              <TableCell className={`text-right ${d.budgeted - d.actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {financeService.formatCurrency(d.budgeted - d.actual)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* Over Budget Alerts */}
                {(summary.overBudget.length > 0 || summary.warningBudget.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Budget Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {summary.overBudget.map((b) => (
                          <Alert key={b.id} variant="destructive">
                            <AlertDescription>
                              <span className="font-medium">{b.name}</span> is over budget by {financeService.formatCurrency(Math.abs(calculateBudgetProgress(b).remaining))}
                            </AlertDescription>
                          </Alert>
                        ))}
                        {summary.warningBudget.map((b) => (
                          <Alert key={b.id} className="border-yellow-500 bg-yellow-50">
                            <AlertDescription>
                              <span className="font-medium">{b.name}</span> is at {calculateBudgetProgress(b).percentage.toFixed(1)}% utilization
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Budget' : 'Create New Budget'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBudget} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Budget Name *</Label>
                <Input
                  id="name"
                  value={budgetForm.name}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q1 Marketing Budget"
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="type">Budget Type *</Label>
                <Select
                  value={budgetForm.type}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.type && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.type}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period_start">Period Start *</Label>
                <Input
                  id="period_start"
                  type="date"
                  value={budgetForm.period_start}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, period_start: e.target.value }))}
                  required
                />
                {formErrors.period_start && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.period_start}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="period_end">Period End *</Label>
                <Input
                  id="period_end"
                  type="date"
                  value={budgetForm.period_end}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, period_end: e.target.value }))}
                  required
                />
                {formErrors.period_end && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.period_end}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department_id">Department</Label>
                <Select
                  value={budgetForm.department_id}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, department_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select
                  value={budgetForm.project_id}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, project_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_id">Account</Label>
                <Select
                  value={budgetForm.account_id}
                  onValueChange={(value) => setBudgetForm(prev => ({ ...prev, account_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="budgeted_amount">Budgeted Amount *</Label>
                <Input
                  id="budgeted_amount"
                  type="number"
                  step="0.01"
                  value={budgetForm.budgeted_amount}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, budgeted_amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
                {formErrors.budgeted_amount && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.budgeted_amount}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={budgetForm.description}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Budget description"
                rows={3}
              />
            </div>

            {/* Budget Breakdown */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Budget Breakdown</Label>
                <span className="text-sm text-gray-500">
                  Allocated: {financeService.formatCurrency(budgetForm.breakdown.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))} 
                  {budgetForm.budgeted_amount && ` / ${financeService.formatCurrency(budgetForm.budgeted_amount)}`}
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-4"
                  placeholder="Category (e.g., Salaries)"
                  value={breakdownItem.category}
                  onChange={(e) => setBreakdownItem(prev => ({ ...prev, category: e.target.value }))}
                />
                <Input
                  className="col-span-3"
                  type="number"
                  placeholder="Amount"
                  value={breakdownItem.amount}
                  onChange={(e) => setBreakdownItem(prev => ({ ...prev, amount: e.target.value }))}
                />
                <Input
                  className="col-span-4"
                  placeholder="Description"
                  value={breakdownItem.description}
                  onChange={(e) => setBreakdownItem(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button
                  type="button"
                  size="sm"
                  className="col-span-1"
                  onClick={() => {
                    if (breakdownItem.category && breakdownItem.amount) {
                      setBudgetForm(prev => ({
                        ...prev,
                        breakdown: [...prev.breakdown, { ...breakdownItem, id: Date.now() }]
                      }));
                      setBreakdownItem({ category: '', amount: '', description: '' });
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {budgetForm.breakdown.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {budgetForm.breakdown.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{item.category}</span>
                        {item.description && <span className="text-gray-500 text-sm ml-2">- {item.description}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{financeService.formatCurrency(item.amount)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setBudgetForm(prev => ({
                            ...prev,
                            breakdown: prev.breakdown.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Errors */}
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors above and try again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBudgetDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Budget Items Dialog */}
      <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Budget Items - {selectedBudget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total: {financeService.formatCurrency(budgetItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
              </p>
              <Button size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
            
            {showItemForm && (
              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Item Name *</Label>
                    <Input value={itemForm.name} onChange={(e) => setItemForm({...itemForm, name: e.target.value})} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input value={itemForm.category} onChange={(e) => setItemForm({...itemForm, category: e.target.value})} />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({...itemForm, quantity: parseFloat(e.target.value) || 1})} />
                  </div>
                  <div>
                    <Label>Unit Price *</Label>
                    <Input type="number" min="0" step="0.01" value={itemForm.unit_price} onChange={(e) => setItemForm({...itemForm, unit_price: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Input value={itemForm.description} onChange={(e) => setItemForm({...itemForm, description: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => setShowItemForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveItem}>{editingItem ? 'Update' : 'Add'}</Button>
                </div>
              </Card>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No items yet. Click "Add Item" to add budget line items.
                    </TableCell>
                  </TableRow>
                ) : budgetItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{financeService.formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{financeService.formatCurrency(item.quantity * item.unit_price)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Budget Details
            </DialogTitle>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : detailBudget && (
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">{detailBudget.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <Badge variant="outline" className="capitalize">{detailBudget.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span className="text-sm">
                          {new Date(detailBudget.period_start).toLocaleDateString()} - {new Date(detailBudget.period_end).toLocaleDateString()}
                        </span>
                      </div>
                      {detailBudget.Department && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span>{detailBudget.Department.name}</span>
                        </div>
                      )}
                      {detailBudget.Project && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project:</span>
                          <span>{detailBudget.Project.name}</span>
                        </div>
                      )}
                      {detailBudget.description && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-600 text-sm">Description:</span>
                          <p className="text-sm mt-1">{detailBudget.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                    {(() => {
                      const progress = calculateBudgetProgress(detailBudget);
                      return (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Budgeted Amount:</span>
                            <span className="text-xl font-bold text-primary">
                              {financeService.formatCurrency(detailBudget.budgeted_amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Actual Spent:</span>
                            <span className="text-xl font-bold text-green-600">
                              {financeService.formatCurrency(progress.spent)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Remaining:</span>
                            <span className={`text-xl font-bold ${progress.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {financeService.formatCurrency(progress.remaining)}
                            </span>
                          </div>
                          <div className="pt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Utilization</span>
                              <span>{progress.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress.percentage} className="h-3" />
                          </div>
                          <div className="flex justify-center pt-2">
                            <Badge className={getBudgetStatusColor(progress.status)}>
                              {progress.status === 'over' ? 'Over Budget' : 
                               progress.status === 'warning' ? 'Warning' : 'On Track'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Budget Items */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Budget Line Items ({detailItems.length})</CardTitle>
                    <Button size="sm" onClick={() => { setSelectedBudget(detailBudget); setBudgetItems(detailItems); setShowDetailsDialog(false); setShowItemsDialog(true); }}>
                      <Plus className="w-4 h-4 mr-1" /> Manage Items
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {detailItems.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No budget items added yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                              </div>
                            </TableCell>
                            <TableCell>{item.category || '-'}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{financeService.formatCurrency(item.unit_price)}</TableCell>
                            <TableCell className="text-right font-medium">{financeService.formatCurrency(item.quantity * item.unit_price)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 font-semibold">
                          <TableCell colSpan={4} className="text-right">Total:</TableCell>
                          <TableCell className="text-right">
                            {financeService.formatCurrency(detailItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => { setShowDetailsDialog(false); handleEditBudget(detailBudget); }}>
                  <Edit className="w-4 h-4 mr-1" /> Edit Budget
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetManagement;