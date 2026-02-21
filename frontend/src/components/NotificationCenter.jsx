/**
 * NotificationCenter Component
 * 
 * Displays system notifications, alerts, and updates in a popover.
 * Features:
 * - Bell icon with unread count badge
 * - Notification list with filtering
 * - Mark as read/unread functionality
 * - Clear all notifications
 * - Real-time updates via WebSocket or polling
 * - Notification preferences
 * 
 * Requirements: 9.7, 10.7
 */

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X, Settings, Filter } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import Badge from '../design-system/components/Badge';
import { cn } from '../design-system/utils';

// Mock notifications data (replace with API call)
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'info',
    title: 'System Update',
    message: 'The system will be updated tonight at 2 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    category: 'system',
  },
  {
    id: '2',
    type: 'success',
    title: 'Project Approved',
    message: 'Your project "Website Redesign" has been approved',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    category: 'projects',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Pending Approval',
    message: 'You have 3 expense claims waiting for approval',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    category: 'finance',
  },
  {
    id: '4',
    type: 'error',
    title: 'Low Stock Alert',
    message: '5 items are below reorder level',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    category: 'inventory',
  },
];

const NOTIFICATION_TYPES = {
  info: { color: 'bg-blue-100 text-blue-600', icon: '📢' },
  success: { color: 'bg-green-100 text-green-600', icon: '✅' },
  warning: { color: 'bg-yellow-100 text-yellow-600', icon: '⚠️' },
  error: { color: 'bg-red-100 text-red-600', icon: '❌' },
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'system', label: 'System' },
  { id: 'projects', label: 'Projects' },
  { id: 'finance', label: 'Finance' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'hr', label: 'HR' },
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.read) return false;
    if (filter !== 'all' && notification.category !== filter) return false;
    return true;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications (replace with WebSocket)
  useEffect(() => {
    // Poll for new notifications every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      // In production, fetch from API
      // fetchNotifications().then(setNotifications);
      console.log('Polling for new notifications...');
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // Navigate to relevant page based on notification type
    // navigate(notification.link);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            'hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
            isOpen && 'bg-neutral-100'
          )}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5 text-neutral-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-96 rounded-lg bg-white shadow-lg border border-neutral-200 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <h3 className="text-sm font-semibold text-neutral-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-neutral-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1 rounded hover:bg-neutral-100 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4 text-neutral-500" />
                </button>
              )}
              <button
                className="p-1 rounded hover:bg-neutral-100 transition-colors"
                title="Notification settings"
              >
                <Settings className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-3 w-3 text-neutral-500" />
              <span className="text-xs font-medium text-neutral-600">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    filter === category.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'bg-white text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs text-neutral-600">Show unread only</span>
            </label>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {filteredNotifications.map(notification => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type];
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors',
                        'hover:bg-neutral-50',
                        !notification.read && 'bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                          typeConfig.color
                        )}>
                          <span className="text-sm">{typeConfig.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm font-medium text-neutral-900',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-neutral-400">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Badge variant="default" size="sm">
                              {notification.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">No notifications</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {showUnreadOnly
                    ? 'All caught up! No unread notifications.'
                    : 'You have no notifications at this time.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={clearAll}
                className="w-full text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Clear all notifications
              </button>
            </div>
          )}

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationCenter;
