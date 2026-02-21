import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

const ProjectsErrorBoundary = ({ error, onRetry }) => {
  const isServerError = error?.message?.includes('500') || error?.response?.status === 500
  const isNetworkError = error?.message?.includes('Network Error') || !navigator.onLine

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mx-auto h-16 w-16 text-red-500 mb-4">
          <AlertTriangle className="h-16 w-16" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isServerError ? 'Server Error' : isNetworkError ? 'Connection Error' : 'Something went wrong'}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {isServerError 
            ? 'The server encountered an error while loading projects. This might be a temporary issue.'
            : isNetworkError 
            ? 'Unable to connect to the server. Please check your internet connection.'
            : 'An unexpected error occurred while loading the projects.'
          }
        </p>

        <div className="space-y-3">
          <Button
            onClick={onRetry}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

export default ProjectsErrorBoundary