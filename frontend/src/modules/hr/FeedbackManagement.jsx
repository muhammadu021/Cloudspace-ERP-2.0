import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Textarea,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import {
  MessageSquare,
  Users,
  Star,
  Send,
  Eye,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import performanceService from '../../services/performanceService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const FeedbackManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');
  
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [requestForm, setRequestForm] = useState({
    employee_id: '',
    reviewers: [],
    deadline: '',
    message: '',
    anonymous: false
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    ratings: {},
    comments: {},
    strengths: '',
    improvements: '',
    overall_comment: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'requests') {
        const response = await performanceService.getFeedbackRequests();
        console.log('Feedback requests response:', response);
        // Backend returns: { success: true, data: { requests: [...] } }
        setFeedbackRequests(response.data?.requests || []);
      } else if (activeTab === 'my-feedback') {
        const response = await performanceService.getFeedbackRequests({ reviewer_id: user.id });
        console.log('My feedback requests response:', response);
        // Backend returns: { success: true, data: { requests: [...] } }
        setMyFeedback(response.data?.requests || []);
      }
    } catch (error) {
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createFeedbackRequest(requestForm);
      toast.success('Feedback request created successfully');
      setShowRequestDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create feedback request');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.submitFeedback(selectedRequest.id, feedbackForm);
      toast.success('Feedback submitted successfully');
      setShowFeedbackDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const RequestsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Feedback Requests</h2>
          <p className="text-gray-600">Manage 360-degree feedback requests</p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-primary">12</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">45</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600">87%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">4.3</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Feedback Requests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Reviewers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{request.employee?.name || 'Employee'}</p>
                        <p className="text-sm text-gray-500">{request.employee?.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{request.reviewers?.length || 0} reviewers</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      request.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {request.status?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {performanceService.formatDate(request.deadline)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{request.completed_responses || 0}/{request.total_responses || 0}</span>
                        <span>{Math.round(((request.completed_responses || 0) / (request.total_responses || 1)) * 100)}%</span>
                      </div>
                      <Progress value={((request.completed_responses || 0) / (request.total_responses || 1)) * 100} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const MyFeedbackTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">My Feedback Tasks</h2>
        <p className="text-gray-600">Feedback requests assigned to you</p>
      </div>

      {/* Pending Feedback Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myFeedback.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{request.employee?.name}</p>
                    <p className="text-sm text-gray-500">{request.employee?.position}</p>
                  </div>
                </div>
                <Badge className={
                  request.my_status === 'completed' ? 'bg-green-100 text-green-800' :
                  request.my_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }>
                  {request.my_status?.replace('_', ' ') || 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Due: {performanceService.formatDate(request.deadline)}</span>
                </div>
                
                {request.message && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{request.message}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowFeedbackDialog(true);
                    }}
                    disabled={request.my_status === 'completed'}
                  >
                    {request.my_status === 'completed' ? 'Completed' : 'Provide Feedback'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">360-Degree Feedback</h1>
          <p className="text-gray-600">Multi-source feedback collection and management</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback Requests
          </TabsTrigger>
          <TabsTrigger value="my-feedback" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            My Feedback Tasks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="my-feedback">
          <MyFeedbackTab />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Feedback Analytics</h3>
            <p className="text-gray-600">Comprehensive feedback analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Feedback Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee *</Label>
              <select 
                value={requestForm.employee_id} 
                onChange={(e) => setRequestForm(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select employee</option>
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                type="date"
                value={requestForm.deadline}
                onChange={(e) => setRequestForm(prev => ({ ...prev, deadline: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message to Reviewers</Label>
              <Textarea
                value={requestForm.message}
                onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Optional message for reviewers"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowRequestDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provide Feedback for {selectedRequest?.employee?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            {/* Rating Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Performance Ratings</h3>
              {[
                { key: 'communication', label: 'Communication Skills' },
                { key: 'teamwork', label: 'Teamwork & Collaboration' },
                { key: 'leadership', label: 'Leadership Abilities' },
                { key: 'problem_solving', label: 'Problem Solving' },
                { key: 'technical_skills', label: 'Technical Skills' },
                { key: 'initiative', label: 'Initiative & Proactivity' }
              ].map((category) => (
                <div key={category.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{category.label}</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFeedbackForm(prev => ({
                          ...prev,
                          ratings: { ...prev.ratings, [category.key]: rating }
                        }))}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                          feedbackForm.ratings[category.key] === rating
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="strengths">Key Strengths</Label>
                <Textarea
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, strengths: e.target.value }))}
                  placeholder="What are this person's key strengths?"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="improvements">Areas for Improvement</Label>
                <Textarea
                  value={feedbackForm.improvements}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, improvements: e.target.value }))}
                  placeholder="What areas could this person improve on?"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="overall_comment">Overall Comments</Label>
                <Textarea
                  value={feedbackForm.overall_comment}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, overall_comment: e.target.value }))}
                  placeholder="Any additional comments or observations"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;