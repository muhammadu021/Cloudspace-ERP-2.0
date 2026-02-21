import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  X,
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader,
} from "lucide-react";
import api from "../../services/api";

const CompanySignupModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Company Info, 2: Admin Info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const password = watch("admin_user.password");

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      // Prepare registration data
      const registrationData = {
        company_name: data.name,
        company_code: data.name.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) || 'COMP' + Date.now(),
        company_details: {
          email: data.email,
          phone: data.phone,
          industry: data.industry,
          company_size: data.company_size,
          address_line1: data.address_line1,
          city: data.city,
          state: data.state,
          country: data.country,
        },
        username: data.admin_user.username,
        email: data.admin_user.email,
        password: data.admin_user.password,
        first_name: data.admin_user.first_name,
        last_name: data.admin_user.last_name,
        phone: data.admin_user.phone,
        user_types: []
      };

      // Register company using demo-enabled api
      const response = await api.post('/auth/register', registrationData);

      if (response.data.success) {
        // Auto-login after successful registration
        await login({ email: data.admin_user.email, password: data.admin_user.password });

        // Close modal and redirect to dashboard handled by Login.jsx or manual redirect
        handleClose();
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to register company. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setStep(1);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Register Your Company
              </h2>
              <p className="text-sm text-gray-600">
                {step === 1 && "Step 1: Company Information"}
                {step === 2 && "Step 2: Administrator Account"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800">
                    Registration Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("name", {
                          required: "Company name is required",
                        })}
                        type="text"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.name ? "border-red-300" : "border-gray-300"
                          }`}
                        placeholder="Enter company name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Company Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.email ? "border-red-300" : "border-gray-300"
                          }`}
                        placeholder="company@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("phone")}
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        {...register("industry")}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Construction">Construction</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      {...register("company_size")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="small">1-50 employees</option>
                      <option value="medium">51-200 employees</option>
                      <option value="large">201-1000 employees</option>
                      <option value="enterprise">1000+ employees</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        {...register("address_line1")}
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Street address"
                      />
                    </div>
                  </div>

                  {/* City, State, Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      {...register("city")}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      {...register("state")}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="State"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      {...register("country")}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Next: Admin Account
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admin Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("admin_user.username", {
                          required: "Username is required",
                        })}
                        type="text"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.username
                          ? "border-red-300"
                          : "border-gray-300"
                          }`}
                        placeholder="admin"
                      />
                    </div>
                    {errors.admin_user?.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.username.message}
                      </p>
                    )}
                  </div>

                  {/* Admin Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("admin_user.email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.email
                          ? "border-red-300"
                          : "border-gray-300"
                          }`}
                        placeholder="admin@example.com"
                      />
                    </div>
                    {errors.admin_user?.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.email.message}
                      </p>
                    )}
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register("admin_user.first_name", {
                        required: "First name is required",
                      })}
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.first_name
                        ? "border-red-300"
                        : "border-gray-300"
                        }`}
                      placeholder="John"
                    />
                    {errors.admin_user?.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register("admin_user.last_name", {
                        required: "Last name is required",
                      })}
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.last_name
                        ? "border-red-300"
                        : "border-gray-300"
                        }`}
                      placeholder="Doe"
                    />
                    {errors.admin_user?.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.last_name.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("admin_user.phone")}
                        type="tel"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("admin_user.password", {
                          required: "Password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.password
                          ? "border-red-300"
                          : "border-gray-300"
                          }`}
                        placeholder="Enter password"
                      />
                    </div>
                    {errors.admin_user?.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        {...register("admin_user.confirm_password", {
                          required: "Please confirm password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        type={showPassword ? "text" : "password"}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.admin_user?.confirm_password
                          ? "border-red-300"
                          : "border-gray-300"
                          }`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.admin_user?.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.admin_user.confirm_password.message}
                      </p>
                    )}
                  </div>

                  {/* Show Password Toggle */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Show passwords
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account & Login"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySignupModal;
