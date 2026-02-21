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
  Switch,
  Separator
} from '@/components/ui';
import {
  DollarSign,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Calculator,
  TrendingUp,
  Users,
  Building,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const SalaryManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // State for salary components
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    component_type: 'earning',
    component_name: '',
    component_code: '',
    calculation_type: 'fixed',
    amount: '',
    percentage: '',
    formula: '',
    base_component: 'basic',
    is_taxable: true,
    is_statutory: false,
    is_variable: false,
    effective_from: '',
    effective_to: '',
    frequency: 'monthly',
    priority: 0,
    currency: 'USD',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    employee_id: '',
    component_type: '',
    department_id: '',
    is_active: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadSalaryComponents();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load employees and departments from API
      const [employeesResponse, departmentsResponse] = await Promise.all([
        employeeService.getEmployees({ limit: 100, status: 'active' }),
        departmentService.getDepartments({ limit: 100 })
      ]);
      
      if (employeesResponse.success) {
        const employeeData = employeesResponse.data.employees.map(emp => ({
          id: emp.id,
          name: `${emp.User?.first_name || ''} ${emp.User?.last_name || ''}`.trim(),
          employee_id: emp.employee_id,
          department: emp.Department?.name || 'Unknown',
          department_id: emp.department_id
        }));
        setEmployees(employeeData);
      }
      
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data.departments || []);
      }
    } catch (error) {
      toast.error('Failed to load initial data');
      console.error('Load initial data error:', error);
      
      // Fallback to empty arrays if API fails
      setEmployees([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSalaryComponents = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getSalaryComponents(filters);
      setSalaryComponents(response.data?.components || []);
    } catch (error) {
      toast.error('Failed to load salary components');
      console.error('Load salary components error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const validationErrors = payrollService.validateSalaryComponent(formData);
      if (validationErrors.length > 0) {
        setFormErrors({ general: validationErrors });
        return;
      }

      await payrollService.createSalaryComponent(formData);
      
      toast.success('Salary component created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadSalaryComponents();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create salary component';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComponent = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const validationErrors = payrollService.validateSalaryComponent(formData);
      if (validationErrors.length > 0) {
        setFormErrors({ general: validationErrors });
        return;
      }

      await payrollService.updateSalaryComponent(selectedComponent.id, formData);
      
      toast.success('Salary component updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadSalaryComponents();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update salary component';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (componentId) => {
    if (!confirm('Are you sure you want to delete this salary component? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await payrollService.deleteSalaryComponent(componentId);
      
      toast.success('Salary component deleted successfully');
      loadSalaryComponents();
      
    } catch (error) {
      toast.error('Failed to delete salary component');
      console.error('Delete salary component error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      component_type: 'earning',
      component_name: '',
      component_code: '',
      calculation_type: 'fixed',
      amount: '',
      percentage: '',
      formula: '',
      base_component: 'basic',
      is_taxable: true,
      is_statutory: false,
      is_variable: false,
      effective_from: '',
      effective_to: '',
      frequency: 'monthly',
      priority: 0,
      currency: 'USD',
      notes: ''
    });
    setFormErrors({});
    setSelectedComponent(null);
  };

  const openEditDialog = (component) => {
    setSelectedComponent(component);
    setFormData({
      employee_id: component.employee_id || '',
      component_type: component.component_type || 'earning',
      component_name: component.component_name || '',
      component_code: component.component_code || '',
      calculation_type: component.calculation_type || 'fixed',
      amount: component.amount || '',
      percentage: component.percentage || '',
      formula: component.formula || '',
      base_component: component.base_component || 'basic',
      is_taxable: component.is_taxable !== false,
      is_statutory: component.is_statutory || false,
      is_variable: component.is_variable || false,
      effective_from: component.effective_from || '',
      effective_to: component.effective_to || '',
      frequency: component.frequency || 'monthly',
      priority: component.priority || 0,
      currency: component.currency || 'USD',
      notes: component.notes || ''
    });
    setShowEditDialog(true);
  };

  const getComponentTypeBadge = (type) => {
    const typeConfig = {
      earning: { color: 'bg-green-100 text-green-800', icon: TrendingUp },
      deduction: { color: 'bg-red-100 text-red-800', icon: XCircle },
      tax: { color: 'bg-blue-100 text-blue-800', icon: Calculator }
    };

    const config = typeConfig[type] || typeConfig.earning;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getCalculationTypeBadge = (type) => {
    const typeConfig = {
      fixed: { color: 'bg-gray-100 text-gray-800' },
      percentage: { color: 'bg-purple-100 text-purple-800' },
      formula: { color: 'bg-orange-100 text-orange-800' },
      attendance_based: { color: 'bg-blue-100 text-blue-800' }
    };

    const config = typeConfig[type] || typeConfig.fixed;

    return (
      <Badge className={config.color}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateComponent : handleCreateComponent} className="space-y-6">
      {/* Employee Selection */}
      <div>
        <Label htmlFor="employee_id">Employee *</Label>
        <Select
          value={formData.employee_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
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

      {/* Component Details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="component_name">Component Name *</Label>
          <Input
            value={formData.component_name}
            onChange={(e) => setFormData(prev => ({ ...prev, component_name: e.target.value }))}
            placeholder="e.g., Basic Salary, HRA, Medical Allowance"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="component_code">Component Code *</Label>
          <Input
            value={formData.component_code}
            onChange={(e) => setFormData(prev => ({ ...prev, component_code: e.target.value.toUpperCase() }))}
            placeholder="e.g., BASIC, HRA, MED"
            maxLength={20}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="component_type">Component Type *</Label>
          <Select
            value={formData.component_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, component_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earning">Earning</SelectItem>
              <SelectItem value="deduction">Deduction</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="calculation_type">Calculation Type *</Label>
          <Select
            value={formData.calculation_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, calculation_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="formula">Formula</SelectItem>
              <SelectItem value="attendance_based">Attendance Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calculation Details */}
      {formData.calculation_type === 'fixed' && (
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      )}

      {formData.calculation_type === 'percentage' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="percentage">Percentage *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="base_component">Base Component</Label>
            <Select
              value={formData.base_component}
              onValueChange={(value) => setFormData(prev => ({ ...prev, base_component: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic Salary</SelectItem>
                <SelectItem value="gross">Gross Salary</SelectItem>
                <SelectItem value="net">Net Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {formData.calculation_type === 'formula' && (
        <div>
          <Label htmlFor="formula">Formula</Label>
          <Textarea
            value={formData.formula}
            onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
            placeholder="Enter calculation formula"
            rows={3}
          />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effective_from">Effective From *</Label>
          <Input
            type="date"
            value={formData.effective_from}
            onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="effective_to">Effective To</Label>
          <Input
            type="date"
            value={formData.effective_to}
            onChange={(e) => setFormData(prev => ({ ...prev, effective_to: e.target.value }))}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Component Options</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_taxable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_taxable: checked }))}
              />
              <Label>Taxable</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_statutory}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_statutory: checked }))}
              />
              <Label>Statutory</Label>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_variable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_variable: checked }))}
              />
              <Label>Variable</Label>
            </div>
            
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half_yearly">Half Yearly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one_time">One Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this component"
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

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setShowEditDialog(false);
            } else {
              setShowCreateDialog(false);
            }
            resetForm();
          }}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Management</h1>
          <p className="text-gray-600">Manage employee salary components, allowances, and deductions</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Salary Component</DialogTitle>
              </DialogHeader>
              {renderForm(false)}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filter_employee">Employee</Label>
              <Select
                value={filters.employee_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, employee_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_type">Component Type</Label>
              <Select
                value={filters.component_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, component_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="earning">Earnings</SelectItem>
                  <SelectItem value="deduction">Deductions</SelectItem>
                  <SelectItem value="tax">Taxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_department">Department</Label>
              <Select
                value={filters.department_id}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
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
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.is_active}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active Only</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Components Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Salary Components
          </CardTitle>
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
                  <TableHead>Employee</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Calculation</TableHead>
                  <TableHead>Amount/Rate</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents.map((component) => (
                  <TableRow key={component.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {component.Employee?.User ? 
                            `${component.Employee.User.first_name} ${component.Employee.User.last_name}` : 
                            'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {component.Employee?.employee_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{component.component_name}</div>
                        <div className="text-sm text-gray-500">
                          <Badge variant="outline">{component.component_code}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getComponentTypeBadge(component.component_type)}
                    </TableCell>
                    <TableCell>
                      {getCalculationTypeBadge(component.calculation_type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        {component.calculation_type === 'fixed' && (
                          <span className="font-medium">
                            {payrollService.formatCurrency(component.amount, component.currency)}
                          </span>
                        )}
                        {component.calculation_type === 'percentage' && (
                          <span className="font-medium">
                            {component.percentage}% of {component.base_component}
                          </span>
                        )}
                        {component.calculation_type === 'formula' && (
                          <span className="text-sm text-gray-600">Formula</span>
                        )}
                        {component.calculation_type === 'attendance_based' && (
                          <span className="text-sm text-gray-600">Attendance Based</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(component.effective_from).toLocaleDateString()}</div>
                        {component.effective_to && (
                          <div className="text-gray-500">
                            to {new Date(component.effective_to).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {component.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {component.is_statutory && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Statutory</Badge>
                        )}
                        {component.is_variable && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Variable</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComponent(component);
                            // Open details dialog
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(component)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Salary Component</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryManagement;