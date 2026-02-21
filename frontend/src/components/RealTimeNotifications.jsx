import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Eye, 
  Trash2, 
  Settings,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  Button,
  Badge,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator
} from '@/components/ui';
import notificationService from '@/services/notificationService';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();
    loadUnreadCount();
    
    // Set up polling for real-time updates
    intervalRef.current = setInterval(() => {
      loadUnreadCount();
      if (isOpen) {
        loadNotifications();
      }
    }, 30000); // Poll every 30 seconds

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({
        limit: 5,
        is_read: false
      });
      
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      
      if (response.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
        
        // Update unread count if it was unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: <Info className="h-4 w-4 text-primary" />,
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      error: <AlertCircle className="h-4 w-4 text-red-500" />,
      reminder: <Bell className="h-4 w-4 text-purple-500" />
    };
    return icons[type] || <Info className="h-4 w-4 text-gray-500" />;
  };

  const formatTimeAgo = (timestamp) => {
    return notificationService.formatTimeAgo(timestamp);
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={handleMarkAllAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No new notifications</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-primary-50' : ''}`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col ml-2 space-y-1">
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        
        <div className="p-2 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => {
              setIsOpen(false);
              // Navigate to notifications page
              window.location.hash = '/collaboration/notifications';
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default RealTimeNotifications;