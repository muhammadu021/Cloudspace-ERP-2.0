import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Textarea,
  Alert,
  AlertDescription,
  Separator
} from '@/components/ui';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  TrendingUp,
  Building,
  CreditCard,
  Shield,
  Send,
  RefreshCw,
  Calculator,
  Banknote,
  Receipt
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { financeService } from '../../services/financeService';
import { selectApiData } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PayrollApproval = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState('pending');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedPayrolls, setSelectedPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [approvalForm, setApprovalForm] = useState({
    comments: '',
    approved_amount: '',
    payment_method: 'bank_transfer',
    payment_date: '',
    authorization_code: ''
  });

  const [rejectionForm, setRejectionForm] = useState({
    reason: '',
    comments: '',
    required_changes: ''
  });

  // Fetch pending payroll approvals
  const { data: pendingPayrolls, isLoading: pendingLoading, refetch: refetchPending } = useQuery(
    ['pending-payroll-approvals', currentPage, searchTerm, filterPeriod, filterDepartment],
    () => financeService.getPendingPayrollApprovals({
      page: currentPage,
      limit: 20,
      search: searchTerm,
      period: filterPeriod,
      department: filterDepartment
    }),
    {
      select: selectApiData,
      keepPreviousData: true
    }
  );

  // Fetch payroll approval history
  const { data: approvalHistory, isLoading: historyLoading } = useQuery(
    ['payroll-approval-history', selectedTab],
    () => financeService.getPayrollApprovalHistory({
      page: 1,
      limit: 50
    }),
    {
      select: selectApiData,
      enabled: selectedTab === 'history'
    }
  );

  // Fetch approval statistics
  const { data: approvalStats } = useQuery(
    'payroll-approval-stats',
    () => financeService.getPayrollApprovalStats(),
    {
      select: selectApiData
    }
  );

  // Approve payroll mutation
  const approvePayrollMutation = useMutation(
    ({ id, approvalData }) => financeService.approvePayroll(id, approvalData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-payroll-approvals');
        queryClient.invalidateQueries('payroll-approval-history');
        queryClient.invalidateQueries('payroll-approval-stats');
        setShowApprovalModal(false);
        setSelectedPayroll(null);
        setApprovalForm({
          comments: '',
          approved_amount: '',
          payment_method: 'bank_transfer',
          payment_date: '',
          authorization_code: ''
        });
      }
    }
  );

  // Reject payroll mutation
  const rejectPayrollMutation = useMutation(
    ({ id, rejectionData }) => financeService.rejectPayroll(id, rejectionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-payroll-approvals');
        queryClient.invalidateQueries('payroll-approval-history');
        queryClient.invalidateQueries('payroll-approval-stats');
        setShowRejectionModal(false);
        setSelectedPayroll(null);
        setRejectionForm({
          reason: '',
          comments: '',
          required_changes: ''
        });
      }
    }
  );

  // Bulk approve mutation
  const bulkApproveMutation = useMutation(
    (approvalData) => financeService.bulkApprovePayroll(approvalData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-payroll-approvals');
        queryClient.invalidateQueries('payroll-approval-stats');
        setSelectedPayrolls([]);
      }
    }
  );

  const handleApprove = (payroll) => {
    setSelectedPayroll(payroll);
    setApprovalForm(prev => ({
      ...prev,
      approved_amount: payroll.total_amount,
      payment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    }));
    setShowApprovalModal(true);
  };

  const handleReject = (payroll) => {
    setSelectedPayroll(payroll);
    setShowRejectionModal(true);
  };

  const handleViewDetails = async (payroll) => {
    try {
      const response = await financeService.getPayrollById(payroll.id);
      const detailedPayroll = selectApiData(response);
      setSelectedPayroll(detailedPayroll);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching payroll details:', error);
    }
  };

  const handleSubmitApproval = async (e) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    try {
      await approvePayrollMutation.mutateAsync({
        id: selectedPayroll.id,
        approvalData: {
          ...approvalForm,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error approving payroll:', error);
    }
  };

  const handleSubmitRejection = async (e) => {
    e.preventDefault();
    if (!selectedPayroll) return;

    try {
      await rejectPayrollMutation.mutateAsync({
        id: selectedPayroll.id,
        rejectionData: {
          ...rejectionForm,
          rejected_by: user.id,
          rejected_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error rejecting payroll:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPayrolls.length === 0) return;

    try {
      await bulkApproveMutation.mutateAsync({
        payroll_ids: selectedPayrolls,
        approved_by: user.id,
        comments: 'Bulk approval',
        payment_method: 'bank_transfer'
      });
    } catch (error) {
      console.error('Error bulk approving payrolls:', error);
    }
  };

  const togglePayrollSelection = (payrollId) => {
    setSelectedPayrolls(prev =>
      prev.includes(payrollId)
        ? prev.filter(id => id !== payrollId)
        : [...prev, payrollId]
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted_to_finance: { color: 'bg-orange-100 text-orange-800', icon: Clock, label: 'Pending Finance Approval' },
      finance_approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Finance Approved' },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Finance Rejected' },
      paid: { color: 'bg-purple-100 text-purple-800', icon: CreditCard, label: 'Paid' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const mockPendingPayrolls = [];

  const mockApprovalHistory = [];

  const displayPendingPayrolls = pendingPayrolls?.payrolls || mockPendingPayrolls;
  const displayApprovalHistory = approvalHistory?.approvals || mockApprovalHistory;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Approval</h1>
          <p className="text-gray-600 mt-1">Finance final approval for payroll processing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetchPending()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {selectedPayrolls.length > 0 && (
            <Button
              onClick={handleBulkApprove}
              className="flex items-center gap-2"
              disabled={bulkApproveMutation.isLoading}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Selected ({selectedPayrolls.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {approvalStats?.pending_count || displayPendingPayrolls.length}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(approvalStats?.pending_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvalStats?.approved_count || 0}
            </div>
            <p className="text-xs text-gray-500">
              {formatCurrency(approvalStats?.approved_amount || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Employees Affected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {approvalStats?.total_employees || displayPendingPayrolls.reduce((sum, p) => sum + p.employee_count, 0)}
            </div>
            <p className="text-xs text-gray-500">
              Across all pending payrolls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {approvalStats?.avg_processing_time || '0'}h
            </div>
            <p className="text-xs text-gray-500">
              Average approval time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Approvals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Approval History
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Queue
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Search</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search payrolls..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Period</Label>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
                  >
                    <option value="">All Periods</option>
                    <option value="december-2024">December 2024</option>
                    <option value="november-2024">November 2024</option>
                    <option value="october-2024">October 2024</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="mt-1 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
                  >
                    <option value="">All Departments</option>
                    <option value="engineering">Engineering</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterPeriod('');
                      setFilterDepartment('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payrolls Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payrolls Awaiting Finance Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : displayPendingPayrolls.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No pending approvals</h3>
                  <p className="text-gray-500">All payrolls have been processed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedPayrolls.length === displayPendingPayrolls.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPayrolls(displayPendingPayrolls.map(p => p.id));
                              } else {
                                setSelectedPayrolls([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead>Period & Department</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Amount Details</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayPendingPayrolls.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedPayrolls.includes(payroll.id)}
                              onChange={() => togglePayrollSelection(payroll.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{payroll.period_name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {payroll.department}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{payroll.employee_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-green-600">
                                {formatCurrency(payroll.total_amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Gross: {formatCurrency(payroll.gross_amount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Deductions: {formatCurrency(payroll.deductions)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{formatDate(payroll.submitted_at)}</div>
                              <div className="text-xs text-gray-500">{payroll.submitted_by.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(payroll.payment_due_date)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payroll.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  payroll.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                              }
                            >
                              {payroll.priority?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payroll.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(payroll)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(payroll)}
                                className="text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(payroll)}
                                className="text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period & Department</TableHead>
                        <TableHead>Employees</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Approved Date</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayApprovalHistory.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{approval.period_name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {approval.department}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{approval.employee_count}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {formatCurrency(approval.total_amount)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium">{approval.approved_by.name}</div>
                              <div className="text-xs text-gray-500">{approval.approved_by.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(approval.approved_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(approval.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(approval)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Download Report"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Queue Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Payment Queue</h3>
                <p className="text-gray-500">Approved payrolls ready for payment processing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      {showApprovalModal && selectedPayroll && (
        <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Payroll - {selectedPayroll.period_name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitApproval} className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Payroll Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-700">Department:</span>
                    <span className="ml-2 font-medium">{selectedPayroll.department}</span>
                  </div>
                  <div>
                    <span className="text-primary-700">Employees:</span>
                    <span className="ml-2 font-medium">{selectedPayroll.employee_count}</span>
                  </div>
                  <div>
                    <span className="text-primary-700">Gross Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedPayroll.gross_amount)}</span>
                  </div>
                  <div>
                    <span className="text-primary-700">Net Amount:</span>
                    <span className="ml-2 font-medium text-green-600">{formatCurrency(selectedPayroll.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approved_amount">Approved Amount *</Label>
                  <Input
                    id="approved_amount"
                    type="number"
                    value={approvalForm.approved_amount}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, approved_amount: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <select
                    id="payment_method"
                    value={approvalForm.payment_method}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_date">Payment Date *</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={approvalForm.payment_date}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, payment_date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="authorization_code">Authorization Code</Label>
                  <Input
                    id="authorization_code"
                    value={approvalForm.authorization_code}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, authorization_code: e.target.value }))}
                    placeholder="Enter authorization code"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Approval Comments</Label>
                <Textarea
                  id="comments"
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Add any comments about this approval..."
                  rows={3}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  By approving this payroll, you authorize the payment of {formatCurrency(approvalForm.approved_amount || selectedPayroll.total_amount)} to {selectedPayroll.employee_count} employees. This action cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={approvePayrollMutation.isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approvePayrollMutation.isLoading ? 'Approving...' : 'Approve Payroll'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedPayroll && (
        <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Payroll - {selectedPayroll.period_name}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitRejection} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Payroll Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-red-700">Department:</span>
                    <span className="ml-2 font-medium">{selectedPayroll.department}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Employees:</span>
                    <span className="ml-2 font-medium">{selectedPayroll.employee_count}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedPayroll.total_amount)}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Submitted:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedPayroll.submitted_at)}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reason">Rejection Reason *</Label>
                <select
                  id="reason"
                  value={rejectionForm.reason}
                  onChange={(e) => setRejectionForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="calculation_errors">Calculation Errors</option>
                  <option value="missing_documentation">Missing Documentation</option>
                  <option value="policy_violations">Policy Violations</option>
                  <option value="budget_constraints">Budget Constraints</option>
                  <option value="incomplete_data">Incomplete Data</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="comments">Detailed Comments *</Label>
                <Textarea
                  id="comments"
                  value={rejectionForm.comments}
                  onChange={(e) => setRejectionForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Provide detailed explanation for the rejection..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="required_changes">Required Changes</Label>
                <Textarea
                  id="required_changes"
                  value={rejectionForm.required_changes}
                  onChange={(e) => setRejectionForm(prev => ({ ...prev, required_changes: e.target.value }))}
                  placeholder="Specify what changes are needed before resubmission..."
                  rows={3}
                />
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rejecting this payroll will send it back to HR for corrections. The payroll will need to be reprocessed and resubmitted for approval.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={rejectPayrollMutation.isLoading}
                  variant="destructive"
                >
                  {rejectPayrollMutation.isLoading ? 'Rejecting...' : 'Reject Payroll'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPayroll && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Payroll Details - {selectedPayroll.period_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payroll Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-medium">{selectedPayroll.period_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{selectedPayroll.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Employees:</span>
                      <span className="font-medium">{selectedPayroll.employee_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedPayroll.status)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedPayroll.gross_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deductions:</span>
                      <span className="font-medium text-red-600">{formatCurrency(selectedPayroll.deductions)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Net Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(selectedPayroll.total_amount)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional details would go here */}
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Detailed payroll breakdown and employee records would be displayed here</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PayrollApproval;