import React, { useState, useEffect } from 'react';
import { X, Building2, User, CreditCard, Settings as SettingsIcon, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { SIDEBAR_MODULES_ARRAY } from '@/config/sidebarConfig';
import { API_URL } from '@/services/api';

const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Trial',
    max_users: 5,
    max_storage_gb: 5,
    duration_days: 30,
    color: 'gray',
    description: '30-day trial with basic features',
    allowedModules: ['dashboard', 'my-desk', 'office-desk']
  },
  bronze: {
    name: 'Bronze',
    max_users: 10,
    max_storage_gb: 25,
    color: 'orange',
    description: 'Starter package for small teams',
    allowedModules: ['dashboard', 'my-desk', 'office-desk', 'collaboration-desk', 'hr-desk']
  },
  silver: {
    name: 'Silver',
    max_users: 25,
    max_storage_gb: 100,
    color: 'gray',
    description: 'Growing businesses with more features',
    allowedModules: [
      'dashboard', 'my-desk', 'office-desk', 'collaboration-desk',
      'hr-desk', 'finance-desk', 'project-desk', 'inventory-desk'
    ]
  },
  gold: {
    name: 'Gold',
    max_users: 100,
    max_storage_gb: 250,
    color: 'yellow',
    description: 'Advanced features for established companies',
    allowedModules: [
      'dashboard', 'my-desk', 'office-desk', 'collaboration-desk',
      'hr-desk', 'finance-desk', 'project-desk', 'inventory-desk',
      'purchase-desk', 'procurement-desk', 'payroll-desk', 'expense-desk'
    ]
  },
  platinum: {
    name: 'Platinum',
    max_users: 500,
    max_storage_gb: 1000,
    color: 'purple',
    description: 'Enterprise-grade with all features',
    allowedModules: 'all' // All modules available
  },
  custom: {
    name: 'Custom',
    max_users: 100,
    max_storage_gb: 200,
    color: 'blue',
    description: 'Customized package tailored to your needs',
    allowedModules: 'all'
  }
};

const CreateCompanyModal = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    // Company Info
    name: '',
    code: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    
    // Address
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // Subscription
    subscription_plan: 'trial',
    subscription_status: 'active',
    max_users: 10,
    max_storage_gb: 10,
    
    // Admin User
    create_admin: true,
    admin_username: '',
    admin_email: '',
    admin_password: '',
    admin_first_name: '',
    admin_last_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load packages from localStorage
  useEffect(() => {
    const savedPackages = localStorage.getItem('subscription_packages');
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    }
  }, []);

  // Convert packages array to object format for easy lookup
  const SUBSCRIPTION_PLANS = packages.reduce((acc, pkg) => {
    acc[pkg.id] = pkg;
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-generate company code when name changes
    if (name === 'name') {
      const generatedCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
        .split(' ')
        .map(word => word.substring(0, 3)) // Take first 3 letters of each word
        .join('')
        .substring(0, 6) + // Limit to 6 characters
        Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Add 3-digit random number
      
      setFormData(prev => ({
        ...prev,
        name: value,
        code: generatedCode
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePlanChange = (plan) => {
    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) return;
    
    setFormData(prev => ({
      ...prev,
      subscription_plan: plan,
      max_users: planConfig.max_users,
      max_storage_gb: planConfig.max_storage_gb
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare request body
      const requestBody = {
        name: formData.name,
        code: formData.code,
        legal_name: formData.legal_name,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address_line1: formData.address_line1,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        subscription_plan: formData.subscription_plan,
        subscription_status: formData.subscription_status,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: formData.subscription_plan === 'trial'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        max_users: parseInt(formData.max_users),
        max_storage_gb: parseInt(formData.max_storage_gb),
        settings: {
          modules: formData.modules
        }
      };

      // Add admin user if requested
      if (formData.create_admin) {
        requestBody.admin_user = {
          username: formData.admin_username,
          email: formData.admin_email,
          password: formData.admin_password,
          first_name: formData.admin_first_name,
          last_name: formData.admin_last_name
        };
      }

      const response = await fetch(`${API_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        alert('Company created successfully!');
        onSuccess();
      } else {
        setError(data.message || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      setError('An error occurred while creating the company');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Company Information
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Acme Corporation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Code * <span className="text-xs text-gray-500">(Auto-generated)</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
            placeholder="AUTO"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Generated from company name</p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Legal Name
          </label>
          <input
            type="text"
            name="legal_name"
            value={formData.legal_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Acme Corporation Ltd."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="contact@acme.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+1234567890"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://acme.com"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="123 Main Street"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="New York"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State/Province
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="NY"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="10001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="USA"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Subscription Plan
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const colorClasses = {
            gray: 'border-gray-400 bg-gray-50',
            orange: 'border-orange-400 bg-orange-50',
            yellow: 'border-yellow-400 bg-yellow-50',
            purple: 'border-purple-400 bg-purple-50',
            blue: 'border-blue-400 bg-primary-50'
          };
          
          const selectedColorClasses = {
            gray: 'border-gray-600 bg-gray-100',
            orange: 'border-orange-600 bg-orange-100',
            yellow: 'border-yellow-600 bg-yellow-100',
            purple: 'border-purple-600 bg-purple-100',
            blue: 'border-primary bg-blue-100'
          };
          
          return (
            <div
              key={key}
              onClick={() => handlePlanChange(key)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.subscription_plan === key
                  ? selectedColorClasses[plan.color] || 'border-primary bg-primary-50'
                  : colorClasses[plan.color] || 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                {formData.subscription_plan === key && (
                  <Check className="h-5 w-5 text-green-600" />
                )}
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {plan.description}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {plan.max_users} users • {plan.max_storage_gb} GB storage
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {plan.modules === 'all' 
                  ? 'All modules included'
                  : `${Array.isArray(plan.modules) ? plan.modules.length : 0} modules included`
                }
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Users
          </label>
          <input
            type="number"
            name="max_users"
            value={formData.max_users}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Storage (GB)
          </label>
          <input
            type="number"
            name="max_storage_gb"
            value={formData.max_storage_gb}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        Admin User (Optional)
      </h3>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          name="create_admin"
          checked={formData.create_admin}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Create admin user for this company
        </label>
      </div>

      {formData.create_admin && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="admin_username"
              value={formData.admin_username}
              onChange={handleChange}
              required={formData.create_admin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="admin_email"
              value={formData.admin_email}
              onChange={handleChange}
              required={formData.create_admin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin@company.com"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleChange}
              required={formData.create_admin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="admin_first_name"
              value={formData.admin_first_name}
              onChange={handleChange}
              required={formData.create_admin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="admin_last_name"
              value={formData.admin_last_name}
              onChange={handleChange}
              required={formData.create_admin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Doe"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Company</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Company Info</span>
            <span className="text-xs text-gray-600">Subscription</span>
            <span className="text-xs text-gray-600">Modules</span>
            <span className="text-xs text-gray-600">Admin User</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-250px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Company'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyModal;
