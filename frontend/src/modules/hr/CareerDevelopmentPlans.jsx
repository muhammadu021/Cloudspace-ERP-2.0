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
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  Star,
  Briefcase,
  GraduationCap,
  Users,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import performanceService from '../../services/performanceService';
import employeeService from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const CareerDevelopmentPlans = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');
  
  const [careerPlans, setCareerPlans] = useState([]);
  const [skillAssessments, setSkillAssessments] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [planForm, setPlanForm] = useState({
    employee_id: '',
    current_role: '',
    target_role: '',
    target_timeline: '',
    development_goals: [],
    skill_gaps: [],
    training_needs: '',
    mentoring_requirements: '',
    success_metrics: ''
  });
  
  const [skillForm, setSkillForm] = useState({
    employee_id: '',
    technical_skills: {},
    soft_skills: {},
    leadership_skills: {},
    assessment_notes: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    career_level: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadInitialData = async () => {
    try {
      const [employeesResponse, departmentsResponse] = await Promise.all([
        employeeService.getEmployees({ limit: 100 }),
        employeeService.getDepartments()
      ]);
      
      setEmployees(employeesResponse.data?.data?.employees || employeesResponse.data?.employees || []);
      setDepartments(departmentsResponse.data?.data?.departments || departmentsResponse.data?.departments || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load initial data');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'plans': {
          const plansResponse = await performanceService.getCareerPlans(filters);
          console.log('Career plans response:', plansResponse);
          // Backend returns: { success: true, data: { plans: [...] } }
          setCareerPlans(plansResponse.data?.plans || []);
          break;
        }
        case 'skills':
          // Load skill assessments
          setSkillAssessments([
            {
              id: 1,
              employee: { name: 'John Doe', position: 'Software Engineer' },
              technical_score: 85,
              soft_skills_score: 78,
              leadership_score: 65,
              last_assessment: '2024-01-15',
              next_assessment: '2024-07-15'
            },
            {
              id: 2,
              employee: { name: 'Jane Smith', position: 'Marketing Manager' },
              technical_score: 72,
              soft_skills_score: 92,
              leadership_score: 88,
              last_assessment: '2024-01-10',
              next_assessment: '2024-07-10'
            }
          ]);
          break;
        case 'paths':
          // Load career paths
          setCareerPaths([
            {
              id: 1,
              title: 'Software Engineer to Tech Lead',
              levels: ['Junior Engineer', 'Software Engineer', 'Senior Engineer', 'Tech Lead'],
              skills_required: ['Technical Leadership', 'System Design', 'Team Management'],
              avg_duration: '3-5 years'
            },
            {
              id: 2,
              title: 'Marketing Specialist to Marketing Director',
              levels: ['Marketing Specialist', 'Senior Specialist', 'Marketing Manager', 'Marketing Director'],
              skills_required: ['Strategic Planning', 'Team Leadership', 'Budget Management'],
              avg_duration: '4-6 years'
            }
          ]);
          break;
        default:
          break;
      }
      
      // Load analytics
      const analyticsResponse = await performanceService.getPerformanceAnalytics({ type: 'career' });
      console.log('Career analytics response:', analyticsResponse);
      // Backend returns: { success: true, data: { ... } }
      setAnalytics(analyticsResponse.data || {});
    } catch (error) {
      toast.error('Failed to load career development data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await performanceService.createCareerPlan(planForm);
      toast.success('Career development plan created successfully');
      setShowPlanDialog(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create career plan');
    } finally {
      setLoading(false);
    }
  };

  const PlansTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Plans</p>
                <p className="text-2xl font-bold text-primary">{analytics.activePlans || 24}</p>
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
                <p className="text-2xl font-bold text-green-600">{analytics.goalsAchieved || 67}%</p>
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
                <p className="text-2xl font-bold text-purple-600">{analytics.promotions || 8}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.avgProgress || 73}%</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careerPlans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{plan.employee?.name}</p>
                    <p className="text-sm text-gray-500">{plan.current_role}</p>
                  </div>
                </div>
                <Badge className={
                  plan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Target Role</p>
                  <p className="text-sm text-gray-600">{plan.target_role}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-sm text-gray-600">{plan.target_timeline}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{plan.progress || 0}%</span>
                  </div>
                  <Progress value={plan.progress || 0} className="h-2" />
                </div>

                <div>
                  <p className="text-sm font-medium">Development Goals</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(plan.development_goals || []).slice(0, 3).map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                    {(plan.development_goals || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(plan.development_goals || []).length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
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

  const SkillsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Skill Assessments</h2>
          <p className="text-gray-600">Track and evaluate employee skills</p>
        </div>
        <Button onClick={() => setShowSkillDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Assessment
        </Button>
      </div>

      {/* Skills Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Technical Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{assessment.employee.name}</p>
                    <p className="text-xs text-gray-500">{assessment.employee.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{assessment.technical_score}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(assessment.technical_score / 20)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Soft Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{assessment.employee.name}</p>
                    <p className="text-xs text-gray-500">{assessment.employee.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{assessment.soft_skills_score}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(assessment.soft_skills_score / 20)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{assessment.employee.name}</p>
                    <p className="text-xs text-gray-500">{assessment.employee.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{assessment.leadership_score}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(assessment.leadership_score / 20)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Skill Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Technical</TableHead>
                <TableHead>Soft Skills</TableHead>
                <TableHead>Leadership</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>Next Assessment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{assessment.employee.name}</p>
                        <p className="text-sm text-gray-500">{assessment.employee.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assessment.technical_score}</span>
                      <Progress value={assessment.technical_score} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assessment.soft_skills_score}</span>
                      <Progress value={assessment.soft_skills_score} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assessment.leadership_score}</span>
                      <Progress value={assessment.leadership_score} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>{performanceService.formatDate(assessment.last_assessment)}</TableCell>
                  <TableCell>{performanceService.formatDate(assessment.next_assessment)}</TableCell>
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

  const PathsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Career Paths</h2>
          <p className="text-gray-600">Defined career progression paths</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Path
        </Button>
      </div>

      {/* Career Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careerPaths.map((path) => (
          <Card key={path.id}>
            <CardHeader>
              <CardTitle>{path.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Career Progression</p>
                  <div className="space-y-2">
                    {path.levels.map((level, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' :
                          index === path.levels.length - 1 ? 'bg-primary-500' :
                          'bg-gray-300'
                        }`} />
                        <span className="text-sm">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Key Skills Required</p>
                  <div className="flex flex-wrap gap-1">
                    {path.skills_required.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Duration:</span>
                  <span className="font-medium">{path.avg_duration}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Development</h1>
          <p className="text-gray-600">Manage employee career growth and development plans</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={() => setShowPlanDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plans..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <select 
              value={filters.department} 
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id.toString()}>
                  {department.name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Development Plans
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Skill Assessments
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Career Paths
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <PlansTab />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>

        <TabsContent value="paths">
          <PathsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Career Development Analytics</h3>
            <p className="text-gray-600">Comprehensive analytics and insights coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Career Development Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePlan} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee *</Label>
                <select 
                  value={planForm.employee_id} 
                  onChange={(e) => setPlanForm(prev => ({ ...prev, employee_id: e.target.value }))}
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
                <Label htmlFor="target_timeline">Target Timeline *</Label>
                <select 
                  value={planForm.target_timeline} 
                  onChange={(e) => setPlanForm(prev => ({ ...prev, target_timeline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="6_months">6 months</option>
                  <option value="1_year">1 year</option>
                  <option value="2_years">2 years</option>
                  <option value="3_years">3 years</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_role">Current Role *</Label>
                <Input
                  value={planForm.current_role}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, current_role: e.target.value }))}
                  placeholder="Current position"
                  required
                />
              </div>
              <div>
                <Label htmlFor="target_role">Target Role *</Label>
                <Input
                  value={planForm.target_role}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, target_role: e.target.value }))}
                  placeholder="Desired position"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="training_needs">Training & Development Needs</Label>
              <Textarea
                value={planForm.training_needs}
                onChange={(e) => setPlanForm(prev => ({ ...prev, training_needs: e.target.value }))}
                placeholder="Describe training requirements and development opportunities"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mentoring_requirements">Mentoring Requirements</Label>
              <Textarea
                value={planForm.mentoring_requirements}
                onChange={(e) => setPlanForm(prev => ({ ...prev, mentoring_requirements: e.target.value }))}
                placeholder="Mentoring and coaching needs"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="success_metrics">Success Metrics</Label>
              <Textarea
                value={planForm.success_metrics}
                onChange={(e) => setPlanForm(prev => ({ ...prev, success_metrics: e.target.value }))}
                placeholder="How will success be measured?"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPlanDialog(false)}>
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

export default CareerDevelopmentPlans;