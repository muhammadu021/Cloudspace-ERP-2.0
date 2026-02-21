import React from 'react'
import { PieChart, BarChart3, TrendingUp, Download, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const ReportsAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate insights and reports on HR metrics and performance</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Employee Report</h3>
              <p className="text-sm text-gray-600">Headcount and demographics</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <button className="mt-4 w-full bg-primary-50 text-primary-700 py-2 px-4 rounded-lg hover:bg-blue-100">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Attendance Report</h3>
              <p className="text-sm text-gray-600">Time tracking and patterns</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <button className="mt-4 w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100">
            Generate Report
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Performance Report</h3>
              <p className="text-sm text-gray-600">Reviews and ratings</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <button className="mt-4 w-full bg-purple-50 text-purple-700 py-2 px-4 rounded-lg hover:bg-purple-100">
            Generate Report
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <PieChart className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <BarChart3 className="h-16 w-16 text-gray-400" />
          </div>
        </div>
      </div>

      {/* HR Analytics Platform */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">HR Analytics Platform</h3>
            <p className="text-gray-600">Advanced analytics and reporting capabilities</p>
          </div>
          <Link 
            to="/hr/analytics" 
            className="inline-flex items-center text-primary hover:text-blue-800 font-medium"
          >
            Access Platform
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary mb-2" />
            <h4 className="font-medium text-gray-900">Real-time Dashboards</h4>
            <p className="text-sm text-gray-600 mt-1">Monitor KPIs and metrics in real-time</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Predictive Analytics</h4>
            <p className="text-sm text-gray-600 mt-1">Forecast trends and identify risks</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Download className="h-6 w-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Custom Reports</h4>
            <p className="text-sm text-gray-600 mt-1">Build and export detailed reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalytics