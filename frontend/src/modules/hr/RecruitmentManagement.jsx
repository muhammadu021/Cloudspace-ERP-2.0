import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  FileText, 
  UserCheck, 
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
  Phone,
  Building,
  Banknote,
  Award,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  Copy,
  Link
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
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { toast } from 'react-hot-toast';
import recruitmentService from '@/services/recruitmentService';
import employeeService from '@/services/employeeService';
import departmentService from '@/services/departmentService';

const RecruitmentManagement = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({});
  const [jobPostings, setJobPostings] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [backgroundChecks, setBackgroundChecks] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [jobChannels, setJobChannels] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [analyticsDateRange, setAnalyticsDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  // Dialog states
  const [showJobPostingDialog, setShowJobPostingDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [showBackgroundCheckDialog, setShowBackgroundCheckDialog] = useState(false);
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);
  const [showJobChannelDialog, setShowJobChannelDialog] = useState(false);
  
  // View/Edit Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Comment states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('general');
  
  // Form states
  const [jobPostingForm, setJobPostingForm] = useState({
    title: '',
    description: '',
    department_id: '',
    job_type: 'full_time',
    employment_type: 'permanent',
    location: '',
    remote_option: 'on_site',
    salary_min: '',
    salary_max: '',
    salary_currency: 'NGN',
    salary_period: 'yearly',
    experience_level: 'mid',
    education_level: '',
    required_skills: [],
    preferred_skills: [],
    responsibilities: '',
    requirements: '',
    benefits: '',
    application_deadline: '',
    start_date: '',
    positions_available: 1,
    hiring_manager_id: '',
    recruiter_id: '',
    status: 'draft',
    priority: 'medium'
  });

  const [candidateForm, setCandidateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    current_title: '',
    current_company: '',
    current_salary: '',
    expected_salary: '',
    notice_period: '',
    availability_date: '',
    willing_to_relocate: false,
    remote_work_preference: 'flexible',
    education_level: '',
    experience_years: '',
    skills: [],
    linkedin_url: '',
    portfolio_url: '',
    github_url: '',
    cv_link: '',
    source: 'website',
    source_details: '',
    referrer_id: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  const [applicationForm, setApplicationForm] = useState({
    candidate_id: '',
    job_posting_id: '',
    source: 'direct',
    cover_letter: '',
    salary_expectation: '',
    start_date_requested: '',
    assigned_recruiter_id: '',
    priority: 'medium'
  });

  const [interviewForm, setInterviewForm] = useState({
    application_id: '',
    interview_type: 'video_call',
    interview_round: 1,
    title: '',
    description: '',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    meeting_link: '',
    primary_interviewer_id: '',
    interviewer_ids: []
  });

  const [evaluationForm, setEvaluationForm] = useState({
    application_id: '',
    interview_id: '',
    evaluation_type: 'behavioral_interview',
    overall_score: '',
    technical_skills_score: '',
    communication_score: '',
    cultural_fit_score: '',
    strengths: '',
    weaknesses: '',
    detailed_feedback: '',
    recommendation: 'maybe'
  });

  const [backgroundCheckForm, setBackgroundCheckForm] = useState({
    application_id: '',
    check_type: 'criminal_history',
    provider: '',
    cost: '',
    consent_obtained: false,
    reference_email_1: '',
    reference_email_2: '',
    description: ''
  });

  const [offerLetterForm, setOfferLetterForm] = useState({
    application_id: '',
    job_title: '',
    department: '',
    work_location: '',
    employment_type: 'permanent',
    start_date: '',
    base_salary: '',
    salary_currency: 'NGN',
    salary_frequency: 'yearly',
    bonus_eligible: false,
    equity_eligible: false,
    vacation_days: '',
    offer_expiry_date: '',
    response_deadline: ''
  });

  const [jobChannelForm, setJobChannelForm] = useState({
    name: '',
    type: 'job_board',
    platform: '',
    url: '',
    posting_cost: '',
    auto_posting_enabled: false,
    status: 'active'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        loadDashboardStats();
        break;
      case 'job-postings':
        loadJobPostings();
        break;
      case 'candidates':
        loadCandidates();
        break;
      case 'applications':
        loadApplications();
        break;
      case 'interviews':
        loadInterviews();
        break;
      case 'evaluations':
        loadEvaluations();
        break;
      case 'background-checks':
        loadBackgroundChecks();
        break;
      case 'offer-letters':
        loadOfferLetters();
        break;
      case 'job-channels':
        loadJobChannels();
        break;
      case 'analytics':
        loadAnalytics();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes, jobPostingsRes, candidatesRes, applicationsRes] = await Promise.all([
        employeeService.getEmployees(),
        departmentService.getDepartments(),
        recruitmentService.getJobPostings(),
        recruitmentService.getCandidates(),
        recruitmentService.getApplications()
      ]);
      setEmployees(employeesRes.data?.data?.employees || employeesRes.data?.employees || []);
      setDepartments(departmentsRes.data?.data?.departments || departmentsRes.data?.departments || []);
      setJobPostings(jobPostingsRes.data?.data?.jobPostings || jobPostingsRes.data?.jobPostings || []);
      setCandidates(candidatesRes.data?.data?.candidates || candidatesRes.data?.candidates || []);
      setApplications(applicationsRes.data?.data?.applications || applicationsRes.data?.applications || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const response = await recruitmentService.getDashboardStats();
      setDashboardStats(response.data?.data || response.data || {});
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadJobPostings = async () => {
    try {
      const response = await recruitmentService.getJobPostings({ search: searchTerm });
      setJobPostings(response.data?.data?.jobPostings || response.data?.jobPostings || []);
    } catch (error) {
      console.error('Error loading job postings:', error);
      toast.error('Failed to load job postings');
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await recruitmentService.getCandidates({ search: searchTerm });
      setCandidates(response.data?.data?.candidates || response.data?.candidates || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    }
  };

  const loadApplications = async () => {
    try {
      const response = await recruitmentService.getApplications();
      setApplications(response.data?.data?.applications || response.data?.applications || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const loadInterviews = async () => {
    try {
      const response = await recruitmentService.getInterviews();
      setInterviews(response.data?.data?.interviews || response.data?.interviews || []);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast.error('Failed to load interviews');
    }
  };

  const loadEvaluations = async () => {
    try {
      const response = await recruitmentService.getEvaluations();
      setEvaluations(response.data?.data?.evaluations || response.data?.evaluations || []);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      toast.error('Failed to load evaluations');
    }
  };

  const loadBackgroundChecks = async () => {
    try {
      const response = await recruitmentService.getBackgroundChecks();
      setBackgroundChecks(response.data?.data?.backgroundChecks || response.data?.backgroundChecks || []);
    } catch (error) {
      console.error('Error loading background checks:', error);
      toast.error('Failed to load background checks');
    }
  };

  const loadOfferLetters = async () => {
    try {
      const response = await recruitmentService.getOfferLetters();
      setOfferLetters(response.data?.data?.offerLetters || response.data?.offerLetters || []);
    } catch (error) {
      console.error('Error loading offer letters:', error);
      toast.error('Failed to load offer letters');
    }
  };

  const loadJobChannels = async () => {
    try {
      const response = await recruitmentService.getJobChannels();
      setJobChannels(response.data?.data?.jobChannels || response.data?.jobChannels || []);
    } catch (error) {
      console.error('Error loading job channels:', error);
      toast.error('Failed to load job channels');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await recruitmentService.getRecruitmentAnalytics({
        date_from: analyticsDateRange.from,
        date_to: analyticsDateRange.to
      });
      setAnalyticsData(response.data?.data || response.data || {});
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load recruitment analytics');
    }
  };

  const handleCreateJobPosting = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await recruitmentService.createJobPosting(jobPostingForm);
      const jobData = response.data?.data || response.data;
      const publicLink = jobData?.publicApplicationUrl || jobData?.jobPosting?.public_link;
      
      if (publicLink) {
        const fullUrl = `${window.location.origin}/careers/apply/${publicLink.replace('/careers/apply/', '')}`;
        toast.success(
          <div>
            <p>Job posting created successfully!</p>
            <p className="text-xs mt-1">Public link: {fullUrl}</p>
          </div>,
          { duration: 8000 }
        );
        navigator.clipboard.writeText(fullUrl).catch(() => {});
      } else {
        toast.success('Job posting created successfully');
      }
      
      setShowJobPostingDialog(false);
      setJobPostingForm({
        title: '',
        description: '',
        department_id: '',
        job_type: 'full_time',
        employment_type: 'permanent',
        location: '',
        remote_option: 'on_site',
        salary_min: '',
        salary_max: '',
        salary_currency: 'NGN',
        salary_period: 'yearly',
        experience_level: 'mid',
        education_level: '',
        required_skills: [],
        preferred_skills: [],
        responsibilities: '',
        requirements: '',
        benefits: '',
        application_deadline: '',
        start_date: '',
        positions_available: 1,
        hiring_manager_id: '',
        recruiter_id: '',
        status: 'draft',
        priority: 'medium'
      });
      loadJobPostings();
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast.error('Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (file) => {
    if (!file) return null;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return null;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return null;
    }
    
    try {
      setCvUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/v1/upload/cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to upload CV');
      return null;
    } finally {
      setCvUploading(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let cvLink = candidateForm.cv_link;
      if (cvFile) {
        cvLink = await handleCvUpload(cvFile);
        if (!cvLink && cvFile) {
          setLoading(false);
          return;
        }
      }
      
      await recruitmentService.createCandidate({ ...candidateForm, cv_link: cvLink });
      toast.success('Candidate created successfully');
      setShowCandidateDialog(false);
      setCvFile(null);
      setCandidateForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        current_title: '',
        current_company: '',
        current_salary: '',
        expected_salary: '',
        notice_period: '',
        availability_date: '',
        willing_to_relocate: false,
        remote_work_preference: 'flexible',
        education_level: '',
        experience_years: '',
        skills: [],
        linkedin_url: '',
        portfolio_url: '',
        github_url: '',
        cv_link: '',
        source: 'website',
        source_details: '',
        referrer_id: ''
      });
      loadCandidates();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruitmentService.createApplication(applicationForm);
      toast.success('Application created successfully');
      setShowApplicationDialog(false);
      setApplicationForm({
        candidate_id: '',
        job_posting_id: '',
        source: 'direct',
        cover_letter: '',
        salary_expectation: '',
        start_date_requested: '',
        assigned_recruiter_id: '',
        priority: 'medium'
      });
      loadApplications();
    } catch (error) {
      console.error('Error creating application:', error);
      toast.error('Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruitmentService.createInterview(interviewForm);
      toast.success('Interview scheduled successfully');
      setShowInterviewDialog(false);
      setInterviewForm({
        application_id: '',
        interview_type: 'video_call',
        interview_round: 1,
        title: '',
        description: '',
        scheduled_date: '',
        duration_minutes: 60,
        location: '',
        meeting_link: '',
        primary_interviewer_id: '',
        interviewer_ids: []
      });
      loadInterviews();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruitmentService.createEvaluation(evaluationForm);
      toast.success('Evaluation created successfully');
      setShowEvaluationDialog(false);
      setEvaluationForm({
        application_id: '',
        interview_id: '',
        evaluation_type: 'behavioral_interview',
        overall_score: '',
        technical_skills_score: '',
        communication_score: '',
        cultural_fit_score: '',
        strengths: '',
        weaknesses: '',
        detailed_feedback: '',
        recommendation: 'maybe'
      });
      loadEvaluations();
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('Failed to create evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackgroundCheck = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting background check:', backgroundCheckForm);
      await recruitmentService.createBackgroundCheck(backgroundCheckForm);
      toast.success('Background check initiated successfully');
      setShowBackgroundCheckDialog(false);
      setBackgroundCheckForm({
        application_id: '',
        check_type: 'criminal_history',
        provider: '',
        cost: '',
        consent_obtained: false,
        reference_email_1: '',
        reference_email_2: '',
        description: ''
      });
      loadBackgroundChecks();
    } catch (error) {
      console.error('Error initiating background check:', error);
      toast.error('Failed to initiate background check');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOfferLetter = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruitmentService.createOfferLetter(offerLetterForm);
      toast.success('Offer letter created successfully');
      setShowOfferLetterDialog(false);
      setOfferLetterForm({
        application_id: '',
        job_title: '',
        department: '',
        work_location: '',
        employment_type: 'permanent',
        start_date: '',
        base_salary: '',
        salary_currency: 'NGN',
        salary_frequency: 'yearly',
        bonus_eligible: false,
        equity_eligible: false,
        vacation_days: '',
        offer_expiry_date: '',
        response_deadline: ''
      });
      loadOfferLetters();
    } catch (error) {
      console.error('Error creating offer letter:', error);
      toast.error('Failed to create offer letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJobChannel = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await recruitmentService.createJobChannel(jobChannelForm);
      toast.success('Job channel added successfully');
      setShowJobChannelDialog(false);
      setJobChannelForm({
        name: '',
        type: 'job_board',
        platform: '',
        url: '',
        posting_cost: '',
        auto_posting_enabled: false,
        status: 'active'
      });
      loadJobChannels();
    } catch (error) {
      console.error('Error adding job channel:', error);
      toast.error('Failed to add job channel');
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = (job) => {
    if (job.public_link) {
      const fullUrl = `${window.location.origin}/careers/apply/${job.public_link}`;
      navigator.clipboard.writeText(fullUrl).then(() => {
        toast.success('Public link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    } else {
      toast.error('No public link available for this job');
    }
  };

  const handleSendOffer = async (offer) => {
    if (!window.confirm('Are you sure you want to send this offer letter to the candidate?')) {
      return;
    }
    try {
      setLoading(true);
      await recruitmentService.sendOfferLetter(offer.id);
      toast.success('Offer letter sent successfully');
      loadOfferLetters();
    } catch (error) {
      console.error('Error sending offer letter:', error);
      toast.error('Failed to send offer letter');
    } finally {
      setLoading(false);
    }
  };

  // View/Edit/Comment handlers
  const handleView = async (item, type) => {
    setSelectedItemType(type);
    setEditMode(false);
    
    // For applications, fetch full details including candidate and job info
    if (type === 'application') {
      try {
        const response = await recruitmentService.getApplication(item.id);
        if (response.data?.data) {
          setSelectedItem({ ...response.data.data.application, interviews: response.data.data.interviews });
        } else {
          setSelectedItem(item);
        }
      } catch (error) {
        console.error('Error fetching application details:', error);
        setSelectedItem(item);
      }
    } else {
      setSelectedItem(item);
    }
    
    setShowViewDialog(true);
    loadComments(item.id, type);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setEditMode(true);
    setShowEditDialog(true);
    
    // Pre-populate form based on type
    switch (type) {
      case 'jobPosting':
        setJobPostingForm({ 
          ...item,
          department_id: item.department_id || item.department?.id || ''
        });
        break;
      case 'candidate':
        setCandidateForm({ ...item });
        break;
      case 'application':
        setApplicationForm({ ...item });
        break;
      case 'interview':
        setInterviewForm({ ...item });
        break;
      case 'evaluation':
        setEvaluationForm({ ...item });
        break;
      case 'backgroundCheck':
        setBackgroundCheckForm({ ...item });
        break;
      case 'offerLetter':
        setOfferLetterForm({ ...item });
        break;
      case 'jobChannel':
        setJobChannelForm({ ...item });
        break;
      default:
        break;
    }
  };

  const handleComment = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setComments([]); // Clear previous comments
    setShowCommentDialog(true);
    loadComments(item, type);
  };

  const loadComments = async (item, type) => {
    try {
      const existingNotes = [];
      
      if (item?.notes) {
        existingNotes.push({
          id: 1,
          author: 'Notes',
          content: item.notes,
          type: 'notes',
          created_at: item.created_at || new Date().toISOString(),
          avatar: 'NT'
        });
      }
      
      if (item?.internal_notes) {
        existingNotes.push({
          id: 2,
          author: 'Internal',
          content: item.internal_notes,
          type: 'internal',
          created_at: item.updated_at || new Date().toISOString(),
          avatar: 'IN'
        });
      }

      if (item?.detailed_feedback) {
        existingNotes.push({
          id: 3,
          author: 'Feedback',
          content: item.detailed_feedback,
          type: 'feedback',
          created_at: item.updated_at || new Date().toISOString(),
          avatar: 'FB'
        });
      }

      if (item?.reviewer_notes) {
        existingNotes.push({
          id: 4,
          author: 'Reviewer',
          content: item.reviewer_notes,
          type: 'review',
          created_at: item.updated_at || new Date().toISOString(),
          avatar: 'RV'
        });
      }
      
      setComments(existingNotes);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // Update the item with the new note
      const updatedNotes = selectedItem.notes 
        ? `${selectedItem.notes}\n\n[${new Date().toLocaleString()}]: ${newComment}`
        : `[${new Date().toLocaleString()}]: ${newComment}`;
      
      if (selectedItemType === 'candidate') {
        await recruitmentService.updateCandidate(selectedItem.id, { notes: updatedNotes });
        loadCandidates();
      } else if (selectedItemType === 'application') {
        await recruitmentService.updateApplication(selectedItem.id, { internal_notes: updatedNotes });
        loadApplications();
      } else if (selectedItemType === 'interview') {
        await recruitmentService.updateInterview(selectedItem.id, { notes: updatedNotes });
        loadInterviews();
      } else if (selectedItemType === 'evaluation') {
        await recruitmentService.updateEvaluation(selectedItem.id, { detailed_feedback: updatedNotes });
        loadEvaluations();
      } else if (selectedItemType === 'backgroundCheck') {
        await recruitmentService.updateBackgroundCheck(selectedItem.id, { reviewer_notes: updatedNotes });
        loadBackgroundChecks();
      } else if (selectedItemType === 'offerLetter') {
        await recruitmentService.updateOfferLetter(selectedItem.id, { internal_notes: updatedNotes });
        loadOfferLetters();
      } else if (selectedItemType === 'jobChannel') {
        await recruitmentService.updateJobChannel(selectedItem.id, { notes: updatedNotes });
        loadJobChannels();
      }
      
      // Add to local state
      const comment = {
        id: Date.now(),
        author: 'You',
        content: newComment,
        type: commentType,
        created_at: new Date().toISOString(),
        avatar: 'YO'
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add note');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      switch (selectedItemType) {
        case 'jobPosting':
          await recruitmentService.updateJobPosting(selectedItem.id, jobPostingForm);
          loadJobPostings();
          break;
        case 'candidate':
          await recruitmentService.updateCandidate(selectedItem.id, candidateForm);
          loadCandidates();
          break;
        case 'application':
          await recruitmentService.updateApplication(selectedItem.id, applicationForm);
          loadApplications();
          break;
        case 'interview':
          await recruitmentService.updateInterview(selectedItem.id, interviewForm);
          loadInterviews();
          break;
        case 'evaluation':
          await recruitmentService.updateEvaluation(selectedItem.id, evaluationForm);
          loadEvaluations();
          break;
        case 'backgroundCheck':
          await recruitmentService.updateBackgroundCheck(selectedItem.id, backgroundCheckForm);
          loadBackgroundChecks();
          break;
        case 'offerLetter':
          await recruitmentService.updateOfferLetter(selectedItem.id, offerLetterForm);
          loadOfferLetters();
          break;
        case 'jobChannel':
          await recruitmentService.updateJobChannel(selectedItem.id, jobChannelForm);
          loadJobChannels();
          break;
        default:
          break;
      }
      
      toast.success(`${selectedItemType} updated successfully`);
      setShowEditDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.openPositions || 0}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Total received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.scheduledInterviews || 0}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingOffers || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.newCandidates || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common recruitment tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => setShowJobPostingDialog(true)} className="h-20 flex flex-col">
              <Briefcase className="h-6 w-6 mb-2" />
              Post Job
            </Button>
            <Button onClick={() => setShowCandidateDialog(true)} className="h-20 flex flex-col" variant="outline">
              <Users className="h-6 w-6 mb-2" />
              Add Candidate
            </Button>
            <Button onClick={() => setShowInterviewDialog(true)} className="h-20 flex flex-col" variant="outline">
              <Calendar className="h-6 w-6 mb-2" />
              Schedule Interview
            </Button>
            <Button onClick={() => setShowOfferLetterDialog(true)} className="h-20 flex flex-col" variant="outline">
              <FileText className="h-6 w-6 mb-2" />
              Create Offer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{application.candidate?.first_name} {application.candidate?.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.job_posting?.title || 'N/A'} • {recruitmentService.formatDate(application.application_date)}
                    </p>
                  </div>
                  <Badge className={recruitmentService.getStatusColor(application.status)}>
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{interview.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {recruitmentService.formatDateTime(interview.scheduled_date)}
                    </p>
                  </div>
                  <Badge className={recruitmentService.getStatusColor(interview.status)}>
                    {interview.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderJobPostings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <p className="text-muted-foreground">Manage job openings and requirements</p>
        </div>
        <Button onClick={() => setShowJobPostingDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search job postings..."
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

      {/* Job Postings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobPostings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.department?.name || job.department}</p>
                </div>
                <Badge className={recruitmentService.getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{job.application_count || job.applications || 0} applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Posted {recruitmentService.calculateDaysAgo(job.created_at)}</span>
                </div>
                {job.public_link && (
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Link className="h-3 w-3" />
                    <span className="truncate">/careers/apply/{job.public_link}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleView(job, 'jobPosting')}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(job, 'jobPosting')}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {job.public_link && (
                  <Button size="sm" variant="outline" onClick={() => copyPublicLink(job)} title="Copy public link">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recruitment Analytics</h2>
          <p className="text-muted-foreground">Comprehensive recruitment metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadAnalytics()}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div>
              <Label htmlFor="date_from">From</Label>
              <Input
                type="date"
                value={analyticsDateRange.from}
                onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date_to">To</Label>
              <Input
                type="date"
                value={analyticsDateRange.to}
                onChange={(e) => setAnalyticsDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <Button onClick={() => loadAnalytics()}>
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalJobPostings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.activeJobPostings || 0} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">Applications received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Conducted</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedInterviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.totalInterviews || 0} total scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Made</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOffers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.acceptedOffers || 0} accepted ({analyticsData.offerAcceptanceRate || 0}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Application Funnel</CardTitle>
          <CardDescription>Track candidates through the recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.applicationsByStatus?.map((status) => {
              const percentage = analyticsData.totalApplications > 0 
                ? (status.count / analyticsData.totalApplications * 100).toFixed(1)
                : 0;
              return (
                <div key={status.status} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{status.status.replace('_', ' ')}</span>
                    <span>{status.count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Time to Hire</span>
                <span className="text-2xl font-bold">{analyticsData.avgTimeToHire || 0} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Offer Acceptance Rate</span>
                <span className="text-2xl font-bold">{analyticsData.offerAcceptanceRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Interview to Offer Ratio</span>
                <span className="text-2xl font-bold">
                  {analyticsData.totalInterviews && analyticsData.totalOffers 
                    ? (analyticsData.totalInterviews / analyticsData.totalOffers).toFixed(1)
                    : 0}:1
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { source: 'LinkedIn', applications: 45, hires: 8, cost: '₦2,400' },
                { source: 'Indeed', applications: 32, hires: 5, cost: '₦1,800' },
                { source: 'Referrals', applications: 18, hires: 7, cost: '₦3,500' },
                { source: 'Company Website', applications: 28, hires: 4, cost: '₦0' },
                { source: 'Recruiters', applications: 15, hires: 3, cost: '₦4,200' }
              ].map((channel) => (
                <div key={channel.source} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{channel.source}</p>
                    <p className="text-sm text-muted-foreground">
                      {channel.applications} applications • {channel.hires} hires
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{channel.cost}</p>
                    <p className="text-sm text-muted-foreground">
                      {((channel.hires / channel.applications) * 100).toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Hires</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobPostings.slice(0, 5).map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.applications || 0}</TableCell>
                    <TableCell>{job.hires || 0}</TableCell>
                    <TableCell>
                      {job.applications > 0 
                        ? ((job.hires || 0) / job.applications * 100).toFixed(1)
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Hiring Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Open Positions</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Hires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.slice(0, 5).map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.openPositions || 0}</TableCell>
                    <TableCell>{dept.applications || 0}</TableCell>
                    <TableCell>{dept.hires || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-600">Positive Trends</h4>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• Offer acceptance rate increased by 15% this month</li>
                <li>• Average time to hire reduced by 3 days</li>
                <li>• Referral program showing strong ROI</li>
                <li>• Technical interview scores improving</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-orange-600">Areas for Improvement</h4>
              </div>
              <ul className="space-y-1 text-sm">
                <li>• High drop-off rate after phone screening</li>
                <li>• Some job postings have low application rates</li>
                <li>• Interview scheduling delays affecting candidate experience</li>
                <li>• Background check process taking longer than expected</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Management</h1>
          <p className="text-muted-foreground">Complete recruitment and hiring platform</p>
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
          <TabsTrigger value="job-postings">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="background-checks">Background</TabsTrigger>
          <TabsTrigger value="offer-letters">Offers</TabsTrigger>
          <TabsTrigger value="job-channels">Channels</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="job-postings">
          {renderJobPostings()}
        </TabsContent>

        <TabsContent value="candidates">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Candidates</h2>
                <p className="text-muted-foreground">Manage candidate profiles and information</p>
              </div>
              <Button onClick={() => setShowCandidateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
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

            {/* Candidates Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">
                          {candidate.first_name} {candidate.last_name}
                        </TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.current_title || 'Not specified'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{recruitmentService.getSourceIcon(candidate.source)}</span>
                            <span className="capitalize">{candidate.source}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {candidate.overall_rating ? (
                            <div className="flex items-center gap-1">
                              <span>{candidate.overall_rating}</span>
                              <span className="text-yellow-500">★</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not rated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(candidate, 'candidate')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(candidate, 'candidate')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(candidate, 'candidate')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Applications</h2>
                <p className="text-muted-foreground">Track application progress and status</p>
              </div>
              <Button onClick={() => setShowApplicationDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Application
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
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

            {/* Applications Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">#{application.id}</TableCell>
                        <TableCell>
                          {application.candidate?.first_name} {application.candidate?.last_name}
                        </TableCell>
                        <TableCell>
                          {application.job_posting?.title || `Job ${application.job_posting_id}`}
                        </TableCell>
                        <TableCell>
                          {recruitmentService.formatDate(application.application_date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.overall_score ? (
                            <div className="flex items-center gap-1">
                              <span>{application.overall_score}</span>
                              <span className="text-yellow-500">★</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not scored</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getPriorityColor(application.priority)}>
                            {application.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(application, 'application')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(application, 'application')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(application, 'application')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="interviews">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Interviews</h2>
                <p className="text-muted-foreground">Schedule and manage interviews</p>
              </div>
              <Button onClick={() => setShowInterviewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search interviews..."
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

            {/* Interviews Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Interview Title</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Interviewer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell className="font-medium">{interview.title}</TableCell>
                        <TableCell>
                          {interview.application?.candidate?.first_name} {interview.application?.candidate?.last_name || interview.candidate_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {interview.interview_type === 'video_call' && <Video className="h-4 w-4" />}
                            {interview.interview_type === 'phone_screen' && <Phone className="h-4 w-4" />}
                            {interview.interview_type === 'in_person' && <Building className="h-4 w-4" />}
                            <span className="capitalize">{interview.interview_type?.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {recruitmentService.formatDateTime(interview.scheduled_date)}
                        </TableCell>
                        <TableCell>{interview.duration_minutes} min</TableCell>
                        <TableCell>
                          {interview.interviewer_name || `Employee ${interview.primary_interviewer_id}`}
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(interview, 'interview')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(interview, 'interview')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(interview, 'interview')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="evaluations">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Evaluations</h2>
                <p className="text-muted-foreground">Assess and rate candidates</p>
              </div>
              <Button onClick={() => setShowEvaluationDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Evaluation
              </Button>
            </div>

            {/* Evaluations Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Evaluation Type</TableHead>
                      <TableHead>Overall Score</TableHead>
                      <TableHead>Technical</TableHead>
                      <TableHead>Communication</TableHead>
                      <TableHead>Cultural Fit</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-medium">
                          {evaluation.application?.candidate?.first_name} {evaluation.application?.candidate?.last_name || evaluation.candidate_name || 'N/A'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {evaluation.evaluation_type?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold">{evaluation.overall_score}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.technical_skills_score || 'N/A'}</TableCell>
                        <TableCell>{evaluation.communication_score || 'N/A'}</TableCell>
                        <TableCell>{evaluation.cultural_fit_score || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={{
                            'strong_hire': 'bg-green-100 text-green-800',
                            'hire': 'bg-green-100 text-green-800',
                            'maybe': 'bg-yellow-100 text-yellow-800',
                            'no_hire': 'bg-red-100 text-red-800',
                            'strong_no_hire': 'bg-red-100 text-red-800'
                          }[evaluation.recommendation] || 'bg-gray-100 text-gray-800'}>
                            {evaluation.recommendation?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(evaluation, 'evaluation')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(evaluation, 'evaluation')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(evaluation, 'evaluation')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="background-checks">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Background Checks</h2>
                <p className="text-muted-foreground">Verify candidate information</p>
              </div>
              <Button onClick={() => setShowBackgroundCheckDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Initiate Check
              </Button>
            </div>

            {/* Background Checks Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Check Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Initiated Date</TableHead>
                      <TableHead>Consent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backgroundChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">
                          {check.application?.candidate?.first_name} {check.application?.candidate?.last_name || check.candidate_name || 'N/A'}
                        </TableCell>
                        <TableCell className="capitalize">
                          {check.check_type?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{check.provider || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(check.status)}>
                            {check.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {check.cost ? recruitmentService.formatCurrency(check.cost) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {recruitmentService.formatDate(check.created_at)}
                        </TableCell>
                        <TableCell>
                          {check.consent_obtained ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(check, 'backgroundCheck')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(check, 'backgroundCheck')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(check, 'backgroundCheck')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="offer-letters">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Offer Letters</h2>
                <p className="text-muted-foreground">Generate and send job offers</p>
              </div>
              <Button onClick={() => setShowOfferLetterDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Offer
              </Button>
            </div>

            {/* Offer Letters Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerLetters.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          {offer.application?.candidate?.first_name} {offer.application?.candidate?.last_name || offer.candidate_name || 'N/A'}
                        </TableCell>
                        <TableCell>{offer.job_title}</TableCell>
                        <TableCell>{offer.department?.name || offer.department}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Banknote className="h-4 w-4" />
                            <span>
                              {recruitmentService.formatCurrency(offer.base_salary)} 
                              <span className="text-muted-foreground">/{offer.salary_frequency}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {recruitmentService.formatDate(offer.start_date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(offer.status)}>
                            {offer.status || 'draft'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {recruitmentService.formatDate(offer.offer_expiry_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(offer, 'offerLetter')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(offer, 'offerLetter')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {offer.status === 'draft' || offer.status === 'approved' ? (
                              <Button size="sm" variant="default" onClick={() => handleSendOffer(offer)}>
                                <Send className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button size="sm" variant="outline" onClick={() => handleComment(offer, 'offerLetter')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="job-channels">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Job Channels</h2>
                <p className="text-muted-foreground">Manage posting channels and platforms</p>
              </div>
              <Button onClick={() => setShowJobChannelDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>

            {/* Job Channels Table */}
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Posting Cost</TableHead>
                      <TableHead>Auto Posting</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell className="font-medium">{channel.name}</TableCell>
                        <TableCell className="capitalize">
                          {channel.type?.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{channel.platform || 'N/A'}</TableCell>
                        <TableCell>
                          {channel.posting_cost 
                            ? recruitmentService.formatCurrency(channel.posting_cost)
                            : 'Free'
                          }
                        </TableCell>
                        <TableCell>
                          {channel.auto_posting_enabled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <span className="text-muted-foreground">Manual</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={recruitmentService.getStatusColor(channel.status)}>
                            {channel.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{channel.applications || 0} applications</div>
                            <div className="text-muted-foreground">
                              {channel.conversion_rate || 0}% conversion
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(channel, 'jobChannel')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(channel, 'jobChannel')}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleComment(channel, 'jobChannel')}>
                              <MessageSquare className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalytics()}
        </TabsContent>
      </Tabs>

      {/* Create Job Posting Dialog */}
      <Dialog open={showJobPostingDialog} onOpenChange={setShowJobPostingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Posting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJobPosting} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Job Title *</Label>
                <Input value={jobPostingForm.title} onChange={(e) => setJobPostingForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div>
                <Label>Department *</Label>
                <select value={jobPostingForm.department_id} onChange={(e) => setJobPostingForm(prev => ({ ...prev, department_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Job Description *</Label>
              <Textarea value={jobPostingForm.description} onChange={(e) => setJobPostingForm(prev => ({ ...prev, description: e.target.value }))} rows={4} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Location</Label>
                <Input value={jobPostingForm.location} onChange={(e) => setJobPostingForm(prev => ({ ...prev, location: e.target.value }))} />
              </div>
              <div>
                <Label>Job Type</Label>
                <select value={jobPostingForm.job_type} onChange={(e) => setJobPostingForm(prev => ({ ...prev, job_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select value={jobPostingForm.status} onChange={(e) => setJobPostingForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salary Min</Label>
                <Input type="number" value={jobPostingForm.salary_min} onChange={(e) => setJobPostingForm(prev => ({ ...prev, salary_min: e.target.value }))} />
              </div>
              <div>
                <Label>Salary Max</Label>
                <Input type="number" value={jobPostingForm.salary_max} onChange={(e) => setJobPostingForm(prev => ({ ...prev, salary_max: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowJobPostingDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Job Posting'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Job Channel Dialog */}
      <Dialog open={showJobChannelDialog} onOpenChange={setShowJobChannelDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Job Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJobChannel} className="space-y-4">
            <div>
              <Label htmlFor="name">Channel Name *</Label>
              <Input
                value={jobChannelForm.name}
                onChange={(e) => setJobChannelForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Channel name (e.g., LinkedIn, Indeed)"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Channel Type *</Label>
                <select value={jobChannelForm.type} onChange={(e) => setJobChannelForm(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                    <option value="job_board">Job Board</option>
                    <option value="social_media">Social Media</option>
                    <option value="company_website">Company Website</option>
                    <option value="recruitment_agency">Recruitment Agency</option>
                    <option value="university">University</option>
                    <option value="referral">Referral Program</option>
                    <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select value={jobChannelForm.status} onChange={(e) => setJobChannelForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="testing">Testing</option>
                    <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Input
                value={jobChannelForm.platform}
                onChange={(e) => setJobChannelForm(prev => ({ ...prev, platform: e.target.value }))}
                placeholder="Platform name"
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                value={jobChannelForm.url}
                onChange={(e) => setJobChannelForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Channel URL"
              />
            </div>
            <div>
              <Label htmlFor="posting_cost">Posting Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={jobChannelForm.posting_cost}
                onChange={(e) => setJobChannelForm(prev => ({ ...prev, posting_cost: e.target.value }))}
                placeholder="Cost per posting"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_posting_enabled"
                checked={jobChannelForm.auto_posting_enabled}
                onChange={(e) => setJobChannelForm(prev => ({ ...prev, auto_posting_enabled: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="auto_posting_enabled">Enable Auto Posting</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowJobChannelDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Channel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Candidate Dialog */}
      <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCandidate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input value={candidateForm.first_name} onChange={(e) => setCandidateForm(prev => ({ ...prev, first_name: e.target.value }))} required />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input value={candidateForm.last_name} onChange={(e) => setCandidateForm(prev => ({ ...prev, last_name: e.target.value }))} required />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={candidateForm.email} onChange={(e) => setCandidateForm(prev => ({ ...prev, email: e.target.value }))} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={candidateForm.phone} onChange={(e) => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div>
                <Label>Current Title</Label>
                <Input value={candidateForm.current_title} onChange={(e) => setCandidateForm(prev => ({ ...prev, current_title: e.target.value }))} />
              </div>
              <div>
                <Label>Current Company</Label>
                <Input value={candidateForm.current_company} onChange={(e) => setCandidateForm(prev => ({ ...prev, current_company: e.target.value }))} />
              </div>
              <div>
                <Label>Experience (Years)</Label>
                <Input type="number" value={candidateForm.experience_years} onChange={(e) => setCandidateForm(prev => ({ ...prev, experience_years: e.target.value }))} />
              </div>
              <div>
                <Label>Source</Label>
                <select value={candidateForm.source} onChange={(e) => setCandidateForm(prev => ({ ...prev, source: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="job_board">Job Board</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {/* CV Upload */}
            <div>
              <Label>CV/Resume (PDF or Word)</Label>
              <div className="mt-1">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-blue-100"
                />
                {cvFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FileText className="w-4 h-4" />
                    <span>{cvFile.name}</span>
                    <button type="button" onClick={() => setCvFile(null)} className="text-red-500 hover:text-red-700">×</button>
                  </div>
                )}
                {cvUploading && (
                  <div className="mt-2 text-sm text-primary">Uploading CV...</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setShowCandidateDialog(false); setCvFile(null); }}>Cancel</Button>
              <Button type="submit" disabled={loading || cvUploading}>{loading || cvUploading ? 'Processing...' : 'Add Candidate'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Application Dialog */}
      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateApplication} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Candidate *</Label>
                <select value={applicationForm.candidate_id} onChange={(e) => setApplicationForm(prev => ({ ...prev, candidate_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select candidate</option>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <Label>Job Position *</Label>
                <select value={applicationForm.job_posting_id} onChange={(e) => setApplicationForm(prev => ({ ...prev, job_posting_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select job</option>
                  {jobPostings.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              <div>
                <Label>Source</Label>
                <select value={applicationForm.source} onChange={(e) => setApplicationForm(prev => ({ ...prev, source: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="direct">Direct</option>
                  <option value="referral">Referral</option>
                  <option value="job_board">Job Board</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select value={applicationForm.priority} onChange={(e) => setApplicationForm(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Cover Letter</Label>
              <Textarea value={applicationForm.cover_letter} onChange={(e) => setApplicationForm(prev => ({ ...prev, cover_letter: e.target.value }))} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Application'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInterview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Application *</Label>
                <select value={interviewForm.application_id} onChange={(e) => setInterviewForm(prev => ({ ...prev, application_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select application</option>
                  {applications.map(a => <option key={a.id} value={a.id}>{a.candidate?.first_name} {a.candidate?.last_name} - {a.job_posting?.title || 'N/A'}</option>)}
                </select>
              </div>
              <div>
                <Label>Interview Type *</Label>
                <select value={interviewForm.interview_type} onChange={(e) => setInterviewForm(prev => ({ ...prev, interview_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="phone_screen">Phone Screen</option>
                  <option value="video_call">Video Call</option>
                  <option value="in_person">In Person</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input value={interviewForm.title} onChange={(e) => setInterviewForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div>
                <Label>Scheduled Date *</Label>
                <Input type="datetime-local" value={interviewForm.scheduled_date} onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduled_date: e.target.value }))} required />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input type="number" value={interviewForm.duration_minutes} onChange={(e) => setInterviewForm(prev => ({ ...prev, duration_minutes: e.target.value }))} />
              </div>
              <div>
              <Label>Description</Label>
              <Textarea value={interviewForm.description} onChange={(e) => setInterviewForm(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Interview agenda, topics to cover, preparation notes..." />
            </div>
              {/* <div>
                <Label>Interviewer</Label>
                <select value={interviewForm.primary_interviewer_id} onChange={(e) => setInterviewForm(prev => ({ ...prev, primary_interviewer_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Select interviewer</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div> */}
            </div>
            <div>
              <Label>Meeting Link</Label>
              <Input value={interviewForm.meeting_link} onChange={(e) => setInterviewForm(prev => ({ ...prev, meeting_link: e.target.value }))} placeholder="Video call URL" />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowInterviewDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Interview'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Evaluation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvaluation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Application *</Label>
                <select value={evaluationForm.application_id} onChange={(e) => setEvaluationForm(prev => ({ ...prev, application_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select application</option>
                  {applications.map(a => <option key={a.id} value={a.id}>{a.candidate?.first_name} {a.candidate?.last_name} - {a.job_posting?.title || 'N/A'}</option>)}
                </select>
              </div>
              <div>
                <Label>Evaluation Type</Label>
                <select value={evaluationForm.evaluation_type} onChange={(e) => setEvaluationForm(prev => ({ ...prev, evaluation_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="resume_screening">Resume Screening</option>
                  <option value="phone_screen">Phone Screen</option>
                  <option value="technical_assessment">Technical Assessment</option>
                  <option value="behavioral_interview">Behavioral Interview</option>
                  <option value="cultural_fit">Cultural Fit</option>
                  <option value="reference_check">Reference Check</option>
                  <option value="final_assessment">Final Assessment</option>
                </select>
              </div>
              <div>
                <Label>Overall Score (1-10) *</Label>
                <Input type="number" min="1" max="10" value={evaluationForm.overall_score} onChange={(e) => setEvaluationForm(prev => ({ ...prev, overall_score: e.target.value }))} required />
              </div>
              <div>
                <Label>Technical Skills (1-10)</Label>
                <Input type="number" min="1" max="10" value={evaluationForm.technical_skills_score} onChange={(e) => setEvaluationForm(prev => ({ ...prev, technical_skills_score: e.target.value }))} />
              </div>
              <div>
                <Label>Communication (1-10)</Label>
                <Input type="number" min="1" max="10" value={evaluationForm.communication_score} onChange={(e) => setEvaluationForm(prev => ({ ...prev, communication_score: e.target.value }))} />
              </div>
              <div>
                <Label>Recommendation</Label>
                <select value={evaluationForm.recommendation} onChange={(e) => setEvaluationForm(prev => ({ ...prev, recommendation: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                  <option value="strong_hire">Strong Hire</option>
                  <option value="hire">Hire</option>
                  <option value="maybe">Maybe</option>
                  <option value="no_hire">No Hire</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Detailed Feedback</Label>
              <Textarea value={evaluationForm.detailed_feedback} onChange={(e) => setEvaluationForm(prev => ({ ...prev, detailed_feedback: e.target.value }))} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEvaluationDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Evaluation'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Background Check Dialog */}
      <Dialog open={showBackgroundCheckDialog} onOpenChange={setShowBackgroundCheckDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Initiate Background Check</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBackgroundCheck} className="space-y-4">
            <div>
              <Label>Application *</Label>
              <select value={backgroundCheckForm.application_id} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, application_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                <option value="">Select application</option>
                {applications.map(a => <option key={a.id} value={a.id}>{a.candidate?.first_name} {a.candidate?.last_name} - {a.job_posting?.title || 'N/A'}</option>)}
              </select>
            </div>
            <div>
              <Label>Check Type *</Label>
              <select value={backgroundCheckForm.check_type} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, check_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                <option value="criminal_history">Criminal History</option>
                <option value="employment_verification">Employment Verification</option>
                <option value="education_verification">Education Verification</option>
                <option value="reference_check">Reference Check</option>
                <option value="credit_check">Credit Check</option>
              </select>
            </div>
            {backgroundCheckForm.check_type === 'reference_check' && (
              <>
                <div>
                  <Label>Reference Email 1 *</Label>
                  <Input type="email" value={backgroundCheckForm.reference_email_1 || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, reference_email_1: e.target.value }))} placeholder="first.reference@company.com" required />
                </div>
                <div>
                  <Label>Reference Email 2 *</Label>
                  <Input type="email" value={backgroundCheckForm.reference_email_2 || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, reference_email_2: e.target.value }))} placeholder="second.reference@company.com" required />
                </div>
                <div>
                  <Label>Description / Questions for References *</Label>
                  <Textarea value={backgroundCheckForm.description || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, description: e.target.value }))} rows={4} placeholder="Please provide information about the candidate's work performance, reliability, and character..." required />
                </div>
              </>
            )}
            <div>
              <Label>Provider</Label>
              <Input value={backgroundCheckForm.provider} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, provider: e.target.value }))} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="consent" checked={backgroundCheckForm.consent_obtained} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, consent_obtained: e.target.checked }))} className="rounded" />
              <Label htmlFor="consent">Consent Obtained</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBackgroundCheckDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Initiating...' : 'Initiate Check'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Offer Letter Dialog */}
      <Dialog open={showOfferLetterDialog} onOpenChange={setShowOfferLetterDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Offer Letter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOfferLetter} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Application *</Label>
                <select value={offerLetterForm.application_id} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, application_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select application</option>
                  {applications.map(a => <option key={a.id} value={a.id}>{a.candidate?.first_name} {a.candidate?.last_name} - {a.job_posting?.title || 'N/A'}</option>)}
                </select>
              </div>
              <div>
                <Label>Job Title *</Label>
                <Input value={offerLetterForm.job_title} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, job_title: e.target.value }))} required />
              </div>
              <div>
                <Label>Department</Label>
                <Input value={offerLetterForm.department} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, department: e.target.value }))} />
              </div>
              <div>
                <Label>Work Location</Label>
                <Input value={offerLetterForm.work_location} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, work_location: e.target.value }))} />
              </div>
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={offerLetterForm.start_date} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, start_date: e.target.value }))} required />
              </div>
              <div>
                <Label>Base Salary *</Label>
                <Input type="number" value={offerLetterForm.base_salary} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, base_salary: e.target.value }))} required />
              </div>
              <div>
                <Label>Offer Expiry Date *</Label>
                <Input type="date" value={offerLetterForm.offer_expiry_date} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, offer_expiry_date: e.target.value }))} required />
              </div>
              <div>
                <Label>Response Deadline *</Label>
                <Input type="date" value={offerLetterForm.response_deadline} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, response_deadline: e.target.value }))} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowOfferLetterDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Offer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View {selectedItemType}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Dynamic content based on item type */}
              {selectedItemType === 'candidate' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="space-y-2">
                      <div><strong>Name:</strong> {selectedItem.first_name} {selectedItem.last_name}</div>
                      <div><strong>Email:</strong> {selectedItem.email}</div>
                      <div><strong>Phone:</strong> {selectedItem.phone || 'Not provided'}</div>
                      <div><strong>Location:</strong> {selectedItem.city}, {selectedItem.state}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Professional Information</h3>
                    <div className="space-y-2">
                      <div><strong>Current Title:</strong> {selectedItem.current_title || 'Not specified'}</div>
                      <div><strong>Current Company:</strong> {selectedItem.current_company || 'Not specified'}</div>
                      <div><strong>Experience:</strong> {selectedItem.experience_years || 'Not specified'} years</div>
                      <div><strong>Education:</strong> {selectedItem.education_level || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold">Links & Documents</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedItem.cv_link && (
                        <a href={selectedItem.cv_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-100 text-primary-700 rounded-lg hover:bg-blue-200">
                          📄 View CV/Resume
                        </a>
                      )}
                      {selectedItem.linkedin_url && (
                        <a href={selectedItem.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-100 text-primary-700 rounded-lg hover:bg-blue-200">
                          💼 LinkedIn
                        </a>
                      )}
                      {selectedItem.portfolio_url && (
                        <a href={selectedItem.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-100 text-primary-700 rounded-lg hover:bg-blue-200">
                          🌐 Portfolio
                        </a>
                      )}
                      {selectedItem.github_url && (
                        <a href={selectedItem.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-100 text-primary-700 rounded-lg hover:bg-blue-200">
                          💻 GitHub
                        </a>
                      )}
                      {!selectedItem.cv_link && !selectedItem.linkedin_url && !selectedItem.portfolio_url && !selectedItem.github_url && (
                        <span className="text-gray-500">No links provided</span>
                      )}
                    </div>
                  </div>
                  {/* Action: Create Application */}
                  <div className="col-span-2 border-t pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setApplicationForm(prev => ({ ...prev, candidate_id: String(selectedItem.id) }));
                        setShowViewDialog(false);
                        setShowApplicationDialog(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Application for this Candidate
                    </button>
                  </div>
                </div>
              )}
              
              {selectedItemType === 'application' && (
                <div className="space-y-6">
                  {/* Candidate Info */}
                  {selectedItem.candidate && (
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Candidate Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Name:</strong> {selectedItem.candidate.first_name} {selectedItem.candidate.last_name}</div>
                        <div><strong>Email:</strong> {selectedItem.candidate.email}</div>
                        <div><strong>Phone:</strong> {selectedItem.candidate.phone || 'Not provided'}</div>
                        <div><strong>Current Title:</strong> {selectedItem.candidate.current_title || 'Not specified'}</div>
                        <div><strong>Current Company:</strong> {selectedItem.candidate.current_company || 'Not specified'}</div>
                        <div><strong>Experience:</strong> {selectedItem.candidate.experience_years || 'N/A'} years</div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        {selectedItem.candidate.cv_link && (
                          <a href={selectedItem.candidate.cv_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">📄 View Resume</a>
                        )}
                        {selectedItem.candidate.linkedin_url && (
                          <a href={selectedItem.candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">💼 LinkedIn</a>
                        )}
                        {selectedItem.candidate.portfolio_url && (
                          <a href={selectedItem.candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">🌐 Portfolio</a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Job Info */}
                  {selectedItem.job_posting && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Position Applied For</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Job Title:</strong> {selectedItem.job_posting.title}</div>
                        <div><strong>Department:</strong> {selectedItem.job_posting.department?.name || 'N/A'}</div>
                        <div><strong>Location:</strong> {selectedItem.job_posting.location || 'N/A'}</div>
                        <div><strong>Employment Type:</strong> {selectedItem.job_posting.employment_type || 'N/A'}</div>
                        {selectedItem.job_posting.salary_min && (
                          <div><strong>Salary Range:</strong> {recruitmentService.formatCurrency(selectedItem.job_posting.salary_min)} - {recruitmentService.formatCurrency(selectedItem.job_posting.salary_max)}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Application Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div><strong>Application ID:</strong> #{selectedItem.id}</div>
                      <div><strong>Status:</strong> 
                        <Badge className={recruitmentService.getStatusColor(selectedItem.status)}>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div><strong>Applied Date:</strong> {recruitmentService.formatDate(selectedItem.application_date)}</div>
                      <div><strong>Priority:</strong> 
                        <Badge className={recruitmentService.getPriorityColor(selectedItem.priority)}>
                          {selectedItem.priority}
                        </Badge>
                      </div>
                      <div><strong>Source:</strong> {selectedItem.source || 'Direct'}</div>
                      {selectedItem.salary_expectation && (
                        <div><strong>Salary Expectation:</strong> {recruitmentService.formatCurrency(selectedItem.salary_expectation)}</div>
                      )}
                      {selectedItem.assigned_recruiter && (
                        <div><strong>Assigned Recruiter:</strong> {selectedItem.assigned_recruiter.first_name} {selectedItem.assigned_recruiter.last_name}</div>
                      )}
                      {selectedItem.hiring_manager && (
                        <div><strong>Hiring Manager:</strong> {selectedItem.hiring_manager.first_name} {selectedItem.hiring_manager.last_name}</div>
                      )}
                    </div>
                  </div>

                  {selectedItem.cover_letter && (
                    <div>
                      <h4 className="font-semibold mb-2">Cover Letter</h4>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {selectedItem.cover_letter}
                      </div>
                    </div>
                  )}

                  {/* Interviews for this application */}
                  {selectedItem.interviews && selectedItem.interviews.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Scheduled Interviews</h4>
                      <div className="space-y-2">
                        {selectedItem.interviews.map((interview) => (
                          <div key={interview.id} className="p-3 bg-purple-50 rounded-lg flex justify-between items-center">
                            <div>
                              <div className="font-medium">{interview.title}</div>
                              <div className="text-sm text-gray-600">
                                {recruitmentService.formatDateTime(interview.scheduled_date)} • {interview.interview_type?.replace('_', ' ')}
                              </div>
                            </div>
                            <Badge className={recruitmentService.getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action: Create Interview */}
                  <div className="border-t pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setInterviewForm(prev => ({ ...prev, application_id: String(selectedItem.id) }));
                        setShowViewDialog(false);
                        setShowInterviewDialog(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Interview for this Application
                    </button>
                  </div>
                </div>
              )}
              
              {selectedItemType === 'interview' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Interview Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Title:</strong> {selectedItem.title}</div>
                    <div><strong>Type:</strong> {selectedItem.interview_type?.replace('_', ' ')}</div>
                    <div><strong>Date & Time:</strong> {recruitmentService.formatDateTime(selectedItem.scheduled_date)}</div>
                    <div><strong>Duration:</strong> {selectedItem.duration_minutes} minutes</div>
                    <div><strong>Status:</strong> 
                      <Badge className={recruitmentService.getStatusColor(selectedItem.status)}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedItem.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        {selectedItem.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Action: Create Evaluation */}
                  <div className="border-t pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setEvaluationForm(prev => ({ 
                          ...prev, 
                          application_id: String(selectedItem.application_id || ''),
                          interview_id: String(selectedItem.id)
                        }));
                        setShowViewDialog(false);
                        setShowEvaluationDialog(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Evaluation for this Interview
                    </button>
                  </div>
                </div>
              )}
              
              {selectedItemType === 'evaluation' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Evaluation Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Type:</strong> {selectedItem.evaluation_type?.replace('_', ' ')}</div>
                    <div><strong>Overall Score:</strong> {selectedItem.overall_score}/10</div>
                    <div><strong>Technical Skills:</strong> {selectedItem.technical_skills_score || 'N/A'}/10</div>
                    <div><strong>Communication:</strong> {selectedItem.communication_score || 'N/A'}/10</div>
                    <div><strong>Cultural Fit:</strong> {selectedItem.cultural_fit_score || 'N/A'}/10</div>
                    <div><strong>Recommendation:</strong> 
                      <Badge className={{
                        'strong_hire': 'bg-green-100 text-green-800',
                        'hire': 'bg-green-100 text-green-800',
                        'maybe': 'bg-yellow-100 text-yellow-800',
                        'no_hire': 'bg-red-100 text-red-800',
                        'strong_no_hire': 'bg-red-100 text-red-800'
                      }[selectedItem.recommendation] || 'bg-gray-100 text-gray-800'}>
                        {selectedItem.recommendation?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {selectedItem.detailed_feedback && (
                    <div>
                      <h4 className="font-semibold mb-2">Detailed Feedback</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        {selectedItem.detailed_feedback}
                      </div>
                    </div>
                  )}
                  
                  {/* Action: Create Background Check */}
                  <div className="border-t pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setBackgroundCheckForm(prev => ({ 
                          ...prev, 
                          application_id: String(selectedItem.application_id || '')
                        }));
                        setShowViewDialog(false);
                        setShowBackgroundCheckDialog(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Background Check
                    </button>
                  </div>
                </div>
              )}
              
              {selectedItemType === 'backgroundCheck' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Background Check Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Check Type:</strong> {selectedItem.check_type?.replace('_', ' ')}</div>
                    <div><strong>Status:</strong> 
                      <Badge className={recruitmentService.getStatusColor(selectedItem.status)}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                    <div><strong>Requested Date:</strong> {recruitmentService.formatDate(selectedItem.requested_date)}</div>
                    <div><strong>Completed Date:</strong> {selectedItem.completed_date ? recruitmentService.formatDate(selectedItem.completed_date) : 'Pending'}</div>
                    {selectedItem.result && (
                      <div><strong>Result:</strong> 
                        <Badge className={{
                          'clear': 'bg-green-100 text-green-800',
                          'flagged': 'bg-yellow-100 text-yellow-800',
                          'failed': 'bg-red-100 text-red-800'
                        }[selectedItem.result] || 'bg-gray-100 text-gray-800'}>
                          {selectedItem.result}
                        </Badge>
                      </div>
                    )}
                    {selectedItem.provider && <div><strong>Provider:</strong> {selectedItem.provider}</div>}
                  </div>
                  {selectedItem.check_type === 'reference_check' && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Reference Contacts</h4>
                      <div className="space-y-1">
                        <div><strong>Reference 1:</strong> {selectedItem.reference_email_1 || 'Not provided'}</div>
                        <div><strong>Reference 2:</strong> {selectedItem.reference_email_2 || 'Not provided'}</div>
                      </div>
                    </div>
                  )}
                  {selectedItem.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedItem.description}</div>
                    </div>
                  )}
                  {selectedItem.findings && (
                    <div>
                      <h4 className="font-semibold mb-2">Findings</h4>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedItem.findings}</div>
                    </div>
                  )}
                  {selectedItem.reviewer_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Reviewer Notes</h4>
                      <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{selectedItem.reviewer_notes}</div>
                    </div>
                  )}
                  
                  {/* Action: Create Offer Letter */}
                  <div className="border-t pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setOfferLetterForm(prev => ({ 
                          ...prev, 
                          application_id: String(selectedItem.application_id || '')
                        }));
                        setShowViewDialog(false);
                        setShowOfferLetterDialog(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Offer Letter
                    </button>
                  </div>
                </div>
              )}
              
              {/* Comments Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Comments & Notes</h3>
                  <Button onClick={() => setShowCommentDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {comment.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {recruitmentService.formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <Badge className="mt-1 text-xs">{comment.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedItemType === 'jobPosting' ? 'Job Posting' : selectedItemType}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Job Posting Edit Form */}
              {selectedItemType === 'jobPosting' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        value={jobPostingForm.title || ''}
                        onChange={(e) => setJobPostingForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="department_id">Department *</Label>
                      <select 
                        value={jobPostingForm.department_id || ''} 
                        onChange={(e) => setJobPostingForm(prev => ({ ...prev, department_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Select department</option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.id.toString()}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      value={jobPostingForm.description || ''}
                      onChange={(e) => setJobPostingForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        value={jobPostingForm.location || ''}
                        onChange={(e) => setJobPostingForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_type">Job Type</Label>
                      <select 
                        value={jobPostingForm.job_type || 'full_time'} 
                        onChange={(e) => setJobPostingForm(prev => ({ ...prev, job_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select 
                        value={jobPostingForm.status || 'draft'} 
                        onChange={(e) => setJobPostingForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Candidate Edit Form */}
              {selectedItemType === 'candidate' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      value={candidateForm.first_name || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      value={candidateForm.last_name || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      type="email"
                      value={candidateForm.email || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      value={candidateForm.phone || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_title">Current Title</Label>
                    <Input
                      value={candidateForm.current_title || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, current_title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_company">Current Company</Label>
                    <Input
                      value={candidateForm.current_company || ''}
                      onChange={(e) => setCandidateForm(prev => ({ ...prev, current_company: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Application Edit Form */}
              {selectedItemType === 'application' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status *</Label>
                    <select value={applicationForm.status || ''} onChange={(e) => setApplicationForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md" required>
                      <option value="new">New</option>
                      <option value="screening">Screening</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="offer_pending">Offer Pending</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <select value={applicationForm.priority || 'medium'} onChange={(e) => setApplicationForm(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <Label>Salary Expectation</Label>
                    <Input type="number" value={applicationForm.salary_expectation || ''} onChange={(e) => setApplicationForm(prev => ({ ...prev, salary_expectation: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <select value={applicationForm.source || ''} onChange={(e) => setApplicationForm(prev => ({ ...prev, source: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="direct">Direct</option>
                      <option value="referral">Referral</option>
                      <option value="job_board">Job Board</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Cover Letter</Label>
                    <Textarea value={applicationForm.cover_letter || ''} onChange={(e) => setApplicationForm(prev => ({ ...prev, cover_letter: e.target.value }))} rows={3} />
                  </div>
                </div>
              )}

              {/* Interview Edit Form */}
              {selectedItemType === 'interview' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input value={interviewForm.title || ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Interview Type</Label>
                    <select value={interviewForm.interview_type || ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, interview_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="phone_screen">Phone Screen</option>
                      <option value="video_call">Video Call</option>
                      <option value="in_person">In Person</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <Label>Scheduled Date *</Label>
                    <Input type="datetime-local" value={interviewForm.scheduled_date ? interviewForm.scheduled_date.slice(0, 16) : ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduled_date: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={interviewForm.duration_minutes || 60} onChange={(e) => setInterviewForm(prev => ({ ...prev, duration_minutes: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select value={interviewForm.status || ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no_show">No Show</option>
                    </select>
                  </div>
                  <div>
                    <Label>Meeting Link</Label>
                    <Input value={interviewForm.meeting_link || ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, meeting_link: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea value={interviewForm.description || ''} onChange={(e) => setInterviewForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                  </div>
                </div>
              )}

              {/* Evaluation Edit Form */}
              {selectedItemType === 'evaluation' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Evaluation Type</Label>
                    <select value={evaluationForm.evaluation_type || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, evaluation_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="behavioral_interview">Behavioral Interview</option>
                      <option value="technical_interview">Technical Interview</option>
                      <option value="skills_assessment">Skills Assessment</option>
                      <option value="culture_fit">Culture Fit</option>
                    </select>
                  </div>
                  <div>
                    <Label>Overall Score (1-10)</Label>
                    <Input type="number" min="1" max="10" value={evaluationForm.overall_score || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, overall_score: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Technical Skills (1-10)</Label>
                    <Input type="number" min="1" max="10" value={evaluationForm.technical_skills_score || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, technical_skills_score: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Communication (1-10)</Label>
                    <Input type="number" min="1" max="10" value={evaluationForm.communication_score || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, communication_score: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Cultural Fit (1-10)</Label>
                    <Input type="number" min="1" max="10" value={evaluationForm.cultural_fit_score || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, cultural_fit_score: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Recommendation</Label>
                    <select value={evaluationForm.recommendation || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, recommendation: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="strong_hire">Strong Hire</option>
                      <option value="hire">Hire</option>
                      <option value="maybe">Maybe</option>
                      <option value="no_hire">No Hire</option>
                      <option value="strong_no_hire">Strong No Hire</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Detailed Feedback</Label>
                    <Textarea value={evaluationForm.detailed_feedback || ''} onChange={(e) => setEvaluationForm(prev => ({ ...prev, detailed_feedback: e.target.value }))} rows={4} />
                  </div>
                </div>
              )}

              {/* Background Check Edit Form */}
              {selectedItemType === 'backgroundCheck' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check Type</Label>
                    <select value={backgroundCheckForm.check_type || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, check_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="criminal_history">Criminal History</option>
                      <option value="employment_verification">Employment Verification</option>
                      <option value="education_verification">Education Verification</option>
                      <option value="reference_check">Reference Check</option>
                      <option value="credit_check">Credit Check</option>
                    </select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select value={backgroundCheckForm.status || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Input value={backgroundCheckForm.provider || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, provider: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Cost</Label>
                    <Input type="number" value={backgroundCheckForm.cost || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, cost: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <Label>Result</Label>
                    <select value={backgroundCheckForm.result || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, result: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Not Yet</option>
                      <option value="clear">Clear</option>
                      <option value="flagged">Flagged</option>
                      <option value="review_required">Review Required</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea value={backgroundCheckForm.notes || ''} onChange={(e) => setBackgroundCheckForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} />
                  </div>
                </div>
              )}

              {/* Offer Letter Edit Form */}
              {selectedItemType === 'offerLetter' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title *</Label>
                    <Input value={offerLetterForm.job_title || ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, job_title: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input value={offerLetterForm.department || ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, department: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Base Salary *</Label>
                    <Input type="number" value={offerLetterForm.base_salary || ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, base_salary: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <select value={offerLetterForm.salary_currency || 'NGN'} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, salary_currency: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={offerLetterForm.start_date ? offerLetterForm.start_date.slice(0, 10) : ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select value={offerLetterForm.status || ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <Label>Employment Type</Label>
                    <select value={offerLetterForm.employment_type || 'permanent'} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, employment_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md">
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <Label>Work Location</Label>
                    <Input value={offerLetterForm.work_location || ''} onChange={(e) => setOfferLetterForm(prev => ({ ...prev, work_location: e.target.value }))} />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments & Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing Comments */}
            {comments.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    <span className="text-xs text-gray-400">{comment.type}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Comment */}
            <div>
              <Label htmlFor="comment_type">Comment Type</Label>
              <select 
                value={commentType} 
                onChange={(e) => setCommentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="general">General Note</option>
                <option value="feedback">Feedback</option>
                <option value="interview_note">Interview Note</option>
                <option value="evaluation">Evaluation</option>
                <option value="concern">Concern</option>
                <option value="recommendation">Recommendation</option>
              </select>
            </div>
            <div>
              <Label htmlFor="comment">Add Comment</Label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Add Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitmentManagement;