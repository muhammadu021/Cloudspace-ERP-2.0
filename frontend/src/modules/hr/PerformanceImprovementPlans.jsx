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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Textarea,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  TrendingUp,
  AlertTriangle,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  User,
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  Download,
  MessageSquare,
  Activity,
  BarChart3
} from 'lucide-react';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PerformanceImprovementPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
  const [pips, setPips] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showPipDialog, setShowPipDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedPip, setSelectedPip] = useState(null);
  
  const [pipForm, setPipForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    performance_issues: '',
    improvement_goals: [],
    success_criteria: '',
    support_resources: '',
    review_schedule: 'weekly',
    duration_months: 3,
    manager_id: '',
    hr_partner_id: ''
  });
  
  const [progressForm, setProgressForm] = useState({
    progress_notes: '',
    goals_met: [],
    challenges: '',
    next_steps: '',
    manager_feedback: '',
    employee_feedback: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    manager: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadInitialData = async () => {
    try {
      const [employeesResponse, departmentsResponse] = await Promise.all([
        employeeService.getEmployees({ limit: 100 }),
        employeeService.getDepartments()
      ]);
      
      setEmployees(employeesResponse.data?.data?.employees || employeesResponse.data?.employees || []);
      setDepartments(departmentsResponse.data?.data?.departments || departmentsResponse.data?.departments || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        status: activeTab === 'active' ? 'active' : 
               activeTab === 'completed' ? 'completed' : 
               activeTab === 'overdue' ? 'overdue' : ''
      };
      
      const [pipsResponse, analyticsResponse] = await Promise.all([
        performanceService.getPIPs(params),
        performanceService.getPerformanceAnalytics({ type: 'pips' })
      ]);
      
      console.log('PIPs response:', pipsResponse);
      console.log('Analytics response:', analyticsResponse);
      // Backend returns: { success: true, data: { pips: [...] } }
      setPips(pipsResponse.data?.pips || []);
      setAnalytics(analyticsResponse.data || {});
    } catch (error) {
      toast.error('Failed to load PIP data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePip = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createPIP(pipForm);
      toast.success('Performance Improvement Plan created successfully');
      setShowPipDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create PIP');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.updatePIP(selectedPip.id, {
        ...progressForm,
        last_review_date: new Date().toISOString()
      });
      toast.success('Progress updated successfully');
      setShowProgressDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.active;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const ActivePipsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active PIPs</p>
                <p className="text-2xl font-bold text-primary">{analytics.activePips || 8}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics.successRate || 73}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{analytics.overduePips || 2}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.avgDuration || 3.2}mo</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PIPs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pips.map((pip) => (
          <Card key={pip.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{pip.employee?.name}</p>
                    <p className="text-sm text-gray-500">{pip.employee?.position}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(pip.status)}>
                  {pip.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-sm">{pip.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{pip.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{pip.progress || 0}%</span>
                  </div>
                  <Progress value={pip.progress || 0} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span>{pip.duration_months} months</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Next Review:</span>
                  <span>{performanceService.formatDate(pip.next_review_date)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Priority:</span>
                  <Badge className={getPriorityColor(pip.priority)} size="sm">
                    {pip.priority}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedPip(pip);
                      setShowProgressDialog(true);
                    }}
                  >
                    Update Progress
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const CompletedPipsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Completed PIPs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pips.map((pip) => (
                <TableRow key={pip.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{pip.employee?.name}</p>
                        <p className="text-sm text-gray-500">{pip.employee?.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{pip.title}</TableCell>
                  <TableCell>{pip.duration_months} months</TableCell>
                  <TableCell>
                    <Badge className={pip.outcome === 'successful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {pip.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell>{performanceService.formatDate(pip.completion_date)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Improvement Plans</h1>
          <p className="text-gray-600">Manage and track employee performance improvement initiatives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setShowPipDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New PIP
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search PIPs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <select 
              value={filters.department} 
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id.toString()}>
                  {department.name}
                </option>
              ))}
            </select>
            <select 
              value={filters.manager} 
              onChange={(e) => setFilters(prev => ({ ...prev, manager: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Managers</option>
              {employees.filter(emp => emp.role === 'manager' || emp.role === 'supervisor').map((employee) => (
                <option key={employee.id} value={employee.id.toString()}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Active PIPs
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActivePipsTab />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedPipsTab />
        </TabsContent>

        <TabsContent value="overdue">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Overdue PIPs</h3>
            <p className="text-gray-600">PIPs that require immediate attention</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">PIP Analytics</h3>
            <p className="text-gray-600">Detailed analytics and reporting coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create PIP Dialog */}
      <Dialog open={showPipDialog} onOpenChange={setShowPipDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Performance Improvement Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePip} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={pipForm.employee_id} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (months) *</Label>
                <select 
                  value={pipForm.duration_months.toString()} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="1">1 month</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">PIP Title *</Label>
              <Input
                value={pipForm.title}
                onChange={(e) => setPipForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter PIP title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                value={pipForm.description}
                onChange={(e) => setPipForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this PIP"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="performance_issues">Performance Issues *</Label>
              <Textarea
                value={pipForm.performance_issues}
                onChange={(e) => setPipForm(prev => ({ ...prev, performance_issues: e.target.value }))}
                placeholder="Detail the specific performance issues that need to be addressed"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="success_criteria">Success Criteria *</Label>
              <Textarea
                value={pipForm.success_criteria}
                onChange={(e) => setPipForm(prev => ({ ...prev, success_criteria: e.target.value }))}
                placeholder="Define what success looks like for this PIP"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="support_resources">Support & Resources</Label>
              <Textarea
                value={pipForm.support_resources}
                onChange={(e) => setPipForm(prev => ({ ...prev, support_resources: e.target.value }))}
                placeholder="List training, mentoring, or other resources that will be provided"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="review_schedule">Review Schedule</Label>
              <select 
                value={pipForm.review_schedule} 
                onChange={(e) => setPipForm(prev => ({ ...prev, review_schedule: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPipDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create PIP'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Progress - {selectedPip?.employee?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProgress} className="space-y-6">
            <div>
              <Label htmlFor="progress_notes">Progress Notes *</Label>
              <Textarea
                value={progressForm.progress_notes}
                onChange={(e) => setProgressForm(prev => ({ ...prev, progress_notes: e.target.value }))}
                placeholder="Document progress made since last review"
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="challenges">Challenges & Obstacles</Label>
              <Textarea
                value={progressForm.challenges}
                onChange={(e) => setProgressForm(prev => ({ ...prev, challenges: e.target.value }))}
                placeholder="Any challenges or obstacles encountered"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="next_steps">Next Steps</Label>
              <Textarea
                value={progressForm.next_steps}
                onChange={(e) => setProgressForm(prev => ({ ...prev, next_steps: e.target.value }))}
                placeholder="Action items for the next review period"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="manager_feedback">Manager Feedback</Label>
              <Textarea
                value={progressForm.manager_feedback}
                onChange={(e) => setProgressForm(prev => ({ ...prev, manager_feedback: e.target.value }))}
                placeholder="Manager's observations and feedback"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="employee_feedback">Employee Feedback</Label>
              <Textarea
                value={progressForm.employee_feedback}
                onChange={(e) => setProgressForm(prev => ({ ...prev, employee_feedback: e.target.value }))}
                placeholder="Employee's self-assessment and feedback"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowProgressDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Progress'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceImprovementPlans;