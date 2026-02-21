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
  Target,
  GitBranch,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Save,
  X,
  ArrowRight,
  ArrowDown,
  Settings,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import { toast } from 'react-hot-toast';

const LeaveApprovalWorkflows = () => {
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflow_type: 'sequential',
    is_active: true,
    
    // Trigger Conditions
    trigger_conditions: {
      leave_types: [],
      departments: [],
      roles: [],
      min_days: '',
      max_days: '',
      employee_levels: [],
      amount_threshold: ''
    },
    
    // Workflow Steps
    steps: [
      {
        step_order: 1,
        step_name: 'Manager Approval',
        step_type: 'approval',
        approver_type: 'manager',
        approver_id: '',
        approver_role_id: '',
        is_required: true,
        timeout_hours: 72,
        escalation_enabled: true,
        escalation_to: '',
        escalation_hours: 24,
        auto_approve: false,
        auto_approve_conditions: {},
        notification_enabled: true,
        reminder_hours: 24
      }
    ],
    
    // Escalation Settings
    escalation_enabled: true,
    escalation_levels: [],
    final_escalation_to: '',
    max_escalation_days: 7,
    
    // Notification Settings
    notification_settings: {
      notify_applicant: true,
      notify_manager: true,
      notify_hr: false,
      notify_admin: false,
      email_enabled: true,
      sms_enabled: false,
      in_app_enabled: true
    },
    
    // Advanced Settings
    parallel_approval: false,
    require_all_approvals: true,
    allow_delegation: true,
    allow_skip_levels: false,
    auto_reject_timeout: false,
    auto_reject_days: '',
    
    // Conditions
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
      const [workflowsResponse, employeesResponse, rolesResponse, departmentsResponse, leaveTypesResponse] = await Promise.all([
        leaveService.getApprovalWorkflows(),
        leaveService.getEmployees(),
        leaveService.getRoles(),
        leaveService.getDepartments(),
        leaveService.getLeaveTypes()
      ]);
      
      setWorkflows(workflowsResponse.data.workflows || []);
      setEmployees(employeesResponse.data.employees || []);
      setRoles(rolesResponse.data.roles || []);
      setDepartments(departmentsResponse.data.departments || []);
      setLeaveTypes(leaveTypesResponse.data.leaveTypes || []);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.createApprovalWorkflow(formData);
      
      toast.success('Approval workflow created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create approval workflow';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkflow = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      const response = await leaveService.updateApprovalWorkflow(selectedWorkflow.id, formData);
      
      toast.success('Approval workflow updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadInitialData();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update approval workflow';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await leaveService.deleteApprovalWorkflow(workflowId);
      
      toast.success('Approval workflow deleted successfully');
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to delete approval workflow');
      console.error('Delete workflow error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (workflowId, isActive) => {
    try {
      setLoading(true);
      await leaveService.toggleApprovalWorkflow(workflowId, { is_active: !isActive });
      
      toast.success(`Workflow ${!isActive ? 'activated' : 'deactivated'} successfully`);
      loadInitialData();
      
    } catch (error) {
      toast.error('Failed to toggle workflow status');
      console.error('Toggle workflow error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkflowStep = () => {
    const newStep = {
      step_order: formData.steps.length + 1,
      step_name: `Step ${formData.steps.length + 1}`,
      step_type: 'approval',
      approver_type: 'manager',
      approver_id: '',
      approver_role_id: '',
      is_required: true,
      timeout_hours: 72,
      escalation_enabled: true,
      escalation_to: '',
      escalation_hours: 24,
      auto_approve: false,
      auto_approve_conditions: {},
      notification_enabled: true,
      reminder_hours: 24
    };
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeWorkflowStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({
        ...step,
        step_order: i + 1
      }))
    }));
  };

  const updateWorkflowStep = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      workflow_type: 'sequential',
      is_active: true,
      
      // Trigger Conditions
      trigger_conditions: {
        leave_types: [],
        departments: [],
        roles: [],
        min_days: '',
        max_days: '',
        employee_levels: [],
        amount_threshold: ''
      },
      
      // Workflow Steps
      steps: [
        {
          step_order: 1,
          step_name: 'Manager Approval',
          step_type: 'approval',
          approver_type: 'manager',
          approver_id: '',
          approver_role_id: '',
          is_required: true,
          timeout_hours: 72,
          escalation_enabled: true,
          escalation_to: '',
          escalation_hours: 24,
          auto_approve: false,
          auto_approve_conditions: {},
          notification_enabled: true,
          reminder_hours: 24
        }
      ],
      
      // Escalation Settings
      escalation_enabled: true,
      escalation_levels: [],
      final_escalation_to: '',
      max_escalation_days: 7,
      
      // Notification Settings
      notification_settings: {
        notify_applicant: true,
        notify_manager: true,
        notify_hr: false,
        notify_admin: false,
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true
      },
      
      // Advanced Settings
      parallel_approval: false,
      require_all_approvals: true,
      allow_delegation: true,
      allow_skip_levels: false,
      auto_reject_timeout: false,
      auto_reject_days: '',
      
      // Conditions
      effective_date: '',
      expiry_date: '',
      priority: 'normal'
    });
    setFormErrors({});
    setSelectedWorkflow(null);
    setActiveTab('basic');
  };

  const openEditDialog = (workflow) => {
    setSelectedWorkflow(workflow);
    setFormData({
      name: workflow.name || '',
      description: workflow.description || '',
      workflow_type: workflow.workflow_type || 'sequential',
      is_active: workflow.is_active !== false,
      
      // Trigger Conditions
      trigger_conditions: workflow.trigger_conditions || {
        leave_types: [],
        departments: [],
        roles: [],
        min_days: '',
        max_days: '',
        employee_levels: [],
        amount_threshold: ''
      },
      
      // Workflow Steps
      steps: workflow.steps || [
        {
          step_order: 1,
          step_name: 'Manager Approval',
          step_type: 'approval',
          approver_type: 'manager',
          approver_id: '',
          approver_role_id: '',
          is_required: true,
          timeout_hours: 72,
          escalation_enabled: true,
          escalation_to: '',
          escalation_hours: 24,
          auto_approve: false,
          auto_approve_conditions: {},
          notification_enabled: true,
          reminder_hours: 24
        }
      ],
      
      // Escalation Settings
      escalation_enabled: workflow.escalation_enabled !== false,
      escalation_levels: workflow.escalation_levels || [],
      final_escalation_to: workflow.final_escalation_to || '',
      max_escalation_days: workflow.max_escalation_days || 7,
      
      // Notification Settings
      notification_settings: workflow.notification_settings || {
        notify_applicant: true,
        notify_manager: true,
        notify_hr: false,
        notify_admin: false,
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true
      },
      
      // Advanced Settings
      parallel_approval: workflow.parallel_approval || false,
      require_all_approvals: workflow.require_all_approvals !== false,
      allow_delegation: workflow.allow_delegation !== false,
      allow_skip_levels: workflow.allow_skip_levels || false,
      auto_reject_timeout: workflow.auto_reject_timeout || false,
      auto_reject_days: workflow.auto_reject_days || '',
      
      // Conditions
      effective_date: workflow.effective_date || '',
      expiry_date: workflow.expiry_date || '',
      priority: workflow.priority || 'normal'
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

  const getWorkflowTypeBadge = (type) => {
    const types = {
      sequential: { color: 'bg-blue-100 text-blue-800', label: 'Sequential' },
      parallel: { color: 'bg-purple-100 text-purple-800', label: 'Parallel' },
      conditional: { color: 'bg-orange-100 text-orange-800', label: 'Conditional' },
      hybrid: { color: 'bg-green-100 text-green-800', label: 'Hybrid' }
    };
    
    const config = types[type] || types.sequential;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const renderWorkflowSteps = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Workflow Steps</h3>
        <Button type="button" onClick={addWorkflowStep} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Step
        </Button>
      </div>
      
      {formData.steps.map((step, index) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Step {step.step_order}</Badge>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            {formData.steps.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeWorkflowStep(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Step Name</Label>
              <Input
                value={step.step_name}
                onChange={(e) => updateWorkflowStep(index, 'step_name', e.target.value)}
                placeholder="e.g., Manager Approval"
              />
            </div>
            
            <div>
              <Label>Step Type</Label>
              <Select
                value={step.step_type}
                onValueChange={(value) => updateWorkflowStep(index, 'step_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">Approval</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="condition">Condition Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Approver Type</Label>
              <Select
                value={step.approver_type}
                onValueChange={(value) => updateWorkflowStep(index, 'approver_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Direct Manager</SelectItem>
                  <SelectItem value="role">Specific Role</SelectItem>
                  <SelectItem value="employee">Specific Employee</SelectItem>
                  <SelectItem value="department_head">Department Head</SelectItem>
                  <SelectItem value="hr">HR Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Timeout (Hours)</Label>
              <Input
                type="number"
                value={step.timeout_hours}
                onChange={(e) => updateWorkflowStep(index, 'timeout_hours', e.target.value)}
                min="1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={step.is_required}
                onCheckedChange={(checked) => updateWorkflowStep(index, 'is_required', checked)}
              />
              <Label>Required Step</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={step.escalation_enabled}
                onCheckedChange={(checked) => updateWorkflowStep(index, 'escalation_enabled', checked)}
              />
              <Label>Enable Escalation</Label>
            </div>
          </div>
          
          {step.escalation_enabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Escalation Hours</Label>
                <Input
                  type="number"
                  value={step.escalation_hours}
                  onChange={(e) => updateWorkflowStep(index, 'escalation_hours', e.target.value)}
                  min="1"
                />
              </div>
              
              <div>
                <Label>Escalate To</Label>
                <Select
                  value={step.escalation_to}
                  onValueChange={(value) => updateWorkflowStep(index, 'escalation_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select escalation target" />
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
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateWorkflow : handleCreateWorkflow} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Standard Leave Approval"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="workflow_type">Workflow Type</Label>
              <Select
                value={formData.workflow_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, workflow_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description of this approval workflow"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active Workflow</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.parallel_approval}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, parallel_approval: checked }))}
                  />
                  <Label>Parallel Approval</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.allow_delegation}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_delegation: checked }))}
                  />
                  <Label>Allow Delegation</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.require_all_approvals}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, require_all_approvals: checked }))}
                  />
                  <Label>Require All Approvals</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.allow_skip_levels}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allow_skip_levels: checked }))}
                  />
                  <Label>Allow Skip Levels</Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-4">
          {renderWorkflowSteps()}
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trigger Conditions</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Days</Label>
                <Input
                  type="number"
                  value={formData.trigger_conditions.min_days}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_conditions: {
                      ...prev.trigger_conditions,
                      min_days: e.target.value
                    }
                  }))}
                  placeholder="e.g., 3"
                  min="0"
                />
              </div>
              
              <div>
                <Label>Maximum Days</Label>
                <Input
                  type="number"
                  value={formData.trigger_conditions.max_days}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    trigger_conditions: {
                      ...prev.trigger_conditions,
                      max_days: e.target.value
                    }
                  }))}
                  placeholder="e.g., 30"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <Label>Amount Threshold</Label>
              <Input
                type="number"
                value={formData.trigger_conditions.amount_threshold}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  trigger_conditions: {
                    ...prev.trigger_conditions,
                    amount_threshold: e.target.value
                  }
                }))}
                placeholder="e.g., 10000"
                min="0"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Auto Rejection Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.auto_reject_timeout}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_reject_timeout: checked }))}
              />
              <Label>Auto Reject on Timeout</Label>
            </div>
            
            {formData.auto_reject_timeout && (
              <div>
                <Label>Auto Reject Days</Label>
                <Input
                  type="number"
                  value={formData.auto_reject_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, auto_reject_days: e.target.value }))}
                  placeholder="e.g., 7"
                  min="1"
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Recipients</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.notification_settings.notify_applicant}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notification_settings: {
                        ...prev.notification_settings,
                        notify_applicant: checked
                      }
                    }))}
                  />
                  <Label>Notify Applicant</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.notification_settings.notify_manager}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notification_settings: {
                        ...prev.notification_settings,
                        notify_manager: checked
                      }
                    }))}
                  />
                  <Label>Notify Manager</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.notification_settings.notify_hr}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notification_settings: {
                        ...prev.notification_settings,
                        notify_hr: checked
                      }
                    }))}
                  />
                  <Label>Notify HR</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.notification_settings.notify_admin}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notification_settings: {
                        ...prev.notification_settings,
                        notify_admin: checked
                      }
                    }))}
                  />
                  <Label>Notify Admin</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Methods</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.notification_settings.email_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      email_enabled: checked
                    }
                  }))}
                />
                <Label>Email</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.notification_settings.sms_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      sms_enabled: checked
                    }
                  }))}
                />
                <Label>SMS</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.notification_settings.in_app_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    notification_settings: {
                      ...prev.notification_settings,
                      in_app_enabled: checked
                    }
                  }))}
                />
                <Label>In-App</Label>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Approval Workflows</h1>
          <p className="text-gray-600">Configure and manage leave approval workflows and processes</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Approval Workflow</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Approval Workflows
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
                  <TableHead>Workflow Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.description && (
                          <div className="text-sm text-gray-500">{workflow.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getWorkflowTypeBadge(workflow.workflow_type)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span>{workflow.steps?.length || 0} steps</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(workflow.is_active)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(workflow)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleWorkflow(workflow.id, workflow.is_active)}
                          className={workflow.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow.id)}
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
            <DialogTitle>Edit Approval Workflow</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveApprovalWorkflows;