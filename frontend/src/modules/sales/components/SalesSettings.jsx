import React, { useState } from 'react';
import { Settings, Users, FileText, Package } from 'lucide-react';
import UserManagement from '../../admin/UserManagement';
import AuditLogs from '../../admin/AuditLogs';
import AssetManagement from '../../admin/AssetManagement';

const SalesSettings = () => {
  const [activeTab, setActiveTab] = useState('user-management');

  const tabs = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: Users,
      component: UserManagement
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileText,
      component: AuditLogs
    },
    {
      id: 'asset-management',
      label: 'Asset Management',
      icon: Package,
      component: AssetManagement
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Settings</h1>
            <p className="text-sm text-gray-600">Manage sales module settings and configurations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default SalesSettings;
