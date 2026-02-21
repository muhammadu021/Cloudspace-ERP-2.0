import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Separator
} from '../../components/ui';
import {
  CalendarDays,
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Send,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Phone,
  UserX,
  ArrowLeft,
  MessageSquare,
  Bell,
  Shield
} from 'lucide-react';
import { hrService } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Utility functions for leave management
const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', options);
  }
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

const formatDuration = (totalDays, isHalfDay, halfDayPeriod) => {
  if (isHalfDay) {
    return `0.5 day (${halfDayPeriod})`;
  }
  
  const days = parseFloat(totalDays);
  return days === 1 ? '1 day' : `${days} days`;
};

const getDaysUntilReturn = (endDate) => {
  const today = new Date();
  const returnDate = new Date(endDate);
  const timeDiff = returnDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const LeaveManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  
  // State for leave requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [currentLeaves, setCurrentLeaves] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    leave_type_id: '',
    employee_id: '',
    date_from: '',
    date_to: '',
    department_id: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Dialog states
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalAction, setApprovalAction] = useState('');

  // Form state for approval/rejection
  const [approvalData, setApprovalData] = useState({
    comments: '',
    conditions: '',
    alternative_dates: {
      start_date: '',
      end_date: ''
    }
  });

  // Form state for staff recall
  const [recallData, setRecallData] = useState({
    reason: '',
    urgency: 'normal',
    return_date: '',
    compensation_offered: false,
    compensation_details: '',
    contact_method: 'phone',
    additional_notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingRequests();
    } else if (activeTab === 'current') {
      loadCurrentLeaves();
    } else if (activeTab === 'setup') {
      loadLeaveTypes();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, filters, pagination.page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const typesResponse = await hrService.getLeaveTypes();
      console.log('Leave types response:', typesResponse);
      // Backend returns: { success: true, data: { leaveTypes: [...] } }
      const types = typesResponse?.data?.data?.leaveTypes || [];
      console.log('Extracted leave types:', types);
      setLeaveTypes(types);
    } catch (error) {
      console.error('Load initial data error:', error);
      toast.error('Failed to load initial data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        // Use submitted status for pending approvals (requests awaiting approval)
        status: filters.status || 'submitted',
        page: pagination.page,
        limit: pagination.limit
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await hrService.getLeaves(params);
      console.log('Pending requests response:', response);
      // Backend returns: { success: true, data: { leaves: [...], pagination: {...} } }
      const leaves = response?.data?.data?.leaves || [];
      const paginationData = response?.data?.data?.pagination || {};
      setLeaveRequests(leaves);
      setPagination(prev => ({
        ...prev,
        total: paginationData.totalItems || 0
      }));
    } catch (error) {
      toast.error('Failed to load pending requests');
      console.error('Load pending requests error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentLeaves = async () => {
    try {
      setLoading(true);
      console.log('Loading current leaves...');
      
      // Try the dedicated current leaves endpoint first
      try {
        const params = {
          status: 'approved',
          is_current: true,
          page: pagination.page,
          limit: pagination.limit
        };

        const response = await hrService.getCurrentLeaves(params);
        console.log('Current leaves response:', response);
        // Backend returns: { success: true, data: { leaves: [...] } }
        const leaves = response?.data?.data?.leaves || [];
        console.log('Current leaves found:', leaves.length);
        setCurrentLeaves(leaves);
      } catch (currentError) {
        console.log('Current leaves endpoint failed, trying fallback...');
        
        // Fallback: Get all approved leaves and filter for current ones
        const fallbackParams = {
          status: 'approved',
          page: pagination.page,
          limit: pagination.limit
        };
        
        const fallbackResponse = await hrService.getLeaves(fallbackParams);
        // Backend returns: { success: true, data: { leaves: [...] } }
        const allApproved = fallbackResponse?.data?.data?.leaves || [];
        
        // Filter for leaves that are currently active (today is between start and end date)
        const today = new Date();
        const currentLeaves = allApproved.filter(leave => {
          const startDate = new Date(leave.start_date);
          const endDate = new Date(leave.end_date);
          return startDate <= today && endDate >= today;
        });
        
        console.log('Fallback: Found', currentLeaves.length, 'current leaves out of', allApproved.length, 'approved leaves');
        setCurrentLeaves(currentLeaves);
      }
    } catch (error) {
      console.error('Load current leaves error:', error);
      toast.error('Failed to load current leaves: ' + (error.response?.data?.message || error.message));
      setCurrentLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      console.log('Loading leave types...');
      const response = await hrService.getLeaveTypes();
      console.log('Leave types response:', response);
      // Backend returns: { success: true, data: { leaveTypes: [...] } }
      const types = response?.data?.data?.leaveTypes || [];
      console.log('Extracted leave types:', types.length, types);
      setLeaveTypes(types);
    } catch (error) {
      console.error('Load leave types error:', error);
      toast('Failed to load leave types: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await hrService.getLeaveAnalytics({
        year: new Date().getFullYear()
      });
      console.log('Analytics response:', response);
      // Backend returns: { success: true, data: { overview: {...}, statusStats: [...], ... } }
      setAnalytics(response?.data?.data || {});
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async () => {
    try {
      setLoading(true);
      console.log('Approving leave:', selectedLeave.id, {
        comments: approvalData.comments,
        conditions: approvalData.conditions,
        approved_by: user.id
      });
      
      const response = await hrService.approveLeave(selectedLeave.id, {
        comments: approvalData.comments,
        conditions: approvalData.conditions,
        approved_by: user.id
      });
      
      console.log('Approval response:', response);
      toast.success('Leave request approved successfully');
      setShowApprovalDialog(false);
      resetApprovalForm();
      
      // Refresh both pending requests and current leaves
      await loadPendingRequests();
      if (activeTab === 'current') {
        await loadCurrentLeaves();
      }
      
    } catch (error) {
      console.error('Approve leave error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve leave request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async () => {
    try {
      setLoading(true);
      console.log('Rejecting leave:', selectedLeave.id, {
        reason: approvalData.comments,
        alternative_dates: approvalData.alternative_dates,
        rejected_by: user.id
      });
      
      const response = await hrService.rejectLeave(selectedLeave.id, {
        reason: approvalData.comments,
        alternative_dates: approvalData.alternative_dates,
        rejected_by: user.id
      });
      
      console.log('Rejection response:', response);
      toast.success('Leave request rejected successfully');
      setShowApprovalDialog(false);
      resetApprovalForm();
      
      // Refresh both pending requests and current leaves
      await loadPendingRequests();
      if (activeTab === 'current') {
        await loadCurrentLeaves();
      }
      
    } catch (error) {
      console.error('Reject leave error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject leave request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRecallStaff = async () => {
    try {
      setLoading(true);
      console.log('Recalling staff:', selectedLeave.id, {
        ...recallData,
        recalled_by: user.id,
        recall_date: new Date().toISOString()
      });
      
      const response = await hrService.recallStaff(selectedLeave.id, {
        ...recallData,
        recalled_by: user.id,
        recall_date: new Date().toISOString()
      });
      
      console.log('Recall response:', response);
      toast.success('Staff recall initiated successfully');
      setShowRecallDialog(false);
      resetRecallForm();
      await loadCurrentLeaves();
      
    } catch (error) {
      console.error('Staff recall error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate staff recall';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetApprovalForm = () => {
    setApprovalData({
      comments: '',
      conditions: '',
      alternative_dates: {
        start_date: '',
        end_date: ''
      }
    });
    setApprovalAction('');
    setSelectedLeave(null);
  };

  const resetRecallForm = () => {
    setRecallData({
      reason: '',
      urgency: 'normal',
      return_date: '',
      compensation_offered: false,
      compensation_details: '',
      contact_method: 'phone',
      additional_notes: ''
    });
    setSelectedLeave(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      recalled: { color: 'bg-orange-100 text-orange-800', icon: ArrowLeft },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { color: 'bg-blue-100 text-blue-800' },
      normal: { color: 'bg-gray-100 text-gray-800' },
      high: { color: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'bg-red-100 text-red-800' }
    };

    const config = urgencyConfig[urgency] || urgencyConfig.normal;
    return (
      <Badge className={config.color}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Administrative control for employee leave requests and policies</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Approvals
          </TabsTrigger>
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Current Leaves
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Leave Setup
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Leave Requests</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Badge variant="outline" className="px-3">
                    {leaveRequests.length} pending
                  </Badge>
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
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {leave.Employee?.User ? 
                                `${leave.Employee.User.first_name} ${leave.Employee.User.last_name}` : 
                                'N/A'
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.Employee?.employee_id} • {leave.Employee?.Department?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: leave.LeaveType?.color || '#3498db' }}
                            />
                            {leave.LeaveType?.name || leave.leave_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatDateRange(leave.start_date, leave.end_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDuration(leave.total_days, leave.is_half_day, leave.half_day_period)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(leave.applied_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getUrgencyBadge(leave.priority || 'normal')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setApprovalAction('approve');
                                setShowApprovalDialog(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setApprovalAction('reject');
                                setShowApprovalDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
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

        {/* Current Leaves Tab */}
        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Staff Currently on Leave</CardTitle>
                <Badge variant="outline" className="px-3">
                  {currentLeaves.length} on leave
                </Badge>
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
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {leave.Employee?.User ? 
                                `${leave.Employee.User.first_name} ${leave.Employee.User.last_name}` : 
                                'N/A'
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.Employee?.employee_id} • {leave.Employee?.Department?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: leave.LeaveType?.color || '#3498db' }}
                            />
                            {leave.LeaveType?.name || leave.leave_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatDateRange(leave.start_date, leave.end_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDuration(leave.total_days, leave.is_half_day, leave.half_day_period)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {new Date(leave.end_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getDaysUntilReturn(leave.end_date)} days remaining
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {leave.contact_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {leave.contact_number}
                              </div>
                            )}
                            {leave.emergency_contact && (
                              <div className="text-gray-500">
                                Emergency: {leave.emergency_contact}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setShowRecallDialog(true);
                              }}
                              className="text-orange-600 hover:text-orange-700"
                              title="Recall Staff"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Contact staff functionality
                                toast.info('Contact functionality coming soon');
                              }}
                              className="text-primary hover:text-primary-700"
                              title="Contact Staff"
                            >
                              <MessageSquare className="w-4 h-4" />
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

        {/* Leave Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/leaves/types')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Leave Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure different types of leave available to employees</p>
                <Button className="w-full">
                  Manage Leave Types
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/leaves/policies')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Leave Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Set up leave policies and rules for your organization</p>
                <Button className="w-full">
                  Manage Policies
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/leaves/workflows')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Approval Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure approval workflows and escalation rules</p>
                <Button className="w-full">
                  Setup Workflows
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/hr/leaves/access')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Staff Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage staff permissions and access controls</p>
                <Button className="w-full">
                  Manage Access
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info('Holiday calendar coming soon')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Holiday Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Set up public holidays and company-specific dates</p>
                <Button className="w-full">
                  Manage Holidays
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toast.info('Notification settings coming soon')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Configure notification settings and templates</p>
                <Button className="w-full">
                  Setup Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Leave Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="analytics_year">Year</Label>
                  <Select
                    value={filters.year || new Date().getFullYear().toString()}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="analytics_department">Department</Label>
                  <Select
                    value={filters.department_id || ''}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {/* Add department options here */}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="analytics_start_date">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="analytics_end_date">End Date</Label>
                  <Input
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Leave Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {analytics?.overview?.totalLeaves || 0}
                </div>
                <p className="text-xs text-gray-500">In {analytics?.overview?.year || new Date().getFullYear()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Leave Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.overview?.totalDays || 0}
                </div>
                <p className="text-xs text-gray-500">Days taken</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {analytics?.overview?.avgDuration || 0}
                </div>
                <p className="text-xs text-gray-500">Days per request</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Approval Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics?.approvalTimeStats?.avg_approval_days ? 
                    Math.round(analytics.approvalTimeStats.avg_approval_days * 10) / 10 : '0'}
                </div>
                <p className="text-xs text-gray-500">Days to approve</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.statusStats?.map((stat) => {
                    const total = analytics.statusStats.reduce((sum, s) => sum + parseInt(s.count), 0);
                    const percentage = total > 0 ? Math.round((parseInt(stat.count) / total) * 100) : 0;
                    
                    return (
                      <div key={stat.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(stat.status)}
                          <span className="text-sm">{stat.count} requests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Leave Types Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Types Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.typeStats?.map((stat) => {
                    const maxDays = Math.max(...(analytics.typeStats.map(s => parseInt(s.total_days || 0))));
                    const percentage = maxDays > 0 ? Math.round((parseInt(stat.total_days || 0) / maxDays) * 100) : 0;
                    
                    return (
                      <div key={stat.leave_type_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: stat.LeaveType?.color || '#3498db' }}
                          />
                          <span className="text-sm font-medium">{stat.LeaveType?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{stat.total_days || 0} days</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: stat.LeaveType?.color || '#3498db'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Leave Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.departmentStats?.map((stat, index) => {
                    const maxDays = Math.max(...(analytics.departmentStats.map(s => parseInt(s.total_days || 0))));
                    const percentage = maxDays > 0 ? Math.round((parseInt(stat.total_days || 0) / maxDays) * 100) : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {stat['Employee.Department.name'] || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {stat.count} requests • {stat.total_days || 0} days
                          </span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-600" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Leave Takers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Leave Takers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topLeaveTakers?.map((employee, index) => {
                    const maxDays = Math.max(...(analytics.topLeaveTakers.map(e => parseInt(e.total_days || 0))));
                    const percentage = maxDays > 0 ? Math.round((parseInt(employee.total_days || 0) / maxDays) * 100) : 0;
                    
                    return (
                      <div key={employee.employee_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              {employee.Employee?.User ? 
                                `${employee.Employee.User.first_name} ${employee.Employee.User.last_name}` : 
                                'Unknown'
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.Employee?.Department?.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {employee.total_days || 0} days
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center py-4 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Leaves */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leaves (Next 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.upcomingLeaves?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.upcomingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: leave.LeaveType?.color || '#3498db' }}
                        />
                        <div>
                          <div className="font-medium">
                            {leave.Employee?.User ? 
                              `${leave.Employee.User.first_name} ${leave.Employee.User.last_name}` : 
                              'Unknown'
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {leave.Employee?.Department?.name} • {leave.LeaveType?.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatDateRange(leave.start_date, leave.end_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(leave.total_days, leave.is_half_day, leave.half_day_period)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming leaves in the next 30 days
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leave Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.monthlyStats?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const monthData = analytics.monthlyStats.filter(stat => parseInt(stat.month) === month);
                      const totalDays = monthData.reduce((sum, stat) => sum + parseInt(stat.total_days || 0), 0);
                      const maxDays = Math.max(...Array.from({ length: 12 }, (_, j) => {
                        const m = j + 1;
                        const mData = analytics.monthlyStats.filter(stat => parseInt(stat.month) === m);
                        return mData.reduce((sum, stat) => sum + parseInt(stat.total_days || 0), 0);
                      }));
                      const height = maxDays > 0 ? Math.max((totalDays / maxDays) * 100, 5) : 5;
                      
                      return (
                        <div key={month} className="flex flex-col items-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {new Date(2024, month - 1).toLocaleDateString('en', { month: 'short' })}
                          </div>
                          <div className="w-full bg-gray-200 rounded-t" style={{ height: '60px' }}>
                            <div 
                              className="w-full bg-primary-500 rounded-t transition-all duration-300" 
                              style={{ 
                                height: `${height}%`,
                                marginTop: `${100 - height}%`
                              }}
                              title={`${totalDays} days in ${new Date(2024, month - 1).toLocaleDateString('en', { month: 'long' })}`}
                            />
                          </div>
                          <div className="text-xs font-medium mt-1">{totalDays}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Leave days taken per month
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              {/* Leave Details Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee:</span> {selectedLeave.Employee?.User ? 
                      `${selectedLeave.Employee.User.first_name} ${selectedLeave.Employee.User.last_name}` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Leave Type:</span> {selectedLeave.LeaveType?.name}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {formatDateRange(selectedLeave.start_date, selectedLeave.end_date)}
                  </div>
                  <div>
                    <span className="font-medium">Total Days:</span> {selectedLeave.total_days}
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (approvalAction === 'approve') {
                  handleApproveLeave();
                } else {
                  handleRejectLeave();
                }
              }} className="space-y-4">
                
                <div>
                  <Label htmlFor="comments">
                    {approvalAction === 'approve' ? 'Approval Comments' : 'Rejection Reason'} *
                  </Label>
                  <Textarea
                    value={approvalData.comments}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder={approvalAction === 'approve' ? 
                      'Add any conditions or notes for approval...' : 
                      'Please provide a reason for rejection...'
                    }
                    rows={3}
                    required
                  />
                </div>

                {approvalAction === 'approve' && (
                  <div>
                    <Label htmlFor="conditions">Conditions (Optional)</Label>
                    <Textarea
                      value={approvalData.conditions}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, conditions: e.target.value }))}
                      placeholder="Any specific conditions for this approval..."
                      rows={2}
                    />
                  </div>
                )}

                {approvalAction === 'reject' && (
                  <div>
                    <Label>Suggest Alternative Dates (Optional)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="alt_start_date">Alternative Start Date</Label>
                        <Input
                          type="date"
                          value={approvalData.alternative_dates.start_date}
                          onChange={(e) => setApprovalData(prev => ({
                            ...prev,
                            alternative_dates: {
                              ...prev.alternative_dates,
                              start_date: e.target.value
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="alt_end_date">Alternative End Date</Label>
                        <Input
                          type="date"
                          value={approvalData.alternative_dates.end_date}
                          onChange={(e) => setApprovalData(prev => ({
                            ...prev,
                            alternative_dates: {
                              ...prev.alternative_dates,
                              end_date: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowApprovalDialog(false);
                      resetApprovalForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {loading ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Staff Recall Dialog */}
      <Dialog open={showRecallDialog} onOpenChange={setShowRecallDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recall Staff from Leave</DialogTitle>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              {/* Staff Details Summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee:</span> {selectedLeave.Employee?.User ? 
                      `${selectedLeave.Employee.User.first_name} ${selectedLeave.Employee.User.last_name}` : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Current Leave:</span> {selectedLeave.LeaveType?.name}
                  </div>
                  <div>
                    <span className="font-medium">Expected Return:</span> {new Date(selectedLeave.end_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Days Remaining:</span> {getDaysUntilReturn(selectedLeave.end_date)}
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleRecallStaff();
              }} className="space-y-4">
                
                <div>
                  <Label htmlFor="reason">Reason for Recall *</Label>
                  <Textarea
                    value={recallData.reason}
                    onChange={(e) => setRecallData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please provide a detailed reason for recalling the staff member..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={recallData.urgency}
                      onValueChange={(value) => setRecallData(prev => ({ ...prev, urgency: value }))}
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
                  
                  <div>
                    <Label htmlFor="return_date">Requested Return Date</Label>
                    <Input
                      type="date"
                      value={recallData.return_date}
                      onChange={(e) => setRecallData(prev => ({ ...prev, return_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_method">Preferred Contact Method</Label>
                  <Select
                    value={recallData.contact_method}
                    onValueChange={(value) => setRecallData(prev => ({ ...prev, contact_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={recallData.compensation_offered}
                    onCheckedChange={(checked) => setRecallData(prev => ({ ...prev, compensation_offered: checked }))}
                  />
                  <Label>Offer Compensation</Label>
                </div>

                {recallData.compensation_offered && (
                  <div>
                    <Label htmlFor="compensation_details">Compensation Details</Label>
                    <Textarea
                      value={recallData.compensation_details}
                      onChange={(e) => setRecallData(prev => ({ ...prev, compensation_details: e.target.value }))}
                      placeholder="Details of compensation offered (overtime pay, time off in lieu, etc.)"
                      rows={2}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <Textarea
                    value={recallData.additional_notes}
                    onChange={(e) => setRecallData(prev => ({ ...prev, additional_notes: e.target.value }))}
                    placeholder="Any additional information or instructions..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRecallDialog(false);
                      resetRecallForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {loading ? 'Processing...' : 'Initiate Recall'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Leave Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Request ID</Label>
                  <p className="font-semibold">{selectedLeave.leave_request_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Employee</Label>
                  <p>{selectedLeave.Employee?.User ? 
                    `${selectedLeave.Employee.User.first_name} ${selectedLeave.Employee.User.last_name}` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedLeave.Employee?.employee_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p>{selectedLeave.Employee?.Department?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Leave Type</Label>
                  <p className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: selectedLeave.LeaveType?.color || '#3498db' }}
                    />
                    {selectedLeave.LeaveType?.name || selectedLeave.leave_type}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Duration</Label>
                  <p>{formatDuration(selectedLeave.total_days, selectedLeave.is_half_day, selectedLeave.half_day_period)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                  <p>{new Date(selectedLeave.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">End Date</Label>
                  <p>{new Date(selectedLeave.end_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Reason</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedLeave.reason}</p>
              </div>
              
              {selectedLeave.handover_notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Handover Notes</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedLeave.handover_notes}</p>
                </div>
              )}

              {selectedLeave.contact_number && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Contact Information</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p>Phone: {selectedLeave.contact_number}</p>
                    {selectedLeave.emergency_contact && (
                      <p>Emergency Contact: {selectedLeave.emergency_contact}</p>
                    )}
                  </div>
                </div>
              )}
              
              {selectedLeave.rejection_reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Rejection Reason</Label>
                  <p className="mt-1 p-3 bg-red-50 rounded-md text-red-700">{selectedLeave.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;