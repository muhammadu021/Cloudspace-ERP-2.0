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
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Users,
  Shield,
  Key,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Save,
  X,
  Search,
  Filter,
  Settings,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import { toast } from 'react-hot-toast';

const StaffAccessControl = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [accessRules, setAccessRules] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'employee',
    target_id: '',
    target_type: 'employee',
    
    // Leave Permissions
    can_apply_leave: true,
    can_view_own_leave: true,
    can_view_team_leave: false,
    can_view_all_leave: false,
    can_approve_leave: false,
    can_reject_leave: false,
    can_cancel_leave: false,
    can_modify_leave: false,
    
    // Leave Type Access
    accessible_leave_types: [],
    restricted_leave_types: [],
    
    // Approval Permissions
    approval_level: 'none',
    can_approve_subordinates: false,
    can_approve_department: false,
    can_approve_all: false,
    max_approval_days: '',
    max_approval_amount: '',
    
    // Administrative Permissions
    can_manage_leave_types: false,
    can_manage_policies: false,
    can_manage_workflows: false,
    can_view_reports: false,
    can_export_data: false,
    can_manage_balances: false,
    
    // Restrictions
    date_restrictions: [],
    time_restrictions: [],
    ip_restrictions: [],
    device_restrictions: [],
    
    // Settings
    is_active: true,
    effective_date: '',
    expiry_date: '',
    priority: 'normal'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesResponse, rolesResponse, departmentsResponse, permissionsResponse, rulesResponse] = await Promise.all([
        leaveService.getEmployees(),
        leaveService.getRoles(),
        leaveService.getDepartments(),
        leaveService.getLeavePermissions(),
        leaveService.getAccessRules()
      ]);
      
      setEmployees(employeesResponse.data.employees || []);
      setRoles(rolesResponse.data.roles || []);
      setDepartments(departmentsResponse.data.departments || []);
      setPermissions(permissionsResponse.data.permissions || []);
      setAccessRules(rulesResponse.data.rules || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.createAccessRule(formData);
      
      toast.success('Access rule created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create access rule';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.updateAccessRule(selectedRule.id, formData);
      
      toast.success('Access rule updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update access rule';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this access rule? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await leaveService.deleteAccessRule(ruleId);
      
      toast.success('Access rule deleted successfully');
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to delete access rule');
      console.error('Delete rule error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployeeAccess = async (employeeId, permission, value) => {
    try {
      setLoading(true);
      await leaveService.updateEmployeePermission(employeeId, {
        permission,
        value
      });
      
      toast.success('Permission updated successfully');
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to update permission');
      console.error('Update permission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rule_type: 'employee',
      target_id: '',
      target_type: 'employee',
      
      // Leave Permissions
      can_apply_leave: true,
      can_view_own_leave: true,
      can_view_team_leave: false,
      can_view_all_leave: false,
      can_approve_leave: false,
      can_reject_leave: false,
      can_cancel_leave: false,
      can_modify_leave: false,
      
      // Leave Type Access
      accessible_leave_types: [],
      restricted_leave_types: [],
      
      // Approval Permissions
      approval_level: 'none',
      can_approve_subordinates: false,
      can_approve_department: false,
      can_approve_all: false,
      max_approval_days: '',
      max_approval_amount: '',
      
      // Administrative Permissions
      can_manage_leave_types: false,
      can_manage_policies: false,
      can_manage_workflows: false,
      can_view_reports: false,
      can_export_data: false,
      can_manage_balances: false,
      
      // Restrictions
      date_restrictions: [],
      time_restrictions: [],
      ip_restrictions: [],
      device_restrictions: [],
      
      // Settings
      is_active: true,
      effective_date: '',
      expiry_date: '',
      priority: 'normal'
    });
    setFormErrors({});
    setSelectedRule(null);
  };

  const openEditDialog = (rule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name || '',
      description: rule.description || '',
      rule_type: rule.rule_type || 'employee',
      target_id: rule.target_id || '',
      target_type: rule.target_type || 'employee',
      
      // Leave Permissions
      can_apply_leave: rule.can_apply_leave !== false,
      can_view_own_leave: rule.can_view_own_leave !== false,
      can_view_team_leave: rule.can_view_team_leave || false,
      can_view_all_leave: rule.can_view_all_leave || false,
      can_approve_leave: rule.can_approve_leave || false,
      can_reject_leave: rule.can_reject_leave || false,
      can_cancel_leave: rule.can_cancel_leave || false,
      can_modify_leave: rule.can_modify_leave || false,
      
      // Leave Type Access
      accessible_leave_types: rule.accessible_leave_types || [],
      restricted_leave_types: rule.restricted_leave_types || [],
      
      // Approval Permissions
      approval_level: rule.approval_level || 'none',
      can_approve_subordinates: rule.can_approve_subordinates || false,
      can_approve_department: rule.can_approve_department || false,
      can_approve_all: rule.can_approve_all || false,
      max_approval_days: rule.max_approval_days || '',
      max_approval_amount: rule.max_approval_amount || '',
      
      // Administrative Permissions
      can_manage_leave_types: rule.can_manage_leave_types || false,
      can_manage_policies: rule.can_manage_policies || false,
      can_manage_workflows: rule.can_manage_workflows || false,
      can_view_reports: rule.can_view_reports || false,
      can_export_data: rule.can_export_data || false,
      can_manage_balances: rule.can_manage_balances || false,
      
      // Restrictions
      date_restrictions: rule.date_restrictions || [],
      time_restrictions: rule.time_restrictions || [],
      ip_restrictions: rule.ip_restrictions || [],
      device_restrictions: rule.device_restrictions || [],
      
      // Settings
      is_active: rule.is_active !== false,
      effective_date: rule.effective_date || '',
      expiry_date: rule.expiry_date || '',
      priority: rule.priority || 'normal'
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const getPermissionBadge = (hasPermission) => {
    return hasPermission ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Allowed
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Denied
      </Badge>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      `${employee.User?.first_name} ${employee.User?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || employee.department_id === parseInt(filterDepartment);
    const matchesRole = !filterRole || employee.User?.role_id === parseInt(filterRole);
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateRule : handleCreateRule} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Manager Leave Access"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={formData.rule_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rule_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description of this access rule"
              rows={2}
            />
          </div>

          {formData.rule_type === 'employee' && (
            <div>
              <Label htmlFor="target_id">Select Employee</Label>
              <Select
                value={formData.target_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.User ? `${employee.User.first_name} ${employee.User.last_name}` : employee.employee_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.rule_type === 'role' && (
            <div>
              <Label htmlFor="target_id">Select Role</Label>
              <Select
                value={formData.target_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.rule_type === 'department' && (
            <div>
              <Label htmlFor="target_id">Select Department</Label>
              <Select
                value={formData.target_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, target_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(department => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="effective_date">Effective Date</Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label>Active Rule</Label>
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leave Permissions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_apply_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_apply_leave: checked }))}
                  />
                  <Label>Can Apply Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_view_own_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_own_leave: checked }))}
                  />
                  <Label>Can View Own Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_view_team_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_team_leave: checked }))}
                  />
                  <Label>Can View Team Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_view_all_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_all_leave: checked }))}
                  />
                  <Label>Can View All Leave</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_approve_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_approve_leave: checked }))}
                  />
                  <Label>Can Approve Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_reject_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_reject_leave: checked }))}
                  />
                  <Label>Can Reject Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_cancel_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_cancel_leave: checked }))}
                  />
                  <Label>Can Cancel Leave</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_modify_leave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_modify_leave: checked }))}
                  />
                  <Label>Can Modify Leave</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Administrative Permissions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_manage_leave_types}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_manage_leave_types: checked }))}
                  />
                  <Label>Can Manage Leave Types</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_manage_policies}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_manage_policies: checked }))}
                  />
                  <Label>Can Manage Policies</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_manage_workflows}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_manage_workflows: checked }))}
                  />
                  <Label>Can Manage Workflows</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_view_reports}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_view_reports: checked }))}
                  />
                  <Label>Can View Reports</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_export_data}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_export_data: checked }))}
                  />
                  <Label>Can Export Data</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_manage_balances}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_manage_balances: checked }))}
                  />
                  <Label>Can Manage Balances</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval" className="space-y-4">
          <div>
            <Label htmlFor="approval_level">Approval Level</Label>
            <Select
              value={formData.approval_level}
              onValueChange={(value) => setFormData(prev => ({ ...prev, approval_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Approval Rights</SelectItem>
                <SelectItem value="basic">Basic Approval</SelectItem>
                <SelectItem value="advanced">Advanced Approval</SelectItem>
                <SelectItem value="admin">Admin Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.approval_level !== 'none' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_approve_subordinates}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_approve_subordinates: checked }))}
                  />
                  <Label>Can Approve Subordinates</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_approve_department}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_approve_department: checked }))}
                  />
                  <Label>Can Approve Department</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.can_approve_all}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, can_approve_all: checked }))}
                  />
                  <Label>Can Approve All</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_approval_days">Max Approval Days</Label>
                  <Input
                    type="number"
                    value={formData.max_approval_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_approval_days: e.target.value }))}
                    placeholder="e.g., 30"
                    min="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_approval_amount">Max Approval Amount</Label>
                  <Input
                    type="number"
                    value={formData.max_approval_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_approval_amount: e.target.value }))}
                    placeholder="e.g., 10000"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Restrictions Tab */}
        <TabsContent value="restrictions" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            Advanced restrictions configuration coming soon...
            <br />
            <small>This will include IP restrictions, time-based access, and device limitations</small>
          </div>
        </TabsContent>
      </Tabs>

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
          <h1 className="text-3xl font-bold text-gray-900">Staff Access Control</h1>
          <p className="text-gray-600">Manage staff permissions and access to leave management features</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Access Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Access Rule</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Employee Access
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Access Rules
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Employee Access Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Employee Access Management</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select 
                    value={filterDepartment} 
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Apply Leave</TableHead>
                      <TableHead>Approve Leave</TableHead>
                      <TableHead>View Reports</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {employee.User ? `${employee.User.first_name} ${employee.User.last_name}` : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">{employee.employee_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.Department?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {employee.User?.Role?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={employee.permissions?.can_apply_leave !== false}
                            onCheckedChange={(checked) => handleToggleEmployeeAccess(employee.id, 'can_apply_leave', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={employee.permissions?.can_approve_leave || false}
                            onCheckedChange={(checked) => handleToggleEmployeeAccess(employee.id, 'can_approve_leave', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={employee.permissions?.can_view_reports || false}
                            onCheckedChange={(checked) => handleToggleEmployeeAccess(employee.id, 'can_view_reports', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Open detailed permissions dialog
                              toast.info('Detailed permissions coming soon');
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Rules
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
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            {rule.description && (
                              <div className="text-sm text-gray-500">{rule.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rule.rule_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {rule.target_name || rule.target_id}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(rule.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(rule)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
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
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Permission matrix view coming soon...
                <br />
                <small>This will show a comprehensive view of all permissions across roles and departments</small>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Access Rule</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffAccessControl;