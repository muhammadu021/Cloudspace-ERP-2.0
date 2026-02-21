import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Building, 
  Phone, 
  Mail, 
  User,
  AlertTriangle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'warehouse',
    address: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    capacity: '',
    capacity_unit: 'sqm'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/inventory/locations', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'warehouse',
      address: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      capacity: '',
      capacity_unit: 'sqm'
    });
    setEditingLocation(null);
    setFormError(null);
    setSuccess(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name,
      code: location.code,
      type: location.type,
      address: location.address || '',
      contact_person: location.contact_person || '',
      contact_phone: location.contact_phone || '',
      contact_email: location.contact_email || '',
      capacity: location.capacity || '',
      capacity_unit: location.capacity_unit || 'sqm'
    });
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setSuccess(null);

    try {
      const url = editingLocation 
        ? `/api/v1/inventory/locations/${editingLocation.id}`
        : '/api/v1/inventory/locations';
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save location');
      }

      setSuccess(editingLocation ? 'Location updated successfully!' : 'Location created successfully!');
      setShowForm(false);
      resetForm();
      fetchLocations();

    } catch (error) {
      console.error('Error saving location:', error);
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/inventory/locations/${location.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete location');
      }

      setSuccess('Location deleted successfully!');
      fetchLocations();

    } catch (error) {
      console.error('Error deleting location:', error);
      setError(error.message);
    }
  };

  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'warehouse':
        return <Building className="h-4 w-4 text-primary" />;
      case 'office':
        return <Building className="h-4 w-4 text-green-600" />;
      case 'store':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'factory':
        return <Building className="h-4 w-4 text-orange-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLocationTypeColor = (type) => {
    switch (type) {
      case 'warehouse':
        return 'bg-blue-100 text-blue-800';
      case 'office':
        return 'bg-green-100 text-green-800';
      case 'store':
        return 'bg-purple-100 text-purple-800';
      case 'factory':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading locations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Locations</h1>
          <p className="text-gray-600 mt-1">Manage your storage locations and warehouses</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No locations found</h3>
            <p className="text-gray-500 mb-4">Create your first storage location to get started</p>
            <button
              onClick={handleAddNew}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add Location
            </button>
          </div>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getLocationTypeIcon(location.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Code: {location.code}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(location.type)}`}>
                        {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="text-primary hover:text-blue-900 p-1 rounded"
                    title="Edit Location"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Delete Location"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {location.address && (
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{location.address}</span>
                </div>
              )}

              {location.contact_person && (
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{location.contact_person}</span>
                </div>
              )}

              {location.contact_phone && (
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{location.contact_phone}</span>
                </div>
              )}

              {location.contact_email && (
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{location.contact_email}</span>
                </div>
              )}

              {location.capacity && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Capacity: {parseFloat(location.capacity).toLocaleString()} {location.capacity_unit}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingLocation ? 'Edit Location' : 'Add New Location'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form Error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-800">{formError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter location name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter unique code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    >
                      <option value="warehouse">Warehouse</option>
                      <option value="office">Office</option>
                      <option value="store">Store</option>
                      <option value="factory">Factory</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter contact person"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    placeholder="Enter full address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Enter capacity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity Unit
                    </label>
                    <select
                      name="capacity_unit"
                      value={formData.capacity_unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    >
                      <option value="sqm">Square Meters</option>
                      <option value="sqft">Square Feet</option>
                      <option value="cbm">Cubic Meters</option>
                      <option value="cbft">Cubic Feet</option>
                      <option value="pallets">Pallets</option>
                      <option value="shelves">Shelves</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingLocation ? 'Update Location' : 'Create Location'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;