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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  Award,
  Star,
  TrendingUp,
  Target,
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  MessageSquare,
  BookOpen,
  TrendingDown,
  Activity,
  Zap,
  User
} from 'lucide-react';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const PerformanceReviews = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for different data types
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [pips, setPips] = useState([]);
  const [careerPlans, setCareerPlans] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Dialog states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showPipDialog, setShowPipDialog] = useState(false);
  const [showCareerDialog, setShowCareerDialog] = useState(false);
  const [showSkillAssessmentDialog, setShowSkillAssessmentDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  
  // Form states
  const [reviewForm, setReviewForm] = useState({
    employee_id: '',
    cycle_id: '',
    type: 'annual',
    due_date: '',
    template_id: ''
  });
  
  const [goalForm, setGoalForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    category: 'performance',
    priority: 'medium',
    target_date: '',
    weight: 100,
    success_criteria: '',
    resources_needed: ''
  });

  const [feedbackForm, setFeedbackForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    feedback_type: '360_review',
    deadline: '',
    anonymous: false,
    reviewers: [],
    instructions: ''
  });

  const [pipForm, setPipForm] = useState({
    employee_id: '',
    manager_id: '',
    hr_partner_id: '',
    title: '',
    description: '',
    performance_issues: '',
    improvement_goals: [],
    success_criteria: '',
    support_resources: '',
    review_schedule: 'weekly',
    duration_months: 3,
    start_date: ''
  });

  const [careerForm, setCareerForm] = useState({
    employee_id: '',
    manager_id: '',
    title: '',
    description: '',
    current_role: '',
    target_role: '',
    career_path_id: '',
    target_timeline: '1_year',
    development_goals: [],
    skill_gaps: [],
    training_needs: '',
    mentoring_requirements: '',
    success_metrics: ''
  });

  const [skillAssessmentForm, setSkillAssessmentForm] = useState({
    employee_id: '',
    assessment_type: 'self_assessment',
    assessment_period: '',
    technical_skills: {},
    soft_skills: {},
    leadership_skills: {},
    assessment_notes: ''
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    department: '',
    date_range: 'current_year'
  });

  useEffect(() => {
    loadDashboardData();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load employees, departments, and career paths for form dropdowns
      const [employeesResponse, departmentsResponse, careerPathsResponse] = await Promise.all([
        employeeService.getEmployees({ limit: 100 }),
        employeeService.getDepartments(),
        performanceService.getCareerPaths()
      ]);
      
      setEmployees(employeesResponse.data?.data?.employees || employeesResponse.data?.employees || []);
      setDepartments(departmentsResponse.data?.data?.departments || departmentsResponse.data?.departments || []);
      setCareerPaths(careerPathsResponse.data?.data?.careerPaths || careerPathsResponse.data?.careerPaths || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      loadTabData();
    }
  }, [activeTab, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, reviewsResponse, goalsResponse] = await Promise.all([
        performanceService.getPerformanceAnalytics(),
        performanceService.getReviews({ limit: 5 }),
        performanceService.getGoals({ limit: 5 })
      ]);
      
      setAnalytics(analyticsResponse.data?.data || analyticsResponse.data || {});
      setReviews(reviewsResponse.data?.data?.reviews || reviewsResponse.data?.reviews || []);
      setGoals(goalsResponse.data?.data?.goals || goalsResponse.data?.goals || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'reviews': {
          const reviewsResponse = await performanceService.getReviews(filters);
          console.log('Reviews response:', reviewsResponse);
          setReviews(reviewsResponse.data?.data?.reviews || reviewsResponse.data?.reviews || []);
          break;
        }
        case 'goals': {
          const goalsResponse = await performanceService.getGoals(filters);
          console.log('Goals response:', goalsResponse);
          setGoals(goalsResponse.data?.data?.goals || goalsResponse.data?.goals || []);
          break;
        }
        case 'feedback': {
          const feedbackResponse = await performanceService.getFeedbackRequests(filters);
          console.log('Feedback response:', feedbackResponse);
          setFeedbackRequests(feedbackResponse.data?.data?.requests || feedbackResponse.data?.requests || []);
          break;
        }
        case 'pips': {
          const pipsResponse = await performanceService.getPIPs(filters);
          console.log('PIPs response:', pipsResponse);
          setPips(pipsResponse.data?.data?.pips || pipsResponse.data?.pips || []);
          break;
        }
        case 'career': {
          const careerResponse = await performanceService.getCareerPlans(filters);
          console.log('Career response:', careerResponse);
          setCareerPlans(careerResponse.data?.data?.plans || careerResponse.data?.plans || []);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createReview(reviewForm);
      toast.success('Performance review created successfully');
      setShowReviewDialog(false);
      loadTabData();
    } catch (error) {
      toast.error('Failed to create review');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createGoal(goalForm);
      toast.success('Goal created successfully');
      setShowGoalDialog(false);
      setGoalForm({
        employee_id: '',
        title: '',
        description: '',
        category: 'performance',
        priority: 'medium',
        target_date: '',
        weight: 100,
        success_criteria: '',
        resources_needed: ''
      });
      loadTabData();
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createFeedbackRequest(feedbackForm);
      toast.success('Feedback request created successfully');
      setShowFeedbackDialog(false);
      setFeedbackForm({
        employee_id: '',
        title: '',
        description: '',
        feedback_type: '360_review',
        deadline: '',
        anonymous: false,
        reviewers: [],
        instructions: ''
      });
      loadTabData();
    } catch (error) {
      toast.error('Failed to create feedback request');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePip = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createPIP(pipForm);
      toast.success('Performance Improvement Plan created successfully');
      setShowPipDialog(false);
      setPipForm({
        employee_id: '',
        manager_id: '',
        hr_partner_id: '',
        title: '',
        description: '',
        performance_issues: '',
        improvement_goals: [],
        success_criteria: '',
        support_resources: '',
        review_schedule: 'weekly',
        duration_months: 3,
        start_date: ''
      });
      loadTabData();
    } catch (error) {
      toast.error('Failed to create PIP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCareerPlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createCareerPlan(careerForm);
      toast.success('Career Development Plan created successfully');
      setShowCareerDialog(false);
      setCareerForm({
        employee_id: '',
        manager_id: '',
        title: '',
        description: '',
        current_role: '',
        target_role: '',
        career_path_id: '',
        target_timeline: '1_year',
        development_goals: [],
        skill_gaps: [],
        training_needs: '',
        mentoring_requirements: '',
        success_metrics: ''
      });
      loadTabData();
    } catch (error) {
      toast.error('Failed to create career plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkillAssessment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createSkillAssessment(skillAssessmentForm);
      toast.success('Skill assessment created successfully');
      setShowSkillAssessmentDialog(false);
      setSkillAssessmentForm({
        employee_id: '',
        assessment_type: 'self_assessment',
        assessment_period: '',
        technical_skills: {},
        soft_skills: {},
        leadership_skills: {},
        assessment_notes: ''
      });
      loadTabData();
    } catch (error) {
      toast.error('Failed to create skill assessment');
    } finally {
      setLoading(false);
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.averageRating || '4.2'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.ratingTrend >= 0 ? '+' : ''}{analytics.ratingTrend || '+0.3'} from last period
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goals Achieved</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.goalsAchieved || '85'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {analytics.goalsTotal || '142'} total goals
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviews Due</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.reviewsDue || '23'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Next 30 days
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Performance</p>
                <p className="text-2xl font-bold text-primary">
                  {analytics.teamPerformance || '92'}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Above expectations
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{review.employee?.name || 'Employee'}</p>
                      <p className="text-sm text-gray-500">{review.type} Review</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={performanceService.getReviewStatusColor(review.status)}>
                      {review.status?.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {performanceService.formatDate(review.due_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{goal.title}</p>
                    <Badge className={performanceService.getGoalStatusColor(goal.status)}>
                      {goal.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                    <p className="text-xs text-gray-500">
                      Target: {performanceService.formatDate(goal.target_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { level: 'Exceptional', count: analytics.exceptional || 12, color: 'bg-green-500' },
              { level: 'Exceeds', count: analytics.exceeds || 28, color: 'bg-primary-500' },
              { level: 'Meets', count: analytics.meets || 45, color: 'bg-yellow-500' },
              { level: 'Below', count: analytics.below || 8, color: 'bg-orange-500' },
              { level: 'Needs Improvement', count: analytics.needsImprovement || 3, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.level} className="text-center">
                <div className={`${item.color} h-20 rounded-lg mb-2 flex items-end justify-center pb-2`}>
                  <span className="text-white font-bold text-lg">{item.count}</span>
                </div>
                <p className="text-sm font-medium">{item.level}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((item.count / 96) * 100)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReviewsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Reviews</h2>
          <p className="text-gray-600">Manage employee performance evaluations</p>
        </div>
        <Button onClick={() => setShowReviewDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Review
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <select 
              value={filters.status} 
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={filters.type} 
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="annual">Annual</option>
              <option value="mid_year">Mid-Year</option>
              <option value="quarterly">Quarterly</option>
              <option value="probation">Probation</option>
            </select>
            <Button variant="outline" onClick={loadTabData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Review Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{review.employee?.name || 'Employee'}</p>
                        <p className="text-sm text-gray-500">{review.employee?.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{review.type?.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={performanceService.getReviewStatusColor(review.status)}>
                      {review.status?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{performanceService.formatDate(review.due_date)}</TableCell>
                  <TableCell>
                    {review.overall_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{review.overall_rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not rated</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
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

  const GoalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Goals & Objectives</h2>
          <p className="text-gray-600">Track and manage employee goals</p>
        </div>
        <Button onClick={() => setShowGoalDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <Badge className={performanceService.getGoalStatusColor(goal.status)}>
                  {goal.status?.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{goal.description}</p>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Date:</span>
                  <span>{performanceService.formatDate(goal.target_date)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Weight:</span>
                  <span>{goal.weight}%</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const FeedbackTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">360-Degree Feedback</h2>
          <p className="text-gray-600">Multi-source feedback collection and management</p>
        </div>
        <Button onClick={() => setShowFeedbackDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Request Feedback
        </Button>
      </div>

      {/* Feedback Stats */}
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
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">45</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">360-Degree Feedback System</h3>
        <p className="text-gray-600 mb-4">Comprehensive multi-source feedback collection</p>
        <Button>Launch Feedback Module</Button>
      </div>
    </div>
  );

  const PipsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Improvement Plans</h2>
          <p className="text-gray-600">Manage and track performance improvement initiatives</p>
        </div>
        <Button onClick={() => setShowPipDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create PIP
        </Button>
      </div>

      {/* PIP Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active PIPs</p>
                <p className="text-2xl font-bold text-primary">8</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">73%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">3.2mo</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Performance Improvement Plans</h3>
        <p className="text-gray-600 mb-4">Structured approach to performance enhancement</p>
        <Button>Launch PIP Module</Button>
      </div>
    </div>
  );

  const CareerTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Career Development Plans</h2>
          <p className="text-gray-600">Employee career growth and development planning</p>
        </div>
        <Button onClick={() => setShowCareerDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Plan
        </Button>
      </div>

      {/* Career Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-primary">24</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goals Achieved</p>
                <p className="text-2xl font-bold text-green-600">67%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promotions</p>
                <p className="text-2xl font-bold text-purple-600">8</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-orange-600">73%</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Career Development Planning</h3>
        <p className="text-gray-600 mb-4">Structured career growth and skill development</p>
        <Button>Launch Career Module</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600">Comprehensive performance review and goal tracking system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            360 Feedback
          </TabsTrigger>
          <TabsTrigger value="pips" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            PIPs
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Career Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsTab />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackTab />
        </TabsContent>

        <TabsContent value="pips">
          <PipsTab />
        </TabsContent>

        <TabsContent value="career">
          <CareerTab />
        </TabsContent>
      </Tabs>

      {/* Create Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Performance Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateReview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={reviewForm.employee_id} 
                  onChange={(e) => setReviewForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="type">Review Type *</Label>
                <select 
                  value={reviewForm.type} 
                  onChange={(e) => setReviewForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="annual">Annual Review</option>
                  <option value="mid_year">Mid-Year Review</option>
                  <option value="quarterly">Quarterly Review</option>
                  <option value="probation">Probation Review</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                type="date"
                value={reviewForm.due_date}
                onChange={(e) => setReviewForm(prev => ({ ...prev, due_date: e.target.value }))}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Review'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee *</Label>
              <select 
                value={goalForm.employee_id} 
                onChange={(e) => setGoalForm(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                value={goalForm.title}
                onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select 
                  value={goalForm.category} 
                  onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="performance">Performance</option>
                  <option value="development">Development</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select 
                  value={goalForm.priority} 
                  onChange={(e) => setGoalForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="weight">Weight (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={goalForm.weight}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="target_date">Target Date *</Label>
              <Input
                type="date"
                value={goalForm.target_date}
                onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="success_criteria">Success Criteria</Label>
              <Textarea
                value={goalForm.success_criteria}
                onChange={(e) => setGoalForm(prev => ({ ...prev, success_criteria: e.target.value }))}
                placeholder="Define what success looks like for this goal"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="resources_needed">Resources Needed</Label>
              <Textarea
                value={goalForm.resources_needed}
                onChange={(e) => setGoalForm(prev => ({ ...prev, resources_needed: e.target.value }))}
                placeholder="List any resources, training, or support needed"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowGoalDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Feedback Request Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Request 360-Degree Feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFeedback} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={feedbackForm.employee_id} 
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="feedback_type">Feedback Type *</Label>
                <select 
                  value={feedbackForm.feedback_type} 
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="360_review">360-Degree Review</option>
                  <option value="peer_feedback">Peer Feedback</option>
                  <option value="upward_feedback">Upward Feedback</option>
                  <option value="manager_feedback">Manager Feedback</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Request Title *</Label>
              <Input
                value={feedbackForm.title}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter feedback request title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={feedbackForm.description}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and context of this feedback request"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Response Deadline *</Label>
                <Input
                  type="date"
                  value={feedbackForm.deadline}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={feedbackForm.anonymous}
                  onChange={(e) => setFeedbackForm(prev => ({ ...prev, anonymous: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="anonymous">Allow anonymous feedback</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="instructions">Instructions for Reviewers</Label>
              <Textarea
                value={feedbackForm.instructions}
                onChange={(e) => setFeedbackForm(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Provide specific instructions or focus areas for reviewers"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create PIP Dialog */}
      <Dialog open={showPipDialog} onOpenChange={setShowPipDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Performance Improvement Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePip} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={pipForm.employee_id} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="manager">Manager *</Label>
                <select 
                  value={pipForm.manager_id} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, manager_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Manager</option>
                  {employees.filter(emp => emp.role === 'manager' || emp.role === 'supervisor').map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="hr_partner">HR Partner</Label>
                <select 
                  value={pipForm.hr_partner_id} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, hr_partner_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select HR Partner</option>
                  {employees.filter(emp => emp.department?.name === 'Human Resources').map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">PIP Title *</Label>
              <Input
                value={pipForm.title}
                onChange={(e) => setPipForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter PIP title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={pipForm.description}
                onChange={(e) => setPipForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide an overview of the performance improvement plan"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="performance_issues">Performance Issues *</Label>
              <Textarea
                value={pipForm.performance_issues}
                onChange={(e) => setPipForm(prev => ({ ...prev, performance_issues: e.target.value }))}
                placeholder="Describe the specific performance issues that need to be addressed"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="success_criteria">Success Criteria *</Label>
              <Textarea
                value={pipForm.success_criteria}
                onChange={(e) => setPipForm(prev => ({ ...prev, success_criteria: e.target.value }))}
                placeholder="Define clear, measurable criteria for successful completion"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="support_resources">Support Resources</Label>
              <Textarea
                value={pipForm.support_resources}
                onChange={(e) => setPipForm(prev => ({ ...prev, support_resources: e.target.value }))}
                placeholder="List training, mentoring, or other support resources to be provided"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="review_schedule">Review Schedule *</Label>
                <select 
                  value={pipForm.review_schedule} 
                  onChange={(e) => setPipForm(prev => ({ ...prev, review_schedule: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (Months) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={pipForm.duration_months}
                  onChange={(e) => setPipForm(prev => ({ ...prev, duration_months: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  type="date"
                  value={pipForm.start_date}
                  onChange={(e) => setPipForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPipDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create PIP'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Career Development Plan Dialog */}
      <Dialog open={showCareerDialog} onOpenChange={setShowCareerDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Career Development Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCareerPlan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={careerForm.employee_id} 
                  onChange={(e) => setCareerForm(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name} - {employee.position || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <select 
                  value={careerForm.manager_id} 
                  onChange={(e) => setCareerForm(prev => ({ ...prev, manager_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Manager</option>
                  {employees.filter(emp => emp.role === 'manager' || emp.role === 'supervisor').map((employee) => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Plan Title *</Label>
              <Input
                value={careerForm.title}
                onChange={(e) => setCareerForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter career development plan title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={careerForm.description}
                onChange={(e) => setCareerForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the career development objectives"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_role">Current Role *</Label>
                <Input
                  value={careerForm.current_role}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, current_role: e.target.value }))}
                  placeholder="Current position/role"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target_role">Target Role *</Label>
                <Input
                  value={careerForm.target_role}
                  onChange={(e) => setCareerForm(prev => ({ ...prev, target_role: e.target.value }))}
                  placeholder="Desired future position/role"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="career_path">Career Path</Label>
                <select 
                  value={careerForm.career_path_id} 
                  onChange={(e) => setCareerForm(prev => ({ ...prev, career_path_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Career Path</option>
                  {careerPaths.map((path) => (
                    <option key={path.id} value={path.id.toString()}>
                      {path.title} - {path.function_area || 'General'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="timeline">Target Timeline *</Label>
                <select 
                  value={careerForm.target_timeline} 
                  onChange={(e) => setCareerForm(prev => ({ ...prev, target_timeline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="6_months">6 Months</option>
                  <option value="1_year">1 Year</option>
                  <option value="2_years">2 Years</option>
                  <option value="3_years">3 Years</option>
                  <option value="5_years">5 Years</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="training_needs">Training Needs</Label>
              <Textarea
                value={careerForm.training_needs}
                onChange={(e) => setCareerForm(prev => ({ ...prev, training_needs: e.target.value }))}
                placeholder="Identify specific training programs, courses, or certifications needed"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="mentoring_requirements">Mentoring Requirements</Label>
              <Textarea
                value={careerForm.mentoring_requirements}
                onChange={(e) => setCareerForm(prev => ({ ...prev, mentoring_requirements: e.target.value }))}
                placeholder="Describe mentoring or coaching needs"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="success_metrics">Success Metrics</Label>
              <Textarea
                value={careerForm.success_metrics}
                onChange={(e) => setCareerForm(prev => ({ ...prev, success_metrics: e.target.value }))}
                placeholder="Define how success will be measured"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCareerDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceReviews;