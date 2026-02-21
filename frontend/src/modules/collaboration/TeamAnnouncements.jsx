import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Megaphone, Plus, Bell, Calendar, User, AlertTriangle, FileText, Info, Users, Building, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import toast from 'react-hot-toast';

const TeamAnnouncements = () => {
  const navigate = useNavigate();
  const { announcementId } = useParams();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'normal',
    requires_acknowledgment: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (announcementId && announcements.length > 0) {
      const announcement = announcements.find(a => a.id === parseInt(announcementId));
      if (announcement) {
        setSelectedAnnouncement(announcement);
      }
    }
  }, [announcementId, announcements]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getAnnouncements({ limit: 50 });
      setAnnouncements(response.data?.data?.announcements || []);
    } catch (error) {
      console.error('Load announcements error:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (announcementId) => {
    try {
      await collaborationService.acknowledgeAnnouncement(announcementId);
      toast.success('Announcement acknowledged');
      loadAnnouncements();
    } catch (error) {
      console.error('Acknowledge error:', error);
      toast.error('Failed to acknowledge announcement');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Creating announcement with data:', formData);
      const response = await collaborationService.createAnnouncement(formData);
      console.log('Create announcement response:', response);
      toast.success('Announcement created successfully');
      setShowCreateForm(false);
      setFormData({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        requires_acknowledgment: false
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Create announcement error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to create announcement';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = (e, announcement) => {
    e.stopPropagation();
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcement_type: announcement.announcement_type,
      priority: announcement.priority,
      requires_acknowledgment: announcement.requires_acknowledgment
    });
    setShowEditForm(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      collaborationService.showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Updating announcement:', editingAnnouncement.id, formData);
      const response = await collaborationService.updateAnnouncement(editingAnnouncement.id, formData);
      console.log('Update response:', response);
      toast.success('Announcement updated successfully');
      setShowEditForm(false);
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        requires_acknowledgment: false
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Update announcement error:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to update announcement';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (e, announcementId) => {
    e.stopPropagation();
    setDeletingAnnouncementId(announcementId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('Deleting announcement:', deletingAnnouncementId);
      const response = await collaborationService.deleteAnnouncement(deletingAnnouncementId);
      console.log('Delete response:', response);
      toast.success('Announcement deleted successfully');
      setShowDeleteConfirm(false);
      setDeletingAnnouncementId(null);
      loadAnnouncements();
    } catch (error) {
      console.error('Delete announcement error:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to delete announcement';
      toast.error(errorMessage);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.normal;
  };

  const getTypeIcon = (type) => {
    // Normalize the type to lowercase and handle null/undefined
    const normalizedType = String(type || 'general').toLowerCase().trim();
    
    const icons = {
      general: Bell,
      announcement: Bell,
      notice: Bell,
      
      urgent: AlertTriangle,
      critical: AlertTriangle,
      emergency: AlertTriangle,
      
      policy: FileText,
      document: FileText,
      
      event: Calendar,
      meeting: Calendar,
      
      system: Info,
      update: Info,
      maintenance: Info,
      
      hr: Users,
      hr_update: Users,
      'human resources': Users,
      
      it: Info,
      'i.t.': Info,
      tech: Info,
      technology: Info,
      
      finance: Building,
      billing: Building,
      accounts: Building,
      financial: Building
    };
    
    const IconComponent = icons[normalizedType] || Bell;
    
    // Debug log for unknown types (can be removed later)
    if (!icons[normalizedType] && type) {
      console.debug('Unknown announcement_type:', type, '- using default Bell icon');
    }
    
    return IconComponent;
  };

  const getPriorityBgColor = (priority) => {
    const colors = {
      low: 'bg-gray-100',
      normal: 'bg-blue-100',
      high: 'bg-orange-100',
      urgent: 'bg-red-100',
      critical: 'bg-red-100'
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityIconColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      normal: 'text-primary',
      high: 'text-orange-600',
      urgent: 'text-red-600',
      critical: 'text-red-600'
    };
    return colors[priority] || colors.normal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Announcements</h1>
          <p className="text-gray-600">Stay updated with important company news and updates</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {announcements.map((announcement) => {
          const TypeIcon = getTypeIcon(announcement.announcement_type);
          return (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/collaboration/announcements/${announcement.id}`)}
            >
              {/* Edit and Delete Icons - Top Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={(e) => handleEditClick(e, announcement)}
                  className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                  title="Edit announcement"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, announcement.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Large Icon Header */}
              <div className="flex items-start gap-4 mb-4 pr-20">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getPriorityBgColor(announcement.priority)}`}>
                  {TypeIcon && <TypeIcon className={`w-6 h-6 ${getPriorityIconColor(announcement.priority)}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {collaborationService.formatRelativeTime(announcement.published_at)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                </div>
              </div>

              {/* Content - moved outside the flex container */}
              <div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {announcement.summary || announcement.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {announcement.creator?.first_name} {announcement.creator?.last_name}
                  </span>
                </div>
                
                {announcement.requires_acknowledgment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcknowledge(announcement.id);
                    }}
                    className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
              </div>
            </div>
          );
        })}
      </div>

      {announcements.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements yet</h3>
          <p className="text-gray-600">Check back later for important updates and news.</p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showEditForm ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  placeholder="Announcement content"
                  rows={6}
                  value={formData.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={formData.announcement_type}
                    onChange={(e) => handleFormChange('announcement_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.requires_acknowledgment}
                    onChange={(e) => handleFormChange('requires_acknowledgment', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require acknowledgment from users</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setEditingAnnouncement(null);
                    setFormData({
                      title: '',
                      content: '',
                      announcement_type: 'general',
                      priority: 'normal',
                      requires_acknowledgment: false
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditForm ? handleUpdateAnnouncement : handleCreateAnnouncement}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (showEditForm ? 'Updating...' : 'Creating...') : (showEditForm ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Announcement</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this announcement? All associated data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingAnnouncementId(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAnnouncements;