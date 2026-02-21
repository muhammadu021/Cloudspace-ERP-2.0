import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button,
  Input,
  Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Badge,
  Tabs, TabsContent, TabsList, TabsTrigger
} from '../../components/ui';
import { Plus, Edit, Trash2, Users, MapPin, Layers, CheckSquare, Square, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const OfficeDesk = () => {
  const [desks, setDesks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDesk, setEditingDesk] = useState(null);
  const [selectedDesks, setSelectedDesks] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    location: '',
    floor: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    desk_type: 'hot_desk',
    status: 'available',
    location: '',
    floor: '',
    capacity: 1,
    equipment: []
  });

  useEffect(() => {
    fetchDesks();
    fetchEmployees();
  }, [filters]);

  const fetchDesks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.location) params.append('location', filters.location);
      if (filters.floor) params.append('floor', filters.floor);

      const response = await api.get(`/office-desk?${params}`);
      if (response.data.success) {
        setDesks(response.data.data.desks);
      } else {
        toast.error(response.data.message || 'Failed to fetch office desks');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch office desks';
      toast.error(errorMessage);
      console.error('Error fetching desks:', error);

      // Set empty desks on error to prevent infinite loading
      setDesks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data.employees);
      } else {
        toast.error(response.data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employees';
      toast.error(errorMessage);
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (editingDesk) {
        const response = await api.put(`/office-desk/${editingDesk.id}`, payload);
        if (response.data.success) {
          toast.success('Office desk updated successfully');
          setEditingDesk(null);
        } else {
          toast.error(response.data.message || 'Failed to update office desk');
          return;
        }
      } else {
        const response = await api.post('/office-desk', payload);
        if (response.data.success) {
          toast.success('Office desk created successfully');
          setShowCreateForm(false);
        } else {
          toast.error(response.data.message || 'Failed to create office desk');
          return;
        }
      }

      resetForm();
      fetchDesks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save office desk';
      toast.error(errorMessage);
      console.error('Error saving desk:', error);
    }
  };

  const handleDelete = async (deskId) => {
    const action = confirm(
      'Choose delete option:\n\n' +
      'OK = Deactivate (mark as out of order)\n' +
      'Cancel = Permanently delete\n\n' +
      'Tip: Deactivated desks can be reactivated later.'
    );

    const hardDelete = !action; // Cancel means hard delete

    const confirmMessage = hardDelete
      ? 'Are you sure you want to PERMANENTLY delete this desk? This action cannot be undone.'
      : 'Are you sure you want to deactivate this desk? It will be marked as out of order.';

    if (!confirm(confirmMessage)) return;

    try {
      const response = await api.delete(`/office-desk/${deskId}`, {
        data: { hardDelete }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDesks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete office desk');
    }
  };

  const handleAssign = async (deskId, employeeId) => {
    try {
      const response = await api.post(`/office-desk/${deskId}/assign`, { employeeId });
      if (response.data.success) {
        toast.success('Employee assigned to desk successfully');
        fetchDesks();
      } else {
        toast.error(response.data.message || 'Failed to assign employee');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign employee';
      toast.error(errorMessage);
      console.error('Error assigning employee:', error);
    }
  };

  const handleUnassign = async (deskId) => {
    try {
      const response = await api.delete(`/office-desk/${deskId}/assign`);
      if (response.data.success) {
        toast.success('Employee unassigned from desk successfully');
        fetchDesks();
      } else {
        toast.error(response.data.message || 'Failed to unassign employee');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to unassign employee';
      toast.error(errorMessage);
      console.error('Error unassigning employee:', error);
    }
  };

  // Bulk operations
  const handleSelectDesk = (deskId) => {
    const newSelected = new Set(selectedDesks);
    if (newSelected.has(deskId)) {
      newSelected.delete(deskId);
    } else {
      newSelected.add(deskId);
    }
    setSelectedDesks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedDesks.size === desks.length) {
      setSelectedDesks(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedDesks(new Set(desks.map(desk => desk.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedDesks.size === 0) return;

    if (!confirm(`Change status of ${selectedDesks.size} desk(s) to ${newStatus.replace('_', ' ')}?`)) return;

    try {
      const promises = Array.from(selectedDesks).map(deskId =>
        api.put(`/office-desk/${deskId}`, { status: newStatus })
      );

      await Promise.all(promises);
      toast.success(`Updated ${selectedDesks.size} desk(s) successfully`);
      setSelectedDesks(new Set());
      setShowBulkActions(false);
      fetchDesks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update desks';
      toast.error(errorMessage);
      console.error('Error in bulk status update:', error);
    }
  };

  const handleBulkUnassign = async () => {
    if (selectedDesks.size === 0) return;

    if (!confirm(`Unassign employees from ${selectedDesks.size} desk(s)?`)) return;

    try {
      const promises = Array.from(selectedDesks).map(deskId =>
        api.delete(`/office-desk/${deskId}/assign`)
      );

      await Promise.all(promises);
      toast.success(`Unassigned employees from ${selectedDesks.size} desk(s) successfully`);
      setSelectedDesks(new Set());
      setShowBulkActions(false);
      fetchDesks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to unassign employees';
      toast.error(errorMessage);
      console.error('Error in bulk unassign:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      desk_type: 'hot_desk',
      status: 'available',
      location: '',
      floor: '',
      capacity: 1,
      equipment: []
    });
  };

  const startEdit = (desk) => {
    setEditingDesk(desk);
    setFormData({
      title: desk.title,
      description: desk.description,
      desk_type: desk.desk_type,
      status: desk.status,
      location: desk.location,
      floor: desk.floor,
      capacity: desk.capacity,
      equipment: desk.equipment || []
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      out_of_order: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDeskTypeColor = (type) => {
    const colors = {
      hot_desk: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      shared: 'bg-orange-100 text-orange-800',
      meeting_room: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Office Desk Management</h1>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Desk
        </Button>
      </div>

      <Tabs defaultValue="desks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="desks">All Desks</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="desks">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out_of_order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Filter by location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Floor</Label>
                  <Input
                    placeholder="Filter by floor"
                    value={filters.floor}
                    onChange={(e) => setFilters(prev => ({ ...prev, floor: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <Card className="mb-6 border-primary-200 bg-primary-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedDesks.size} desk(s) selected
                    </span>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedDesks(new Set());
                      setShowBulkActions(false);
                    }}>
                      <X className="w-4 h-4 mr-1" />
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select onValueChange={handleBulkStatusChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_order">Out of Order</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleBulkUnassign}>
                      <Users className="w-4 h-4 mr-1" />
                      Unassign All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desks Grid with Selection */}
          <div className="mb-4">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedDesks.size === desks.length ? (
                <Square className="w-4 h-4 mr-2" />
              ) : (
                <CheckSquare className="w-4 h-4 mr-2" />
              )}
              {selectedDesks.size === desks.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {desks.map((desk) => (
              <Card key={desk.id} className={`relative ${selectedDesks.has(desk.id) ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectDesk(desk.id)}
                        className="p-1"
                      >
                        {selectedDesks.has(desk.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                      <CardTitle className="text-lg">{desk.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(desk)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(desk.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getStatusColor(desk.status)}>
                      {desk.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getDeskTypeColor(desk.desk_type)}>
                      {desk.desk_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{desk.description}</p>

                  <div className="space-y-2 text-sm">
                    {desk.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{desk.location}</span>
                      </div>
                    )}
                    {desk.floor && (
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span>Floor {desk.floor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {desk.capacity}</span>
                    </div>
                    {desk.assignedEmployee && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          {desk.assignedEmployee.first_name?.[0]}{desk.assignedEmployee.last_name?.[0]}
                        </div>
                        <span>{desk.assignedEmployee.first_name} {desk.assignedEmployee.last_name}</span>
                      </div>
                    )}
                  </div>

                  {desk.status === 'available' && (
                    <div className="mt-4">
                      <Select onValueChange={(employeeId) => handleAssign(desk.id, employeeId)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              {employee.first_name} {employee.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {desk.assignedEmployee && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnassign(desk.id)}
                        className="w-full"
                      >
                        Unassign Employee
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <OfficeDeskAvailability />
        </TabsContent>

        <TabsContent value="analytics">
          <OfficeDeskAnalytics desks={desks} />
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Office Desk</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="desk_type">Desk Type</Label>
                    <Select value={formData.desk_type} onValueChange={(value) => setFormData(prev => ({ ...prev, desk_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot_desk">Hot Desk</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="meeting_room">Meeting Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_order">Out of Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingDesk ? 'Update Desk' : 'Create Desk'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setEditingDesk(null);
                    setShowCreateForm(false);
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OfficeDeskAvailability = () => {
  const [availableDesks, setAvailableDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    floor: '',
    location: ''
  });

  useEffect(() => {
    fetchAvailability();
  }, [filters]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.floor) params.append('floor', filters.floor);
      if (filters.location) params.append('location', filters.location);

      const response = await api.get(`/office-desk/availability?${params}`);
      if (response.data.success) {
        setAvailableDesks(response.data.data.availableDesks);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading availability...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Desks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Floor</Label>
            <Input
              placeholder="Filter by floor"
              value={filters.floor}
              onChange={(e) => setFilters(prev => ({ ...prev, floor: e.target.value }))}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              placeholder="Filter by location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableDesks.map((desk) => (
            <Card key={desk.id} className="p-4">
              <h3 className="font-semibold">{desk.title}</h3>
              <p className="text-sm text-gray-600">{desk.location}</p>
              <p className="text-sm">Floor: {desk.floor}</p>
              <p className="text-sm">Capacity: {desk.capacity}</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const OfficeDeskAnalytics = ({ desks }) => {
  const [analytics, setAnalytics] = useState({
    totalDesks: 0,
    availableDesks: 0,
    occupiedDesks: 0,
    maintenanceDesks: 0,
    outOfOrderDesks: 0,
    deskTypes: {},
    floorDistribution: {},
    utilizationRate: 0
  });

  useEffect(() => {
    if (desks.length > 0) {
      const totalDesks = desks.length;
      const availableDesks = desks.filter(d => d.status === 'available').length;
      const occupiedDesks = desks.filter(d => d.status === 'occupied').length;
      const maintenanceDesks = desks.filter(d => d.status === 'maintenance').length;
      const outOfOrderDesks = desks.filter(d => d.status === 'out_of_order').length;

      // Desk types distribution
      const deskTypes = desks.reduce((acc, desk) => {
        const type = desk.desk_type.replace('_', ' ');
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Floor distribution
      const floorDistribution = desks.reduce((acc, desk) => {
        const floor = desk.floor || 'Unspecified';
        acc[floor] = (acc[floor] || 0) + 1;
        return acc;
      }, {});

      // Utilization rate
      const utilizationRate = totalDesks > 0 ? ((occupiedDesks / totalDesks) * 100).toFixed(1) : 0;

      setAnalytics({
        totalDesks,
        availableDesks,
        occupiedDesks,
        maintenanceDesks,
        outOfOrderDesks,
        deskTypes,
        floorDistribution,
        utilizationRate
      });
    }
  }, [desks]);

  const getStatusColor = (status) => {
    const colors = {
      available: 'text-green-600',
      occupied: 'text-red-600',
      maintenance: 'text-yellow-600',
      out_of_order: 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Desks</p>
                <p className="text-2xl font-bold">{analytics.totalDesks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{analytics.availableDesks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-red-600">{analytics.occupiedDesks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold text-primary">{analytics.utilizationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Available</span>
                <span className={`text-sm font-bold ${getStatusColor('available')}`}>
                  {analytics.availableDesks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Occupied</span>
                <span className={`text-sm font-bold ${getStatusColor('occupied')}`}>
                  {analytics.occupiedDesks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maintenance</span>
                <span className={`text-sm font-bold ${getStatusColor('maintenance')}`}>
                  {analytics.maintenanceDesks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Out of Order</span>
                <span className={`text-sm font-bold ${getStatusColor('out_of_order')}`}>
                  {analytics.outOfOrderDesks}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desk Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Desk Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.deskTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Floor Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Floor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.floorDistribution).map(([floor, count]) => (
                <div key={floor} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{floor}</span>
                  <span className="text-sm font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maintenance</span>
                <span className={`text-sm font-bold ${getStatusColor('maintenance')}`}>
                  {analytics.maintenanceDesks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Out of Order</span>
                <span className={`text-sm font-bold ${getStatusColor('out_of_order')}`}>
                  {analytics.outOfOrderDesks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Capacity</span>
                <span className="text-sm font-bold">
                  {desks.reduce((sum, desk) => sum + (desk.capacity || 1), 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfficeDesk;