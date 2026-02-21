import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  BookOpen,
  CheckSquare,
  Bell,
  Folder,
  MessageSquare,
  ClipboardList,
  X,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  submitAnonymousReview,
  submitPerformanceAppraisal,
} from "../../services/reviewService";
import { selfServiceService } from "../../services/selfServiceService";
import { selectApiData } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import AnnouncementsWidget from "./components/AnnouncementsWidget";
import UpcomingEvents from "./components/UpcomingEvents";

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "max-w-4xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${size} w-full`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2 max-h-[70vh] overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Anonymous Review Form Component
const AnonymousReviewForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    q1: "",
    q2_gmd: "",
    q2_ta: "",
    q2_pm: "",
    q2_hr: "",
    q3_colleague1_name: "",
    q3_colleague1_feedback: "",
    q3_colleague2_name: "",
    q3_colleague2_feedback: "",
    q3_colleague3_name: "",
    q3_colleague3_feedback: "",
    q4_best1_name: "",
    q4_best1_why: "",
    q4_best2_name: "",
    q4_best2_why: "",
    q4_best3_name: "",
    q4_best3_why: "",
    q5: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitAnonymousReview(formData);
      alert(
        "Anonymous review submitted successfully! Thank you for your feedback."
      );
      onClose();
    } catch (error) {
      console.error("Error submitting anonymous review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-primary-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Anonymous Review - Peer Feedback (Anonymous 360-Style)
        </h3>
        <p className="text-sm text-blue-800">
          Please note that this review is totally anonymous. You are required to
          provide answers to all questions as honestly as possible. The
          information provided will be strictly used for recognition,
          development, and improvement purposes.
        </p>
      </div>

      {/* Q1 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Q1: Provide feedback on Cloudspace in General
          <span className="block text-xs text-gray-600 mt-1">
            Note: Structure your feedback based on the following: What we do
            well, and What needs improved
          </span>
        </label>
        <textarea
          value={formData.q1}
          onChange={(e) => handleChange("q1", e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="What we do well:&#10;&#10;What needs improved:"
          required
        />
      </div>

      {/* Q2 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-900">
          Q2: Provide feedback for the management Team (GMD, TA, PM, HR)
          <span className="block text-xs text-gray-600 mt-1">
            Note: Structure your feedback based on the following: What we do
            well, and What needs improved
          </span>
        </label>

        <div className="space-y-3 pl-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              1. GMD
            </label>
            <textarea
              value={formData.q2_gmd}
              onChange={(e) => handleChange("q2_gmd", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Feedback for GMD"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              2. TA
            </label>
            <textarea
              value={formData.q2_ta}
              onChange={(e) => handleChange("q2_ta", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Feedback for TA"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              3. PM
            </label>
            <textarea
              value={formData.q2_pm}
              onChange={(e) => handleChange("q2_pm", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Feedback for PM"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              4. HR
            </label>
            <textarea
              value={formData.q2_hr}
              onChange={(e) => handleChange("q2_hr", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Feedback for HR"
              required
            />
          </div>
        </div>
      </div>

      {/* Q3 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-900">
          Q3: Provide feedback for 3 of your colleagues
          <span className="block text-xs text-gray-600 mt-1">
            Note: Structure your feedback based on the following: What they do
            well, and What needs improved
          </span>
        </label>

        <div className="space-y-4 pl-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="border border-gray-200 rounded-lg p-4 space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700">
                {num}. Colleague Name
              </label>
              <input
                type="text"
                value={formData[`q3_colleague${num}_name`]}
                onChange={(e) =>
                  handleChange(`q3_colleague${num}_name`, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Name"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mt-2">
                Feedback
              </label>
              <textarea
                value={formData[`q3_colleague${num}_feedback`]}
                onChange={(e) =>
                  handleChange(`q3_colleague${num}_feedback`, e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="What they do well and what needs improved"
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Q4 */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-900">
          Q4: Can you name 3 colleagues/staff, or Management member whom you
          feel in your opinion is the best in Cloudspace (in terms of support,
          contributions, efforts, etc…) this year 2025
          <span className="block text-xs text-gray-600 mt-1">
            Please list in order of rating
          </span>
        </label>

        <div className="space-y-4 pl-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="border border-gray-200 rounded-lg p-4 space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700">
                {num}. Name
              </label>
              <input
                type="text"
                value={formData[`q4_best${num}_name`]}
                onChange={(e) =>
                  handleChange(`q4_best${num}_name`, e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Name"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mt-2">
                Why selected
              </label>
              <textarea
                value={formData[`q4_best${num}_why`]}
                onChange={(e) =>
                  handleChange(`q4_best${num}_why`, e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Reason for selection"
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Q5 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Q5: Anything else you'd like Cloudspace Management to know?
          <span className="block text-xs text-gray-600 mt-1">
            Key points and brief please
          </span>
        </label>
        <textarea
          value={formData.q5}
          onChange={(e) => handleChange("q5", e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Additional comments..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Anonymous Review"}
        </button>
      </div>
    </form>
  );
};

// Performance Appraisal Form Component
const PerformanceAppraisalForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    staffName: "",
    jobTitle: "",
    currentManager: "",
    dateOfReview: "",
    q1: 3,
    q2a: 3,
    q2b: "",
    q2c: "",
    q2d: "",
    q2e: "",
    q3a: 3,
    q3b: "",
    q3c: "",
    q3d: "",
    q4a: 3,
    q4b: "",
    q4c: "",
    q5a: 3,
    q5b: "",
    q6: "",
    q7: "",
    managerNames: "",
    q8a: 3,
    q8b: "",
    q9a: 3,
    q9b: "",
    q10: "",
    q11: "",
    q12: "",
    q12_other: "",
    q13: "",
    q14: 3,
    q15: 3,
    q16a: 3,
    q16b: "",
    q17: "",
    q18: 3,
    q19a: "",
    q19b: "",
    q20: 3,
    q21: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitPerformanceAppraisal(formData);
      alert("Performance appraisal submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting performance appraisal:", error);
      alert("Failed to submit appraisal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const LinearScale = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="text-center text-sm font-medium text-gray-700">
        Selected: {value}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Staff Annual Performance Appraisals/Review
        </h3>
        <p className="text-sm text-green-800">
          This review will help assess your performance and identify areas for
          growth and development.
        </p>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Staff Name
          </label>
          <input
            type="text"
            value={formData.staffName}
            onChange={(e) => handleChange("staffName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Manager
          </label>
          <input
            type="text"
            value={formData.currentManager}
            onChange={(e) => handleChange("currentManager", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Review
          </label>
          <input
            type="date"
            value={formData.dateOfReview}
            onChange={(e) => handleChange("dateOfReview", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Performance Appraisal"}
        </button>
      </div>
    </form>
  );
};

const SelfServiceDashboard = () => {
  const [showAnonymousModal, setShowAnonymousModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // For now, use mock data to ensure dashboard works
      // In production, this would call the real API
      const mockData = {
        stats: {
          pendingLeaves: 0,
          approvedLeaves: 0,
          pendingExpenses: 0,
          approvedExpenses: 0,
          totalHours: 0,
          pendingTasks: 0,
          unreadNotifications: 0,
        },
      };

      setDashboardData(mockData);

      // Try real API but don't fail if it doesn't work
      try {
        const response = await selfServiceService.getSelfServiceDashboard();
        const data = selectApiData(response);
        if (data && data.stats) {
          setDashboardData(data);
        }
      } catch (apiError) {
        console.log("API not available, using mock data:", apiError.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "My Profile",
      description: "Update personal information",
      icon: User,
      path: "/self-service/profile",
      color: "blue",
    },
    {
      title: "Leave Request",
      description: "Apply for time off",
      icon: Calendar,
      path: "/self-service/leave-requests",
      color: "green",
    },
    {
      title: "Expense Claim",
      description: "Submit reimbursement requests",
      icon: CreditCard,
      path: "/self-service/expense-claims",
      color: "purple",
    },
    {
      title: "Timesheet",
      description: "Log working hours",
      icon: Clock,
      path: "/self-service/time-tracking",
      color: "yellow",
    },
    {
      title: "Payslips",
      description: "View and download payslips",
      icon: FileText,
      path: "/self-service/payslips",
      color: "indigo",
    },
    {
      title: "Training",
      description: "Enroll in courses",
      icon: BookOpen,
      path: "/self-service/training",
      color: "pink",
    },
    {
      title: "My Tasks",
      description: "View assigned tasks",
      icon: CheckSquare,
      path: "/self-service/tasks",
      color: "teal",
    },
    {
      title: "Notifications",
      description: "View alerts and messages",
      icon: Bell,
      path: "/self-service/notifications",
      color: "orange",
    },
    {
      title: "Documents",
      description: "Upload and manage documents",
      icon: Folder,
      path: "/self-service/documents",
      color: "gray",
    },
    {
      title: "Anonymous Review",
      description: "360-degree peer feedback",
      icon: MessageSquare,
      onClick: () => setShowAnonymousModal(true),
      color: "blue",
    },
    {
      title: "Performance Appraisal",
      description: "Annual self-assessment",
      icon: ClipboardList,
      onClick: () => setShowPerformanceModal(true),
      color: "green",
    },
  ];

  const features = [
    "Profile management",
    "Leave requests",
    "Expense claims",
    "Payslip access",
    "Time tracking",
    "Training enrollment",
    "Task management",
    "Notifications",
    "Document management",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Self Service Portal
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.first_name || "User"}!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {dashboardData?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Leave Balance
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {dashboardData.stats.approvedLeaves || 0} days
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Expenses
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {dashboardData.stats.pendingExpenses || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hours This Month
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {dashboardData.stats.totalHours || 0}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Notifications
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {dashboardData.stats.unreadNotifications || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          const content = (
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer block">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 bg-${action.color}-100 p-3 rounded-md`}
                >
                  <IconComponent
                    className={`h-6 w-6 text-${action.color}-600`}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </div>
          );

          if (action.onClick) {
            return (
              <div key={index} role="button" onClick={action.onClick}>
                {content}
              </div>
            );
          }

          return (
            <Link key={index} to={action.path}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements Widget */}
        <AnnouncementsWidget />

        {/* Upcoming Events Widget */}
        <UpcomingEvents limit={5} />
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Available Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 7.293a1 1 0 00-1.414 0L10 12.414l2.293 2.293a1 1 0 001.414 1.414l-4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAnonymousModal}
        onClose={() => setShowAnonymousModal(false)}
        title="Anonymous Review - Peer Feedback"
        size="max-w-5xl"
      >
        <AnonymousReviewForm onClose={() => setShowAnonymousModal(false)} />
      </Modal>

      <Modal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        title="Staff Annual Performance Appraisal"
        size="max-w-5xl"
      >
        <PerformanceAppraisalForm
          onClose={() => setShowPerformanceModal(false)}
        />
      </Modal>
    </div>
  );
};

export default SelfServiceDashboard;
