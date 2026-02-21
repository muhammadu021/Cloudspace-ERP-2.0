import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  X,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Eye,
  Download,
  Users
} from 'lucide-react';

const PayrollApproval = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState({
    totalPayrolls: 0,
    pendingApproval: 0,
    approvedPayrolls: 0,
    paidPayrolls: 0,
    totalAmount: '0.00',
    pendingAmount: '0.00',
    approvedAmount: '0.00',
    paidAmount: '0.00'
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { id: 'pending', label: 'Pending Approval', icon: Clock, color: 'text-orange-600' },
    { id: 'history', label: 'Approval History', icon: FileText, color: 'text-gray-600' }
  ];

  useEffect(() => {
    fetchStats();
    fetchPayrolls();
    fetchDepartments();
  }, [activeTab, currentPage, searchTerm, selectedPeriod, selectedDepartment]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/finance/payroll/approval-stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching payroll stats:', error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (activeTab) {
        case 'pending':
          endpoint = '/api/v1/finance/payroll/pending-approvals';
          break;
        case 'history':
          endpoint = '/api/v1/finance/payroll/approval-history';
          break;
        default:
          endpoint = '/api/v1/finance/payroll/pending-approvals';
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedPeriod && { period: selectedPeriod }),
        ...(selectedDepartment && { department: selectedDepartment })
      });

      const response = await fetch(`${endpoint}?${params}`);
      const data = await response.json();

      if (data.success) {
        setPayrolls(data.data.payrolls);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch payrolls');
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setError('Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/v1/hr/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleApprove = async (payrollId) => {
    try {
      const comments = prompt('Add approval comments (optional):');
      
      const response = await fetch(`/api/v1/finance/payroll/${payrollId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPayrolls();
        fetchStats();
      } else {
        setError(data.message || 'Failed to approve payroll');
      }
    } catch (error) {
      console.error('Error approving payroll:', error);
      setError('Failed to approve payroll');
    }
  };

  const handleReject = async (payrollId) => {
    try {
      const reason = prompt('Please provide a rejection reason:');
      if (!reason) return;

      const response = await fetch(`/api/v1/finance/payroll/${payrollId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        fetchPayrolls();
        fetchStats();
      } else {
        setError(data.message || 'Failed to reject payroll');
      }
    } catch (error) {
      console.error('Error rejecting payroll:', error);
      setError('Failed to reject payroll');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      finance_approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: X }
    };

    const config = statusConfig[status] || statusConfig.approved;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generatePeriodOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (loading && payrolls.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading payrolls...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Approval</h1>
          <p className="text-gray-600 mt-1">Finance approval for payroll processing</p>
        </div>
        <button
          onClick={fetchStats}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingApproval}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approvedPayrolls}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.approvedAmount)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-primary">{stats.paidPayrolls}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payrolls</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalPayrolls}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Periods</option>
              {generatePeriodOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedPeriod('');
                setSelectedDepartment('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Payroll List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.Employee?.User?.first_name} {payroll.Employee?.User?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payroll.Employee?.Department?.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {payroll.employee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payroll.pay_period_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(payroll.pay_period_start)} - {formatDate(payroll.pay_period_end)}
                    </div>
                    {payroll.workflow?.isHighValue && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                        High Value
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.gross_salary)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payroll.net_salary)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Deductions: {formatCurrency(payroll.total_deductions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payroll.status)}
                    {payroll.hr_approved_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        HR: {formatDate(payroll.hr_approved_at)}
                      </div>
                    )}
                    {payroll.finance_approved_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        Finance: {formatDate(payroll.finance_approved_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {activeTab === 'pending' && payroll.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleApprove(payroll.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve Payroll"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(payroll.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject Payroll"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && payrolls.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payrolls found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedPeriod || selectedDepartment
                ? 'Try adjusting your filters to see more results.'
                : `No payrolls in ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} status.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollApproval;