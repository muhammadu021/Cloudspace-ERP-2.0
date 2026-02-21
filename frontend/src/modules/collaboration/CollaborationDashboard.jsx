import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Megaphone,
  Calendar,
  FileText,
  Video,
  Users,
  Bell,
  Clock,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  User,
  LayoutDashboard
} from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import { Button } from '../../design-system/components';

const CollaborationDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentMessages: [],
    announcements: [],
    upcomingEvents: [],
    recentDocuments: [],
    activeConferences: [],
    forumActivity: [],
    stats: {
      unreadMessages: 0,
      pendingAnnouncements: 0,
      todayEvents: 0,
      sharedDocuments: 0,
      activeConferences: 0,
      forumPosts: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data from multiple endpoints
      const [messagesRes, announcementsRes, eventsRes, documentsRes, conferencesRes, forumsRes] = await Promise.allSettled([
        collaborationService.getMessageThreads({ limit: 5 }),
        collaborationService.getAnnouncements({ limit: 5 }),
        collaborationService.getCalendarEvents({ 
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          limit: 5 
        }),
        collaborationService.getSharedDocuments({ limit: 5 }),
        collaborationService.getVideoConferences({ status: 'scheduled', limit: 5 }),
        collaborationService.getForums()
      ]);

      // Process results
      const recentMessages = messagesRes.status === 'fulfilled' ? messagesRes.value.data?.data?.threads || [] : [];
      const announcements = announcementsRes.status === 'fulfilled' ? announcementsRes.value.data?.data?.announcements || [] : [];
      const upcomingEvents = eventsRes.status === 'fulfilled' ? eventsRes.value.data?.data?.events || [] : [];
      const recentDocuments = documentsRes.status === 'fulfilled' ? documentsRes.value.data?.data?.documents || [] : [];
      const activeConferences = conferencesRes.status === 'fulfilled' ? conferencesRes.value.data?.data?.conferences || [] : [];
      const forums = forumsRes.status === 'fulfilled' ? forumsRes.value.data?.data?.forums || [] : [];

      // Calculate stats
      const stats = {
        unreadMessages: recentMessages.reduce((sum, thread) => sum + (thread.unread_count || 0), 0),
        pendingAnnouncements: announcements.filter(a => a.requires_acknowledgment && !a.acknowledged).length,
        todayEvents: upcomingEvents.filter(e => new Date(e.start_date).toDateString() === new Date().toDateString()).length,
        sharedDocuments: recentDocuments.length,
        activeConferences: activeConferences.length,
        forumPosts: forums.reduce((sum, forum) => sum + (forum.post_count || 0), 0)
      };

      setDashboardData({
        recentMessages,
        announcements,
        upcomingEvents,
        recentDocuments,
        activeConferences,
        forumActivity: forums.slice(0, 5),
        stats
      });
    } catch (error) {
      console.error('Load dashboard data error:', error);
      collaborationService.showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Send Message',
      description: 'Start a new conversation',
      icon: MessageSquare,
      color: 'bg-primary-500',
      action: () => navigate('/collaboration/messaging')
    },
    {
      title: 'Create Announcement',
      description: 'Share important news',
      icon: Megaphone,
      color: 'bg-orange-500',
      action: () => navigate('/collaboration/announcements/create')
    },
    {
      title: 'Schedule Event',
      description: 'Add calendar event',
      icon: Calendar,
      color: 'bg-green-500',
      action: () => navigate('/collaboration/calendar/create')
    },
    {
      title: 'Share Document',
      description: 'Upload and share files',
      icon: FileText,
      color: 'bg-purple-500',
      action: () => navigate('/collaboration/documents/upload')
    },
    {
      title: 'Start Meeting',
      description: 'Create video conference',
      icon: Video,
      color: 'bg-red-500',
      action: () => navigate('/collaboration/conferences/create')
    },
    {
      title: 'Join Discussion',
      description: 'Participate in forums',
      icon: Users,
      color: 'bg-indigo-500',
      action: () => navigate('/collaboration/forums')
    }
  ];

  const statCards = [
    {
      title: 'Unread Messages',
      value: dashboardData.stats.unreadMessages,
      icon: MessageSquare,
      color: 'text-primary',
      bgColor: 'bg-primary-50',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pending Acknowledgments',
      value: dashboardData.stats.pendingAnnouncements,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: "Today's Events",
      value: dashboardData.stats.todayEvents,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Shared Documents',
      value: dashboardData.stats.sharedDocuments,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Active Conferences',
      value: dashboardData.stats.activeConferences,
      icon: Video,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Forum Posts',
      value: dashboardData.stats.forumPosts,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+22%',
      changeType: 'increase'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/messaging')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Send Message
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/announcements')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Megaphone className="h-3.5 w-3.5" />
          Create Announcement
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/calendar')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Calendar className="h-3.5 w-3.5" />
          Schedule Event
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/documents')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          Share Document
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/conferences')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Video className="h-3.5 w-3.5" />
          Start Meeting
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration/forums')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Users className="h-3.5 w-3.5" />
          Join Discussion
        </Button>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collaboration Hub</h1>
          <p className="text-gray-600">Connect, communicate, and collaborate with your team</p>
        </div>
        <button 
          onClick={() => navigate('/collaboration/messaging')} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Quick Start
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`w-3 h-3 mr-1 ${
                      stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-xs ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Messages
            </h2>
            <button 
              onClick={() => navigate('/collaboration/messaging')}
              className="text-sm text-primary hover:text-blue-800 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.recentMessages.length > 0 ? (
                dashboardData.recentMessages.map((thread) => (
                  <div key={thread.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                       onClick={() => navigate(`/collaboration/messaging/${thread.id}`)}>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {thread.title || 'Direct Message'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {thread.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {thread.unread_count > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent messages</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Recent Announcements
            </h2>
            <button 
              onClick={() => navigate('/collaboration/announcements')}
              className="text-sm text-primary hover:text-blue-800 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.announcements.length > 0 ? (
                dashboardData.announcements.map((announcement) => (
                  <div key={announcement.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                       onClick={() => navigate(`/collaboration/announcements/${announcement.id}`)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {announcement.summary || announcement.content}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            announcement.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {collaborationService.formatRelativeTime(announcement.published_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent announcements</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </h2>
            <button 
              onClick={() => navigate('/collaboration/calendar')}
              className="text-sm text-primary hover:text-blue-800 transition-colors"
            >
              View Calendar
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.upcomingEvents.length > 0 ? (
                dashboardData.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                       onClick={() => navigate(`/collaboration/calendar/event/${event.id}`)}>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: event.color || '#3b82f6' }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {collaborationService.formatDate(event.start_date)}
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {event.event_type}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Documents
            </h2>
            <button 
              onClick={() => navigate('/collaboration/documents')}
              className="text-sm text-primary hover:text-blue-800 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dashboardData.recentDocuments.length > 0 ? (
                dashboardData.recentDocuments.map((document) => (
                  <div key={document.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                       onClick={() => navigate(`/collaboration/documents/${document.id}`)}>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{document.title}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{collaborationService.formatFileSize(document.file_size)}</span>
                        <span className="mx-1">•</span>
                        <span>{collaborationService.formatRelativeTime(document.created_at)}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {document.document_type}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent documents</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDashboard;