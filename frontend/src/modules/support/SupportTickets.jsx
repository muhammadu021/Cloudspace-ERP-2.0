import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, MessageSquare, 
  AlertCircle, CheckCircle, Clock, XCircle, ArrowUp, Send,
  User, Calendar, Tag, FileText
} from 'lucide-react';
import supportService from '@/services/supportService';
import { toast } from 'react-hot-toast';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    search: ''
  });

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    type: 'question',
    category_id: '',
    tags: []
  });

  useEffect(() => {
    fetchTickets();
    fetchCategories();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      
      const response = await supportService.getTickets(params);
      setTickets(response.data?.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await supportService.getCategories(true);
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await supportService.createTicket(newTicket);
      toast.success('Ticket created successfully');
      setShowCreateModal(false);
      setNewTicket({
        subject: '',
        description: '',
        priority: 'medium',
        type: 'question',
        category_id: '',
        tags: []
      });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      const response = await supportService.getTicketById(ticket.id);
      setSelectedTicket(response.data?.ticket);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      toast.error('Failed to load ticket details');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await supportService.addComment(selectedTicket.id, {
        comment: newComment,
        is_internal: false,
        is_resolution: false
      });
      toast.success('Comment added');
      setNewComment('');
      // Refresh ticket details
      const response = await supportService.getTicketById(selectedTicket.id);
      setSelectedTicket(response.data?.ticket);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await supportService.updateTicket(ticketId, { status });
      toast.success('Status updated');
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        const response = await supportService.getTicketById(ticketId);
        setSelectedTicket(response.data?.ticket);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      await supportService.deleteTicket(ticketId);
      toast.success('Ticket deleted');
      setShowDetailModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      waiting_customer: 'bg-yellow-100 text-yellow-800',
      waiting_internal: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <AlertCircle className="h-4 w-4" />,
      in_progress: <Clock className="h-4 w-4" />,
      resolved: <CheckCircle className="h-4 w-4" />,
      closed: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage and track support requests</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="question">Question</option>
            <option value="technical_issue">Technical Issue</option>
            <option value="billing">Billing</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600">Create your first support ticket to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTicket(ticket)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span>{ticket.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {ticket.creator?.first_name} {ticket.creator?.last_name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {ticket.ticket_number}
                      </span>
                      {ticket.category && (
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {ticket.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTicket(ticket);
                      }}
                      className="p-2 text-primary hover:bg-primary-50 rounded-lg"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Detailed description of the issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newTicket.type}
                    onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="question">Question</option>
                    <option value="bug">Bug</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="technical_issue">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newTicket.category_id}
                  onChange={(e) => setNewTicket({ ...newTicket, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">{selectedTicket.ticket_number}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Status Actions */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedTicket.status === status
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Comments</h3>
                <div className="space-y-4 mb-4">
                  {selectedTicket.comments?.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.commenter?.first_name} {comment.commenter?.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{comment.comment}</p>
                      {comment.is_resolution && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Resolution
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete Ticket
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

export default SupportTickets;
