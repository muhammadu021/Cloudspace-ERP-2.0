import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { collaborationService } from '../../../services/collaborationService';
import toast from 'react-hot-toast';

const UpcomingEvents = ({ limit = 5 }) => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    loadUpcomingEvents();
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3); // Get events for next 3 months
      
      console.log('Fetching events from:', now.toISOString().split('T')[0], 'to:', futureDate.toISOString().split('T')[0]);
      
      const response = await collaborationService.getCalendarEvents({
        start: now.toISOString().split('T')[0],
        end: futureDate.toISOString().split('T')[0],
        limit: 50 // Fetch more to ensure we have enough after filtering
      });
      
      console.log('API Response:', response);
      
      const allEvents = response.data?.data?.events || [];
      console.log('All events received:', allEvents.length, allEvents);
      
      // Filter and sort upcoming events (use end_date for better filtering)
      const upcomingEvents = allEvents
        .filter(event => {
          const eventEnd = new Date(event.end_date);
          const isUpcoming = eventEnd >= now;
          console.log('Event:', event.title, 'End:', eventEnd, 'Is upcoming:', isUpcoming);
          return isUpcoming;
        })
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, limit);
      
      console.log('Filtered upcoming events:', upcomingEvents.length, upcomingEvents);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Load upcoming events error:', error);
      toast.error('Failed to load upcoming events');
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
      deadline: AlertTriangle,
      reminder: Clock
    };
    return icons[type] || Users;
  };

  const toggleEventDetails = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const formatEventTime = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // Calculate time until event
    const diffMs = start - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    let timeUntil = '';
    if (diffDays > 0) {
      timeUntil = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeUntil = `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      timeUntil = `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      timeUntil = 'Starting now';
    }
    
    if (start.toDateString() === end.toDateString()) {
      return {
        time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDate: start.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        timeUntil
      };
    } else {
      return {
        time: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        date: start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        fullDate: `${start.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
        timeUntil
      };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Events
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Events
        </h3>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => {
            const EventIcon = getEventTypeIcon(event.event_type);
            const { time, date, fullDate, timeUntil } = formatEventTime(event.start_date, event.end_date);
            const isExpanded = expandedEventId === event.id;
            
            return (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
              >
                {/* Event Header - Always Visible */}
                <div
                  onClick={() => toggleEventDetails(event.id)}
                  className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getEventTypeColor(event.event_type)}`}>
                    <EventIcon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {date} • {time}
                      </span>
                      <span className="text-xs text-primary font-medium">
                        {timeUntil}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.event_type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                      event.event_type === 'event' ? 'bg-green-100 text-green-800' :
                      event.event_type === 'deadline' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.event_type}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Event Details - Shown When Expanded */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-3">
                      {/* Full Date/Time */}
                      <div className="bg-primary-50 border-l-4 border-blue-500 p-3 rounded">
                        <div className="flex items-start">
                          <Clock className="w-4 h-4 text-primary mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">{fullDate}</p>
                            <p className="text-xs text-primary-700 mt-1">{time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Description</h5>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      )}

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-start">
                          <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-medium text-gray-700">Location</h5>
                            <p className="text-sm text-gray-600">{event.location}</p>
                          </div>
                        </div>
                      )}

                      {/* Virtual Meeting */}
                      {event.virtual_meeting_url && (
                        <div className="flex items-start">
                          <Video className="w-4 h-4 text-primary mr-2 mt-0.5" />
                          <div>
                            <h5 className="text-xs font-medium text-gray-700">Virtual Meeting</h5>
                            <a 
                              href={event.virtual_meeting_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Join Meeting →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
