import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  BookOpen,
  PieChart,
  LineChart
} from 'lucide-react';
import { Link, Routes, Route } from 'react-router-dom';
import HrAnalyticsDashboard from './components/analytics/HrAnalyticsDashboard';
import TurnoverAnalysis from './components/analytics/TurnoverAnalysis';
import RecruitmentMetrics from './components/analytics/RecruitmentMetrics';
import PerformanceTrends from './components/analytics/PerformanceTrends';
import CompensationBenchmarking from './components/analytics/CompensationBenchmarking';
import TrainingAnalytics from './components/analytics/TrainingAnalytics';

const HrAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const analyticsModules = [
    {
      id: 'dashboard',
      title: 'HR Dashboard',
      description: 'Real-time HR metrics and KPIs',
      icon: BarChart3,
      path: '/hr/analytics'
    },
    {
      id: 'turnover',
      title: 'Turnover Analysis',
      description: 'Employee departure patterns and trends',
      icon: TrendingUp,
      path: '/hr/analytics/turnover'
    },
    {
      id: 'recruitment',
      title: 'Recruitment Metrics',
      description: 'Recruitment performance and KPIs',
      icon: Users,
      path: '/hr/analytics/recruitment'
    },
    {
      id: 'performance',
      title: 'Performance Trends',
      description: 'Employee performance analysis',
      icon: LineChart,
      path: '/hr/analytics/performance'
    },
    {
      id: 'compensation',
      title: 'Compensation Benchmarking',
      description: 'Salary analysis and benchmarking',
      icon: DollarSign,
      path: '/hr/analytics/compensation'
    },
    {
      id: 'training',
      title: 'Training Analytics',
      description: 'Employee training progress and metrics',
      icon: BookOpen,
      path: '/hr/analytics/training'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Analytics Platform</h1>
        <p className="text-gray-600 mt-1">
          Advanced HR analytics and reporting system with real-time dashboards and predictive insights
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {analyticsModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={module.id}
                to={module.path}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === module.id
                    ? 'border-blue-500 text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(module.id)}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {module.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Routes for each analytics module */}
      <Routes>
        <Route index element={<HrAnalyticsDashboard />} />
        <Route path="turnover" element={<TurnoverAnalysis />} />
        <Route path="recruitment" element={<RecruitmentMetrics />} />
        <Route path="performance" element={<PerformanceTrends />} />
        <Route path="compensation" element={<CompensationBenchmarking />} />
        <Route path="training" element={<TrainingAnalytics />} />
      </Routes>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Real-time HR dashboards</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Employee turnover analysis</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Recruitment metrics and KPIs</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Performance trend analysis</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Compensation benchmarking</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Predictive analytics</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Custom report builder</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Data visualization tools</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Automated report scheduling</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Export to multiple formats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrAnalytics;