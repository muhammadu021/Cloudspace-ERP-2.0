import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Video, 
  Calendar, 
  FileText, 
  Users, 
  Bell,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  FilePlus,
  Eye,
  Download,
  Share2,
  Activity
} from 'lucide-react';

const CollaborationDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    unreadMessages: 0,
    activeThreads: 0,
    upcomingConferences: [],
    recentForumActivity: [],
    recentAnnouncements: [],
    recentDocuments: [],
    quickActions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/collaboration/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuickActionIcon = (iconName) => {
    const icons = {
      'message-circle': MessageCircle,
      'video': Video,
      'message-square': MessageSquare,
      'file-plus': FilePlus
    };
    return icons[iconName] || MessageCircle;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collaboration Dashboard</h1>
          <p className="text-gray-600 mt-1">Stay connected and collaborate effectively</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
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
              <p className="text-sm font-medium text-gray-600">Unread Messages</p>
              <p className="text-3xl font-bold text-primary">{dashboardData.unreadMessages}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Threads</p>
              <p className="text-3xl font-bold text-green-600">{dashboardData.activeThreads}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-purple-600">{dashboardData.upcomingConferences.length}</p>
            </div>
            <Video className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Announcements</p>
              <p className="text-3xl font-bold text-orange-600">{dashboardData.recentAnnouncements.length}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dashboardData.quickActions.map((action) => {
            const Icon = getQuickActionIcon(action.icon);
            return (
              <button
                key={action.id}
                onClick={() => window.location.href = action.url}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                <Icon className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
            <button className="text-primary hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(announcement.created_at)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                      announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent announcements</p>
            </div>
          )}
        </div>

        {/* Upcoming Conferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
            <button className="text-primary hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.upcomingConferences.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingConferences.map((conference) => (
                <div key={conference.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <Video className="h-8 w-8 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{conference.title}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(conference.scheduled_start)}
                    </p>
                  </div>
                  <button className="text-primary hover:text-primary-700">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming meetings</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Forum Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Forum Activity</h2>
            <button className="text-primary hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.recentForumActivity.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentForumActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      New post in <span className="font-medium">{activity.topic?.title}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.creator?.first_name} {activity.creator?.last_name} • {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent forum activity</p>
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <button className="text-primary hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentDocuments.map((document) => (
                <div key={document.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{document.title}</h3>
                    <p className="text-sm text-gray-600">
                      by {document.uploader?.first_name} {document.uploader?.last_name} • {formatDate(document.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-600 hover:text-gray-700">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-700">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationDashboard;