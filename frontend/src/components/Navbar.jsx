import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import notificationService from '../services/notificationService';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await notificationService.getNotifications({ limit: 10 });
      if (response?.data?.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response?.data?.count !== undefined) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (user) {
      // Fetch immediately on mount
      fetchNotifications();
      fetchUnreadCount();

      // Poll every 30 seconds for new notifications
      const notificationInterval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(notificationInterval);
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'reminder':
        return '⏰';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return time.toLocaleDateString();
  };

  const getUserTypeDisplay = () => {
    if (user?.UserType) {
      return user.UserType.display_name;
    }
    if (user?.user_type_id) {
      return 'Custom Access';
    }
    return user?.Role?.display_name || 'User';
  };

  const getUserTypeColor = () => {
    if (user?.UserType?.color) {
      const colors = {
        blue: 'bg-blue-100 text-blue-800',
        green: 'bg-green-100 text-green-800',
        purple: 'bg-purple-100 text-purple-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
        gray: 'bg-gray-100 text-gray-800'
      };
      return colors[user.UserType.color] || 'bg-blue-100 text-blue-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
           
          </div>

          {/* Right side - Notifications and User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* User Type Badge */}
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getUserTypeColor()}`}>
                {getUserTypeDisplay()}
              </span>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.is_read ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.action_url) {
                                // Extract path from full URL if needed
                                let path = notification.action_url;
                                try {
                                  // If it's a full URL, extract just the pathname
                                  if (path.startsWith('http://') || path.startsWith('https://')) {
                                    const url = new URL(path);
                                    path = url.pathname;
                                  }
                                } catch (e) {
                                  // If URL parsing fails, use as-is
                                  console.log('Using action_url as-is:', path);
                                }
                                navigate(path);
                                setShowNotifications(false);
                              }
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className={`text-sm font-medium text-gray-900 ${
                                    !notification.is_read ? 'font-semibold' : ''
                                  }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-200">
                      <button 
                        onClick={() => {
                          navigate('/self-service/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-primary hover:text-blue-800"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>


              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {user.cloudinary_avatar_url || user.avatar ? (
                        <img 
                          src={user.cloudinary_avatar_url || user.avatar} 
                          alt={`${user.first_name} ${user.last_name}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span 
                        className="text-sm font-medium text-gray-700" 
                        style={{ display: user.cloudinary_avatar_url || user.avatar ? 'none' : 'flex' }}
                      >
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-primary mt-1">
                        {getUserTypeDisplay()}
                      </p>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => navigate('/self-service/profile')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </button>
                      <button
                        onClick={() => navigate('/self-service')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Self Service
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;