import React, { useState, useEffect } from 'react';
import { X, Save, Check, Settings } from 'lucide-react';
import { API_URL } from '@/services/api';

const AVAILABLE_FEATURES = [
  { id: 'hr_module', name: 'HR Module', description: 'Employee management, attendance, leave, payroll' },
  { id: 'finance_module', name: 'Finance Module', description: 'Accounting, transactions, budgets, reports' },
  { id: 'inventory_module', name: 'Inventory Module', description: 'Stock management, tracking, movements' },
  { id: 'projects_module', name: 'Projects Module', description: 'Project and task management, kanban boards' },
  { id: 'collaboration_module', name: 'Collaboration Module', description: 'Team messaging, file sharing, forums' },
  { id: 'advanced_reporting', name: 'Advanced Reporting', description: 'Custom reports, analytics, dashboards' },
  { id: 'api_access', name: 'API Access', description: 'REST API integration and webhooks' },
  { id: 'custom_branding', name: 'Custom Branding', description: 'White-label customization and theming' }
];

const ManageFeaturesModal = ({ company, onClose, onSuccess }) => {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load current features from company settings
    const currentFeatures = company.settings?.feature_flags || {};
    setFeatures(currentFeatures);
  }, [company]);

  const toggleFeature = (featureId) => {
    setFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: {
            ...company.settings,
            feature_flags: features
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Features updated successfully!');
        onSuccess();
      } else {
        setError(data.message || 'Failed to update features');
      }
    } catch (error) {
      console.error('Error updating features:', error);
      setError('An error occurred while updating features');
    } finally {
      setLoading(false);
    }
  };

  const enabledCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                Manage Features
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {company.name} • {company.code}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Current Plan: {company.subscription_plan}
                  </p>
                  <p className="text-xs text-primary-700 mt-1">
                    {enabledCount} of {AVAILABLE_FEATURES.length} features enabled
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-700">Max Users: {company.max_users}</p>
                  <p className="text-xs text-primary-700">Storage: {company.max_storage_gb} GB</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Available Features & Modules
              </h3>

              {AVAILABLE_FEATURES.map((feature) => {
                const isEnabled = features[feature.id] === true;
                
                return (
                  <div
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isEnabled
                        ? 'border-primary bg-primary-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          {isEnabled && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white rounded-full text-xs">
                              <Check className="h-3 w-3" />
                              Enabled
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      </div>
                      <div className="ml-4">
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            isEnabled ? 'bg-primary' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Enabled Features:</p>
                  <p className="font-medium text-gray-900">{enabledCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Disabled Features:</p>
                  <p className="font-medium text-gray-900">
                    {AVAILABLE_FEATURES.length - enabledCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Features'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageFeaturesModal;
