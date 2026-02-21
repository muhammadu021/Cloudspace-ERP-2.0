import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Shield,
  AlertCircle,
  CheckCircle,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader, PuffinSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import CompanySignupModal from "./CompanySignupModal";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [urlMessage, setUrlMessage] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasNavigated = useRef(false);

  const from = location.state?.from?.pathname || "/self-service";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    console.log('Login useEffect - isAuthenticated:', isAuthenticated, 'current path:', location.pathname);
    // If authenticated and still on login page, navigate away
    if (isAuthenticated && location.pathname === '/login') {
      console.log('User is authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, location.pathname]);

  // Check for message in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const message = searchParams.get("message");
    if (message) {
      setUrlMessage(decodeURIComponent(message));
      // Show as toast as well
      toast.error(decodeURIComponent(message), {
        duration: 5000,
      });
      // Clear the message from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.search]);

  const onSubmit = async (data) => {
    try {
      console.log('Login form submitted');
      const result = await login(data);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful!');
        // Don't navigate here - let the useEffect handle it when isAuthenticated updates
        // The useEffect will trigger when isAuthenticated becomes true
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (isLoading) {
    return <PageLoader text="Initializing Cloudspace ERP..." />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-700/90 z-10"></div> */}
        <img
          src="/loginSide.png"
          alt="Login Background"
          className="absolute inset-0 w-full h-full"
        />
        {/* <div className="relative z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to
              <br />
              Cloudspace ERP
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Your comprehensive enterprise resource planning solution for
              modern businesses.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-lg">Streamlined Operations</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-lg">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-lg">Secure & Reliable</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="border border-gray-100">
                <img
                  className="h-20 w-auto"
                  src="/logo.png"
                  alt="Cloudspace ERP"
                  onError={(e) => {
                    // Fallback if logo doesn't load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="h-16 w-16 bg-gradient-to-br from-primary to-cyan-600 rounded-xl hidden items-center justify-center"
                  style={{ display: "none" }}
                >
                  <span className="text-white font-bold text-2xl">P</span>
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-600">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Secure Login</span>
            </div>
          </div>

          {/* URL Message Display */}
          {urlMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{urlMessage}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 ${
                    errors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register("remember_me")}
                  id="remember-me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Sign Up Section */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">New to Cloudspace?</span>
              </div>
            </div>
            <button
              onClick={() => setShowSignupModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              <Building2 className="h-5 w-5" />
              Register Your Company
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Sign up for a free trial and get started in minutes
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Cloudspace ERP. All rights reserved.
            </p>
            <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-600 transition-colors">
                Support
              </a>
            </div>
          </div>

          {/* Company Signup Modal */}
          <CompanySignupModal
            isOpen={showSignupModal}
            onClose={() => setShowSignupModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
