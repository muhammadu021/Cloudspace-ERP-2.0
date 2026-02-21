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
  Download,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Mail,
  Printer,
  Settings,
  Layers,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Upload,
  Copy,
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Save,
  Play
} from 'lucide-react';
import payrollService from '../../services/payrollService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PayslipGeneration = () => {
  // Fixed Template icon import issue
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  
  // State for data
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [generatedPayslips, setGeneratedPayslips] = useState([]);
  
  // Dialog states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showBulkGenerateDialog, setShowBulkGenerateDialog] = useState(false);
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Form states
  const [generateForm, setGenerateForm] = useState({
    period_id: '',
    template_id: '',
    employee_ids: [],
    department_id: '',
    generation_type: 'selected', // 'all', 'selected', 'department'
    include_draft: false,
    auto_send: false,
    send_method: 'email'
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    template_type: 'standard',
    layout: 'portrait',
    header_content: '',
    footer_content: '',
    company_logo: '',
    color_scheme: 'blue',
    font_family: 'Arial',
    font_size: '12',
    include_company_details: true,
    include_employee_photo: false,
    include_qr_code: false,
    custom_fields: [],
    is_default: false
  });

  const [distributionForm, setDistributionForm] = useState({
    payslip_ids: [],
    distribution_method: 'email',
    email_subject: '',
    email_message: '',
    send_immediately: true,
    schedule_date: '',
    include_password_protection: true
  });

  const [filters, setFilters] = useState({
    period_id: '',
    status: '',
    template_id: '',
    search: '',
    page: 1,
    limit: 10
  });

  const [formErrors, setFormErrors] = useState({});
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'generated') {
      loadGeneratedPayslips();
    }
  }, [activeTab, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [periodsResponse] = await Promise.all([
        payrollService.getPayrollPeriods({ limit: 50 })
      ]);
      
      setPayrollPeriods(periodsResponse.data?.periods || []);
      
      // Mock data for templates, employees, and departments
      setTemplates([
        {
          id: 1,
          name: 'Standard Template',
          description: 'Default company payslip template',
          template_type: 'standard',
          layout: 'portrait',
          color_scheme: 'blue',
          is_default: true,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Executive Template',
          description: 'Premium template for executives',
          template_type: 'premium',
          layout: 'landscape',
          color_scheme: 'green',
          is_default: false,
          created_at: '2024-01-15'
        },
        {
          id: 3,
          name: 'Minimal Template',
          description: 'Clean and simple design',
          template_type: 'minimal',
          layout: 'portrait',
          color_scheme: 'gray',
          is_default: false,
          created_at: '2024-02-01'
        }
      ]);
      
      setEmployees([
        { id: 1, name: 'John Doe', employee_id: 'EMP001', department_id: 1, department: 'Engineering', email: 'john@company.com' },
        { id: 2, name: 'Jane Smith', employee_id: 'EMP002', department_id: 2, department: 'Marketing', email: 'jane@company.com' },
        { id: 3, name: 'Mike Johnson', employee_id: 'EMP003', department_id: 3, department: 'Sales', email: 'mike@company.com' },
        { id: 4, name: 'Sarah Wilson', employee_id: 'EMP004', department_id: 1, department: 'Engineering', email: 'sarah@company.com' },
        { id: 5, name: 'David Brown', employee_id: 'EMP005', department_id: 4, department: 'HR', email: 'david@company.com' }
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

  const loadPayrollRecords = async (periodId) => {
    try {
      setLoading(true);
      const response = await payrollService.getPayrollRecords({ 
        period_id: periodId,
        status: generateForm.include_draft ? undefined : 'approved'
      });
      setPayrollRecords(response.data?.payrolls || []);
    } catch (error) {
      toast.error('Failed to load payroll records');
      console.error('Load payroll records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneratedPayslips = async () => {
    try {
      setLoading(true);
      // Mock generated payslips data
      const mockPayslips = [
        {
          id: 1,
          employee_name: 'John Doe',
          employee_id: 'EMP001',
          period_name: 'January 2024',
          template_name: 'Standard Template',
          status: 'generated',
          generated_at: '2024-01-31T10:00:00Z',
          sent_at: null,
          download_count: 0,
          file_size: '245 KB'
        },
        {
          id: 2,
          employee_name: 'Jane Smith',
          employee_id: 'EMP002',
          period_name: 'January 2024',
          template_name: 'Standard Template',
          status: 'sent',
          generated_at: '2024-01-31T10:00:00Z',
          sent_at: '2024-01-31T11:30:00Z',
          download_count: 2,
          file_size: '251 KB'
        },
        {
          id: 3,
          employee_name: 'Mike Johnson',
          employee_id: 'EMP003',
          period_name: 'January 2024',
          template_name: 'Executive Template',
          status: 'failed',
          generated_at: '2024-01-31T10:00:00Z',
          sent_at: null,
          download_count: 0,
          file_size: null,
          error_message: 'Email delivery failed'
        }
      ];
      
      setGeneratedPayslips(mockPayslips);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: mockPayslips.length,
        itemsPerPage: 10
      });
    } catch (error) {
      toast.error('Failed to load generated payslips');
      console.error('Load generated payslips error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslips = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      if (!generateForm.period_id || !generateForm.template_id) {
        setFormErrors({
          general: 'Please select both a payroll period and template'
        });
        return;
      }

      if (generateForm.generation_type === 'selected' && generateForm.employee_ids.length === 0) {
        setFormErrors({
          general: 'Please select at least one employee'
        });
        return;
      }

      // Mock payslip generation
      const generationData = {
        period_id: generateForm.period_id,
        template_id: generateForm.template_id,
        employee_ids: generateForm.employee_ids,
        department_id: generateForm.department_id,
        generation_type: generateForm.generation_type,
        include_draft: generateForm.include_draft,
        auto_send: generateForm.auto_send,
        send_method: generateForm.send_method
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const employeeCount = generateForm.generation_type === 'all' ? employees.length :
                           generateForm.generation_type === 'department' ? 
                           employees.filter(e => e.department_id.toString() === generateForm.department_id).length :
                           generateForm.employee_ids.length;

      toast.success(`Successfully generated ${employeeCount} payslips`);
      
      if (generateForm.auto_send) {
        toast.success(`Payslips sent via ${generateForm.send_method}`);
      }

      // Reset form
      setGenerateForm({
        period_id: '',
        template_id: '',
        employee_ids: [],
        department_id: '',
        generation_type: 'selected',
        include_draft: false,
        auto_send: false,
        send_method: 'email'
      });

      // Refresh generated payslips
      loadGeneratedPayslips();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate payslips';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setFormErrors({});

      // Mock template creation
      const newTemplate = {
        id: templates.length + 1,
        ...templateForm,
        created_at: new Date().toISOString()
      };

      setTemplates(prev => [...prev, newTemplate]);
      
      toast.success('Template created successfully');
      setShowTemplateDialog(false);
      resetTemplateForm();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to create template';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDistributePayslips = async () => {
    try {
      setLoading(true);
      setFormErrors({});

      if (distributionForm.payslip_ids.length === 0) {
        setFormErrors({
          general: 'Please select payslips to distribute'
        });
        return;
      }

      // Mock distribution
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`Distributed ${distributionForm.payslip_ids.length} payslips via ${distributionForm.distribution_method}`);
      
      setShowDistributionDialog(false);
      setDistributionForm({
        payslip_ids: [],
        distribution_method: 'email',
        email_subject: '',
        email_message: '',
        send_immediately: true,
        schedule_date: '',
        include_password_protection: true
      });

      loadGeneratedPayslips();
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to distribute payslips';
      toast.error(errorMessage);
      
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowPreviewDialog(true);
  };

  const handleDownloadPayslip = (payslip) => {
    // Mock download
    toast.success(`Downloading payslip for ${payslip.employee_name}`);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      template_type: 'standard',
      layout: 'portrait',
      header_content: '',
      footer_content: '',
      company_logo: '',
      color_scheme: 'blue',
      font_family: 'Arial',
      font_size: '12',
      include_company_details: true,
      include_employee_photo: false,
      include_qr_code: false,
      custom_fields: [],
      is_default: false
    });
    setFormErrors({});
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      generated: { color: 'bg-blue-100 text-blue-800', icon: FileText },
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.generated;
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
          <h1 className="text-3xl font-bold text-gray-900">Payslip Generation</h1>
          <p className="text-gray-600">Generate, customize, and distribute employee payslips</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Bulk Download
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowDistributionDialog(true)}
          >
            <Send className="w-4 h-4" />
            Distribute
          </Button>
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generated" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generated
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Generate Payslips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Generation Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="period_id">Payroll Period *</Label>
                    <Select
                      value={generateForm.period_id}
                      onValueChange={(value) => {
                        setGenerateForm(prev => ({ ...prev, period_id: value }));
                        loadPayrollRecords(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payroll period" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollPeriods.map((period) => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name} ({payrollService.formatPayrollPeriod(period)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="template_id">Template *</Label>
                    <Select
                      value={generateForm.template_id}
                      onValueChange={(value) => setGenerateForm(prev => ({ ...prev, template_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name} {template.is_default && '(Default)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="generation_type">Generation Type</Label>
                    <Select
                      value={generateForm.generation_type}
                      onValueChange={(value) => setGenerateForm(prev => ({ ...prev, generation_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="selected">Selected Employees</SelectItem>
                        <SelectItem value="department">By Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {generateForm.generation_type === 'department' && (
                    <div>
                      <Label htmlFor="department_id">Department</Label>
                      <Select
                        value={generateForm.department_id}
                        onValueChange={(value) => setGenerateForm(prev => ({ ...prev, department_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department.id} value={department.id.toString()}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Options</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generateForm.include_draft}
                        onCheckedChange={(checked) => setGenerateForm(prev => ({ ...prev, include_draft: checked }))}
                      />
                      <Label>Include Draft Records</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={generateForm.auto_send}
                        onCheckedChange={(checked) => setGenerateForm(prev => ({ ...prev, auto_send: checked }))}
                      />
                      <Label>Auto-Send After Generation</Label>
                    </div>

                    {generateForm.auto_send && (
                      <div>
                        <Label htmlFor="send_method">Send Method</Label>
                        <Select
                          value={generateForm.send_method}
                          onValueChange={(value) => setGenerateForm(prev => ({ ...prev, send_method: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="portal">Employee Portal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Generation Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div>Period: {payrollPeriods.find(p => p.id.toString() === generateForm.period_id)?.name || 'Not selected'}</div>
                      <div>Template: {templates.find(t => t.id.toString() === generateForm.template_id)?.name || 'Not selected'}</div>
                      <div>Type: {generateForm.generation_type.replace('_', ' ')}</div>
                      <div>Records: {payrollRecords.length} available</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Selection */}
              {generateForm.generation_type === 'selected' && payrollRecords.length > 0 && (
                <div>
                  <Label>Select Employees</Label>
                  <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setGenerateForm(prev => ({
                                    ...prev,
                                    employee_ids: payrollRecords.map(r => r.employee_id)
                                  }));
                                } else {
                                  setGenerateForm(prev => ({
                                    ...prev,
                                    employee_ids: []
                                  }));
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Net Salary</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={generateForm.employee_ids.includes(record.employee_id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setGenerateForm(prev => ({
                                      ...prev,
                                      employee_ids: [...prev.employee_ids, record.employee_id]
                                    }));
                                  } else {
                                    setGenerateForm(prev => ({
                                      ...prev,
                                      employee_ids: prev.employee_ids.filter(id => id !== record.employee_id)
                                    }));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {record.Employee?.User ? 
                                    `${record.Employee.User.first_name} ${record.Employee.User.last_name}` : 
                                    'N/A'
                                  }
                                </div>
                                <div className="text-sm text-gray-500">
                                  {record.Employee?.employee_id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{record.Employee?.Department?.name}</TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {payrollService.formatCurrency(record.net_salary, record.currency)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(record.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleGeneratePayslips}
                  disabled={loading || !generateForm.period_id || !generateForm.template_id}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {loading ? 'Generating...' : 'Generate Payslips'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Preview functionality
                    toast.info('Preview functionality coming soon');
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Payslip Templates
                </CardTitle>
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTemplate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Template Name *</Label>
                          <Input
                            value={templateForm.name}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Executive Template"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="template_type">Template Type</Label>
                          <Select
                            value={templateForm.template_type}
                            onValueChange={(value) => setTemplateForm(prev => ({ ...prev, template_type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          value={templateForm.description}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Template description"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="layout">Layout</Label>
                          <Select
                            value={templateForm.layout}
                            onValueChange={(value) => setTemplateForm(prev => ({ ...prev, layout: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="color_scheme">Color Scheme</Label>
                          <Select
                            value={templateForm.color_scheme}
                            onValueChange={(value) => setTemplateForm(prev => ({ ...prev, color_scheme: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="green">Green</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                              <SelectItem value="purple">Purple</SelectItem>
                              <SelectItem value="gray">Gray</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="font_family">Font Family</Label>
                          <Select
                            value={templateForm.font_family}
                            onValueChange={(value) => setTemplateForm(prev => ({ ...prev, font_family: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Calibri">Calibri</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Template Options</Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={templateForm.include_company_details}
                              onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, include_company_details: checked }))}
                            />
                            <Label>Include Company Details</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={templateForm.include_employee_photo}
                              onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, include_employee_photo: checked }))}
                            />
                            <Label>Include Employee Photo</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={templateForm.include_qr_code}
                              onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, include_qr_code: checked }))}
                            />
                            <Label>Include QR Code</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={templateForm.is_default}
                              onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, is_default: checked }))}
                            />
                            <Label>Set as Default</Label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="header_content">Header Content</Label>
                          <Textarea
                            value={templateForm.header_content}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, header_content: e.target.value }))}
                            placeholder="Header text or HTML content"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="footer_content">Footer Content</Label>
                          <Textarea
                            value={templateForm.footer_content}
                            onChange={(e) => setTemplateForm(prev => ({ ...prev, footer_content: e.target.value }))}
                            placeholder="Footer text or HTML content"
                            rows={3}
                          />
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

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowTemplateDialog(false);
                            resetTemplateForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Template'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        {template.is_default && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{template.template_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Layout:</span>
                          <span className="capitalize">{template.layout}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Color:</span>
                          <span className="capitalize">{template.color_scheme}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreviewDialog(true);
                          }}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateForm(template);
                            setShowTemplateDialog(true);
                          }}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Copy template
                            const newTemplate = {
                              ...template,
                              id: templates.length + 1,
                              name: `${template.name} (Copy)`,
                              is_default: false
                            };
                            setTemplates(prev => [...prev, newTemplate]);
                            toast.success('Template copied successfully');
                          }}
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        {!template.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setTemplates(prev => prev.filter(t => t.id !== template.id));
                              toast.success('Template deleted successfully');
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Tab */}
        <TabsContent value="generated" className="space-y-6">
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
                  <Label htmlFor="filter_period">Period</Label>
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
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_template">Template</Label>
                  <Select
                    value={filters.template_id}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, template_id: value, page: 1 }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Templates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Templates</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter_search">Search</Label>
                  <Input
                    placeholder="Employee name or ID"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Payslips Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generated Payslips
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadGeneratedPayslips}
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
                        <TableHead>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDistributionForm(prev => ({
                                  ...prev,
                                  payslip_ids: generatedPayslips.map(p => p.id)
                                }));
                              } else {
                                setDistributionForm(prev => ({
                                  ...prev,
                                  payslip_ids: []
                                }));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>File Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedPayslips.map((payslip) => (
                        <TableRow key={payslip.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={distributionForm.payslip_ids.includes(payslip.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDistributionForm(prev => ({
                                    ...prev,
                                    payslip_ids: [...prev.payslip_ids, payslip.id]
                                  }));
                                } else {
                                  setDistributionForm(prev => ({
                                    ...prev,
                                    payslip_ids: prev.payslip_ids.filter(id => id !== payslip.id)
                                  }));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payslip.employee_name}</div>
                              <div className="text-sm text-gray-500">{payslip.employee_id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{payslip.period_name}</TableCell>
                          <TableCell>{payslip.template_name}</TableCell>
                          <TableCell>
                            {getStatusBadge(payslip.status)}
                            {payslip.error_message && (
                              <div className="text-xs text-red-600 mt-1">
                                {payslip.error_message}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(payslip.generated_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(payslip.generated_at).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>{payslip.file_size}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewPayslip(payslip)}
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadPayslip(payslip)}
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              
                              {payslip.status === 'generated' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDistributionForm(prev => ({
                                      ...prev,
                                      payslip_ids: [payslip.id]
                                    }));
                                    setShowDistributionDialog(true);
                                  }}
                                  title="Send"
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

                  {/* Bulk Actions */}
                  {distributionForm.payslip_ids.length > 0 && (
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600 flex items-center">
                        {distributionForm.payslip_ids.length} selected
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setShowDistributionDialog(true)}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Selected
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Bulk download
                          toast.success(`Downloading ${distributionForm.payslip_ids.length} payslips`);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Selected
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Distribution Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Distribution Analytics</h3>
                <p>Distribution statistics and delivery reports will be shown here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Distribution Dialog */}
      <Dialog open={showDistributionDialog} onOpenChange={setShowDistributionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Distribute Payslips</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="distribution_method">Distribution Method</Label>
              <Select
                value={distributionForm.distribution_method}
                onValueChange={(value) => setDistributionForm(prev => ({ ...prev, distribution_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="portal">Employee Portal</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {distributionForm.distribution_method === 'email' && (
              <>
                <div>
                  <Label htmlFor="email_subject">Email Subject</Label>
                  <Input
                    value={distributionForm.email_subject}
                    onChange={(e) => setDistributionForm(prev => ({ ...prev, email_subject: e.target.value }))}
                    placeholder="Your payslip for [Period]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email_message">Email Message</Label>
                  <Textarea
                    value={distributionForm.email_message}
                    onChange={(e) => setDistributionForm(prev => ({ ...prev, email_message: e.target.value }))}
                    placeholder="Dear [Employee Name], Please find your payslip attached..."
                    rows={4}
                  />
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={distributionForm.send_immediately}
                  onCheckedChange={(checked) => setDistributionForm(prev => ({ ...prev, send_immediately: checked }))}
                />
                <Label>Send Immediately</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={distributionForm.include_password_protection}
                  onCheckedChange={(checked) => setDistributionForm(prev => ({ ...prev, include_password_protection: checked }))}
                />
                <Label>Password Protection</Label>
              </div>
            </div>

            {!distributionForm.send_immediately && (
              <div>
                <Label htmlFor="schedule_date">Schedule Date</Label>
                <Input
                  type="datetime-local"
                  value={distributionForm.schedule_date}
                  onChange={(e) => setDistributionForm(prev => ({ ...prev, schedule_date: e.target.value }))}
                />
              </div>
            )}

            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Distribution Summary</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div>Payslips: {distributionForm.payslip_ids.length} selected</div>
                <div>Method: {distributionForm.distribution_method}</div>
                <div>Timing: {distributionForm.send_immediately ? 'Immediate' : 'Scheduled'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDistributionDialog(false);
                  setDistributionForm({
                    payslip_ids: [],
                    distribution_method: 'email',
                    email_subject: '',
                    email_message: '',
                    send_immediately: true,
                    schedule_date: '',
                    include_password_protection: true
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleDistributePayslips} disabled={loading}>
                {loading ? 'Distributing...' : 'Distribute Payslips'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPayslip ? `Payslip Preview - ${selectedPayslip.employee_name}` : 'Template Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-8 min-h-[600px]">
            <div className="text-center text-gray-500 py-20">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Payslip Preview</h3>
              <p>Interactive payslip preview will be rendered here.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayslipGeneration;