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
  Plus,
  Edit,
  Trash2,
  Settings,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X,
  ArrowLeft
} from 'lucide-react';
import leaveService from '../../services/leaveService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LeaveTypesSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3498db',
    max_days_per_year: '',
    max_consecutive_days: '',
    min_notice_days: '',
    max_advance_days: '',
    carry_forward_allowed: false,
    carry_forward_max_days: '',
    carry_forward_expiry_months: '',
    pro_rata_calculation: true,
    weekend_included: false,
    holiday_included: false,
    half_day_allowed: true,
    documentation_required: false,
    approval_required: true,
    auto_approval_days: '',
    gender_restriction: 'none',
    employment_type_restriction: 'none',
    department_restriction: 'none',
    minimum_service_months: '',
    maximum_service_years: '',
    is_active: true,
    is_paid: true,
    accrual_type: 'annual',
    accrual_frequency: 'monthly',
    accrual_rate: '',
    negative_balance_allowed: false,
    encashment_allowed: false,
    encashment_max_days: '',
    priority: 'normal'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveTypes();
      console.log('Leave types response:', response); // Debug log
      // Backend returns: { success: true, data: { leaveTypes: [...] } }
      const types = response.data?.leaveTypes || [];
      console.log('Extracted leave types:', types);
      setLeaveTypes(types);
    } catch (error) {
      toast.error('Failed to load leave types');
      console.error('Load leave types error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeaveType = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      // Clean up form data - remove empty strings and convert numbers
      const cleanedData = { ...formData };
      
      // Convert empty strings to null for optional numeric fields
      const numericFields = [
        'max_days_per_year', 'max_consecutive_days', 'min_notice_days', 
        'max_advance_days', 'carry_forward_max_days', 'carry_forward_expiry_months',
        'auto_approval_days', 'minimum_service_months', 'maximum_service_years',
        'accrual_rate', 'encashment_max_days'
      ];
      
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === null || cleanedData[field] === undefined) {
          delete cleanedData[field];
        }
      });

      const response = await leaveService.createLeaveType(cleanedData);
      
      toast.success('Leave type created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadLeaveTypes();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create leave type';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeaveType = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      // Clean up form data - remove empty strings and convert numbers
      const cleanedData = { ...formData };
      
      // Convert empty strings to null for optional numeric fields
      const numericFields = [
        'max_days_per_year', 'max_consecutive_days', 'min_notice_days', 
        'max_advance_days', 'carry_forward_max_days', 'carry_forward_expiry_months',
        'auto_approval_days', 'minimum_service_months', 'maximum_service_years',
        'accrual_rate', 'encashment_max_days'
      ];
      
      numericFields.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === null || cleanedData[field] === undefined) {
          delete cleanedData[field];
        }
      });

      const response = await leaveService.updateLeaveType(selectedLeaveType.id, cleanedData);
      
      toast.success('Leave type updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadLeaveTypes();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update leave type';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLeaveType = async (leaveTypeId) => {
    if (!confirm('Are you sure you want to delete this leave type? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await leaveService.deleteLeaveType(leaveTypeId);
      
      toast.success('Leave type deleted successfully');
      loadLeaveTypes();
      
    } catch (error) {
      toast.error('Failed to delete leave type');
      console.error('Delete leave type error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '#3498db',
      max_days_per_year: '',
      max_consecutive_days: '',
      min_notice_days: '',
      max_advance_days: '',
      carry_forward_allowed: false,
      carry_forward_max_days: '',
      carry_forward_expiry_months: '',
      pro_rata_calculation: true,
      weekend_included: false,
      holiday_included: false,
      half_day_allowed: true,
      documentation_required: false,
      approval_required: true,
      auto_approval_days: '',
      gender_restriction: 'none',
      employment_type_restriction: 'none',
      department_restriction: 'none',
      minimum_service_months: '',
      maximum_service_years: '',
      is_active: true,
      is_paid: true,
      accrual_type: 'annual',
      accrual_frequency: 'monthly',
      accrual_rate: '',
      negative_balance_allowed: false,
      encashment_allowed: false,
      encashment_max_days: '',
      priority: 'normal'
    });
    setFormErrors({});
    setSelectedLeaveType(null);
  };

  const openEditDialog = (leaveType) => {
    setSelectedLeaveType(leaveType);
    setFormData({
      name: leaveType.name || '',
      code: leaveType.code || '',
      description: leaveType.description || '',
      color: leaveType.color || '#3498db',
      max_days_per_year: leaveType.max_days_per_year || '',
      max_consecutive_days: leaveType.max_consecutive_days || '',
      min_notice_days: leaveType.min_notice_days || '',
      max_advance_days: leaveType.max_advance_days || '',
      carry_forward_allowed: leaveType.carry_forward_allowed || false,
      carry_forward_max_days: leaveType.carry_forward_max_days || '',
      carry_forward_expiry_months: leaveType.carry_forward_expiry_months || '',
      pro_rata_calculation: leaveType.pro_rata_calculation !== false,
      weekend_included: leaveType.weekend_included || false,
      holiday_included: leaveType.holiday_included || false,
      half_day_allowed: leaveType.half_day_allowed !== false,
      documentation_required: leaveType.documentation_required || false,
      approval_required: leaveType.approval_required !== false,
      auto_approval_days: leaveType.auto_approval_days || '',
      gender_restriction: leaveType.gender_restriction || 'none',
      employment_type_restriction: leaveType.employment_type_restriction || 'none',
      department_restriction: leaveType.department_restriction || 'none',
      minimum_service_months: leaveType.minimum_service_months || '',
      maximum_service_years: leaveType.maximum_service_years || '',
      is_active: leaveType.is_active !== false,
      is_paid: leaveType.is_paid !== false,
      accrual_type: leaveType.accrual_type || 'annual',
      accrual_frequency: leaveType.accrual_frequency || 'monthly',
      accrual_rate: leaveType.accrual_rate || '',
      negative_balance_allowed: leaveType.negative_balance_allowed || false,
      encashment_allowed: leaveType.encashment_allowed || false,
      encashment_max_days: leaveType.encashment_max_days || '',
      priority: leaveType.priority || 'normal'
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

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateLeaveType : handleCreateLeaveType} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Leave Type Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Annual Leave"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="code">Code *</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., AL"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description of this leave type"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-16 h-10"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#3498db"
              />
            </div>
          </div>
          
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
        </div>
      </div>

      <Separator />

      {/* Leave Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Leave Limits</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max_days_per_year">Max Days Per Year</Label>
            <Input
              type="number"
              value={formData.max_days_per_year}
              onChange={(e) => setFormData(prev => ({ ...prev, max_days_per_year: e.target.value }))}
              placeholder="e.g., 21"
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="max_consecutive_days">Max Consecutive Days</Label>
            <Input
              type="number"
              value={formData.max_consecutive_days}
              onChange={(e) => setFormData(prev => ({ ...prev, max_consecutive_days: e.target.value }))}
              placeholder="e.g., 15"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_notice_days">Minimum Notice Days</Label>
            <Input
              type="number"
              value={formData.min_notice_days}
              onChange={(e) => setFormData(prev => ({ ...prev, min_notice_days: e.target.value }))}
              placeholder="e.g., 7"
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="max_advance_days">Max Advance Booking Days</Label>
            <Input
              type="number"
              value={formData.max_advance_days}
              onChange={(e) => setFormData(prev => ({ ...prev, max_advance_days: e.target.value }))}
              placeholder="e.g., 365"
              min="0"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Carry Forward Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Carry Forward Settings</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.carry_forward_allowed}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, carry_forward_allowed: checked }))}
          />
          <Label>Allow Carry Forward</Label>
        </div>

        {formData.carry_forward_allowed && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="carry_forward_max_days">Max Carry Forward Days</Label>
              <Input
                type="number"
                value={formData.carry_forward_max_days}
                onChange={(e) => setFormData(prev => ({ ...prev, carry_forward_max_days: e.target.value }))}
                placeholder="e.g., 5"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="carry_forward_expiry_months">Carry Forward Expiry (Months)</Label>
              <Input
                type="number"
                value={formData.carry_forward_expiry_months}
                onChange={(e) => setFormData(prev => ({ ...prev, carry_forward_expiry_months: e.target.value }))}
                placeholder="e.g., 3"
                min="1"
                max="12"
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Accrual Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Accrual Settings</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="accrual_type">Accrual Type</Label>
            <Select
              value={formData.accrual_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, accrual_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="none">No Accrual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="accrual_frequency">Accrual Frequency</Label>
            <Select
              value={formData.accrual_frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, accrual_frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="accrual_rate">Accrual Rate (Days per Period)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.accrual_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, accrual_rate: e.target.value }))}
              placeholder="e.g., 1.75"
              min="0"
            />
            <small className="text-gray-500">Leave days earned per accrual period</small>
          </div>
        </div>
      </div>

      <Separator />

      {/* Leave Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Leave Options</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paid: checked }))}
              />
              <Label>Paid Leave</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.half_day_allowed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, half_day_allowed: checked }))}
              />
              <Label>Allow Half Day</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.weekend_included}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, weekend_included: checked }))}
              />
              <Label>Include Weekends</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.holiday_included}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, holiday_included: checked }))}
              />
              <Label>Include Holidays</Label>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.approval_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approval_required: checked }))}
              />
              <Label>Approval Required</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.documentation_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, documentation_required: checked }))}
              />
              <Label>Documentation Required</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.negative_balance_allowed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, negative_balance_allowed: checked }))}
              />
              <Label>Allow Negative Balance</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.encashment_allowed}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, encashment_allowed: checked }))}
              />
              <Label>Allow Encashment</Label>
            </div>
          </div>
        </div>
        
        
        {formData.encashment_allowed && (
          <div>
            <Label htmlFor="encashment_max_days">Max Encashment Days</Label>
            <Input
              type="number"
              value={formData.encashment_max_days}
              onChange={(e) => setFormData(prev => ({ ...prev, encashment_max_days: e.target.value }))}
              placeholder="e.g., 10"
              min="0"
            />
            <small className="text-gray-500">Maximum days that can be encashed per year</small>
          </div>
        )}
      </div>

      <Separator />

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label>Active</Label>
        </div>
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Types Setup</h1>
            <p className="text-gray-600">Configure and manage different types of leave</p>
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Leave Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Leave Type</DialogTitle>
            </DialogHeader>
            {renderForm(false)}
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Leave Types
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
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Max Days/Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((leaveType) => (
                  <TableRow key={leaveType.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: leaveType.color }}
                        />
                        <div>
                          <div className="font-medium">{leaveType.name}</div>
                          {leaveType.description && (
                            <div className="text-sm text-gray-500">{leaveType.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{leaveType.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {leaveType.max_days_per_year || 'Unlimited'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {leaveType.is_paid && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                        )}
                        {leaveType.approval_required && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Approval Required</Badge>
                        )}
                        {leaveType.carry_forward_allowed && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Carry Forward</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(leaveType.is_active)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(leaveType)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLeaveType(leaveType.id)}
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
            <DialogTitle>Edit Leave Type</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveTypesSetup;