import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  Separator
} from '@/components/ui';
import { 
  Plus,
  Trash2,
  ArrowRight,
  ArrowDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';

const WorkflowBuilder = ({ workflow, onSave, onTest }) => {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    document_types: workflow?.document_types || [],
    auto_assign: workflow?.auto_assign || false,
    parallel_approval: workflow?.parallel_approval || false,
    steps: workflow?.steps || [
      {
        id: 1,
        name: 'Initial Review',
        type: 'approval',
        approvers: [],
        conditions: [],
        timeout_days: 3,
        escalation_enabled: true,
        escalation_days: 1,
        required: true
      }
    ]
  });

  const [activeStep, setActiveStep] = useState(0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (stepIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, [field]: value } : step
      )
    }));
  };

  const addStep = () => {
    const newStep = {
      id: formData.steps.length + 1,
      name: `Step ${formData.steps.length + 1}`,
      type: 'approval',
      approvers: [],
      conditions: [],
      timeout_days: 3,
      escalation_enabled: true,
      escalation_days: 1,
      required: true
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (stepIndex) => {
    if (formData.steps.length > 1) {
      setFormData(prev => ({
        ...prev,
        steps: prev.steps.filter((_, index) => index !== stepIndex)
      }));
      if (activeStep >= formData.steps.length - 1) {
        setActiveStep(Math.max(0, formData.steps.length - 2));
      }
    }
  };

  const addApprover = (stepIndex) => {
    const newApprover = {
      id: Date.now(),
      type: 'user',
      value: '',
      required: true
    };
    handleStepChange(stepIndex, 'approvers', [
      ...formData.steps[stepIndex].approvers,
      newApprover
    ]);
  };

  const removeApprover = (stepIndex, approverIndex) => {
    const updatedApprovers = formData.steps[stepIndex].approvers.filter(
      (_, index) => index !== approverIndex
    );
    handleStepChange(stepIndex, 'approvers', updatedApprovers);
  };

  const updateApprover = (stepIndex, approverIndex, field, value) => {
    const updatedApprovers = formData.steps[stepIndex].approvers.map((approver, index) =>
      index === approverIndex ? { ...approver, [field]: value } : approver
    );
    handleStepChange(stepIndex, 'approvers', updatedApprovers);
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleTest = () => {
    onTest(formData);
  };

  const renderWorkflowSettings = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="workflow_name">Workflow Name *</Label>
        <Input
          id="workflow_name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter workflow name"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="workflow_description">Description</Label>
        <Textarea
          id="workflow_description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the purpose and scope of this workflow"
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="document_types">Applicable Document Types</Label>
        <select value={formData.document_types[0] || ''} 
          onChange={(e) => (value) => handleInputChange('document_types', [value])(e.target.value)}
        >
          
            
          
          
            <option value="all">All Document Types</option>
            <option value="policy">Policies</option>
            <option value="procedure">Procedures</option>
            <option value="handbook">Handbooks</option>
            <option value="compliance">Compliance Documents</option>
            <option value="contract">Contracts</option>
            <option value="form">Forms</option>
          
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="auto_assign"
            checked={formData.auto_assign}
            onChange={(e) => handleInputChange('auto_assign', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="auto_assign">Auto-assign based on document type</Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="parallel_approval"
            checked={formData.parallel_approval}
            onChange={(e) => handleInputChange('parallel_approval', e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="parallel_approval">Allow parallel approvals</Label>
        </div>
      </div>

      {formData.parallel_approval && (
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-blue-800">Parallel Approval Mode</span>
          </div>
          <p className="text-sm text-primary-700">
            When enabled, multiple approvers in the same step can approve simultaneously. 
            The step completes when all required approvers have approved.
          </p>
        </div>
      )}
    </div>
  );

  const renderStepsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Steps</h3>
        <Button onClick={addStep} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="space-y-3">
        {formData.steps.map((step, index) => (
          <div key={step.id} className="relative">
            <Card 
              className={`cursor-pointer transition-colors ${
                activeStep === index ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveStep(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.approvers.length} approver(s) • {step.timeout_days} day timeout
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={step.required ? 'default' : 'secondary'}>
                      {step.required ? 'Required' : 'Optional'}
                    </Badge>
                    {formData.steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(index);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {index < formData.steps.length - 1 && (
              <div className="flex justify-center my-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepDetails = () => {
    if (formData.steps.length === 0) return null;
    
    const step = formData.steps[activeStep];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Step {activeStep + 1} Details</h3>
          <Badge variant={step.required ? 'default' : 'secondary'}>
            {step.required ? 'Required' : 'Optional'}
          </Badge>
        </div>

        <div>
          <Label htmlFor="step_name">Step Name</Label>
          <Input
            id="step_name"
            value={step.name}
            onChange={(e) => handleStepChange(activeStep, 'name', e.target.value)}
            placeholder="Enter step name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="step_type">Step Type</Label>
          <select value={step.type} 
            onChange={(e) => (value) => handleStepChange(activeStep, 'type', value)(e.target.value)}
          >
            
              
            
            
              <option value="approval">Approval</option>
              <option value="review">Review</option>
              <option value="notification">Notification</option>
              <option value="signature">Signature</option>
            
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeout_days">Timeout (Days)</Label>
            <Input
              id="timeout_days"
              type="number"
              value={step.timeout_days}
              onChange={(e) => handleStepChange(activeStep, 'timeout_days', parseInt(e.target.value))}
              min="1"
              max="30"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="escalation_days">Escalation After (Days)</Label>
            <Input
              id="escalation_days"
              type="number"
              value={step.escalation_days}
              onChange={(e) => handleStepChange(activeStep, 'escalation_days', parseInt(e.target.value))}
              min="1"
              max="30"
              className="mt-1"
              disabled={!step.escalation_enabled}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="step_required"
              checked={step.required}
              onChange={(e) => handleStepChange(activeStep, 'required', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="step_required">This step is required</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="escalation_enabled"
              checked={step.escalation_enabled}
              onChange={(e) => handleStepChange(activeStep, 'escalation_enabled', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="escalation_enabled">Enable escalation</Label>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Approvers</Label>
            <Button onClick={() => addApprover(activeStep)} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Approver
            </Button>
          </div>

          <div className="space-y-3">
            {step.approvers.map((approver, approverIndex) => (
              <div key={approver.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <select value={approver.type} 
                  onChange={(e) => (value) => updateApprover(activeStep, approverIndex, 'type', value)(e.target.value)}
                >
                  
                    
                  
                  
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="department">Department</option>
                    <option value="manager">Manager</option>
                  
                </select>

                <Input
                  value={approver.value}
                  onChange={(e) => updateApprover(activeStep, approverIndex, 'value', e.target.value)}
                  placeholder={`Enter ${approver.type} name`}
                  className="flex-1"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={approver.required}
                    onChange={(e) => updateApprover(activeStep, approverIndex, 'required', e.target.checked)}
                    className="rounded"
                  />
                  <Label className="text-sm">Required</Label>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeApprover(activeStep, approverIndex)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}

            {step.approvers.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No approvers added yet</p>
                <p className="text-sm">Click "Add Approver" to configure this step</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowPreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Workflow Preview</h3>
      
      <Card>
        <CardHeader>
          <CardTitle>{formData.name || 'Workflow Name'}</CardTitle>
          <CardDescription>{formData.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Document Types:</span>
                <span className="ml-2">{formData.document_types.join(', ') || 'All'}</span>
              </div>
              <div>
                <span className="font-medium">Total Steps:</span>
                <span className="ml-2">{formData.steps.length}</span>
              </div>
              <div>
                <span className="font-medium">Auto-assign:</span>
                <span className="ml-2">{formData.auto_assign ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="font-medium">Parallel Approval:</span>
                <span className="ml-2">{formData.parallel_approval ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {formData.steps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.type} • {step.approvers.length} approver(s) • {step.timeout_days}d timeout
                      </p>
                      {step.approvers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {step.approvers.map((approver, approverIndex) => (
                            <Badge key={approverIndex} variant="outline" className="text-xs">
                              {approver.type}: {approver.value || 'Not set'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.required && (
                        <Badge variant="default" className="text-xs">Required</Badge>
                      )}
                      {step.escalation_enabled && (
                        <Badge variant="outline" className="text-xs">Escalation</Badge>
                      )}
                    </div>
                  </div>
                  
                  {index < formData.steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {workflow ? 'Edit Workflow' : 'Create Workflow'}
          </h2>
          <p className="text-muted-foreground">
            Configure document approval processes and automation
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleTest}>
            <Play className="h-4 w-4 mr-2" />
            Test Workflow
          </Button>
          <Button onClick={handleSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {renderWorkflowSettings()}
            </CardContent>
          </Card>
        </div>

        {/* Steps Configuration */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepsList()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepDetails()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {renderWorkflowPreview()}
        </CardContent>
      </Card>

      {/* Status Information */}
      {workflow && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  workflow.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm">Status: {workflow.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Created: {new Date(workflow.created_at).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Documents Processed: {workflow.documents_processed || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowBuilder;