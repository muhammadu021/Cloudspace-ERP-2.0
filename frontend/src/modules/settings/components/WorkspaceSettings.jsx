import React, { useState, useEffect } from 'react';
import { Monitor, Layout, Eye, Home, Save } from 'lucide-react';
import settingsService from '../../../services/settingsService';
import { toast } from 'react-hot-toast';

const WorkspaceSettings = () => {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState('default');
  const [defaultModule, setDefaultModule] = useState('dashboard');
  const [widgets, setWidgets] = useState({
    quickStats: true,
    recentActivity: true,
    taskList: false,
    calendar: true,
    notifications: true
  });

  useEffect(() => {
    loadWorkspaceSettings();
  }, []);

  const loadWorkspaceSettings = async () => {
    try {
      const response = await settingsService.getWorkspaceSettings();
      const data = response.data;
      setTheme(data.theme || 'light');
      setLayout(data.layout || 'default');
      setDefaultModule(data.default_module || 'dashboard');
      setWidgets(data.widgets || widgets);
    } catch (error) {
      console.error('Error loading workspace settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await settingsService.updateWorkspaceSettings({
        theme,
        layout,
        default_module: defaultModule,
        widgets
      });
      toast.success('Workspace settings updated successfully');
    } catch (error) {
      toast.error('Failed to update workspace settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Monitor className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Theme Mode</h3>
        </div>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === 'light'}
              onChange={(e) => setTheme(e.target.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Light Mode</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === 'dark'}
              onChange={(e) => setTheme(e.target.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Dark Mode</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="theme"
              value="auto"
              checked={theme === 'auto'}
              onChange={(e) => setTheme(e.target.value)}
              className="text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Auto (System)</span>
          </label>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Layout className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Dashboard Layout</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer ${layout === 'default' ? 'border-blue-500 bg-primary-50' : 'border-gray-200'}`}
            onClick={() => setLayout('default')}
          >
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded"></div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <p className="text-xs text-center mt-2">Default</p>
          </div>
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer ${layout === 'compact' ? 'border-blue-500 bg-primary-50' : 'border-gray-200'}`}
            onClick={() => setLayout('compact')}
          >
            <div className="space-y-1">
              <div className="h-1 bg-gray-300 rounded"></div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
            <p className="text-xs text-center mt-2">Compact</p>
          </div>
          <div 
            className={`p-4 border-2 rounded-lg cursor-pointer ${layout === 'wide' ? 'border-blue-500 bg-primary-50' : 'border-gray-200'}`}
            onClick={() => setLayout('wide')}
          >
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <p className="text-xs text-center mt-2">Wide</p>
          </div>
        </div>
      </div>

      {/* Widget Visibility */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Eye className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Dashboard Widgets</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(widgets).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setWidgets({...widgets, [key]: e.target.checked})}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Default Module */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Home className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium">Default Module on Login</h3>
        </div>
        <select 
          value={defaultModule}
          onChange={(e) => setDefaultModule(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
        >
          <option value="dashboard">Dashboard</option>
          <option value="hr">HR Management</option>
          <option value="projects">Projects</option>
          <option value="finance">Finance</option>
          <option value="inventory">Inventory</option>
          <option value="self-service">Self Service</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Workspace Settings
        </button>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
