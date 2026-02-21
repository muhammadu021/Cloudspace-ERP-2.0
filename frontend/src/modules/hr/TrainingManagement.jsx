import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  DollarSign, 
  BarChart3, 
  Plus, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  MapPin,
  Video,
  FileText,
  Shield
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
  Progress
} from '../../components/ui';
import { toast } from 'react-hot-toast';
import trainingService from '../../services/trainingService';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';

const TrainingManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [complianceTraining, setComplianceTraining] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showLearningPathDialog, setShowLearningPathDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showComplianceDialog, setShowComplianceDialog] = useState(false);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'professional_development',
    level: 'beginner',
    duration_hours: '',
    max_participants: '',
    instructor_id: '',
    prerequisites: [],
    learning_objectives: '',
    course_materials: [],
    price: 0,
    certification_available: false,
    passing_score: 70,
    tags: []
  });

  const [learningPathForm, setLearningPathForm] = useState({
    title: '',
    description: '',
    category: 'professional_development',
    level: 'beginner',
    estimated_duration_hours: '',
    courses: [],
    prerequisites: [],
    target_audience: [],
    learning_outcomes: '',
    is_mandatory: false,
    deadline_days: ''
  });

  const [sessionForm, setSessionForm] = useState({
    course_id: '',
    instructor_id: '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    room: '',
    max_participants: 20,
    session_type: 'in_person',
    meeting_link: '',
    registration_deadline: '',
    cost_per_participant: 0
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    employee_id: '',
    course_id: '',
    learning_path_id: '',
    session_id: '',
    enrollment_type: 'self_enrolled',
    deadline: ''
  });

  const [instructorForm, setInstructorForm] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    instructor_type: 'internal',
    specializations: [],
    qualifications: [],
    experience_years: '',
    bio: '',
    hourly_rate: '',
    daily_rate: '',
    can_travel: false,
    virtual_capable: true,
    languages: []
  });

  const [certificationForm, setCertificationForm] = useState({
    name: '',
    description: '',
    issuing_authority: '',
    certification_type: 'internal',
    category: 'professional',
    validity_period_months: '',
    renewal_required: false,
    minimum_score: 70,
    cost: 0
  });

  const [budgetForm, setBudgetForm] = useState({
    department_id: '',
    budget_type: 'department',
    fiscal_year: new Date().getFullYear(),
    budget_period: 'annual',
    period_start_date: '',
    period_end_date: '',
    allocated_budget: '',
    approval_required: true,
    approval_threshold: ''
  });

  const [complianceForm, setComplianceForm] = useState({
    course_id: '',
    regulation_type: 'safety',
    regulation_name: '',
    issuing_authority: '',
    mandatory: true,
    frequency: 'annual',
    deadline_type: 'fixed_date',
    deadline_days: '',
    fixed_deadline: '',
    target_roles: [],
    target_departments: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        loadDashboardStats();
        break;
      case 'courses':
        loadCourses();
        break;
      case 'learning-paths':
        loadLearningPaths();
        break;
      case 'calendar':
        loadTrainingSessions();
        break;
      case 'enrollments':
        loadEnrollments();
        break;
      case 'instructors':
        loadInstructors();
        break;
      case 'certifications':
        loadCertifications();
        break;
      case 'budget':
        loadBudgets();
        break;
      case 'compliance':
        loadComplianceTraining();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes] = await Promise.all([
        employeeService.getEmployees(),
        departmentService.getDepartments()
      ]);
      setEmployees(employeesRes.data.employees || []);
      setDepartments(departmentsRes.data.departments || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await trainingService.getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadCourses = async () => {
    try {
      const response = await trainingService.getCourses({ search: searchTerm });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const loadLearningPaths = async () => {
    try {
      const response = await trainingService.getLearningPaths({ search: searchTerm });
      setLearningPaths(response.data.learningPaths || []);
    } catch (error) {
      console.error('Error loading learning paths:', error);
      toast.error('Failed to load learning paths');
    }
  };

  const loadTrainingSessions = async () => {
    try {
      const response = await trainingService.getTrainingSessions();
      setTrainingSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error loading training sessions:', error);
      toast.error('Failed to load training sessions');
    }
  };

  const loadEnrollments = async () => {
    try {
      const response = await trainingService.getEnrollments();
      setEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Failed to load enrollments');
    }
  };

  const loadInstructors = async () => {
    try {
      const response = await trainingService.getInstructors();
      setInstructors(response.data.instructors || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
      toast.error('Failed to load instructors');
    }
  };

  const loadCertifications = async () => {
    try {
      const response = await trainingService.getCertifications();
      setCertifications(response.data.certifications || []);
    } catch (error) {
      console.error('Error loading certifications:', error);
      toast.error('Failed to load certifications');
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await trainingService.getBudgets();
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    }
  };

  const loadComplianceTraining = async () => {
    try {
      const response = await trainingService.getComplianceTraining();
      setComplianceTraining(response.data.complianceTraining || []);
    } catch (error) {
      console.error('Error loading compliance training:', error);
      toast.error('Failed to load compliance training');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!courseForm.title || !courseForm.duration_hours) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Prepare course data with proper validation
      const courseData = {
        ...courseForm,
        duration_hours: parseFloat(courseForm.duration_hours),
        max_participants: courseForm.max_participants ? parseInt(courseForm.max_participants) : null,
        price: courseForm.price ? parseFloat(courseForm.price) : 0,
        passing_score: courseForm.passing_score ? parseInt(courseForm.passing_score) : 70,
        instructor_id: courseForm.instructor_id || null
      };
      
      console.log('Creating course with data:', courseData);
      
      await trainingService.createCourse(courseData);
      toast.success('Course created successfully');
      setShowCourseDialog(false);
      setCourseForm({
        title: '',
        description: '',
        category: 'professional_development',
        level: 'beginner',
        duration_hours: '',
        max_participants: '',
        instructor_id: '',
        prerequisites: [],
        learning_objectives: '',
        course_materials: [],
        price: 0,
        certification_available: false,
        passing_score: 70,
        tags: []
      });
      loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLearningPath = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createLearningPath(learningPathForm);
      toast.success('Learning path created successfully');
      setShowLearningPathDialog(false);
      setLearningPathForm({
        title: '',
        description: '',
        category: 'professional_development',
        level: 'beginner',
        estimated_duration_hours: '',
        courses: [],
        prerequisites: [],
        target_audience: [],
        learning_outcomes: '',
        is_mandatory: false,
        deadline_days: ''
      });
      loadLearningPaths();
    } catch (error) {
      console.error('Error creating learning path:', error);
      toast.error('Failed to create learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createTrainingSession(sessionForm);
      toast.success('Training session created successfully');
      setShowSessionDialog(false);
      setSessionForm({
        course_id: '',
        instructor_id: '',
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        room: '',
        max_participants: 20,
        session_type: 'in_person',
        meeting_link: '',
        registration_deadline: '',
        cost_per_participant: 0
      });
      loadTrainingSessions();
    } catch (error) {
      console.error('Error creating training session:', error);
      toast.error('Failed to create training session');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.enrollEmployee(enrollmentForm);
      toast.success('Employee enrolled successfully');
      setShowEnrollmentDialog(false);
      setEnrollmentForm({
        employee_id: '',
        course_id: '',
        learning_path_id: '',
        session_id: '',
        enrollment_type: 'self_enrolled',
        deadline: ''
      });
      loadEnrollments();
    } catch (error) {
      console.error('Error enrolling employee:', error);
      toast.error('Failed to enroll employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createInstructor(instructorForm);
      toast.success('Instructor created successfully');
      setShowInstructorDialog(false);
      setInstructorForm({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        instructor_type: 'internal',
        specializations: [],
        qualifications: [],
        experience_years: '',
        bio: '',
        hourly_rate: '',
        daily_rate: '',
        can_travel: false,
        virtual_capable: true,
        languages: []
      });
      loadInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      toast.error('Failed to create instructor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCertification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createCertification(certificationForm);
      toast.success('Certification created successfully');
      setShowCertificationDialog(false);
      setCertificationForm({
        name: '',
        description: '',
        issuing_authority: '',
        certification_type: 'internal',
        category: 'professional',
        validity_period_months: '',
        renewal_required: false,
        minimum_score: 70,
        cost: 0
      });
      loadCertifications();
    } catch (error) {
      console.error('Error creating certification:', error);
      toast.error('Failed to create certification');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createBudget(budgetForm);
      toast.success('Training budget created successfully');
      setShowBudgetDialog(false);
      setBudgetForm({
        department_id: '',
        budget_type: 'department',
        fiscal_year: new Date().getFullYear(),
        budget_period: 'annual',
        period_start_date: '',
        period_end_date: '',
        allocated_budget: '',
        approval_required: true,
        approval_threshold: ''
      });
      loadBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompliance = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await trainingService.createComplianceTraining(complianceForm);
      toast.success('Compliance training created successfully');
      setShowComplianceDialog(false);
      setComplianceForm({
        course_id: '',
        regulation_type: 'safety',
        regulation_name: '',
        issuing_authority: '',
        mandatory: true,
        frequency: 'annual',
        deadline_type: 'fixed_date',
        deadline_days: '',
        fixed_deadline: '',
        target_roles: [],
        target_departments: []
      });
      loadComplianceTraining();
    } catch (error) {
      console.error('Error creating compliance training:', error);
      toast.error('Failed to create compliance training');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">Available for enrollment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalInstructors || 0}</div>
            <p className="text-xs text-muted-foreground">Certified instructors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common training management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => setShowCourseDialog(true)} className="h-20 flex flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              Create Course
            </Button>
            <Button onClick={() => setShowSessionDialog(true)} className="h-20 flex flex-col" variant="outline">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Session
            </Button>
            <Button onClick={() => setShowEnrollmentDialog(true)} className="h-20 flex flex-col" variant="outline">
              <Users className="h-6 w-6 mb-2" />
              Enroll Employee
            </Button>
            <Button onClick={() => setShowInstructorDialog(true)} className="h-20 flex flex-col" variant="outline">
              <User className="h-6 w-6 mb-2" />
              Add Instructor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create and manage training courses</p>
        </div>
        <Button onClick={() => setShowCourseDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{trainingService.getCategoryIcon(course.category)}</span>
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge className={trainingService.getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <Badge className={trainingService.getCourseStatusColor(course.status)}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{trainingService.formatDuration(course.duration_hours)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Participants:</span>
                  <span>{course.max_participants || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>{trainingService.formatCurrency(course.price)}</span>
                </div>
                {course.instructor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>{course.instructor.first_name} {course.instructor.last_name}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Comprehensive training and development platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="instructors">Instructors</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="courses">
          {renderCourses()}
        </TabsContent>

        <TabsContent value="learning-paths">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Learning Paths</h2>
                <p className="text-muted-foreground">Create structured learning journeys</p>
              </div>
              <Button onClick={() => setShowLearningPathDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Learning Path
              </Button>
            </div>

            {/* Learning Paths Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{path.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className={trainingService.getLevelColor(path.level)}>
                            {path.level}
                          </Badge>
                          {path.is_mandatory && (
                            <Badge variant="destructive">Mandatory</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{trainingService.formatDuration(path.estimated_duration_hours)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="capitalize">{path.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {learningPaths.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Learning Paths</h3>
                <p className="text-muted-foreground mb-4">Create your first learning path to get started</p>
                <Button onClick={() => setShowLearningPathDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Learning Path
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Training Calendar</h3>
            <p className="text-muted-foreground mb-4">Schedule and manage training sessions</p>
            <Button onClick={() => setShowSessionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="enrollments">
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enrollments</h3>
            <p className="text-muted-foreground mb-4">Manage employee training enrollments</p>
            <Button onClick={() => setShowEnrollmentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Enroll Employee
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="instructors">
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instructors</h3>
            <p className="text-muted-foreground mb-4">Manage training instructors and facilitators</p>
            <Button onClick={() => setShowInstructorDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Instructor
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="certifications">
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Certifications</h3>
            <p className="text-muted-foreground mb-4">Manage certificates and credentials</p>
            <Button onClick={() => setShowCertificationDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Certification
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Budget Management</h3>
            <p className="text-muted-foreground mb-4">Track training budgets and expenses</p>
            <Button onClick={() => setShowBudgetDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Compliance Training</h3>
            <p className="text-muted-foreground mb-4">Manage mandatory compliance training</p>
            <Button onClick={() => setShowComplianceDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Compliance Training
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Training Analytics</h3>
            <p className="text-muted-foreground mb-4">View training metrics and insights</p>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={courseForm.category} 
                  onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="technical">Technical</option>
                  <option value="soft_skills">Soft Skills</option>
                  <option value="leadership">Leadership</option>
                  <option value="compliance">Compliance</option>
                  <option value="safety">Safety</option>
                  <option value="professional_development">Professional Development</option>
                  <option value="certification">Certification</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the course content and objectives"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">Level *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={courseForm.level} 
                  onChange={(e) => setCourseForm(prev => ({ ...prev, level: e.target.value }))}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <Label htmlFor="duration_hours">Duration (Hours) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={courseForm.duration_hours}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, duration_hours: e.target.value ? parseFloat(e.target.value) : '' }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  type="number"
                  min="1"
                  value={courseForm.max_participants}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, max_participants: e.target.value ? parseInt(e.target.value) : '' }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor_id">Instructor</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={courseForm.instructor_id} 
                  onChange={(e) => setCourseForm(prev => ({ ...prev, instructor_id: e.target.value }))}
                >
                  <option value="">Select Instructor (Optional)</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id.toString()}>
                      {instructor.first_name} {instructor.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value ? parseFloat(e.target.value) : 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="learning_objectives">Learning Objectives</Label>
              <Textarea
                value={courseForm.learning_objectives}
                onChange={(e) => setCourseForm(prev => ({ ...prev, learning_objectives: e.target.value }))}
                placeholder="What will participants learn from this course?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={courseForm.passing_score}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, passing_score: e.target.value ? parseInt(e.target.value) : 70 }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="certification_available"
                  checked={courseForm.certification_available}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, certification_available: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="certification_available">Certification Available</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCourseDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Learning Path Dialog */}
      <Dialog open={showLearningPathDialog} onOpenChange={setShowLearningPathDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Learning Path</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateLearningPath} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Learning Path Title *</Label>
                <Input
                  value={learningPathForm.title}
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter learning path title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={learningPathForm.category} 
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="technical">Technical</option>
                  <option value="leadership">Leadership</option>
                  <option value="professional_development">Professional Development</option>
                  <option value="compliance">Compliance</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="career_advancement">Career Advancement</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={learningPathForm.description}
                onChange={(e) => setLearningPathForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the learning path objectives"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Level *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={learningPathForm.level} 
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, level: e.target.value }))}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="estimated_duration_hours">Estimated Duration (Hours) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={learningPathForm.estimated_duration_hours}
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, estimated_duration_hours: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="learning_outcomes">Learning Outcomes</Label>
              <Textarea
                value={learningPathForm.learning_outcomes}
                onChange={(e) => setLearningPathForm(prev => ({ ...prev, learning_outcomes: e.target.value }))}
                placeholder="What will participants achieve from this learning path?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline_days">Deadline (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={learningPathForm.deadline_days}
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, deadline_days: parseInt(e.target.value) }))}
                  placeholder="Days to complete"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_mandatory"
                  checked={learningPathForm.is_mandatory}
                  onChange={(e) => setLearningPathForm(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_mandatory">Mandatory</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowLearningPathDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Learning Path'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Training Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Training Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_id">Course *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={sessionForm.course_id} 
                  onChange={(e) => setSessionForm(prev => ({ ...prev, course_id: e.target.value }))}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id.toString()}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="instructor_id">Instructor</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={sessionForm.instructor_id} 
                  onChange={(e) => setSessionForm(prev => ({ ...prev, instructor_id: e.target.value }))}
                >
                  <option value="">Select Instructor (Optional)</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id.toString()}>
                      {instructor.first_name} {instructor.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Session Title *</Label>
              <Input
                value={sessionForm.title}
                onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter session title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={sessionForm.description}
                onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the session content"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={sessionForm.start_date}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={sessionForm.end_date}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="session_type">Session Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={sessionForm.session_type} 
                  onChange={(e) => setSessionForm(prev => ({ ...prev, session_type: e.target.value }))}
                >
                  <option value="in_person">In Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="self_paced">Self Paced</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="room">Room</Label>
                <Input
                  value={sessionForm.room}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="Room number"
                />
              </div>
            </div>
            {sessionForm.session_type === 'virtual' || sessionForm.session_type === 'hybrid' ? (
              <div>
                <Label htmlFor="meeting_link">Meeting Link</Label>
                <Input
                  value={sessionForm.meeting_link}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, meeting_link: e.target.value }))}
                  placeholder="Enter meeting URL"
                />
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  type="number"
                  min="1"
                  value={sessionForm.max_participants}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  type="datetime-local"
                  value={sessionForm.registration_deadline}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, registration_deadline: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cost_per_participant">Cost per Participant ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sessionForm.cost_per_participant}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, cost_per_participant: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowSessionDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Schedule Session'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enroll Employee Dialog */}
      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enroll Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEnrollEmployee} className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={enrollmentForm.employee_id} 
                onChange={(e) => setEnrollmentForm(prev => ({ ...prev, employee_id: e.target.value }))}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id.toString()}>
                    {employee.User?.first_name || employee.first_name} {employee.User?.last_name || employee.last_name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="course_id">Course</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={enrollmentForm.course_id} 
                onChange={(e) => setEnrollmentForm(prev => ({ ...prev, course_id: e.target.value }))}
              >
                <option value="">Select Course (Optional)</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="learning_path_id">Learning Path (Optional)</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={enrollmentForm.learning_path_id} 
                onChange={(e) => setEnrollmentForm(prev => ({ ...prev, learning_path_id: e.target.value }))}
              >
                <option value="">Select Learning Path (Optional)</option>
                {learningPaths.map((path) => (
                  <option key={path.id} value={path.id.toString()}>
                    {path.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="enrollment_type">Enrollment Type *</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={enrollmentForm.enrollment_type} 
                onChange={(e) => setEnrollmentForm(prev => ({ ...prev, enrollment_type: e.target.value }))}
                required
              >
                <option value="self_enrolled">Self Enrolled</option>
                <option value="manager_assigned">Manager Assigned</option>
                <option value="hr_assigned">HR Assigned</option>
                <option value="mandatory">Mandatory</option>
                <option value="compliance">Compliance</option>
              </select>
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                type="date"
                value={enrollmentForm.deadline}
                onChange={(e) => setEnrollmentForm(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEnrollmentDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enrolling...' : 'Enroll Employee'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Instructor Dialog */}
      <Dialog open={showInstructorDialog} onOpenChange={setShowInstructorDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Instructor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInstructor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  value={instructorForm.first_name}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  value={instructorForm.last_name}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  type="email"
                  value={instructorForm.email}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  value={instructorForm.phone}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor_type">Instructor Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={instructorForm.instructor_type} 
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, instructor_type: e.target.value }))}
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="contractor">Contractor</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div>
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={instructorForm.experience_years}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                  placeholder="Years of experience"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                value={instructorForm.bio}
                onChange={(e) => setInstructorForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief biography and expertise"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={instructorForm.hourly_rate}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={instructorForm.daily_rate}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, daily_rate: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="can_travel"
                  checked={instructorForm.can_travel}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, can_travel: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="can_travel">Can Travel</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="virtual_capable"
                  checked={instructorForm.virtual_capable}
                  onChange={(e) => setInstructorForm(prev => ({ ...prev, virtual_capable: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="virtual_capable">Virtual Training Capable</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInstructorDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Add Instructor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Certification Dialog */}
      <Dialog open={showCertificationDialog} onOpenChange={setShowCertificationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Certification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCertification} className="space-y-4">
            <div>
              <Label htmlFor="name">Certification Name *</Label>
              <Input
                value={certificationForm.name}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter certification name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                value={certificationForm.description}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the certification"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issuing_authority">Issuing Authority *</Label>
                <Input
                  value={certificationForm.issuing_authority}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, issuing_authority: e.target.value }))}
                  placeholder="Organization issuing certificate"
                  required
                />
              </div>
              <div>
                <Label htmlFor="certification_type">Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={certificationForm.certification_type} 
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, certification_type: e.target.value }))}
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                  <option value="industry">Industry</option>
                  <option value="compliance">Compliance</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={certificationForm.category} 
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="technical">Technical</option>
                  <option value="safety">Safety</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                  <option value="professional">Professional</option>
                  <option value="industry_specific">Industry Specific</option>
                </select>
              </div>
              <div>
                <Label htmlFor="validity_period_months">Validity Period (Months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={certificationForm.validity_period_months}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, validity_period_months: parseInt(e.target.value) }))}
                  placeholder="Certificate validity"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minimum_score">Minimum Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={certificationForm.minimum_score}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, minimum_score: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={certificationForm.cost}
                  onChange={(e) => setCertificationForm(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="renewal_required"
                checked={certificationForm.renewal_required}
                onChange={(e) => setCertificationForm(prev => ({ ...prev, renewal_required: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="renewal_required">Renewal Required</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCertificationDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Certification'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Training Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBudget} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget_type">Budget Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={budgetForm.budget_type} 
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, budget_type: e.target.value }))}
                >
                  <option value="department">Department</option>
                  <option value="individual">Individual</option>
                  <option value="project">Project</option>
                  <option value="company_wide">Company Wide</option>
                  <option value="compliance">Compliance</option>
                </select>
              </div>
              <div>
                <Label htmlFor="fiscal_year">Fiscal Year *</Label>
                <Input
                  type="number"
                  min="2020"
                  max="2030"
                  value={budgetForm.fiscal_year}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, fiscal_year: parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>
            {budgetForm.budget_type === 'department' && (
              <div>
                <Label htmlFor="department_id">Department *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={budgetForm.department_id} 
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, department_id: e.target.value }))}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id.toString()}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label htmlFor="budget_period">Budget Period *</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={budgetForm.budget_period} 
                onChange={(e) => setBudgetForm(prev => ({ ...prev, budget_period: e.target.value }))}
              >
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period_start_date">Period Start Date *</Label>
                <Input
                  type="date"
                  value={budgetForm.period_start_date}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, period_start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="period_end_date">Period End Date *</Label>
                <Input
                  type="date"
                  value={budgetForm.period_end_date}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, period_end_date: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="allocated_budget">Allocated Budget ($) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={budgetForm.allocated_budget}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, allocated_budget: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="approval_threshold">Approval Threshold ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={budgetForm.approval_threshold}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, approval_threshold: parseFloat(e.target.value) }))}
                placeholder="Amount requiring approval"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="approval_required"
                checked={budgetForm.approval_required}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, approval_required: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="approval_required">Approval Required</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBudgetDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Compliance Training Dialog */}
      <Dialog open={showComplianceDialog} onOpenChange={setShowComplianceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Compliance Training</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCompliance} className="space-y-4">
            <div>
              <Label htmlFor="course_id">Course *</Label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                value={complianceForm.course_id} 
                onChange={(e) => setComplianceForm(prev => ({ ...prev, course_id: e.target.value }))}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regulation_type">Regulation Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={complianceForm.regulation_type} 
                  onChange={(e) => setComplianceForm(prev => ({ ...prev, regulation_type: e.target.value }))}
                >
                  <option value="safety">Safety</option>
                  <option value="data_protection">Data Protection</option>
                  <option value="financial">Financial</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="environmental">Environmental</option>
                  <option value="hr_compliance">HR Compliance</option>
                  <option value="industry_specific">Industry Specific</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={complianceForm.frequency} 
                  onChange={(e) => setComplianceForm(prev => ({ ...prev, frequency: e.target.value }))}
                >
                  <option value="one_time">One Time</option>
                  <option value="annual">Annual</option>
                  <option value="biannual">Biannual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="regulation_name">Regulation Name *</Label>
              <Input
                value={complianceForm.regulation_name}
                onChange={(e) => setComplianceForm(prev => ({ ...prev, regulation_name: e.target.value }))}
                placeholder="Enter regulation name"
                required
              />
            </div>
            <div>
              <Label htmlFor="issuing_authority">Issuing Authority *</Label>
              <Input
                value={complianceForm.issuing_authority}
                onChange={(e) => setComplianceForm(prev => ({ ...prev, issuing_authority: e.target.value }))}
                placeholder="Regulatory body or authority"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline_type">Deadline Type *</Label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500" 
                  value={complianceForm.deadline_type} 
                  onChange={(e) => setComplianceForm(prev => ({ ...prev, deadline_type: e.target.value }))}
                >
                  <option value="fixed_date">Fixed Date</option>
                  <option value="days_from_hire">Days from Hire</option>
                  <option value="days_from_role_change">Days from Role Change</option>
                  <option value="rolling">Rolling</option>
                </select>
              </div>
              {complianceForm.deadline_type === 'fixed_date' ? (
                <div>
                  <Label htmlFor="fixed_deadline">Fixed Deadline</Label>
                  <Input
                    type="date"
                    value={complianceForm.fixed_deadline}
                    onChange={(e) => setComplianceForm(prev => ({ ...prev, fixed_deadline: e.target.value }))}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="deadline_days">Deadline (Days)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={complianceForm.deadline_days}
                    onChange={(e) => setComplianceForm(prev => ({ ...prev, deadline_days: parseInt(e.target.value) }))}
                    placeholder="Days to complete"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mandatory"
                checked={complianceForm.mandatory}
                onChange={(e) => setComplianceForm(prev => ({ ...prev, mandatory: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="mandatory">Mandatory</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowComplianceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Add Compliance Training'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingManagement;