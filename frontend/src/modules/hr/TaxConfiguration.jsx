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
  Calculator,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Percent,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  X,
  Globe,
  Building
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const TaxConfiguration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // State for tax configurations
  const [taxConfigurations, setTaxConfigurations] = useState([]);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBracketsDialog, setShowBracketsDialog] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    tax_name: '',
    tax_code: '',
    tax_type: 'income_tax',
    country: 'USA',
    state_province: '',
    calculation_method: 'bracket',
    tax_brackets: [],
    flat_rate: '',
    formula: '',
    exemption_amount: '',
    standard_deduction: '',
    max_taxable_amount: '',
    min_taxable_amount: '',
    frequency: 'monthly',
    effective_from: '',
    effective_to: '',
    applies_to: 'all',
    employee_groups: [],
    is_employer_contribution: false,
    employer_rate: '',
    currency: 'USD',
    notes: ''
  });

  // Tax bracket form
  const [bracketForm, setBracketForm] = useState({
    min: '',
    max: '',
    rate: '',
    fixed_amount: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    tax_type: '',
    country: '',
    is_active: true
  });

  useEffect(() => {
    loadTaxConfigurations();
  }, [filters]);

  const loadTaxConfigurations = async () => {
    try {
      setLoading(true);
      const response = await payrollService.getTaxConfigurations(filters);
      setTaxConfigurations(response.data?.configurations || []);
    } catch (error) {
      toast.error('Failed to load tax configurations');
      console.error('Load tax configurations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTax = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      await payrollService.createTaxConfiguration(formData);
      
      toast.success('Tax configuration created successfully');
      setShowCreateDialog(false);
      resetForm();
      loadTaxConfigurations();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create tax configuration';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTax = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      await payrollService.updateTaxConfiguration(selectedTax.id, formData);
      
      toast.success('Tax configuration updated successfully');
      setShowEditDialog(false);
      resetForm();
      loadTaxConfigurations();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to update tax configuration';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTax = async (taxId) => {
    if (!confirm('Are you sure you want to delete this tax configuration? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await payrollService.deleteTaxConfiguration(taxId);
      
      toast.success('Tax configuration deleted successfully');
      loadTaxConfigurations();
      
    } catch (error) {
      toast.error('Failed to delete tax configuration');
      console.error('Delete tax configuration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTaxBracket = () => {
    if (!bracketForm.min || !bracketForm.rate) {
      toast.error('Minimum amount and rate are required');
      return;
    }

    const newBracket = {
      min: parseFloat(bracketForm.min),
      max: bracketForm.max ? parseFloat(bracketForm.max) : null,
      rate: parseFloat(bracketForm.rate),
      fixed_amount: bracketForm.fixed_amount ? parseFloat(bracketForm.fixed_amount) : 0
    };

    setFormData(prev => ({
      ...prev,
      tax_brackets: [...prev.tax_brackets, newBracket]
    }));

    setBracketForm({
      min: '',
      max: '',
      rate: '',
      fixed_amount: ''
    });
  };

  const removeTaxBracket = (index) => {
    setFormData(prev => ({
      ...prev,
      tax_brackets: prev.tax_brackets.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      tax_name: '',
      tax_code: '',
      tax_type: 'income_tax',
      country: 'USA',
      state_province: '',
      calculation_method: 'bracket',
      tax_brackets: [],
      flat_rate: '',
      formula: '',
      exemption_amount: '',
      standard_deduction: '',
      max_taxable_amount: '',
      min_taxable_amount: '',
      frequency: 'monthly',
      effective_from: '',
      effective_to: '',
      applies_to: 'all',
      employee_groups: [],
      is_employer_contribution: false,
      employer_rate: '',
      currency: 'USD',
      notes: ''
    });
    setFormErrors({});
    setSelectedTax(null);
  };

  const openEditDialog = (tax) => {
    setSelectedTax(tax);
    setFormData({
      tax_name: tax.tax_name || '',
      tax_code: tax.tax_code || '',
      tax_type: tax.tax_type || 'income_tax',
      country: tax.country || 'USA',
      state_province: tax.state_province || '',
      calculation_method: tax.calculation_method || 'bracket',
      tax_brackets: tax.tax_brackets || [],
      flat_rate: tax.flat_rate || '',
      formula: tax.formula || '',
      exemption_amount: tax.exemption_amount || '',
      standard_deduction: tax.standard_deduction || '',
      max_taxable_amount: tax.max_taxable_amount || '',
      min_taxable_amount: tax.min_taxable_amount || '',
      frequency: tax.frequency || 'monthly',
      effective_from: tax.effective_from || '',
      effective_to: tax.effective_to || '',
      applies_to: tax.applies_to || 'all',
      employee_groups: tax.employee_groups || [],
      is_employer_contribution: tax.is_employer_contribution || false,
      employer_rate: tax.employer_rate || '',
      currency: tax.currency || 'USD',
      notes: tax.notes || ''
    });
    setShowEditDialog(true);
  };

  const getTaxTypeBadge = (type) => {
    const typeConfig = {
      income_tax: { color: 'bg-blue-100 text-blue-800', icon: DollarSign },
      social_security: { color: 'bg-green-100 text-green-800', icon: Building },
      medicare: { color: 'bg-purple-100 text-purple-800', icon: FileText },
      state_tax: { color: 'bg-orange-100 text-orange-800', icon: Globe },
      local_tax: { color: 'bg-yellow-100 text-yellow-800', icon: Building },
      other: { color: 'bg-gray-100 text-gray-800', icon: Calculator }
    };

    const config = typeConfig[type] || typeConfig.other;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getCalculationMethodBadge = (method) => {
    const methodConfig = {
      bracket: { color: 'bg-blue-100 text-blue-800' },
      flat_rate: { color: 'bg-green-100 text-green-800' },
      formula: { color: 'bg-purple-100 text-purple-800' }
    };

    const config = methodConfig[method] || methodConfig.bracket;

    return (
      <Badge className={config.color}>
        {method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const renderForm = (isEdit = false) => (
    <form onSubmit={isEdit ? handleUpdateTax : handleCreateTax} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax_name">Tax Name *</Label>
            <Input
              value={formData.tax_name}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_name: e.target.value }))}
              placeholder="e.g., Federal Income Tax"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tax_code">Tax Code *</Label>
            <Input
              value={formData.tax_code}
              onChange={(e) => setFormData(prev => ({ ...prev, tax_code: e.target.value.toUpperCase() }))}
              placeholder="e.g., FIT"
              maxLength={20}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tax_type">Tax Type *</Label>
            <Select
              value={formData.tax_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tax_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income_tax">Income Tax</SelectItem>
                <SelectItem value="social_security">Social Security</SelectItem>
                <SelectItem value="medicare">Medicare</SelectItem>
                <SelectItem value="state_tax">State Tax</SelectItem>
                <SelectItem value="local_tax">Local Tax</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="CAN">Canada</SelectItem>
                <SelectItem value="GBR">United Kingdom</SelectItem>
                <SelectItem value="AUS">Australia</SelectItem>
                <SelectItem value="IND">India</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="state_province">State/Province</Label>
          <Input
            value={formData.state_province}
            onChange={(e) => setFormData(prev => ({ ...prev, state_province: e.target.value }))}
            placeholder="e.g., California, Ontario"
          />
        </div>
      </div>

      <Separator />

      {/* Calculation Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Calculation Method</h3>
        
        <div>
          <Label htmlFor="calculation_method">Method *</Label>
          <Select
            value={formData.calculation_method}
            onValueChange={(value) => setFormData(prev => ({ ...prev, calculation_method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bracket">Tax Brackets</SelectItem>
              <SelectItem value="flat_rate">Flat Rate</SelectItem>
              <SelectItem value="formula">Custom Formula</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.calculation_method === 'bracket' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Tax Brackets</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBracketsDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bracket
              </Button>
            </div>
            
            {formData.tax_brackets.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min Amount</TableHead>
                      <TableHead>Max Amount</TableHead>
                      <TableHead>Rate (%)</TableHead>
                      <TableHead>Fixed Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.tax_brackets.map((bracket, index) => (
                      <TableRow key={index}>
                        <TableCell>{payrollService.formatCurrency(bracket.min)}</TableCell>
                        <TableCell>{bracket.max ? payrollService.formatCurrency(bracket.max) : 'No limit'}</TableCell>
                        <TableCell>{bracket.rate}%</TableCell>
                        <TableCell>{payrollService.formatCurrency(bracket.fixed_amount)}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTaxBracket(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {formData.calculation_method === 'flat_rate' && (
          <div>
            <Label htmlFor="flat_rate">Flat Rate (%) *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.flat_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, flat_rate: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
        )}

        {formData.calculation_method === 'formula' && (
          <div>
            <Label htmlFor="formula">Custom Formula</Label>
            <Textarea
              value={formData.formula}
              onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
              placeholder="Enter custom tax calculation formula"
              rows={3}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Tax Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tax Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="exemption_amount">Exemption Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.exemption_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, exemption_amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="standard_deduction">Standard Deduction</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.standard_deduction}
              onChange={(e) => setFormData(prev => ({ ...prev, standard_deduction: e.target.value }))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_taxable_amount">Minimum Taxable Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.min_taxable_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, min_taxable_amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="max_taxable_amount">Maximum Taxable Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.max_taxable_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, max_taxable_amount: e.target.value }))}
              placeholder="Leave empty for no limit"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Effective Dates */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Effective Period</h3>
        
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
      </div>

      <Separator />

      {/* Employer Contribution */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employer Contribution</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_employer_contribution}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_employer_contribution: checked }))}
          />
          <Label>Employer also contributes to this tax</Label>
        </div>

        {formData.is_employer_contribution && (
          <div>
            <Label htmlFor="employer_rate">Employer Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.employer_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, employer_rate: e.target.value }))}
              placeholder="0.00"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about this tax configuration"
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
          <h1 className="text-3xl font-bold text-gray-900">Tax Configuration</h1>
          <p className="text-gray-600">Configure tax rules, brackets, and compliance settings</p>
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
                Add Tax Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Tax Configuration</DialogTitle>
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
              <Label htmlFor="filter_type">Tax Type</Label>
              <Select
                value={filters.tax_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, tax_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="income_tax">Income Tax</SelectItem>
                  <SelectItem value="social_security">Social Security</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="state_tax">State Tax</SelectItem>
                  <SelectItem value="local_tax">Local Tax</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter_country">Country</Label>
              <Select
                value={filters.country}
                onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Countries</SelectItem>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="CAN">Canada</SelectItem>
                  <SelectItem value="GBR">United Kingdom</SelectItem>
                  <SelectItem value="AUS">Australia</SelectItem>
                  <SelectItem value="IND">India</SelectItem>
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

      {/* Tax Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Tax Configurations
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
                  <TableHead>Tax Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country/Region</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Rate/Brackets</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxConfigurations.map((tax) => (
                  <TableRow key={tax.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tax.tax_name}</div>
                        <div className="text-sm text-gray-500">
                          <Badge variant="outline">{tax.tax_code}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTaxTypeBadge(tax.tax_type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tax.country}</div>
                        {tax.state_province && (
                          <div className="text-sm text-gray-500">{tax.state_province}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCalculationMethodBadge(tax.calculation_method)}
                    </TableCell>
                    <TableCell>
                      <div>
                        {tax.calculation_method === 'flat_rate' && (
                          <span className="font-medium">{tax.flat_rate}%</span>
                        )}
                        {tax.calculation_method === 'bracket' && (
                          <span className="text-sm text-gray-600">
                            {tax.tax_brackets?.length || 0} brackets
                          </span>
                        )}
                        {tax.calculation_method === 'formula' && (
                          <span className="text-sm text-gray-600">Custom formula</span>
                        )}
                        {tax.is_employer_contribution && (
                          <div className="text-xs text-primary">
                            Employer: {tax.employer_rate}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(tax.effective_from).toLocaleDateString()}</div>
                        {tax.effective_to && (
                          <div className="text-gray-500">
                            to {new Date(tax.effective_to).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tax.is_active ? (
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
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTax(tax);
                            // Open details dialog
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tax)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTax(tax.id)}
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
            <DialogTitle>Edit Tax Configuration</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
        </DialogContent>
      </Dialog>

      {/* Tax Bracket Dialog */}
      <Dialog open={showBracketsDialog} onOpenChange={setShowBracketsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tax Bracket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bracket_min">Minimum Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bracketForm.min}
                  onChange={(e) => setBracketForm(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bracket_max">Maximum Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bracketForm.max}
                  onChange={(e) => setBracketForm(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Leave empty for no limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bracket_rate">Tax Rate (%) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bracketForm.rate}
                  onChange={(e) => setBracketForm(prev => ({ ...prev, rate: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bracket_fixed">Fixed Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={bracketForm.fixed_amount}
                  onChange={(e) => setBracketForm(prev => ({ ...prev, fixed_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowBracketsDialog(false);
                  setBracketForm({ min: '', max: '', rate: '', fixed_amount: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={addTaxBracket}>
                Add Bracket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxConfiguration;