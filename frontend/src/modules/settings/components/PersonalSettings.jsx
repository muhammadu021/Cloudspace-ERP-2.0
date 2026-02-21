import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Globe, FileSignature, Save } from 'lucide-react';
import settingsService from '../../../services/settingsService';
import { toast } from 'react-hot-toast';

const PersonalSettings = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true
  });

  const [language, setLanguage] = useState('en');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await settingsService.getProfile();
      const data = response.data;
      setProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || ''
      });
      setNotifications(data.notification_preferences || notifications);
      setLanguage(data.language || 'en');
      setSignature(data.signature || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await settingsService.updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        position: profile.position
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await settingsService.changePassword({
        current_password: password.current,
        new_password: password.new
      });
      setPassword({ current: '', new: '', confirm: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await settingsService.updateNotificationPreferences(notifications);
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLanguage = async () => {
    try {
      setLoading(true);
      await settingsService.updateLanguage(language);
      toast.success('Language preference updated');
    } catch (error) {
      toast.error('Failed to update language');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSignature = async () => {
    try {
      setLoading(true);
      await settingsService.updateSignature(signature);
      toast.success('Signature updated successfully');
    } catch (error) {
      toast.error('Failed to update signature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Profile Information</h3>
          </div>
          <button 
            onClick={handleSaveProfile}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({...profile, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Change Password</h3>
          </div>
          <button 
            onClick={handleChangePassword}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            Update
          </button>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword({...password, current: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({...password, new: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({...password, confirm: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Notification Preferences</h3>
          </div>
          <button 
            onClick={handleSaveNotifications}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.emailAlerts}
              onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Email alerts for important updates</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={(e) => setNotifications({...notifications, pushNotifications: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Push notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={notifications.weeklyReports}
              onChange={(e) => setNotifications({...notifications, weeklyReports: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
          </label>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Language Preference</h3>
          </div>
          <button 
            onClick={handleSaveLanguage}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      {/* Signature */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FileSignature className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium">Digital Signature</h3>
          </div>
          <button 
            onClick={handleSaveSignature}
            disabled={loading}
            className="flex items-center px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </button>
        </div>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter your signature for approvals and emails..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
};

export default PersonalSettings;
