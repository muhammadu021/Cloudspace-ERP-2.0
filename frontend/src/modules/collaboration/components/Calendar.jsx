import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Search,
  Download,
  Share2,
  Bell,
  Repeat,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_date: '',
    end_date: '',
    is_all_day: false,
    timezone: 'UTC',
    location: '',
    virtual_meeting_url: '',
    organizer_id: '',
    attendees: [],
    required_attendees: [],
    optional_attendees: [],
    external_attendees: [],
    recurrence_rule: '',
    reminders: [],
    agenda: [],
    visibility: 'public',
    department_id: '',
    project_id: '',
    approval_required: false
  });

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, searchTerm, typeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        ...(typeFilter && { type: typeFilter })
      });

      const response = await fetch(`/api/v1/collaboration/calendar/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
      } else {
        setError('Failed to fetch calendar events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const response = await fetch('/api/v1/collaboration/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      const data = await response.json();

      if (data.success) {
        setEvents([...events, data.data.event]);
        setShowCreateModal(false);
        setNewEvent({
          title: '',
          description: '',
          event_type: 'meeting',
          start_date: '',
          end_date: '',
          is_all_day: false,
          timezone: 'UTC',
          location: '',
          virtual_meeting_url: '',
          organizer_id: '',
          attendees: [],
          required_attendees: [],
          optional_attendees: [],
          external_attendees: [],
          recurrence_rule: '',
          reminders: [],
          agenda: [],
          visibility: 'public',
          department_id: '',
          project_id: '',
          approval_required: false
        });
      } else {
        setError('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    }
  };

  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case 'month':
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay());
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay());
        break;
      case 'day':
        break;
      default:
        break;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (view) {
      case 'month':
        date.setMonth(date.getMonth() + 1);
        date.setDate(0);
        date.setDate(date.getDate() + (6 - date.getDay()));
        break;
      case 'week':
        date.setDate(date.getDate() - date.getDay() + 6);
        break;
      case 'day':
        break;
      default:
        break;
    }
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    switch (view) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      default:
        break;
    }
    setCurrentDate(newDate);
  };

  const getMonthDays = () => {
    const startDate = getViewStartDate();
    const endDate = getViewEndDate();
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getWeekDays = () => {
    const startDate = getViewStartDate();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return (eventStart <= dayEnd && eventEnd >= dayStart);
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-primary-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-3 w-3" />;
      case 'event':
        return <CalendarIcon className="h-3 w-3" />;
      case 'deadline':
        return <AlertCircle className="h-3 w-3" />;
      case 'reminder':
        return <Bell className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your events and meetings</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
                {view === 'month' && currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                {view === 'week' && `Week of ${getViewStartDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                {view === 'day' && currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="meeting">Meetings</option>
                <option value="event">Events</option>
                <option value="deadline">Deadlines</option>
                <option value="reminder">Reminders</option>
              </select>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg">
              {['month', 'week', 'day'].map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-2 text-sm font-medium capitalize ${
                    view === viewType
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${viewType === 'month' ? 'rounded-l-lg' : viewType === 'day' ? 'rounded-r-lg' : ''}`}
                >
                  {viewType}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {view === 'month' && (
          <div className="grid grid-cols-7 gap-0">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getMonthDays().map((date, index) => {
              const dayEvents = getEventsForDate(date);
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${
                    !isCurrentMonth(date) ? 'bg-gray-50' : ''
                  } ${isToday(date) ? 'bg-primary-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isToday(date) ? 'text-primary' : 
                    !isCurrentMonth(date) ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getEventTypeColor(event.event_type)}`}
                      >
                        <div className="flex items-center space-x-1">
                          {getEventTypeIcon(event.event_type)}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 p-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-8 gap-0">
            {/* Time Column Header */}
            <div className="p-4 border-b border-gray-200"></div>
            
            {/* Day Headers */}
            {getWeekDays().map((date) => (
              <div key={date.toISOString()} className={`p-4 text-center border-b border-gray-200 ${
                isToday(date) ? 'bg-primary-50' : ''
              }`}>
                <div className="text-sm font-medium text-gray-700">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${
                  isToday(date) ? 'text-primary' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}

            {/* Time Slots */}
            {Array.from({ length: 24 }, (_, hour) => (
              <React.Fragment key={hour}>
                <div className="p-2 text-xs text-gray-500 border-b border-gray-100 text-right">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                {getWeekDays().map((date) => {
                  const dayEvents = getEventsForDate(date).filter(event => {
                    const eventHour = new Date(event.start_date).getHours();
                    return eventHour === hour;
                  });
                  return (
                    <div key={`${date.toISOString()}-${hour}`} className="min-h-[60px] p-1 border-b border-r border-gray-100">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 mb-1 ${getEventTypeColor(event.event_type)}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getEventTypeIcon(event.event_type)}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

        {view === 'day' && (
          <div className="space-y-4 p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            {getEventsForDate(currentDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(currentDate).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                            {getEventTypeIcon(event.event_type)}
                            <span className="capitalize">{event.event_type}</span>
                          </div>
                          {event.is_recurring && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Repeat className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {event.is_all_day ? 'All day' : `${formatTime(event.start_date)} - ${formatTime(event.end_date)}`}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.virtual_meeting_url && (
                            <div className="flex items-center space-x-1">
                              <Video className="h-4 w-4" />
                              <span>Virtual</span>
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No events scheduled for this day</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Event</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="event">Event</option>
                    <option value="deadline">Deadline</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={newEvent.visibility}
                    onChange={(e) => setNewEvent({ ...newEvent, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="confidential">Confidential</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_all_day"
                  checked={newEvent.is_all_day}
                  onChange={(e) => setNewEvent({ ...newEvent, is_all_day: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_all_day" className="ml-2 block text-sm text-gray-700">
                  All day event
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Virtual Meeting URL
                  </label>
                  <input
                    type="url"
                    value={newEvent.virtual_meeting_url}
                    onChange={(e) => setNewEvent({ ...newEvent, virtual_meeting_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                disabled={!newEvent.title || !newEvent.start_date || !newEvent.end_date}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.event_type)}`}>
                  {getEventTypeIcon(selectedEvent.event_type)}
                  <span className="capitalize">{selectedEvent.event_type}</span>
                </div>
                {selectedEvent.is_recurring && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Repeat className="h-4 w-4" />
                    <span className="text-sm">Recurring</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h2>
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedEvent.is_all_day ? 'All day' : `${formatTime(selectedEvent.start_date)} - ${formatTime(selectedEvent.end_date)}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(selectedEvent.start_date)}
                      </div>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{selectedEvent.location}</span>
                    </div>
                  )}

                  {selectedEvent.virtual_meeting_url && (
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4 text-gray-400" />
                      <a
                        href={selectedEvent.virtual_meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-700"
                      >
                        Join Virtual Meeting
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {selectedEvent.organizer && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Organizer</div>
                        <div className="text-sm text-gray-600">
                          {selectedEvent.organizer.first_name} {selectedEvent.organizer.last_name}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedEvent.Department && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Department</div>
                        <div className="text-sm text-gray-600">{selectedEvent.Department.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Agenda</h3>
                  <div className="space-y-2">
                    {selectedEvent.agenda.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">{index + 1}.</span>
                        <span className="text-sm text-gray-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2">
                <Edit3 className="h-4 w-4" />
                <span>Edit Event</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;