import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email)
      setIsSubmitted(true)
      toast.success('Password reset instructions sent to your email')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email')
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <img
                className="h-16 w-auto"
                src="/logo.png"
                alt="Cloudspace ERP"
                onError={(e) => {
                  // Fallback if logo doesn't load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div 
                className="h-16 w-16 bg-gradient-to-br from-primary to-cyan-600 rounded-xl hidden items-center justify-center"
                style={{ display: 'none' }}
              >
                <span className="text-white font-bold text-2xl">P</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Didn't receive the email?</strong> Check your spam folder or try again in a few minutes.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center font-semibold text-primary hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            <img
              className="h-16 w-auto"
              src="/logo.png"
              alt="Cloudspace ERP"
              onError={(e) => {
                // Fallback if logo doesn't load
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
            <div 
              className="h-16 w-16 bg-gradient-to-br from-primary to-cyan-600 rounded-xl hidden items-center justify-center"
              style={{ display: 'none' }}
            >
              <span className="text-white font-bold text-2xl">P</span>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h2>
          <p className="text-gray-600 text-lg">
            No worries, we'll help you reset it
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          {/* Security Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Secure Reset</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400 focus:bg-white'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-primary to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending instructions...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
                    Send Reset Instructions
                  </div>
                )}
              </button>
            </div>
            
            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center font-semibold text-primary hover:text-primary transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Cloudspace. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword