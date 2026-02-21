import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Clock, Calendar, Save } from 'lucide-react';
import settingsService from '../../../services/settingsService';
import { toast } from 'react-hot-toast';

const CommunicationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emailTypes, setEmailTypes] = useState({
    taskAssignments: true,
    projectUpdates: true,
    approvalRequests: true,
    systemAnnouncements: false
  });
  const [inAppMessages, setInAppMessages] = useState(true);
  const [messageTypes, setMessageTypes] = useState({
    directMessages: true,
    mentions: true,
    statusUpdates: false
  });
  const [taskReminderTime, setTaskReminderTime] = useState('30');
  const [meetingReminders, setMeetingReminders] = useState({
    enabled: true,
    beforeTime: '15',
    frequency: 'once'
  });

  useEffect(() => {
    loadCommunicationSettings();
  }, []);

  const loadCommunicationSettings = async () => {
    try {
      const response = await settingsService.getCommunicationSettings();
      const data = response.data;
      setEmailAlerts(data.email_alerts || true);
      setEmailTypes(data.email_types || emailTypes);
      setInAppMessages(data.in_app_messages || true);
      setMessageTypes(data.message_types || messageTypes);
      setTaskReminderTime(data.task_reminder_time || '30');
      setMeetingReminders(data.meeting_reminders || meetingReminders);
    } catch (error) {
      console.error('Error loading communication settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await settingsService.updateCommunicationSettings({
        email_alerts: emailAlerts,
        email_types: emailTypes,
        in_app_messages: inAppMessages,
        message_types: messageTypes,
        task_reminder_time: taskReminderTime,
        meeting_reminders: meetingReminders
      });
      toast.success('Communication settings updated successfully');
    } catch (error) {
      toast.error('Failed to update communication settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Email Alerts</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable email notifications</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>
          
          {emailAlerts && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={emailTypes.taskAssignments}
                  onChange={(e) => setEmailTypes({...emailTypes, taskAssignments: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Task assignments</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={emailTypes.projectUpdates}
                  onChange={(e) => setEmailTypes({...emailTypes, projectUpdates: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Project updates</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={emailTypes.approvalRequests}
                  onChange={(e) => setEmailTypes({...emailTypes, approvalRequests: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Approval requests</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={emailTypes.systemAnnouncements}
                  onChange={(e) => setEmailTypes({...emailTypes, systemAnnouncements: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">System announcements</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* In-App Messages */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">In-App Messages</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable in-app notifications</span>
            <input
              type="checkbox"
              checked={inAppMessages}
              onChange={(e) => setInAppMessages(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>
          
          {inAppMessages && (
            <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={messageTypes.directMessages}
                  onChange={(e) => setMessageTypes({...messageTypes, directMessages: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Direct messages</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={messageTypes.mentions}
                  onChange={(e) => setMessageTypes({...messageTypes, mentions: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Mentions in comments</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={messageTypes.statusUpdates}
                  onChange={(e) => setMessageTypes({...messageTypes, statusUpdates: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="ml-2 text-sm text-gray-600">Status updates</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Task Reminders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Task Reminder Time</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remind me before task deadline
            </label>
            <select 
              value={taskReminderTime}
              onChange={(e) => setTaskReminderTime(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="1440">1 day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meeting Reminders */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Meeting Reminders</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Enable meeting reminders</span>
            <input
              type="checkbox"
              checked={meetingReminders.enabled}
              onChange={(e) => setMeetingReminders({...meetingReminders, enabled: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </label>
          
          {meetingReminders.enabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me before meeting
                </label>
                <select 
                  value={meetingReminders.beforeTime}
                  onChange={(e) => setMeetingReminders({...meetingReminders, beforeTime: e.target.value})}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder frequency
                </label>
                <select 
                  value={meetingReminders.frequency}
                  onChange={(e) => setMeetingReminders({...meetingReminders, frequency: e.target.value})}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
                >
                  <option value="once">Once</option>
                  <option value="twice">Twice (15 min & 5 min before)</option>
                  <option value="multiple">Multiple times</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Communication Settings
        </button>
      </div>
    </div>
  );
};

export default CommunicationSettings;
