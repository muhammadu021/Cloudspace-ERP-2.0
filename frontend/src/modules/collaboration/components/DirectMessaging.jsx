import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User as UserIcon, Plus, X, Lock, Video, Calendar, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MESSAGING_VERSION from './MESSAGING_VERSION';

const API_URL = import.meta.env.VITE_API_URL;

const DirectMessaging = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [activeMeeting, setActiveMeeting] = useState(null); // For iframe meeting
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const conversationsListRef = useRef(null);
  const token = localStorage.getItem("token").replace(/['\"]+/g, "");
  
  // Debug: Verify this is the new DirectMessaging component
  console.log('🚀 DirectMessaging component loaded (NEW SYSTEM)');
  console.log('📡 Using API endpoint:', `${API_URL}/direct-messaging`);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  };

  useEffect(() => {
    loadConversations();
    loadEmployees();
    
    // Poll for new conversations every 5 seconds
    const conversationInterval = setInterval(() => {
      loadConversations();
    }, 5000);
    
    return () => clearInterval(conversationInterval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.employee_id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation.employee_id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      console.log('📥 Loading conversations from:', `${API_URL}/direct-messaging/conversations`);
      const response = await axios.get(`${API_URL}/direct-messaging/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const conversationsList = response.data.data?.conversations || [];
      
      // Remove duplicates by employee_id (just in case)
      const uniqueConversations = conversationsList.reduce((acc, conv) => {
        const exists = acc.find(c => c.employee_id === conv.employee_id);
        if (!exists) {
          acc.push(conv);
        }
        return acc;
      }, []);
      
      console.log('✅ Conversations loaded:', {
        total: conversationsList.length,
        unique: uniqueConversations.length,
        duplicatesRemoved: conversationsList.length - uniqueConversations.length
      });
      
      setConversations(uniqueConversations);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const loadEmployees = async () => {
    try {
      // Use collaboration staff endpoint (accessible to all users)
      const response = await axios.get(`${API_URL}/collaboration/staff`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 1000  // High limit to get all employees
        }
      });
      
      console.log('📦 Raw API response:', {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        dataDataKeys: response.data.data ? Object.keys(response.data.data) : null,
        firstItem: response.data.data?.staff?.[0] || response.data.data?.employees?.[0] || response.data.employees?.[0]
      });
      
      // Try multiple possible response formats
      let allEmployees = [];
      
      // Collaboration staff endpoint returns data.staff
      if (response.data.data?.staff) {
        allEmployees = response.data.data.staff;
      } else if (response.data.staff) {
        allEmployees = response.data.staff;
      } else if (response.data.data?.employees) {
        allEmployees = response.data.data.employees;
      } else if (response.data.employees) {
        allEmployees = response.data.employees;
      } else if (response.data.data?.users) {
        allEmployees = response.data.data.users;
      } else if (response.data.users) {
        allEmployees = response.data.users;
      } else if (Array.isArray(response.data.data)) {
        allEmployees = response.data.data;
      } else if (Array.isArray(response.data)) {
        allEmployees = response.data;
      }
      
      const currentEmployeeId = user.Employee?.id || user.employee?.id;
      const currentUserId = user.id;
      
      console.log('👤 Current user info:', {
        currentEmployeeId,
        currentUserId,
        userObject: {
          id: user.id,
          Employee: user.Employee ? { id: user.Employee.id } : null,
          employee: user.employee ? { id: user.employee.id } : null
        }
      });
      
      // Filter out current user (compare both employee ID and user ID)
      const filteredEmployees = allEmployees.filter(emp => {
        // Don't filter out if we can't determine current employee
        if (!currentEmployeeId && !currentUserId) return true;
        
        // Filter by employee ID if available
        if (currentEmployeeId && emp.id === currentEmployeeId) return false;
        
        // Filter by user ID if employee has user_id field
        if (currentUserId && emp.user_id === currentUserId) return false;
        
        return true;
      });
      
      console.log('👥 Loaded employees:', {
        total: allEmployees.length,
        filtered: filteredEmployees.length,
        currentEmployeeId,
        currentUserId,
        sampleEmployee: filteredEmployees[0]
      });
      
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const loadMessages = async (employeeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/direct-messaging/messages/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data?.messages || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const messageContent = messageInput.trim();
    setMessageInput('');

    try {
      console.log('📤 Sending message to:', selectedConversation.employee_id);
      const response = await axios.post(
        `${API_URL}/direct-messaging/messages`,
        { 
          to_employee_id: selectedConversation.employee_id,
          message: messageContent 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Message sent successfully:', response.data);
      
      await loadMessages(selectedConversation.employee_id);
      await loadConversations(); // Refresh conversation list
      setTimeout(() => {
        scrollToBottom();
        messageInputRef.current?.focus();
      }, 150);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data);
      setMessageInput(messageContent);
      alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEmployeeSelect = (e) => {
    const employeeId = parseInt(e.target.value);
    if (!employeeId) return;

    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    const employeeName = employee.User 
      ? `${employee.User.first_name || ''} ${employee.User.last_name || ''}`.trim()
      : `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    
    const avatarUrl = employee.User?.cloudinary_avatar_url || employee.User?.avatar || employee.cloudinary_avatar_url || employee.avatar;

    // In the new system, we don't need to create a thread first
    // Just select the employee and start messaging
    setSelectedConversation({
      employee_id: employeeId,
      employee_name: employeeName || 'Unknown User',
      avatar_url: avatarUrl,
      cloudinary_avatar_url: employee.User?.cloudinary_avatar_url || employee.cloudinary_avatar_url
    });
    
    setShowNewChatModal(false);
    setSelectedEmployeeId('');
    
    // Load any existing messages with this person
    loadMessages(employeeId);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to detect and render meeting links
  const renderMessageContent = (messageText, isOwnMessage) => {
    // Check if this is a meeting invitation message
    const isMeetingInvitation = messageText.includes('Meeting Invitation:') || 
                                messageText.includes('Instant Meeting Started:') ||
                                messageText.includes('🎥') || 
                                messageText.includes('📅');
    
    if (!isMeetingInvitation) {
      // Regular message - just render as text
      return <p className="break-words whitespace-pre-wrap text-sm leading-relaxed">{messageText}</p>;
    }

    // Extract meeting URL from the message
    const urlMatch = messageText.match(/https:\/\/meet\.jit\.si\/[^\s\n]+/);
    const meetingUrl = urlMatch ? urlMatch[0] : null;

    // Extract meeting title
    const titleMatch = messageText.match(/(?:Meeting Invitation|Instant Meeting Started): (.+?)\n/);
    const meetingTitle = titleMatch ? titleMatch[1] : 'Video Meeting';

    // Check if it's an instant meeting (already in progress)
    const isInstantMeeting = messageText.includes('Instant Meeting Started') || 
                             messageText.includes('Meeting in progress');

    return (
      <div className="space-y-3">
        {/* Meeting invitation card */}
        <div className={`rounded-lg p-3 ${
          isOwnMessage 
            ? 'bg-primary-700 bg-opacity-50' 
            : 'bg-white bg-opacity-90 text-gray-900'
        }`}>
          <div className="flex items-start gap-2 mb-2">
            {isInstantMeeting ? (
              <Video className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">
                {isInstantMeeting ? '🎥 Instant Meeting' : '📅 Meeting Invitation'}
              </div>
              <div className="text-sm font-medium mb-2">{meetingTitle}</div>
            </div>
          </div>

          {/* Meeting details */}
          <div className={`text-xs space-y-1 mb-3 ${
            isOwnMessage ? 'text-blue-50' : 'text-gray-700'
          }`}>
            {messageText.split('\n').slice(1, -2).map((line, index) => {
              if (line.trim() && !line.includes('https://')) {
                return <div key={index}>{line}</div>;
              }
              return null;
            })}
          </div>

          {/* Join meeting button */}
          {meetingUrl && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Open meeting in iframe overlay
                  setActiveMeeting({
                    url: meetingUrl,
                    title: meetingTitle,
                    isInstant: isInstantMeeting
                  });
                }}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  isOwnMessage
                    ? 'bg-white text-primary hover:bg-primary-50'
                    : 'bg-primary text-white hover:bg-primary-600'
                }`}
              >
                <Video className="w-4 h-4" />
                {isInstantMeeting ? 'Join Meeting Now' : 'Join Meeting'}
              </button>
              
              {/* External link option */}
              <button
                onClick={() => window.open(meetingUrl, '_blank')}
                className={`w-full py-1.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1 transition-all ${
                  isOwnMessage
                    ? 'bg-blue-800 bg-opacity-30 hover:bg-opacity-50 text-blue-50'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <ExternalLink className="w-3 h-3" />
                Open in new tab
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentEmployeeId = user.Employee?.id || user.employee?.id || user.id;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-200 flex flex-col`} style={{ pointerEvents: 'auto' }}>
        <div className="p-4 border-b border-gray-200 bg-primary text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Private Messages</h2>
              <p className="text-xs text-primary-100 flex items-center gap-1 mt-1">
                <Lock className="w-3 h-3" />
                Only you and the recipient can see these
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-white text-primary rounded-full hover:bg-primary-50 transition-colors"
              title="Start new chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={conversationsListRef} 
          className="flex-1 overflow-y-auto" 
          style={{ 
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            userSelect: 'none',
            position: 'relative',
            height: '100%'
          }}
        >
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="mb-2 font-semibold">No conversations yet</p>
              <p className="text-sm mb-4">Start a private one-on-one chat</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start a Chat
              </button>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.employee_id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedConversation(conv);
                }}
                onTouchStart={(e) => {
                  // Allow scrolling on touch devices
                  e.currentTarget.style.pointerEvents = 'auto';
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.employee_id === conv.employee_id ? 'bg-primary-50 border-l-4 border-l-blue-600' : ''
                }`}
                style={{ userSelect: 'none', touchAction: 'manipulation' }}
              >
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                    {conv.avatar_url || conv.cloudinary_avatar_url ? (
                      <img 
                        src={conv.cloudinary_avatar_url || conv.avatar_url} 
                        alt={conv.employee_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${conv.avatar_url || conv.cloudinary_avatar_url ? 'hidden' : ''}`}>
                      {conv.employee_name[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.employee_name}</h3>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-primary text-white flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="md:hidden p-2 hover:bg-primary-600 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* User Avatar in Header */}
            <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
              {selectedConversation.avatar_url || selectedConversation.cloudinary_avatar_url ? (
                <img 
                  src={selectedConversation.cloudinary_avatar_url || selectedConversation.avatar_url} 
                  alt={selectedConversation.employee_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${selectedConversation.avatar_url || selectedConversation.cloudinary_avatar_url ? 'hidden' : ''}`}>
                {selectedConversation.employee_name[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{selectedConversation.employee_name}</h3>
                <Lock className="w-4 h-4" title="Private conversation" />
              </div>
              <p className="text-xs text-primary-100">
                Private conversation - only you two can see this
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Lock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg mb-2">No messages yet</p>
                  <p className="text-sm">Start your private conversation!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isOwnMessage = message.from_employee_id === currentEmployeeId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwnMessage && (
                          <span className="text-xs font-semibold text-gray-600 mb-1 ml-3">
                            {message.from_employee_name}
                          </span>
                        )}
                        
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-md ${
                            isOwnMessage
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          {/* Render message with clickable meeting links */}
                          {renderMessageContent(message.message, isOwnMessage)}
                          
                          <div className={`text-xs mt-1.5 flex items-center gap-2 ${
                            isOwnMessage ? 'text-primary-100 justify-end' : 'text-gray-600 justify-start'
                          }`}>
                            <span>{formatTime(message.created_at)}</span>
                            {message.is_edited && <span>(edited)</span>}
                          </div>
                        </div>
                        
                        {isOwnMessage && (
                          <span className="text-xs text-gray-500 mt-1 mr-3">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a private message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <Lock className="w-24 h-24 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">Private Messaging</h3>
            <p className="mb-2">Select a conversation to start messaging</p>
            <p className="text-sm text-gray-400 mb-4">All conversations are private and secure</p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start New Private Chat
            </button>
          </div>
        </div>
      )}

      {/* Meeting iframe Overlay */}
      {activeMeeting && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Meeting Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-semibold text-lg">{activeMeeting.title}</h3>
                <p className="text-sm text-gray-400">
                  {activeMeeting.isInstant ? 'Instant Meeting' : 'Scheduled Meeting'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to leave the meeting?')) {
                  setActiveMeeting(null);
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" />
              Leave Meeting
            </button>
          </div>

          {/* Jitsi iframe */}
          <div className="flex-1 relative">
            <iframe
              src={activeMeeting.url}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="w-full h-full border-0"
              title={activeMeeting.title}
            />
          </div>

          {/* Meeting Footer Info */}
          <div className="bg-gray-900 text-white p-2 text-center text-sm">
            <p className="text-gray-400">
              Meeting URL: <span className="text-blue-400">{activeMeeting.url}</span>
            </p>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Start Private Chat</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    One-on-one private conversation
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setSelectedEmployeeId('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a person to chat with:
              </label>
              <select
                value={selectedEmployeeId}
                onChange={handleEmployeeSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900 cursor-pointer"
                autoFocus
              >
                <option value="">-- Choose a person ({employees.length} available) --</option>
                {employees.map(employee => {
                  const employeeName = employee.User 
                    ? `${employee.User.first_name || ''} ${employee.User.last_name || ''}`.trim()
                    : `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
                  const employeeEmail = employee.User?.email || employee.email;
                  return (
                    <option key={employee.id} value={employee.id}>
                      {employeeName} {employeeEmail ? `(${employeeEmail})` : ''}
                    </option>
                  );
                })}
              </select>
              <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Privacy guaranteed:</strong> Only you and the person you select will be able to see your conversation.
                  </span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setSelectedEmployeeId('');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessaging;
