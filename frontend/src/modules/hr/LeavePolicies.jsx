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
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X,
  Users,
  Building2,
  UserCheck,
  Settings
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import { toast } from 'react-hot-toast';

const LeavePolicies = () => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    policy_type: 'general',
    effective_date: '',
    expiry_date: '',
    is_active: true,
    
    // General Settings
    financial_year_start: '01-04',
    weekend_policy: 'exclude',
    holiday_policy: 'exclude',
    probation_period_months: '6',
    notice_period_policy: 'required',
    
    // Approval Settings
    approval_required: true,
    auto_approval_limit: '',
    escalation_enabled: true,
    escalation_days: '3',
    manager_approval_required: true,
    hr_approval_required: false,
    
    // Restrictions
    department_restrictions: [],
    employment_type_restrictions: [],
    gender_restrictions: 'none',
    minimum_service_months: '',
    maximum_service_years: '',
    
    // Leave Balances
    carry_forward_policy: 'allowed',
    carry_forward_limit: '',
    encashment_policy: 'not_allowed',
    encashment_limit: '',
    negative_balance_policy: 'not_allowed',
    
    // Calculation Rules
    pro_rata_calculation: true,
    accrual_frequency: 'monthly',
    leave_year_calculation: 'calendar_year',
    
    // Documentation
    documentation_required: false,
    medical_certificate_days: '3',
    supporting_documents: [],
    
    // Notifications
    notification_enabled: true,
    reminder_days: '7',
    manager_notification: true,
    hr_notification: true,
    
    // Compliance
    statutory_compliance: true,
    labor_law_compliance: true,
    company_policy_compliance: true
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [policiesResponse, departmentsResponse, leaveTypesResponse] = await Promise.all([
        leaveService.getLeavePolicies(),
        leaveService.getDepartments(),
        leaveService.getLeaveTypes()
      ]);
      
      setPolicies(policiesResponse.data.policies || []);
      setDepartments(departmentsResponse.data.departments || []);
      setLeaveTypes(leaveTypesResponse.data.leaveTypes || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.createLeavePolicy(formData);
      
      toast.success('Leave policy created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create leave policy';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.updateLeavePolicy(selectedPolicy.id, formData);
      
      toast.success('Leave policy updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update leave policy';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await leaveService.deleteLeavePolicy(policyId);
      
      toast.success('Leave policy deleted successfully');
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to delete leave policy');
      console.error('Delete policy error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      policy_type: 'general',
      effective_date: '',
      expiry_date: '',
      is_active: true,
      
      // General Settings
      financial_year_start: '01-04',
      weekend_policy: 'exclude',
      holiday_policy: 'exclude',
      probation_period_months: '6',
      notice_period_policy: 'required',
      
      // Approval Settings
      approval_required: true,
      auto_approval_limit: '',
      escalation_enabled: true,
      escalation_days: '3',
      manager_approval_required: true,
      hr_approval_required: false,
      
      // Restrictions
      department_restrictions: [],
      employment_type_restrictions: [],
      gender_restrictions: 'none',
      minimum_service_months: '',
      maximum_service_years: '',
      
      // Leave Balances
      carry_forward_policy: 'allowed',
      carry_forward_limit: '',
      encashment_policy: 'not_allowed',
      encashment_limit: '',
      negative_balance_policy: 'not_allowed',
      
      // Calculation Rules
      pro_rata_calculation: true,
      accrual_frequency: 'monthly',
      leave_year_calculation: 'calendar_year',
      
      // Documentation
      documentation_required: false,
      medical_certificate_days: '3',
      supporting_documents: [],
      
      // Notifications
      notification_enabled: true,
      reminder_days: '7',
      manager_notification: true,
      hr_notification: true,
      
      // Compliance
      statutory_compliance: true,
      labor_law_compliance: true,
      company_policy_compliance: true
    });
    setFormErrors({});
    setSelectedPolicy(null);
    setActiveTab('general');
  };

  const openEditDialog = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      name: policy.name || '',
      description: policy.description || '',
      policy_type: policy.policy_type || 'general',
      effective_date: policy.effective_date || '',
      expiry_date: policy.expiry_date || '',
      is_active: policy.is_active !== false,
      
      // General Settings
      financial_year_start: policy.financial_year_start || '01-04',
      weekend_policy: policy.weekend_policy || 'exclude',
      holiday_policy: policy.holiday_policy || 'exclude',
      probation_period_months: policy.probation_period_months || '6',
      notice_period_policy: policy.notice_period_policy || 'required',
      
      // Approval Settings
      approval_required: policy.approval_required !== false,
      auto_approval_limit: policy.auto_approval_limit || '',
      escalation_enabled: policy.escalation_enabled !== false,
      escalation_days: policy.escalation_days || '3',
      manager_approval_required: policy.manager_approval_required !== false,
      hr_approval_required: policy.hr_approval_required || false,
      
      // Restrictions
      department_restrictions: policy.department_restrictions || [],
      employment_type_restrictions: policy.employment_type_restrictions || [],
      gender_restrictions: policy.gender_restrictions || 'none',
      minimum_service_months: policy.minimum_service_months || '',
      maximum_service_years: policy.maximum_service_years || '',
      
      // Leave Balances
      carry_forward_policy: policy.carry_forward_policy || 'allowed',
      carry_forward_limit: policy.carry_forward_limit || '',
      encashment_policy: policy.encashment_policy || 'not_allowed',
      encashment_limit: policy.encashment_limit || '',
      negative_balance_policy: policy.negative_balance_policy || 'not_allowed',
      
      // Calculation Rules
      pro_rata_calculation: policy.pro_rata_calculation !== false,
      accrual_frequency: policy.accrual_frequency || 'monthly',
      leave_year_calculation: policy.leave_year_calculation || 'calendar_year',
      
      // Documentation
      documentation_required: policy.documentation_required || false,
      medical_certificate_days: policy.medical_certificate_days || '3',
      supporting_documents: policy.supporting_documents || [],
      
      // Notifications
      notification_enabled: policy.notification_enabled !== false,
      reminder_days: policy.reminder_days || '7',
      manager_notification: policy.manager_notification !== false,
      hr_notification: policy.hr_notification !== false,
      
      // Compliance
      statutory_compliance: policy.statutory_compliance !== false,
      labor_law_compliance: policy.labor_law_compliance !== false,
      company_policy_compliance: policy.company_policy_compliance !== false
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

  const getPolicyTypeBadge = (type) => {
    const types = {
      general: { color: 'bg-blue-100 text-blue-800', label: 'General' },
      department: { color: 'bg-purple-100 text-purple-800', label: 'Department' },
      employment_type: { color: 'bg-green-100 text-green-800', label: 'Employment Type' },
      custom: { color: 'bg-orange-100 text-orange-800', label: 'Custom' }
    };
    
    const config = types[type] || types.general;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdatePolicy : handleCreatePolicy} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Annual Leave Policy 2024"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="policy_type">Policy Type</Label>
              <Select
                value={formData.policy_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, policy_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="department">Department Specific</SelectItem>
                  <SelectItem value="employment_type">Employment Type</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description of this leave policy"
              rows={3}
            />
          </div>

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
            <Label>Active Policy</Label>
          </div>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.approval_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approval_required: checked }))}
              />
              <Label>Approval Required</Label>
            </div>

            {formData.approval_required && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.manager_approval_required}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, manager_approval_required: checked }))}
                    />
                    <Label>Manager Approval Required</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.hr_approval_required}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hr_approval_required: checked }))}
                    />
                    <Label>HR Approval Required</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auto_approval_limit">Auto Approval Limit (Days)</Label>
                    <Input
                      type="number"
                      value={formData.auto_approval_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, auto_approval_limit: e.target.value }))}
                      placeholder="e.g., 2"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="escalation_days">Escalation Days</Label>
                    <Input
                      type="number"
                      value={formData.escalation_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, escalation_days: e.target.value }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.escalation_enabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, escalation_enabled: checked }))}
                  />
                  <Label>Enable Escalation</Label>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Restrictions Tab */}
        <TabsContent value="restrictions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minimum_service_months">Minimum Service (Months)</Label>
              <Input
                type="number"
                value={formData.minimum_service_months}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_service_months: e.target.value }))}
                placeholder="e.g., 6"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="maximum_service_years">Maximum Service (Years)</Label>
              <Input
                type="number"
                value={formData.maximum_service_years}
                onChange={(e) => setFormData(prev => ({ ...prev, maximum_service_years: e.target.value }))}
                placeholder="e.g., 30"
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender_restrictions">Gender Restrictions</Label>
            <Select
              value={formData.gender_restrictions}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender_restrictions: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Restrictions</SelectItem>
                <SelectItem value="male">Male Only</SelectItem>
                <SelectItem value="female">Female Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carry_forward_policy">Carry Forward Policy</Label>
              <Select
                value={formData.carry_forward_policy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, carry_forward_policy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="not_allowed">Not Allowed</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="encashment_policy">Encashment Policy</Label>
              <Select
                value={formData.encashment_policy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, encashment_policy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="not_allowed">Not Allowed</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.pro_rata_calculation}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pro_rata_calculation: checked }))}
              />
              <Label>Pro-rata Calculation</Label>
            </div>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.statutory_compliance}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, statutory_compliance: checked }))}
              />
              <Label>Statutory Compliance</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.labor_law_compliance}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, labor_law_compliance: checked }))}
              />
              <Label>Labor Law Compliance</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.company_policy_compliance}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, company_policy_compliance: checked }))}
              />
              <Label>Company Policy Compliance</Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.documentation_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, documentation_required: checked }))}
              />
              <Label>Documentation Required</Label>
            </div>
            
            {formData.documentation_required && (
              <div>
                <Label htmlFor="medical_certificate_days">Medical Certificate Required After (Days)</Label>
                <Input
                  type="number"
                  value={formData.medical_certificate_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, medical_certificate_days: e.target.value }))}
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.notification_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notification_enabled: checked }))}
              />
              <Label>Enable Notifications</Label>
            </div>
            
            {formData.notification_enabled && (
              <>
                <div>
                  <Label htmlFor="reminder_days">Reminder Days</Label>
                  <Input
                    type="number"
                    value={formData.reminder_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_days: e.target.value }))}
                    min="1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.manager_notification}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, manager_notification: checked }))}
                    />
                    <Label>Manager Notification</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.hr_notification}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hr_notification: checked }))}
                    />
                    <Label>HR Notification</Label>
                  </div>
                </div>
              </>
            )}
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Policies</h1>
          <p className="text-gray-600">Configure and manage leave policies and rules</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Leave Policy</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Leave Policies
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
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        {policy.description && (
                          <div className="text-sm text-gray-500">{policy.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPolicyTypeBadge(policy.policy_type)}
                    </TableCell>
                    <TableCell>
                      {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'Not set'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(policy.is_active)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(policy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.id)}
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
            <DialogTitle>Edit Leave Policy</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavePolicies;