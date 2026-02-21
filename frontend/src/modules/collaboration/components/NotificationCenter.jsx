import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Settings, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Check,
  User,
  Calendar,
  Clock,
  CheckSquare,
  AlertTriangle,
  XCircle,
  MessageSquare,
  FileText,
  Users,
  CreditCard,
  Building,
  Briefcase,
  GraduationCap,
  Heart,
  Gift,
  Trophy,
  TreePine
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import notificationService from '@/services/notificationService';
import { toast } from 'react-hot-toast';

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('unread');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    daily_digest: false,
    weekly_summary: true,
    categories: {
      system: true,
      project: true,
      hr: true,
      finance: true,
      inventory: true,
      admin: true,
      collaboration: true
    },
    priorities: {
      low: false,
      medium: true,
      high: true,
      urgent: true
    }
  });

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    loadSettings();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filters, pagination.currentPage, activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        is_read: activeTab === 'read' ? true : activeTab === 'unread' ? false : undefined
      };

      const response = await notificationService.getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage
        });
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
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

  const loadSettings = async () => {
    try {
      const response = await notificationService.getPreferences();
      if (response.success) {
        setSettings(response.data.preferences || {});
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
        );
        
        // Update unread count
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!window.confirm('Are you sure you want to mark all notifications as read?')) {
      return;
    }

    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            is_read: true,
            read_at: new Date().toISOString()
          }))
        );
        
        // Update unread count
        setUnreadCount(0);
        
        // Show success message
        toast('All notifications marked as read');
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

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
        
        // Show success message
        toast.success('Notification deleted successfully');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCategoryToggle = (category) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const handlePriorityToggle = (priority) => {
    setSettings(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: !prev.priorities[priority]
      }
    }));
  };

  const saveSettings = async () => {
    try {
      const response = await notificationService.updatePreferences(settings);
      if (response.success) {
        toast.success('Settings saved successfully');
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: <Info className="h-5 w-5 text-primary" />,
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      reminder: <Bell className="h-5 w-5 text-purple-500" />
    };
    return icons[type] || <Info className="h-5 w-5 text-gray-500" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      info: 'bg-primary-50 border-primary-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      reminder: 'bg-purple-50 border-purple-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      system: <Settings className="h-4 w-4" />,
      project: <FolderOpen className="h-4 w-4" />,
      hr: <User className="h-4 w-4" />,
      finance: <CreditCard className="h-4 w-4" />,
      inventory: <Package className="h-4 w-4" />,
      admin: <Building className="h-4 w-4" />,
      collaboration: <Users className="h-4 w-4" />
    };
    return icons[category] || <Info className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'Low', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${config.color} capitalize`}>
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp) => {
    return notificationService.formatTimeAgo(timestamp);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notifications and alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Notifications requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.totalItems}</div>
            <p className="text-xs text-muted-foreground">All notifications in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Different notification types</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search your notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <select 
  value={filters.type} 
  onChange={(e) => handleFilterChange('type', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Types</option>
    <option value="info">Information</option>
    <option value="success">Success</option>
    <option value="warning">Warning</option>
    <option value="error">Error</option>
    <option value="reminder">Reminder</option>
</select>
            
            <select 
  value={filters.category} 
  onChange={(e) => handleFilterChange('category', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Categories</option>
    <option value="system">System</option>
    <option value="project">Project</option>
    <option value="hr">HR</option>
    <option value="finance">Finance</option>
    <option value="inventory">Inventory</option>
    <option value="admin">Admin</option>
    <option value="collaboration">Collaboration</option>
</select>
            
            <select 
  value={filters.priority} 
  onChange={(e) => handleFilterChange('priority', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Priorities</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="urgent">Urgent</option>
</select>
            
            <select 
  value={filters.sortBy} 
  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="created_at">Date Created</option>
    <option value="priority">Priority</option>
    <option value="type">Type</option>
    <option value="category">Category</option>
</select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'unread' && 'Unread Notifications'}
                {activeTab === 'all' && 'All Notifications'}
                {activeTab === 'read' && 'Read Notifications'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'unread' && 'Notifications that require your attention'}
                {activeTab === 'all' && 'All notifications in the system'}
                {activeTab === 'read' && 'Notifications you have already read'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'unread' 
                      ? 'You have no unread notifications.' 
                      : activeTab === 'read' 
                        ? 'You have no read notifications.'
                        : 'You have no notifications.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map(notification => (
                      <TableRow 
                        key={notification.id} 
                        className={`${!notification.is_read ? 'bg-primary-50' : ''} hover:bg-gray-50`}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{notification.title}</div>
                            <div className="text-sm text-gray-600">{notification.message.substring(0, 60)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getCategoryIcon(notification.category)}
                            <span className="ml-2 capitalize">{notification.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(notification.priority)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{formatTimeAgo(notification.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {notification.is_read ? (
                            <Badge className="bg-green-100 text-green-800">Read</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">Unread</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!notification.is_read && (
                              <Tooltip>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {/* Pagination */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.push_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('push_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => handleSettingsChange('sms_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Digest</Label>
                    <p className="text-sm text-gray-600">Receive a daily summary of notifications</p>
                  </div>
                  <Switch
                    checked={settings.daily_digest}
                    onCheckedChange={(checked) => handleSettingsChange('daily_digest', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-gray-600">Receive a weekly summary of notifications</p>
                  </div>
                  <Switch
                    checked={settings.weekly_summary}
                    onCheckedChange={(checked) => handleSettingsChange('weekly_summary', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Category Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Categories</CardTitle>
                <CardDescription>Select which categories of notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.categories || {}).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {getCategoryIcon(category)}
                        <span className="ml-2 capitalize">{category}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Priority Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Priorities</CardTitle>
                <CardDescription>Select which notification priorities you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.priorities || {}).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        {getPriorityBadge(priority)}
                        <span className="ml-2 capitalize">{priority}</span>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handlePriorityToggle(priority)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;