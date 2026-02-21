import React from 'react'
import { AlertTriangle, RefreshCw, Home, Mail, HelpCircle } from 'lucide-react'
import { logError } from '../utils/errorLogger'

/**
 * Get user-friendly error message and resolution steps
 */
const getErrorGuidance = (error) => {
  const errorString = error?.toString() || '';
  
  // Network errors
  if (errorString.includes('NetworkError') || errorString.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      steps: [
        'Check your internet connection',
        'Verify the server is running',
        'Try refreshing the page',
        'Contact support if the problem persists'
      ]
    };
  }
  
  // Permission errors
  if (errorString.includes('403') || errorString.includes('Forbidden')) {
    return {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource.',
      steps: [
        'Verify you\'re logged in with the correct account',
        'Contact your administrator for access',
        'Return to the dashboard'
      ]
    };
  }
  
  // Not found errors
  if (errorString.includes('404') || errorString.includes('Not Found')) {
    return {
      title: 'Page Not Found',
      message: 'The page you\'re looking for doesn\'t exist or has been moved.',
      steps: [
        'Check the URL for typos',
        'Use the navigation menu to find what you need',
        'Return to the dashboard',
        'Contact support if you believe this is an error'
      ]
    };
  }
  
  // Authentication errors
  if (errorString.includes('401') || errorString.includes('Unauthorized')) {
    return {
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      steps: [
        'Log in with your credentials',
        'Check if your account is active',
        'Contact support if you can\'t log in'
      ]
    };
  }
  
  // Default error
  return {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. We\'re working to fix it.',
    steps: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Try again in a few minutes',
      'Contact support if the problem persists'
    ]
  };
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error for monitoring
    logError(error, errorInfo);
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleContactSupport = () => {
    // Open support ticket or email
    const subject = encodeURIComponent('Error Report: ' + this.state.error?.message);
    const body = encodeURIComponent(
      'I encountered an error:\n\n' +
      'Error: ' + this.state.error?.toString() + '\n\n' +
      'Please help me resolve this issue.'
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  }

  render() {
    if (this.state.hasError) {
      const guidance = getErrorGuidance(this.state.error);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              {guidance.title}
            </h1>
            
            {/* Error Message */}
            <p className="text-gray-600 mb-6 text-center">
              {guidance.message}
            </p>
            
            {/* Resolution Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <HelpCircle size={16} />
                How to resolve this:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                {guidance.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </button>
              
              <button
                onClick={this.handleContactSupport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </button>
            </div>
            
            {/* Development Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium">
                  Error Details (Development Only)
                </summary>
                <div className="mt-3 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-60">
                  <div className="font-semibold mb-2 text-red-600">Error:</div>
                  <div className="mb-4 text-red-800">{this.state.error.toString()}</div>
                  <div className="font-semibold mb-2 text-red-600">Component Stack:</div>
                  <div className="whitespace-pre-wrap text-gray-700">{this.state.errorInfo?.componentStack}</div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary