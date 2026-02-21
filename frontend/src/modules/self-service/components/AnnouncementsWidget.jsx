import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, Info, Calendar, Eye, CheckCircle, X, FileText } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AnnouncementsWidget = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("token")?.replace(/['\"]+/g, "");

  useEffect(() => {
    loadAnnouncements();
    // Poll for new announcements every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/collaboration/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: 'published',
          limit: 5,
          sort: 'priority,created_at'
        }
      });
      
      const data = response.data.data?.announcements || response.data.announcements || [];
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnnouncement = async (announcement) => {
    // Ensure attachments is an array
    let attachments = [];
    
    try {
      if (Array.isArray(announcement.attachments)) {
        attachments = announcement.attachments;
      } else if (typeof announcement.attachments === 'string') {
        attachments = JSON.parse(announcement.attachments || '[]');
      } else if (announcement.attachments && typeof announcement.attachments === 'object') {
        // If it's an object but not an array, convert to array
        attachments = Object.values(announcement.attachments);
      }
    } catch (error) {
      console.error('Error parsing attachments:', error);
      attachments = [];
    }
    
    const safeAnnouncement = {
      ...announcement,
      attachments
    };
    
    setSelectedAnnouncement(safeAnnouncement);
    setShowModal(true);
    
    // Mark as viewed
    try {
      await axios.post(
        `${API_URL}/collaboration/announcements/${announcement.id}/view`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking announcement as viewed:', error);
    }
  };

  const handleAcknowledge = async (announcementId) => {
    try {
      await axios.post(
        `${API_URL}/collaboration/announcements/${announcementId}/acknowledge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh announcements
      loadAnnouncements();
      setShowModal(false);
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
      alert('Failed to acknowledge announcement');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
        </div>
        <div className="text-center py-8 text-gray-500">Loading announcements...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
            </div>
            {announcements.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {announcements.length} New
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No announcements at this time</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewAnnouncement(announcement)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getPriorityColor(announcement.priority)}`}>
                    {getPriorityIcon(announcement.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {announcement.title}
                      </h3>
                      {announcement.is_pinned && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded flex-shrink-0">
                          Pinned
                        </span>
                      )}
                    </div>
                    
                    {announcement.summary && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {announcement.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(announcement.published_at || announcement.created_at)}
                      </div>
                      
                      {announcement.view_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {announcement.view_count} views
                        </div>
                      )}
                      
                      {announcement.requires_acknowledgment && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {showModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${getPriorityColor(selectedAnnouncement.priority)}`}>
                      {getPriorityIcon(selectedAnnouncement.priority)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedAnnouncement.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="capitalize">{selectedAnnouncement.announcement_type}</span>
                        <span>•</span>
                        <span>{formatDate(selectedAnnouncement.published_at || selectedAnnouncement.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 max-h-[60vh] overflow-y-auto">
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                    />
                  </div>

                  {selectedAnnouncement.attachments && 
                   Array.isArray(selectedAnnouncement.attachments) && 
                   selectedAnnouncement.attachments.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {selectedAnnouncement.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url || attachment.path || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-blue-800"
                          >
                            <FileText className="w-4 h-4" />
                            {attachment.filename || attachment.name || `Attachment ${index + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedAnnouncement.requires_acknowledgment && (
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900">Acknowledgment Required</h4>
                        <p className="text-sm text-orange-800 mt-1">
                          Please acknowledge that you have read and understood this announcement.
                        </p>
                        {selectedAnnouncement.acknowledgment_deadline && (
                          <p className="text-xs text-orange-700 mt-2">
                            Deadline: {formatDate(selectedAnnouncement.acknowledgment_deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedAnnouncement.requires_acknowledgment && (
                    <button
                      onClick={() => handleAcknowledge(selectedAnnouncement.id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementsWidget;
