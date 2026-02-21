import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Settings, Users, Shield, Database, FileText, Bell, Palette, Globe, HardDrive, Headphones, User, Monitor, MessageSquare } from 'lucide-react';
import UserManagement from './UserManagement';
import AssetManagement from './AssetManagement';
import AuditLogs from './AuditLogs';
import SystemSettings from './SystemSettings';
import PersonalSettings from './PersonalSettings';
import WorkspaceSettings from './WorkspaceSettings';
import CommunicationSettings from './CommunicationSettings';
import { SupportDesk } from '../../support';

const SettingsDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');

  const settingsSections = [
    {
      id: 'personal',
      name: 'Personal Settings',
      icon: User,
      description: 'Profile, password, notifications, language, signature'
    },
    {
      id: 'workspace',
      name: 'Workspace Settings',
      icon: Monitor,
      description: 'Theme, layout, widgets, default module'
    },
    {
      id: 'communication',
      name: 'Communication Settings',
      icon: MessageSquare,
      description: 'Email alerts, messages, reminders'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      description: 'Manage users and permissions'
    },
    {
      id: 'assets',
      name: 'Asset Management',
      icon: HardDrive,
      description: 'Manage company assets'
    },
    {
      id: 'audit',
      name: 'Audit Logs',
      icon: FileText,
      description: 'System activity and audit trails'
    },
    {
      id: 'system',
      name: 'System Settings',
      icon: Database,
      description: 'System configuration and maintenance'
    },
    {
      id: 'support',
      name: 'Support Desk',
      icon: Headphones,
      description: 'Customer support and ticket management'
    }
  ];

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalSettings />;
      case 'workspace':
        return <WorkspaceSettings />;
      case 'communication':
        return <CommunicationSettings />;
      case 'users':
        return <UserManagement />;
      case 'assets':
        return <AssetManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'system':
        return <SystemSettings />;
      case 'support':
        return user?.email === 'admin@cloudspace.com' ? <SupportDesk /> : (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Support Desk</h3>
            <div className="bg-white p-6 rounded-lg border">
              <p className="text-gray-600">Access restricted to Cloudspace administrators.</p>
            </div>
          </div>
        );
      default:
        return <PersonalSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your system configuration and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-1/4">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:w-3/4">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
