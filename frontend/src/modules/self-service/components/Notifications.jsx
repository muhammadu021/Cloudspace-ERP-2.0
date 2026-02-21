import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
} from "lucide-react";
import notificationService from "../../../services/notificationService";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterUnread, setFilterUnread] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  useEffect(() => {
    fetchNotifications();
  }, [pagination.currentPage, filterUnread]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotifications({
        limit: 20,
      });
      // alert(JSON.stringify(response));
      // EXACTLY like Navbar - check response.data.notifications
      if (response?.data?.notifications) {
        setNotifications(response.data.notifications);

        // Update pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Use the same service as Navbar - notificationService.markAsRead()
      await notificationService.markAsRead(id);

      // Update the notification in the list
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Use the notification service to mark all as read
      await notificationService.markAllAsRead();
      // Refresh the list to show updated state
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case "warning":
        return <XCircle className={`${iconClass} text-yellow-600`} />;
      case "error":
        return <XCircle className={`${iconClass} text-red-600`} />;
      case "reminder":
        return <Clock className={`${iconClass} text-purple-600`} />;
      case "info":
      default:
        return <Bell className={`${iconClass} text-primary`} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "system":
        return "bg-gray-100 text-gray-800";
      case "project":
        return "bg-blue-100 text-blue-800";
      case "hr":
        return "bg-green-100 text-green-800";
      case "finance":
        return "bg-yellow-100 text-yellow-800";
      case "inventory":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "collaboration":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Notifications
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchNotifications()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with important alerts and messages
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-blue-500"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              id="unread-filter"
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label
              htmlFor="unread-filter"
              className="ml-2 block text-sm text-gray-700"
            >
              Show unread only
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No notifications
                </h3>
                <p className="text-gray-500">
                  You don't have any notifications at the moment
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read
                    ? "bg-primary-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
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
                  }
                }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full ${
                        notification.is_read ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-sm font-medium ${
                          notification.is_read
                            ? "text-gray-900"
                            : "text-blue-900 font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-primary hover:text-blue-800 text-xs font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </div>
                    {notification.action_url && notification.action_text && (
                      <div className="mt-2">
                        <span className="text-sm text-primary hover:text-blue-800 font-medium">
                          {notification.action_text} →
                        </span>
                      </div>
                    )}
                    {notification.category && (
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                            notification.category
                          )}`}
                        >
                          {notification.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === i + 1
                          ? "z-10 bg-primary-50 border-blue-500 text-primary"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
