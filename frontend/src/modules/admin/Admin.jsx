import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminDashboard } from './AdminDashboard'
import { Assets } from './Assets'
import { Users } from './Users'
import { Roles } from './Roles'
import { Security } from './Security'
import { Settings } from './Settings'
import AssetManagement from './AssetManagement'
import DocumentRepository from './DocumentRepository'
import SystemSettings from './SystemSettings'
import UserManagement from './UserManagement';
import EnhancedUserManagementWithSidebar from './EnhancedUserManagementWithSidebar';
import AuditLogs from './AuditLogs'
import BackupManagement from './BackupManagement'

const Admin = () => {
  console.log('Admin component rendered');
  
  return (
    <div className="p-6">
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="security" element={<Security />} />
        <Route path="settings" element={<Settings />} />
        <Route path="assets" element={<Assets />} />
        <Route path="documents" element={<DocumentRepository />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="backups" element={<BackupManagement />} />
        {/* Legacy routes */}
        <Route path="users-legacy" element={<UserManagement />} />
        <Route path="users-enhanced" element={<EnhancedUserManagementWithSidebar />} />
        <Route path="assets-legacy" element={<AssetManagement />} />
        <Route path="settings-legacy" element={<SystemSettings />} />
      </Routes>
    </div>
  )
}

export default Admin