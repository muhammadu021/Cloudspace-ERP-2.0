import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Edit, 
  Trash2, 
  Settings,
  CheckCircle,
  XCircle,
  Users,
  HardDrive,
  Calendar,
  CreditCard,
  Filter,
  Package,
  Eye
} from 'lucide-react';
import CreateCompanyModal from './components/CreateCompanyModal';
import EditCompanyModal from './components/EditCompanyModal';
import ManageFeaturesModal from './components/ManageFeaturesModal';
import CompanyStatsCard from './components/CompanyStatsCard';
import PackageManagement from './components/PackageManagement';
import CompanySettingsModal from './components/CompanySettingsModal';
import { API_URL } from '@/services/api';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showPackageManagement, setShowPackageManagement] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadCompanies();
    loadStats();
  }, [currentPage, searchTerm, filterPlan, filterStatus]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterPlan && { subscription_plan: filterPlan }),
        ...(filterStatus && { subscription_status: filterStatus })
      });

      const response = await fetch(`${API_URL}/companies?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data.companies);
        setTotalPages(data.data.pagination.pages);
      } else {
        console.error('Failed to load companies:', data.message);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateCompany = () => {
    setShowCreateModal(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleManageFeatures = (company) => {
    setSelectedCompany(company);
    setShowSettingsModal(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to deactivate this company?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Company deactivated successfully');
        loadCompanies();
        loadStats();
      } else {
        alert('Failed to deactivate company: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deactivating company');
    }
  };

  const getPlanBadgeColor = (plan) => {
    const colors = {
      trial: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800',
      custom: 'bg-orange-100 text-orange-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleApproveCompany = async (companyId) => {
    if (!confirm('Are you sure you want to approve this company? This will activate their account and start their trial period.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/${companyId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Company approved successfully! The admin user can now log in.');
        loadCompanies();
        loadStats();
      } else {
        alert('Failed to approve company: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving company:', error);
      alert('Error approving company');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          Company Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage companies, subscriptions, and feature assignments
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CompanyStatsCard
            title="Total Companies"
            value={stats.overview.total}
            icon={Building2}
            color="blue"
          />
          <CompanyStatsCard
            title="Active Companies"
            value={stats.overview.active}
            icon={CheckCircle}
            color="green"
          />
          <CompanyStatsCard
            title="Trial Companies"
            value={stats.overview.trial}
            icon={Calendar}
            color="yellow"
          />
          <CompanyStatsCard
            title="Paid Companies"
            value={stats.overview.paid}
            icon={CreditCard}
            color="purple"
          />
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name, code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Plan Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Plans</option>
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Package Management Button */}
          <button
            onClick={() => setShowPackageManagement(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
          >
            <Package className="h-5 w-5" />
            Packages
          </button>

          {/* Create Button */}
          <button
            onClick={handleCreateCompany}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Create Company
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No companies found</p>
            <button
              onClick={handleCreateCompany}
              className="mt-4 text-primary hover:text-primary-700"
            >
              Create your first company
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Storage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {company.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {company.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadgeColor(company.subscription_plan)}`}>
                          {company.subscription_plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(company.subscription_status)}`}>
                          {company.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {company.user_count || 0} / {company.max_users}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4 text-gray-400" />
                          {company.max_storage_gb} GB
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {company.subscription_end_date 
                          ? new Date(company.subscription_end_date).toLocaleDateString()
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {company.subscription_status === 'pending' && (
                            <button
                              onClick={() => handleApproveCompany(company.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve Company"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleManageFeatures(company)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Manage Features"
                            disabled={company.subscription_status === 'pending'}
                          >
                            <Settings className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowViewModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="View Company Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="text-primary hover:text-blue-900"
                            title="Edit Company"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deactivate Company"
                          >
                            <Trash2 className="h-5 w-5" />
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCompanyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadCompanies();
            loadStats();
          }}
        />
      )}

      {showEditModal && selectedCompany && (
        <EditCompanyModal
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCompany(null);
            loadCompanies();
            loadStats();
          }}
        />
      )}

      {showFeaturesModal && selectedCompany && (
        <ManageFeaturesModal
          company={selectedCompany}
          onClose={() => {
            setShowFeaturesModal(false);
            setSelectedCompany(null);
          }}
          onSuccess={() => {
            setShowFeaturesModal(false);
            setSelectedCompany(null);
            loadCompanies();
          }}
        />
      )}

      {showPackageManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Package Management</h2>
              <button
                onClick={() => setShowPackageManagement(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <PackageManagement />
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && selectedCompany && (
        <CompanySettingsModal
          company={selectedCompany}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedCompany(null);
          }}
          onSuccess={() => {
            setShowSettingsModal(false);
            setSelectedCompany(null);
            loadCompanies();
            loadStats();
          }}
        />
      )}

      {/* View Company Modal */}
      {showViewModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCompany(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name</label>
                      <p className="text-gray-900">{selectedCompany.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Code</label>
                      <p className="text-gray-900">{selectedCompany.company_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedCompany.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedCompany.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Website</label>
                      <p className="text-gray-900">{selectedCompany.website || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Industry</label>
                      <p className="text-gray-900">{selectedCompany.industry || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">{selectedCompany.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">City</label>
                      <p className="text-gray-900">{selectedCompany.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="text-gray-900">{selectedCompany.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Country</label>
                      <p className="text-gray-900">{selectedCompany.country || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Postal Code</label>
                      <p className="text-gray-900">{selectedCompany.postal_code || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Name</label>
                      <p className="text-gray-900">{selectedCompany.admin_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Email</label>
                      <p className="text-gray-900">{selectedCompany.admin_email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Phone</label>
                      <p className="text-gray-900">{selectedCompany.admin_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created By</label>
                      <p className="text-gray-900">{selectedCompany.created_by || 'System'}</p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tax ID</label>
                      <p className="text-gray-900">{selectedCompany.tax_id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Number</label>
                      <p className="text-gray-900">{selectedCompany.registration_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Size</label>
                      <p className="text-gray-900">{selectedCompany.company_size || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Currency</label>
                      <p className="text-gray-900">{selectedCompany.currency || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Timezone</label>
                      <p className="text-gray-900">{selectedCompany.timezone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Language</label>
                      <p className="text-gray-900">{selectedCompany.language || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Plan</label>
                      <p className="text-gray-900 capitalize">{selectedCompany.subscription_plan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedCompany.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedCompany.subscription_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedCompany.subscription_status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Start Date</label>
                      <p className="text-gray-900">
                        {selectedCompany.subscription_start_date ? new Date(selectedCompany.subscription_start_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">End Date</label>
                      <p className="text-gray-900">
                        {selectedCompany.subscription_end_date ? new Date(selectedCompany.subscription_end_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Limits</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Max Users</label>
                      <p className="text-gray-900">{selectedCompany.max_users}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Max Storage</label>
                      <p className="text-gray-900">{selectedCompany.max_storage_gb} GB</p>
                    </div>
                  </div>
                </div>

                {/* Allowed Modules */}
                {selectedCompany.allowed_modules && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Allowed Modules</h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedCompany.allowed_modules) 
                        ? selectedCompany.allowed_modules 
                        : JSON.parse(selectedCompany.allowed_modules || '[]')
                      ).map(module => (
                        <span key={module} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Active</label>
                      <p className="text-gray-900">{selectedCompany.is_active ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Verified</label>
                      <p className="text-gray-900">{selectedCompany.is_verified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created At</label>
                      <p className="text-gray-900">{new Date(selectedCompany.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Updated At</label>
                      <p className="text-gray-900">{new Date(selectedCompany.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedCompany(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
