import React, { useState, useEffect } from 'react';
import { X, Save, Package as PackageIcon } from 'lucide-react';
import { API_URL } from '@/services/api';

const EditCompanyModal = ({ company, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: company.name || '',
    legal_name: company.legal_name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    address_line1: company.address_line1 || '',
    city: company.city || '',
    state: company.state || '',
    postal_code: company.postal_code || '',
    country: company.country || '',
    subscription_plan: company.subscription_plan || 'trial',
    subscription_status: company.subscription_status || 'active',
    max_users: company.max_users || 10,
    max_storage_gb: company.max_storage_gb || 10
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch available packages on component mount
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/subscription-packages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Fetched packages:', data);
        setPackages(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch packages:', response.status);
        // Fallback to default packages if API fails
        setPackages([
          { id: 'trial', name: 'Trial', slug: 'trial', max_users: 5, max_storage_gb: 5 },
          { id: 'bronze', name: 'Bronze', slug: 'bronze', max_users: 10, max_storage_gb: 10 },
          { id: 'silver', name: 'Silver', slug: 'silver', max_users: 25, max_storage_gb: 25 },
          { id: 'gold', name: 'Gold', slug: 'gold', max_users: 50, max_storage_gb: 50 },
          { id: 'platinum', name: 'Platinum', slug: 'platinum', max_users: 100, max_storage_gb: 100 },
        ]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      // Fallback to default packages
      setPackages([
        { id: 'trial', name: 'Trial', slug: 'trial', max_users: 5, max_storage_gb: 5 },
        { id: 'bronze', name: 'Bronze', slug: 'bronze', max_users: 10, max_storage_gb: 10 },
        { id: 'silver', name: 'Silver', slug: 'silver', max_users: 25, max_storage_gb: 25 },
        { id: 'gold', name: 'Gold', slug: 'gold', max_users: 50, max_storage_gb: 50 },
        { id: 'platinum', name: 'Platinum', slug: 'platinum', max_users: 100, max_storage_gb: 100 },
      ]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageChange = (e) => {
    const packageSlug = e.target.value;
    const selectedPackage = packages.find(p => p.slug === packageSlug || p.id === packageSlug);
    
    console.log('📦 Package changed to:', packageSlug);
    console.log('📦 Selected package:', selectedPackage);
    
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        subscription_plan: packageSlug,
        max_users: selectedPackage.max_users || prev.max_users,
        max_storage_gb: selectedPackage.max_storage_gb || prev.max_storage_gb
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subscription_plan: packageSlug
      }));
    }
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
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Company updated successfully!');
        onSuccess();
      } else {
        setError(data.message || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      setError('An error occurred while updating the company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Company</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    name="legal_name"
                    value={formData.legal_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <PackageIcon className="h-4 w-4" />
                    Subscription Package
                  </label>
                  {loadingPackages ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Loading packages...
                    </div>
                  ) : (
                    <select
                      name="subscription_plan"
                      value={formData.subscription_plan}
                      onChange={handlePackageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {packages.length === 0 ? (
                        <option value="trial">Trial (Default)</option>
                      ) : (
                        packages.map((pkg) => (
                          <option key={pkg.id || pkg.slug} value={pkg.slug || pkg.id}>
                            {pkg.name} - {pkg.max_users} users, {pkg.max_storage_gb}GB storage
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {packages.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {packages.length} package{packages.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="subscription_status"
                    value={formData.subscription_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyModal;
