import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw, Settings } from 'lucide-react';
import notificationService from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    loadNotifications();
  }, [filter, categoryFilter, typeFilter, priorityFilter, pagination.currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const response = await notificationService.getNotifications(params);
      setNotifications(response.data.notifications || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date() } : n)
      );
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
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Delete ${selectedNotifications.length} selected notifications?`)) return;

    try {
      await Promise.all(selectedNotifications.map(id => notificationService.deleteNotification(id)));
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
      toast.success('Selected notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
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
    if (isRead) return 'bg-white border-gray-200';
    
    const colors = {
      info: 'bg-primary-50 border-blue-300',
      success: 'bg-green-50 border-green-300',
      warning: 'bg-yellow-50 border-yellow-300',
      error: 'bg-red-50 border-red-300',
      reminder: 'bg-purple-50 border-purple-300'
    };
    return colors[type] || 'bg-white border-gray-200';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-primary" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your notifications and stay updated
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadNotifications}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mb-4 bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedNotifications.length} notification(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === notifications.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Select All</span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.type, notification.is_read)}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 text-3xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className={`text-lg ${notification.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {notification.message && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            )}
                          </div>
                          
                          {/* Priority Badge */}
                          <span className={`ml-4 px-3 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority.toUpperCase()}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{notification.category}</span>
                          <span>•</span>
                          <span className="capitalize">{notification.type}</span>
                        </div>

                        {/* Action Button */}
                        {notification.action_url && notification.action_text && (
                          <a
                            href={notification.action_url}
                            className="inline-block px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            {notification.action_text}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-primary hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalItems)} of {pagination.totalItems} notifications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
