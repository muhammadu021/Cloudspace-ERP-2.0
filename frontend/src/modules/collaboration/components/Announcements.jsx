import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  Star,
  Pin,
  MessageSquare,
  Calendar,
  Users,
  Building,
  Tag,
  FileText,
  Download,
  Share2,
  MoreVertical,
  X,
  Send
} from 'lucide-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    summary: '',
    announcement_type: 'general',
    priority: 'normal',
    visibility: 'internal',
    requires_acknowledgment: false,
    acknowledgment_deadline: '',
    expires_at: '',
    scheduled_for: '',
    allow_comments: true,
    department_id: '',
    category: '',
    tags: []
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm, typeFilter, priorityFilter, statusFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && { type: typeFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await api.get('/collaboration/announcements', { params });
      const data = response.data;

      if (data.success) {
        setAnnouncements(data.data.announcements);
        setTotalPages(data.data.pagination.pages);
      } else {
        setError('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    try {
      // Validate required fields
      if (!newAnnouncement.title || !newAnnouncement.content) {
        toast.error('Title and content are required');
        return;
      }

      const response = await api.post('/collaboration/announcements', newAnnouncement);
      const data = response.data;

      if (data.success) {
        setAnnouncements([data.data.announcement, ...announcements]);
        setShowCreateModal(false);
        setNewAnnouncement({
          title: '',
          content: '',
          summary: '',
          announcement_type: 'general',
          priority: 'normal',
          visibility: 'internal',
          requires_acknowledgment: false,
          acknowledgment_deadline: '',
          expires_at: '',
          scheduled_for: '',
          allow_comments: true,
          department_id: '',
          category: '',
          tags: []
        });
        toast.success('Announcement created successfully');
      } else {
        toast.error(data.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    }
  };

  const updateAnnouncement = async () => {
    try {
      if (!editingAnnouncement || !editingAnnouncement.id) {
        toast.error('No announcement selected for editing');
        return;
      }

      // Validate required fields
      if (!newAnnouncement.title || !newAnnouncement.content) {
        toast.error('Title and content are required');
        return;
      }

      const response = await api.put(`/collaboration/announcements/${editingAnnouncement.id}`, newAnnouncement);
      const data = response.data;

      if (data.success) {
        toast.success('Announcement updated successfully');
        setShowCreateModal(false);
        setIsEditMode(false);
        setEditingAnnouncement(null);
        setNewAnnouncement({
          title: '',
          content: '',
          summary: '',
          announcement_type: 'general',
          priority: 'normal',
          visibility: 'internal',
          requires_acknowledgment: false,
          acknowledgment_deadline: '',
          expires_at: '',
          scheduled_for: '',
          allow_comments: true,
          department_id: '',
          category: '',
          tags: []
        });
        fetchAnnouncements();
      } else {
        toast.error(data.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to update announcement');
    }
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditMode(true);
    setNewAnnouncement({
      title: announcement.title || '',
      content: announcement.content || '',
      summary: announcement.summary || '',
      announcement_type: announcement.announcement_type || 'general',
      priority: announcement.priority || 'normal',
      status: announcement.status || 'draft',
      visibility: announcement.visibility || 'internal',
      requires_acknowledgment: announcement.requires_acknowledgment || false,
      acknowledgment_deadline: announcement.acknowledgment_deadline || '',
      expires_at: announcement.expires_at || '',
      scheduled_for: announcement.scheduled_for || '',
      allow_comments: announcement.allow_comments !== undefined ? announcement.allow_comments : true,
      department_id: announcement.department_id || '',
      category: announcement.category || '',
      tags: announcement.tags || []
    });
    setShowCreateModal(true);
  };

  const deleteAnnouncement = async (announcementId, title) => {
    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/collaboration/announcements/${announcementId}`);
      const data = response.data;

      if (data.success) {
        toast.success('Announcement deleted successfully');
        // Remove from local state
        setAnnouncements(announcements.filter(a => a.id !== announcementId));
      } else {
        toast.error(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const acknowledgeAnnouncement = async (announcementId) => {
    try {
      const response = await api.post(`/collaboration/announcements/${announcementId}/acknowledge`);
      const data = response.data;

      if (data.success) {
        toast.success('Announcement acknowledged');
        fetchAnnouncements();
      } else {
        toast.error('Failed to acknowledge announcement');
      }
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to acknowledge announcement');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'normal':
        return <Info className="h-4 w-4 text-primary" />;
      case 'low':
        return <Info className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-primary-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'policy':
        return <FileText className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      case 'hr':
        return <Users className="h-4 w-4" />;
      case 'it':
        return <Info className="h-4 w-4" />;
      case 'finance':
        return <Building className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading && announcements.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading announcements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Company-wide announcements and updates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="policy">Policy</option>
            <option value="event">Event</option>
            <option value="system">System</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
            <option value="finance">Finance</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setPriorityFilter('');
              setStatusFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                announcement.is_pinned ? 'ring-2 ring-yellow-200' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Large Icon on Left */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                  announcement.priority === 'critical' ? 'bg-red-100' :
                  announcement.priority === 'high' ? 'bg-orange-100' :
                  announcement.priority === 'normal' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  <div className={`${
                    announcement.priority === 'critical' ? 'text-red-600' :
                    announcement.priority === 'high' ? 'text-orange-600' :
                    announcement.priority === 'normal' ? 'text-primary' :
                    'text-gray-600'
                  }`}>
                    {announcement.announcement_type === 'urgent' && <AlertTriangle className="h-6 w-6" />}
                    {announcement.announcement_type === 'policy' && <FileText className="h-6 w-6" />}
                    {announcement.announcement_type === 'event' && <Calendar className="h-6 w-6" />}
                    {announcement.announcement_type === 'system' && <Info className="h-6 w-6" />}
                    {announcement.announcement_type === 'hr' && <Users className="h-6 w-6" />}
                    {announcement.announcement_type === 'it' && <Info className="h-6 w-6" />}
                    {announcement.announcement_type === 'finance' && <Building className="h-6 w-6" />}
                    {announcement.announcement_type === 'general' && <Bell className="h-6 w-6" />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    {announcement.is_pinned && (
                      <Pin className="h-4 w-4 text-yellow-600" />
                    )}
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(announcement.announcement_type)}
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {announcement.announcement_type}
                      </span>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {getPriorityIcon(announcement.priority)}
                      <span className="capitalize">{announcement.priority}</span>
                    </div>
                    {announcement.requires_acknowledgment && (
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        <span>Requires Acknowledgment</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>

                  {announcement.summary && (
                    <p className="text-gray-600 mb-3">{announcement.summary}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {announcement.creator?.first_name} {announcement.creator?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatRelativeTime(announcement.published_at)}</span>
                    </div>
                    {announcement.view_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{announcement.view_count} views</span>
                      </div>
                    )}
                    {announcement.acknowledgment_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{announcement.acknowledgment_count} acknowledged</span>
                      </div>
                    )}
                  </div>

                  {announcement.tags && Array.isArray(announcement.tags) && announcement.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-2">
                        {announcement.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {announcement.expires_at && (
                    <div className="flex items-center space-x-2 text-sm text-orange-600 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>Expires: {formatDate(announcement.expires_at)}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowViewModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditClick(announcement)}
                    className="p-2 text-primary hover:text-primary-700 hover:bg-blue-100 rounded-lg"
                    title="Edit Announcement"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement.id, announcement.title)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg"
                    title="Delete Announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {announcement.requires_acknowledgment && (
                    <button
                      onClick={() => acknowledgeAnnouncement(announcement.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg"
                      title="Acknowledge"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter || priorityFilter
                ? 'Try adjusting your filters to see more results.'
                : 'No announcements have been posted yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? 'Edit Announcement' : 'Create Announcement'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setEditingAnnouncement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <input
                  type="text"
                  value={newAnnouncement.summary}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief summary of the announcement"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter the full announcement content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newAnnouncement.announcement_type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, announcement_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="system">System</option>
                    <option value="hr">HR</option>
                    <option value="it">IT</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={newAnnouncement.visibility}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="internal">Internal</option>
                    <option value="public">Public</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={newAnnouncement.expires_at}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule For
                  </label>
                  <input
                    type="datetime-local"
                    value={newAnnouncement.scheduled_for}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduled_for: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requires_acknowledgment"
                    checked={newAnnouncement.requires_acknowledgment}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, requires_acknowledgment: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="requires_acknowledgment" className="ml-2 block text-sm text-gray-700">
                    Requires acknowledgment from recipients
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_comments"
                    checked={newAnnouncement.allow_comments}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, allow_comments: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-700">
                    Allow comments on this announcement
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setIsEditMode(false);
                  setEditingAnnouncement(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? updateAnnouncement : createAnnouncement}
                disabled={!newAnnouncement.title || !newAnnouncement.content}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditMode ? 'Update Announcement' : 'Create Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Announcement Modal */}
      {showViewModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(selectedAnnouncement.announcement_type)}
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {selectedAnnouncement.announcement_type}
                  </span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                  {getPriorityIcon(selectedAnnouncement.priority)}
                  <span className="capitalize">{selectedAnnouncement.priority}</span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedAnnouncement.title}
                </h2>
                {selectedAnnouncement.summary && (
                  <p className="text-lg text-gray-600">{selectedAnnouncement.summary}</p>
                )}
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-900">
                  {selectedAnnouncement.content}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {selectedAnnouncement.creator?.first_name} {selectedAnnouncement.creator?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(selectedAnnouncement.published_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {selectedAnnouncement.view_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{selectedAnnouncement.view_count} views</span>
                      </div>
                    )}
                    {selectedAnnouncement.acknowledgment_count > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{selectedAnnouncement.acknowledgment_count} acknowledged</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAnnouncement.requires_acknowledgment && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        This announcement requires your acknowledgment
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        acknowledgeAnnouncement(selectedAnnouncement.id);
                        setShowViewModal(false);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;