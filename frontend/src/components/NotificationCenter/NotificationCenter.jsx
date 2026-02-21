import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Settings, Filter } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [categoryFilter, setCategoryFilter] = useState('all');
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
      if (isOpen) {
        loadNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [filter, categoryFilter]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      reminder: '🔔'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50 border-gray-200';
    
    const colors = {
      info: 'bg-primary-50 border-primary-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      reminder: 'bg-purple-50 border-purple-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-blue-100 text-blue-800 border-blue-300',
      low: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return badges[priority] || badges.medium;
  };

  const filteredNotifications = notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary hover:text-blue-800 font-medium"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                <option value="system">System</option>
                <option value="project">Project</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
                <option value="inventory">Inventory</option>
                <option value="admin">Admin</option>
                <option value="collaboration">Collaboration</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No notifications</p>
                <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type, notification.is_read)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          
                          {/* Priority Badge */}
                          {notification.priority !== 'medium' && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadge(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize">
                              {notification.category}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-primary hover:bg-blue-100 rounded transition-colors"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.action_url && notification.action_text && (
                          <a
                            href={notification.action_url}
                            className="inline-block mt-2 text-xs text-primary hover:text-blue-800 font-medium"
                          >
                            {notification.action_text} →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <a
                href="/notifications"
                className="block text-center text-sm text-primary hover:text-blue-800 font-medium"
              >
                View All Notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
