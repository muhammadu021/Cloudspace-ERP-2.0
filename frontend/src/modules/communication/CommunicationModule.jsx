import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Send, 
  Users, 
  Building, 
  Calendar, 
  Bell, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  Gift, 
  Cake, 
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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Checkbox,
  Tooltip,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import { toast } from 'react-hot-toast';
import communicationService from '@/services/communicationService';
import hrService from '@/services/hrService';

const CommunicationModule = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [templatesRes, departmentsRes] = await Promise.all([
        communicationService.getEmailTemplates(),
        hrService.getDepartments()
      ]);
      
      setTemplates(templatesRes.data.templates);
      setDepartments(departmentsRes.data.departments);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Communication</h2>
          <p className="text-sm text-gray-600">Email & Messaging</p>
        </div>
        
        <nav className="mt-4">
          <Link 
            to="" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'dashboard' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Mail className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          
          <Link 
            to="compose" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'compose' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('compose')}
          >
            <Send className="h-5 w-5 mr-3" />
            Compose Email
          </Link>
          
          <Link 
            to="templates" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'templates' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <Copy className="h-5 w-5 mr-3" />
            Email Templates
          </Link>
          
          <Link 
            to="announcements" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'announcements' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell className="h-5 w-5 mr-3" />
            Announcements
          </Link>
          
          <Link 
            to="birthdays" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'birthdays' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('birthdays')}
          >
            <Cake className="h-5 w-5 mr-3" />
            Birthdays
          </Link>
          
          <Link 
            to="anniversaries" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'anniversaries' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('anniversaries')}
          >
            <Trophy className="h-5 w-5 mr-3" />
            Work Anniversaries
          </Link>
          
          <Link 
            to="holidays" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'holidays' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('holidays')}
          >
            <TreePine className="h-5 w-5 mr-3" />
            Holiday Greetings
          </Link>
          
          <Link 
            to="department" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'department' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('department')}
          >
            <Building className="h-5 w-5 mr-3" />
            Department Emails
          </Link>
          
          <Link 
            to="settings" 
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeTab === 'settings' 
                ? 'bg-primary-50 text-primary-700 border-r-2 border-blue-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<CommunicationDashboard templates={templates} departments={departments} />} />
          <Route path="compose" element={<ComposeEmail />} />
          <Route path="templates" element={<EmailTemplates templates={templates} />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="birthdays" element={<Birthdays />} />
          <Route path="anniversaries" element={<WorkAnniversaries />} />
          <Route path="holidays" element={<HolidayGreetings />} />
          <Route path="department" element={<DepartmentEmails departments={departments} />} />
          <Route path="settings" element={<CommunicationSettings />} />
        </Routes>
      </div>
    </div>
  );
};

// Dashboard Component
const CommunicationDashboard = ({ templates, departments }) => {
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalDepartments: 0,
    recentAnnouncements: [],
    upcomingBirthdays: [],
    upcomingAnniversaries: []
  });

  useEffect(() => {
    setStats({
      totalTemplates: templates.length,
      totalDepartments: departments.length,
      recentAnnouncements: [
        { id: 1, title: 'Q4 Bonus Announcement', date: '2024-03-15', priority: 'high' },
        { id: 2, title: 'Office Renovation Notice', date: '2024-03-10', priority: 'normal' },
        { id: 3, title: 'New Leave Policy', date: '2024-03-05', priority: 'normal' }
      ],
      upcomingBirthdays: [
        { id: 1, name: 'John Doe', date: '2024-03-20', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', date: '2024-03-22', department: 'Marketing' }
      ],
      upcomingAnniversaries: [
        { id: 1, name: 'Mike Johnson', years: 5, date: '2024-03-18', department: 'Sales' },
        { id: 2, name: 'Sarah Wilson', years: 3, date: '2024-03-25', department: 'HR' }
      ]
    });
  }, [templates, departments]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communication Dashboard</h1>
        <p className="text-gray-600">Manage all company communications and messaging</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Ready to use templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingBirthdays.length + stats.upcomingAnniversaries.length}
            </div>
            <p className="text-xs text-muted-foreground">Birthdays & Anniversaries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Latest company-wide communications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{announcement.title}</h4>
                    <p className="text-sm text-gray-600">{announcement.date}</p>
                  </div>
                  <Badge 
                    className={
                      announcement.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {announcement.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Birthdays and work anniversaries</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="birthdays">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="birthdays">Birthdays</TabsTrigger>
                <TabsTrigger value="anniversaries">Anniversaries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="birthdays">
                <div className="space-y-4">
                  {stats.upcomingBirthdays.map((birthday) => (
                    <div key={birthday.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Cake className="h-5 w-5 text-pink-500" />
                        <div>
                          <h4 className="font-medium">{birthday.name}</h4>
                          <p className="text-sm text-gray-600">{birthday.department}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{birthday.date}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="anniversaries">
                <div className="space-y-4">
                  {stats.upcomingAnniversaries.map((anniversary) => (
                    <div key={anniversary.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-purple-500" />
                        <div>
                          <h4 className="font-medium">{anniversary.name}</h4>
                          <p className="text-sm text-gray-600">{anniversary.years} years • {anniversary.department}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{anniversary.date}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Compose Email Component
const ComposeEmail = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    template: '',
    message: '',
    priority: 'normal'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await communicationService.sendEmail(formData);
      setShowSuccess(true);
      setFormData({
        to: '',
        subject: '',
        template: '',
        message: '',
        priority: 'normal'
      });
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compose Email</h1>
        <p className="text-gray-600">Send individual or bulk emails to staff members</p>
      </div>

      {showSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Email Sent Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your email has been sent to the recipients.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Email</CardTitle>
          <CardDescription>Create and send a new email message</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                value={formData.to}
                onChange={(e) => handleChange('to', e.target.value)}
                placeholder="Enter email addresses (comma separated)"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Email subject"
                required
              />
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <select 
  value={formData.template} 
  onChange={(e) => handleChange('template', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="announcement">Announcement</option>
    <option value="birthdayWish">Birthday Wish</option>
    <option value="workAnniversary">Work Anniversary</option>
    <option value="holidayGreeting">Holiday Greeting</option>
</select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select 
  value={formData.priority} 
  onChange={(e) => handleChange('priority', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="low">Low</option>
    <option value="normal">Normal</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
</select>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Write your message here..."
                rows={8}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Email Templates Component
const EmailTemplates = ({ templates }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Manage reusable email templates for company communications</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Pre-designed email templates for common company communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{communicationService.getTemplateIcon(template.id)}</span>
                      {template.name}
                    </CardTitle>
                    <Badge variant="secondary">Built-in</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex justify-end space-x-2">
                    <Tooltip>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input id="template-name" placeholder="Enter template name" />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea id="template-description" placeholder="Describe what this template is for..." />
            </div>
            <div>
              <Label htmlFor="template-content">Template Content</Label>
              <Textarea 
                id="template-content" 
                placeholder="Write your email template content here..." 
                rows={10}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Announcements Component
const Announcements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Quarterly Bonus Announcement',
      content: 'We are pleased to announce that all eligible employees will receive a quarterly bonus...',
      priority: 'high',
      createdAt: '2024-03-15',
      createdBy: 'HR Department',
      recipients: 150
    },
    {
      id: 2,
      title: 'Office Renovation Notice',
      content: 'Please note that our office will undergo renovation work starting April 1st...',
      priority: 'normal',
      createdAt: '2024-03-10',
      createdBy: 'Facilities Team',
      recipients: 120
    }
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Create and manage company-wide announcements</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Bell className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>All company announcements sent in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{announcement.title}</h3>
                  <Badge 
                    className={
                      announcement.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {announcement.priority}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{announcement.content.substring(0, 100)}...</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>By {announcement.createdBy}</span>
                  <span>{announcement.createdAt} • {announcement.recipients} recipients</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title *</Label>
              <Input id="announcement-title" placeholder="Enter announcement title" />
            </div>
            <div>
              <Label htmlFor="announcement-priority">Priority</Label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="announcement-content">Content *</Label>
              <Textarea 
                id="announcement-content" 
                placeholder="Write your announcement content here..." 
                rows={6}
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="all-employees" />
                  <Label htmlFor="all-employees">All Employees</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="by-department" />
                  <Label htmlFor="by-department">By Department</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="specific-recipients" />
                  <Label htmlFor="specific-recipients">Specific Recipients</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateDialog(false)}>
                Send Announcement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Birthdays Component
const Birthdays = () => {
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([
    { id: 1, name: 'John Doe', date: '2024-03-20', department: 'Engineering', email: 'john.doe@company.com' },
    { id: 2, name: 'Jane Smith', date: '2024-03-22', department: 'Marketing', email: 'jane.smith@company.com' },
    { id: 3, name: 'Mike Johnson', date: '2024-03-25', department: 'Sales', email: 'mike.johnson@company.com' }
  ]);

  const sendBirthdayWishes = async () => {
    try {
      await communicationService.sendBirthdayWishes();
      toast.success('Birthday wishes sent successfully!');
    } catch (error) {
      console.error('Error sending birthday wishes:', error);
      toast.error('Failed to send birthday wishes.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Birthdays</h1>
          <p className="text-gray-600">Send automated birthday wishes to employees</p>
        </div>
        <Button onClick={sendBirthdayWishes}>
          <Gift className="mr-2 h-4 w-4" />
          Send Birthday Wishes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Birthdays</CardTitle>
          <CardDescription>Employees celebrating birthdays in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Birthday Date</TableHead>
                <TableHead>Days Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingBirthdays.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.date}</TableCell>
                  <TableCell>
                    {Math.ceil((new Date(employee.date) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Wish
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Work Anniversaries Component
const WorkAnniversaries = () => {
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState([
    { id: 1, name: 'Sarah Wilson', years: 3, date: '2024-03-18', department: 'HR', email: 'sarah.wilson@company.com' },
    { id: 2, name: 'David Brown', years: 5, date: '2024-03-25', department: 'Finance', email: 'david.brown@company.com' },
    { id: 3, name: 'Lisa Garcia', years: 2, date: '2024-04-02', department: 'IT', email: 'lisa.garcia@company.com' }
  ]);

  const sendAnniversaryGreetings = async () => {
    try {
      await communicationService.sendWorkAnniversaryGreetings();
      toast.success('Work anniversary greetings sent successfully!');
    } catch (error) {
      console.error('Error sending anniversary greetings:', error);
      toast.error('Failed to send work anniversary greetings.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Anniversaries</h1>
          <p className="text-gray-600">Celebrate employee work anniversaries</p>
        </div>
        <Button onClick={sendAnniversaryGreetings}>
          <Trophy className="mr-2 h-4 w-4" />
          Send Greetings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Work Anniversaries</CardTitle>
          <CardDescription>Employees celebrating work anniversaries in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Work Anniversary</TableHead>
                <TableHead>Years of Service</TableHead>
                <TableHead>Days Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingAnniversaries.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{employee.years} years</Badge>
                  </TableCell>
                  <TableCell>
                    {Math.ceil((new Date(employee.date) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Greeting
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Holiday Greetings Component
const HolidayGreetings = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'Christmas', date: '2024-12-25', message: 'Wishing you a joyful holiday season!' },
    { id: 2, name: 'New Year', date: '2025-01-01', message: 'Happy New Year! May it bring you happiness and success.' },
    { id: 3, name: 'Thanksgiving', date: '2024-11-28', message: 'Grateful for your hard work and dedication.' }
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Holiday Greetings</h1>
        <p className="text-gray-600">Send automated holiday greetings to all employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {holidays.map((holiday) => (
          <Card key={holiday.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TreePine className="mr-2 h-5 w-5 text-green-600" />
                {holiday.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <p className="text-sm text-gray-600">{holiday.date}</p>
                </div>
                <div>
                  <Label>Message</Label>
                  <p className="text-sm text-gray-600">{holiday.message}</p>
                </div>
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Greetings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Custom Holiday Greeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="holiday-name">Holiday Name *</Label>
                <Input id="holiday-name" placeholder="Enter holiday name" />
              </div>
              <div>
                <Label htmlFor="holiday-date">Date</Label>
                <Input id="holiday-date" type="date" />
              </div>
            </div>
            <div>
              <Label htmlFor="holiday-message">Custom Message</Label>
              <Textarea 
                id="holiday-message" 
                placeholder="Enter your custom holiday message..." 
                rows={3}
              />
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Send Custom Holiday Greeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Department Emails Component
const DepartmentEmails = ({ departments }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Department Emails</h1>
        <p className="text-gray-600">Send emails to specific departments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                {department.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Code</Label>
                  <p className="text-sm text-gray-600">{department.code}</p>
                </div>
                <div>
                  <Label>Employees</Label>
                  <p className="text-sm text-gray-600">{department.employee_count || 0} employees</p>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => setSelectedDepartment(department.id)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send Department Email Dialog */}
      {selectedDepartment && (
        <Dialog open={!!selectedDepartment} onOpenChange={() => setSelectedDepartment('')}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Email to Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-subject">Subject *</Label>
                <Input id="dept-subject" placeholder="Enter email subject" />
              </div>
              <div>
                <Label htmlFor="dept-message">Message *</Label>
                <Textarea 
                  id="dept-message" 
                  placeholder="Write your department message here..." 
                  rows={6}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedDepartment('')}>
                  Cancel
                </Button>
                <Button onClick={() => setSelectedDepartment('')}>
                  Send Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Communication Settings Component
const CommunicationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    birthdayWishes: true,
    workAnniversaryGreetings: true,
    holidayGreetings: true,
    systemAlerts: true,
    dailyDigest: false
  });

  const updateSetting = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Communication Settings</h1>
        <p className="text-gray-600">Configure communication preferences and automation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>Manage your email notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive email notifications for important updates</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Birthday Wishes</h3>
              <p className="text-sm text-gray-600">Automatically send birthday wishes to employees</p>
            </div>
            <Switch
              checked={settings.birthdayWishes}
              onCheckedChange={(checked) => updateSetting('birthdayWishes', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Work Anniversary Greetings</h3>
              <p className="text-sm text-gray-600">Send greetings for employee work anniversaries</p>
            </div>
            <Switch
              checked={settings.workAnniversaryGreetings}
              onCheckedChange={(checked) => updateSetting('workAnniversaryGreetings', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Holiday Greetings</h3>
              <p className="text-sm text-gray-600">Send holiday greetings to all employees</p>
            </div>
            <Switch
              checked={settings.holidayGreetings}
              onCheckedChange={(checked) => updateSetting('holidayGreetings', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">System Alerts</h3>
              <p className="text-sm text-gray-600">Receive critical system alerts and notifications</p>
            </div>
            <Switch
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => updateSetting('systemAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Digest</h3>
              <p className="text-sm text-gray-600">Receive a daily summary of communications</p>
            </div>
            <Switch
              checked={settings.dailyDigest}
              onCheckedChange={(checked) => updateSetting('dailyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Set up SMTP and email server settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.example.com" />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" type="number" placeholder="587" />
            </div>
            <div>
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" placeholder="your-email@example.com" />
            </div>
            <div>
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input id="smtp-pass" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button>Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationModule;