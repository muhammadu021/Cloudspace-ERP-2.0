import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsDashboard from './components/SettingsDashboard';
import UserManagement from './components/UserManagement';
import CompanyUserManagement from './components/CompanyUserManagement';
import AuditLogs from './components/AuditLogs';
import AssetManagement from './components/AssetManagement';
import SystemSettings from './components/SystemSettings';
import { SupportDesk } from '../support';

const SettingsDesk = () => {
  return (
    <div className="settings-desk">
      <Routes>
        <Route path="/" element={<Navigate to="/settings/dashboard" replace />} />
        <Route path="/dashboard" element={<SettingsDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/company-users" element={<CompanyUserManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/asset-management" element={<AssetManagement />} />
        <Route path="/system-settings" element={<SystemSettings />} />
        <Route path="/support" element={<SupportDesk />} />
      </Routes>
    </div>
  );
};

export default SettingsDesk;
