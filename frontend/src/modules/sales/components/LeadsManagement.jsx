import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  TrendingUp,
  User,
  Building,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Mock data - replace with API call
  useEffect(() => {
    const mockLeads = [
      {
        id: 1,
        name: 'John Doe',
        company: 'Acme Corp',
        email: 'john@acme.com',
        phone: '+1234567890',
        status: 'new',
        source: 'Website',
        value: 50000,
        probability: 30,
        expectedCloseDate: '2024-02-15',
        assignedTo: 'Sarah Johnson',
        createdAt: '2024-01-10',
        notes: 'Interested in enterprise package'
      },
      {
        id: 2,
        name: 'Jane Smith',
        company: 'Tech Solutions Inc',
        email: 'jane@techsolutions.com',
        phone: '+1987654321',
        status: 'qualified',
        source: 'Referral',
        value: 75000,
        probability: 60,
        expectedCloseDate: '2024-02-20',
        assignedTo: 'Mike Chen',
        createdAt: '2024-01-08',
        notes: 'Follow up next week'
      },
      {
        id: 3,
        name: 'Bob Wilson',
        company: 'Global Enterprises',
        email: 'bob@global.com',
        phone: '+1122334455',
        status: 'proposal',
        source: 'Cold Call',
        value: 120000,
        probability: 75,
        expectedCloseDate: '2024-02-25',
        assignedTo: 'Sarah Johnson',
        createdAt: '2024-01-05',
        notes: 'Proposal sent, awaiting response'
      },
      {
        id: 4,
        name: 'Alice Brown',
        company: 'Startup Hub',
        email: 'alice@startuphub.com',
        phone: '+1555666777',
        status: 'negotiation',
        source: 'LinkedIn',
        value: 45000,
        probability: 85,
        expectedCloseDate: '2024-02-10',
        assignedTo: 'Mike Chen',
        createdAt: '2024-01-03',
        notes: 'Price negotiation in progress'
      },
      {
        id: 5,
        name: 'Charlie Davis',
        company: 'Innovation Labs',
        email: 'charlie@innovationlabs.com',
        phone: '+1999888777',
        status: 'won',
        source: 'Trade Show',
        value: 95000,
        probability: 100,
        expectedCloseDate: '2024-01-30',
        assignedTo: 'Sarah Johnson',
        createdAt: '2023-12-20',
        notes: 'Deal closed successfully'
      }
    ];
    setLeads(mockLeads);
    setFilteredLeads(mockLeads);
  }, []);

  // Filter leads
  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [searchTerm, statusFilter, leads]);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-orange-100 text-orange-800',
      negotiation: 'bg-indigo-100 text-indigo-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      new: <Clock className="h-4 w-4" />,
      won: <CheckCircle className="h-4 w-4" />,
      lost: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <TrendingUp className="h-4 w-4" />;
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    won: leads.filter(l => l.status === 'won').length,
    totalValue: leads.reduce((sum, l) => sum + l.value, 0),
    avgValue: leads.length > 0 ? leads.reduce((sum, l) => sum + l.value, 0) / leads.length : 0
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Leads & Opportunities
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your sales pipeline and track opportunities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Won Deals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.won}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(stats.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            New Lead
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Close
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {lead.company}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${lead.value.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${lead.probability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{lead.probability}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(lead.expectedCloseDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.assignedTo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-primary hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowCreateModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this lead?')) {
                            setLeads(leads.filter(l => l.id !== lead.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new lead'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Lead
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedLead ? 'Edit Lead' : 'Create New Lead'}
            </h2>
            <p className="text-gray-600 mb-4">
              Lead creation form will be implemented here
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
