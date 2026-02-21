import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './CreateCompany.css';

const CreateCompany = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Company Information
  const [companyData, setCompanyData] = useState({
    name: '',
    code: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    company_size: 'small',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    timezone: 'UTC',
    currency: 'USD',
    fiscal_year_start: '01-01'
  });

  // Admin User Information
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });

  // User Types
  const [userTypes, setUserTypes] = useState([
    {
      id: Date.now(),
      name: 'admin',
      display_name: 'Administrator',
      description: 'Full system access',
      color: '#dc2626',
      sidebar_modules: ['dashboard', 'users', 'employees', 'departments', 'projects', 'tasks', 'inventory', 'hr', 'finance', 'admin', 'reports'],
      is_default: true
    }
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [editingUserType, setEditingUserType] = useState(null);

  // Available modules for user types
  const availableModules = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'employees', name: 'Employees', icon: '👤' },
    { id: 'departments', name: 'Departments', icon: '🏢' },
    { id: 'projects', name: 'Projects', icon: '📁' },
    { id: 'tasks', name: 'Tasks', icon: '✓' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'hr', name: 'HR', icon: '👔' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'admin', name: 'Admin', icon: '⚙️' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'collaboration', name: 'Collaboration', icon: '💬' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'attendance', name: 'Attendance', icon: '🕐' },
    { id: 'leave', name: 'Leave', icon: '🏖️' },
    { id: 'payroll', name: 'Payroll', icon: '💵' }
  ];

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Construction', 'Real Estate', 'Transportation', 'Other'
  ];

  const companySizeOptions = [
    { value: 'small', label: '1-50 employees' },
    { value: 'medium', label: '51-200 employees' },
    { value: 'large', label: '201-1000 employees' },
    { value: 'enterprise', label: '1000+ employees' }
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
    'Asia/Shanghai', 'Australia/Sydney'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' }
  ];

  const userTypeColors = [
    '#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669',
    '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#e11d48'
  ];

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUserType = () => {
    setEditingUserType({
      id: Date.now(),
      name: '',
      display_name: '',
      description: '',
      color: userTypeColors[userTypes.length % userTypeColors.length],
      sidebar_modules: [],
      is_default: false
    });
    setShowUserTypeModal(true);
  };

  const handleEditUserType = (userType) => {
    setEditingUserType({ ...userType });
    setShowUserTypeModal(true);
  };

  const handleSaveUserType = () => {
    if (!editingUserType.name || !editingUserType.display_name) {
      alert('Please fill in required fields');
      return;
    }

    const existingIndex = userTypes.findIndex(ut => ut.id === editingUserType.id);

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...userTypes];
      updated[existingIndex] = editingUserType;
      setUserTypes(updated);
    } else {
      // Add new
      setUserTypes([...userTypes, editingUserType]);
    }

    setShowUserTypeModal(false);
    setEditingUserType(null);
  };

  const handleDeleteUserType = (id) => {
    if (userTypes.find(ut => ut.id === id)?.is_default) {
      alert('Cannot delete default user type');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user type?')) {
      setUserTypes(userTypes.filter(ut => ut.id !== id));
    }
  };

  const toggleModule = (moduleId) => {
    setEditingUserType(prev => ({
      ...prev,
      sidebar_modules: prev.sidebar_modules.includes(moduleId)
        ? prev.sidebar_modules.filter(m => m !== moduleId)
        : [...prev.sidebar_modules, moduleId]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!companyData.name || !companyData.code) {
          setError('Company name and code are required');
          return false;
        }
        break;
      case 2:
        if (!adminData.username || !adminData.email || !adminData.password) {
          setError('All admin fields are required');
          return false;
        }
        if (adminData.password !== adminData.confirm_password) {
          setError('Passwords do not match');
          return false;
        }
        if (adminData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 3:
        if (userTypes.length === 0) {
          setError('At least one user type is required');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      // Register company and admin user
      const response = await api.post(
        '/auth/register',
        {
          // Company data
          company_name: companyData.name,
          company_code: companyData.code,
          company_details: {
            legal_name: companyData.legal_name,
            email: companyData.email,
            phone: companyData.phone,
            website: companyData.website,
            industry: companyData.industry,
            company_size: companyData.company_size,
            address_line1: companyData.address_line1,
            address_line2: companyData.address_line2,
            city: companyData.city,
            state: companyData.state,
            postal_code: companyData.postal_code,
            country: companyData.country,
            timezone: companyData.timezone,
            currency: companyData.currency,
            fiscal_year_start: companyData.fiscal_year_start
          },
          // Admin user data
          username: adminData.username,
          email: adminData.email,
          password: adminData.password,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          phone: adminData.phone,
          // User types
          user_types: userTypes.map(ut => ({
            name: ut.name,
            display_name: ut.display_name,
            description: ut.description,
            color: ut.color,
            sidebar_modules: ut.sidebar_modules
          }))
        }
      );

      // Auto-login after successful registration
      await login({ email: adminData.email, password: adminData.password });

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Company Info</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">Admin User</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">User Types</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
        <div className="step-number">4</div>
        <div className="step-label">Review</div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <h2>Company Information</h2>

      <div className="form-grid">
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="name"
            value={companyData.name}
            onChange={handleCompanyChange}
            placeholder="Acme Corporation"
            required
          />
        </div>

        <div className="form-group">
          <label>Company Code *</label>
          <input
            type="text"
            name="code"
            value={companyData.code}
            onChange={handleCompanyChange}
            placeholder="ACME"
            maxLength="50"
            required
          />
          <small>Unique identifier (alphanumeric only)</small>
        </div>

        <div className="form-group">
          <label>Legal Name</label>
          <input
            type="text"
            name="legal_name"
            value={companyData.legal_name}
            onChange={handleCompanyChange}
            placeholder="Acme Corporation Inc."
          />
        </div>

        <div className="form-group">
          <label>Industry</label>
          <select
            name="industry"
            value={companyData.industry}
            onChange={handleCompanyChange}
          >
            <option value="">Select Industry</option>
            {industryOptions.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Company Size</label>
          <select
            name="company_size"
            value={companyData.company_size}
            onChange={handleCompanyChange}
          >
            {companySizeOptions.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={companyData.email}
            onChange={handleCompanyChange}
            placeholder="info@acme.com"
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={companyData.phone}
            onChange={handleCompanyChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            name="website"
            value={companyData.website}
            onChange={handleCompanyChange}
            placeholder="https://acme.com"
          />
        </div>

        <div className="form-group full-width">
          <label>Address Line 1</label>
          <input
            type="text"
            name="address_line1"
            value={companyData.address_line1}
            onChange={handleCompanyChange}
            placeholder="123 Main Street"
          />
        </div>

        <div className="form-group full-width">
          <label>Address Line 2</label>
          <input
            type="text"
            name="address_line2"
            value={companyData.address_line2}
            onChange={handleCompanyChange}
            placeholder="Suite 100"
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={companyData.city}
            onChange={handleCompanyChange}
            placeholder="New York"
          />
        </div>

        <div className="form-group">
          <label>State/Province</label>
          <input
            type="text"
            name="state"
            value={companyData.state}
            onChange={handleCompanyChange}
            placeholder="NY"
          />
        </div>

        <div className="form-group">
          <label>Postal Code</label>
          <input
            type="text"
            name="postal_code"
            value={companyData.postal_code}
            onChange={handleCompanyChange}
            placeholder="10001"
          />
        </div>

        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={companyData.country}
            onChange={handleCompanyChange}
            placeholder="United States"
          />
        </div>

        <div className="form-group">
          <label>Timezone</label>
          <select
            name="timezone"
            value={companyData.timezone}
            onChange={handleCompanyChange}
          >
            {timezones.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Currency</label>
          <select
            name="currency"
            value={companyData.currency}
            onChange={handleCompanyChange}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fiscal Year Start</label>
          <input
            type="text"
            name="fiscal_year_start"
            value={companyData.fiscal_year_start}
            onChange={handleCompanyChange}
            placeholder="MM-DD"
            pattern="\d{2}-\d{2}"
          />
          <small>Format: MM-DD (e.g., 01-01)</small>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <h2>Administrator Account</h2>
      <p className="step-description">Create the main administrator account for your company</p>

      <div className="form-grid">
        <div className="form-group">
          <label>Username *</label>
          <input
            type="text"
            name="username"
            value={adminData.username}
            onChange={handleAdminChange}
            placeholder="admin"
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={adminData.email}
            onChange={handleAdminChange}
            placeholder="admin@acme.com"
            required
          />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            value={adminData.first_name}
            onChange={handleAdminChange}
            placeholder="John"
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            value={adminData.last_name}
            onChange={handleAdminChange}
            placeholder="Doe"
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={adminData.phone}
            onChange={handleAdminChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={adminData.password}
            onChange={handleAdminChange}
            placeholder="••••••••"
            minLength="6"
            required
          />
          <small>Minimum 6 characters</small>
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirm_password"
            value={adminData.confirm_password}
            onChange={handleAdminChange}
            placeholder="••••••••"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <h2>User Types</h2>
      <p className="step-description">Define user types and their access permissions</p>

      <button
        type="button"
        className="btn-add-user-type"
        onClick={handleAddUserType}
      >
        + Add User Type
      </button>

      <div className="user-types-list">
        {userTypes.map(userType => (
          <div key={userType.id} className="user-type-card">
            <div className="user-type-header">
              <div className="user-type-info">
                <div
                  className="user-type-color"
                  style={{ backgroundColor: userType.color }}
                ></div>
                <div>
                  <h3>{userType.display_name}</h3>
                  <p className="user-type-name">{userType.name}</p>
                </div>
              </div>
              <div className="user-type-actions">
                <button
                  type="button"
                  onClick={() => handleEditUserType(userType)}
                  className="btn-icon"
                  title="Edit"
                >
                  ✏️
                </button>
                {!userType.is_default && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUserType(userType.id)}
                    className="btn-icon btn-danger"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <p className="user-type-description">{userType.description}</p>
            <div className="user-type-modules">
              <strong>Modules ({userType.sidebar_modules.length}):</strong>
              <div className="module-tags">
                {userType.sidebar_modules.slice(0, 5).map(moduleId => {
                  const module = availableModules.find(m => m.id === moduleId);
                  return module ? (
                    <span key={moduleId} className="module-tag">
                      {module.icon} {module.name}
                    </span>
                  ) : null;
                })}
                {userType.sidebar_modules.length > 5 && (
                  <span className="module-tag">
                    +{userType.sidebar_modules.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <h2>Review & Confirm</h2>
      <p className="step-description">Please review your information before creating the company</p>

      <div className="review-section">
        <h3>Company Information</h3>
        <div className="review-grid">
          <div><strong>Name:</strong> {companyData.name}</div>
          <div><strong>Code:</strong> {companyData.code}</div>
          <div><strong>Industry:</strong> {companyData.industry || 'Not specified'}</div>
          <div><strong>Size:</strong> {companySizeOptions.find(s => s.value === companyData.company_size)?.label}</div>
          <div><strong>Email:</strong> {companyData.email || 'Not specified'}</div>
          <div><strong>Phone:</strong> {companyData.phone || 'Not specified'}</div>
          <div><strong>Currency:</strong> {companyData.currency}</div>
          <div><strong>Timezone:</strong> {companyData.timezone}</div>
        </div>
      </div>

      <div className="review-section">
        <h3>Administrator</h3>
        <div className="review-grid">
          <div><strong>Username:</strong> {adminData.username}</div>
          <div><strong>Email:</strong> {adminData.email}</div>
          <div><strong>Name:</strong> {adminData.first_name} {adminData.last_name}</div>
          <div><strong>Phone:</strong> {adminData.phone || 'Not specified'}</div>
        </div>
      </div>

      <div className="review-section">
        <h3>User Types ({userTypes.length})</h3>
        <div className="user-types-summary">
          {userTypes.map(ut => (
            <div key={ut.id} className="user-type-summary-card">
              <div
                className="user-type-color-small"
                style={{ backgroundColor: ut.color }}
              ></div>
              <div>
                <strong>{ut.display_name}</strong>
                <span className="module-count">
                  {ut.sidebar_modules.length} modules
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserTypeModal = () => {
    if (!showUserTypeModal || !editingUserType) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowUserTypeModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editingUserType.id && userTypes.find(ut => ut.id === editingUserType.id) ? 'Edit' : 'Add'} User Type</h2>
            <button
              className="modal-close"
              onClick={() => setShowUserTypeModal(false)}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>Name (Internal) *</label>
              <input
                type="text"
                value={editingUserType.name}
                onChange={(e) => setEditingUserType({
                  ...editingUserType,
                  name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                })}
                placeholder="manager"
                disabled={editingUserType.is_default}
              />
              <small>Lowercase, no spaces (e.g., manager, employee, supervisor)</small>
            </div>

            <div className="form-group">
              <label>Display Name *</label>
              <input
                type="text"
                value={editingUserType.display_name}
                onChange={(e) => setEditingUserType({
                  ...editingUserType,
                  display_name: e.target.value
                })}
                placeholder="Manager"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editingUserType.description}
                onChange={(e) => setEditingUserType({
                  ...editingUserType,
                  description: e.target.value
                })}
                placeholder="Describe the role and responsibilities"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {userTypeColors.map(color => (
                  <div
                    key={color}
                    className={`color-option ${editingUserType.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditingUserType({
                      ...editingUserType,
                      color
                    })}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Accessible Modules *</label>
              <div className="modules-grid">
                {availableModules.map(module => (
                  <div
                    key={module.id}
                    className={`module-checkbox ${editingUserType.sidebar_modules.includes(module.id) ? 'checked' : ''}`}
                    onClick={() => toggleModule(module.id)}
                  >
                    <span className="module-icon">{module.icon}</span>
                    <span className="module-name">{module.name}</span>
                    <span className="checkbox">
                      {editingUserType.sidebar_modules.includes(module.id) ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <small>Selected: {editingUserType.sidebar_modules.length} modules</small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowUserTypeModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveUserType}
            >
              Save User Type
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="create-company-page">
      <div className="create-company-container">
        <div className="create-company-header">
          <h1>Create Your Company</h1>
          <p>Set up your organization in Cloudspace ERP</p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="create-company-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating Company...' : 'Create Company'}
              </button>
            )}
          </div>
        </form>
      </div>

      {renderUserTypeModal()}
    </div>
  );
};

export default CreateCompany;
