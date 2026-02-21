import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Plus, Clock, Users, MapPin, Video, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import toast from 'react-hot-toast';

const SharedCalendar = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_date: '',
    end_date: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  useEffect(() => {
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === parseInt(eventId));
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [eventId, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await collaborationService.getCalendarEvents({
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      });
      setEvents(response.data?.data?.events || []);
    } catch (error) {
      console.error('Load events error:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: 'bg-primary-500',
      event: 'bg-green-500',
      deadline: 'bg-red-500',
      reminder: 'bg-yellow-500'
    };
    return colors[type] || colors.meeting;
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      meeting: Users,
      event: Calendar,
      deadline: Clock,
      reminder: Clock
    };
    return icons[type] || Users;
  };

  const formatEventTime = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate that end date is after start date
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert datetime-local format to ISO8601 format
      const eventData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        location: formData.location?.trim() || undefined
      };
      
      // Remove undefined values
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === undefined) {
          delete eventData[key];
        }
      });
      
      console.log('Creating calendar event with data:', eventData);
      console.log('Start date ISO:', eventData.start_date);
      console.log('End date ISO:', eventData.end_date);
      
      const response = await collaborationService.createCalendarEvent(eventData);
      console.log('Create event response:', response);
      
      toast.success('Event created successfully');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_date: '',
        end_date: '',
        location: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Create event error:', error);
      console.error('Error details:', error.response?.data);
      
      // Extract validation errors if present
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Failed to create event';
      
      // Show validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || err.message);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEventClick = (event, e) => {
    if (e) e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleEditClick = () => {
    const formatDateTimeLocal = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setEditingEvent(selectedEvent);
    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      event_type: selectedEvent.event_type,
      start_date: formatDateTimeLocal(selectedEvent.start_date),
      end_date: formatDateTimeLocal(selectedEvent.end_date),
      location: selectedEvent.location || ''
    });
    setShowEventDetail(false);
    setShowEditForm(true);
  };

  const handleUpdateEvent = async () => {
    if (!formData.title.trim() || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const eventData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        event_type: formData.event_type,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        location: formData.location?.trim() || undefined
      };
      
      Object.keys(eventData).forEach(key => {
        if (eventData[key] === undefined) {
          delete eventData[key];
        }
      });
      
      console.log('Updating calendar event:', editingEvent.id, eventData);
      await collaborationService.updateCalendarEvent(editingEvent.id, eventData);
      
      toast.success('Event updated successfully');
      setShowEditForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_date: '',
        end_date: '',
        location: ''
      });
      loadEvents();
    } catch (error) {
      console.error('Update event error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowEventDetail(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('Deleting event:', selectedEvent.id);
      await collaborationService.deleteCalendarEvent(selectedEvent.id);
      toast.success('Event deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      console.error('Delete event error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete event';
      toast.error(errorMessage);
    }
  };

  const handleOpenCreateForm = () => {
    // Set default dates: start now, end 1 hour from now
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateTimeLocal = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setFormData({
      title: '',
      description: '',
      event_type: 'meeting',
      start_date: formatDateTimeLocal(now),
      end_date: formatDateTimeLocal(oneHourLater),
      location: ''
    });
    setShowCreateForm(true);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shared Calendar</h1>
          <p className="text-gray-600">Manage team events, meetings, and deadlines</p>
        </div>
        <button 
          onClick={handleOpenCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayEvents = getEventsForDay(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-100 rounded-lg ${
                    date ? 'hover:bg-gray-50 cursor-pointer' : ''
                  } ${isToday ? 'bg-primary-50 border-primary-200' : ''}`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-primary' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => {
                          const EventIcon = getEventTypeIcon(event.event_type);
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => handleEventClick(event, e)}
                              className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.event_type)} hover:opacity-80`}
                            >
                              <EventIcon className="w-3 h-3 inline mr-1" />
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {events.slice(0, 5).map(event => {
              const EventIcon = getEventTypeIcon(event.event_type);
              return (
                <div
                  key={event.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className={`p-2 rounded-lg ${getEventTypeColor(event.event_type)}`}>
                    <EventIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatEventTime(event.start_date, event.end_date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      {event.virtual_meeting_url && (
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          Virtual
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    event.event_type === 'event' ? 'bg-green-100 text-green-800' :
                    event.event_type === 'deadline' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {event.event_type}
                  </span>
                </div>
              );
            })}
          </div>

          {events.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
              <p className="text-gray-600">Create your first event to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const EventIcon = getEventTypeIcon(selectedEvent.event_type);
                  return (
                    <div className={`p-3 rounded-lg ${getEventTypeColor(selectedEvent.event_type)}`}>
                      <EventIcon className="w-6 h-6 text-white" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedEvent.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                    selectedEvent.event_type === 'event' ? 'bg-green-100 text-green-800' :
                    selectedEvent.event_type === 'deadline' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedEvent.event_type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowEventDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Start Time</h4>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(selectedEvent.start_date).toLocaleString()}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">End Time</h4>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(selectedEvent.end_date).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedEvent.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedEvent.location}
                  </div>
                </div>
              )}

              {selectedEvent.virtual_meeting_url && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Virtual Meeting</h4>
                  <div className="flex items-center text-gray-600">
                    <Video className="w-4 h-4 mr-2" />
                    <a href={selectedEvent.virtual_meeting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Join Meeting
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{selectedEvent.title}"</strong>? This event will be permanently removed from the calendar.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShowEventDetail(true);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {showEditForm ? 'Edit Event' : 'Create New Event'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="Event title"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Event description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleFormChange('start_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={formData.event_type}
                  onChange={(e) => handleFormChange('event_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="event">Event</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Event location or meeting room"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setShowEditForm(false);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      description: '',
                      event_type: 'meeting',
                      start_date: '',
                      end_date: '',
                      location: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditForm ? handleUpdateEvent : handleCreateEvent}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (showEditForm ? 'Updating...' : 'Creating...') : (showEditForm ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedCalendar;