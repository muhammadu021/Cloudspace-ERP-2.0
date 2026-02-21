import React, { useState } from 'react';
import { Card, Button, FormField } from '../../design-system/components';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../store/api/adminApi';

export const Settings = () => {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async (category) => {
    await updateSettings({ category, data: formData[category] });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            <Button size="sm" onClick={() => handleSave('general')} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Company Name"
              type="text"
              value={formData.general?.companyName || ''}
              onChange={(value) => setFormData({
                ...formData,
                general: { ...formData.general, companyName: value }
              })}
              helperText="Your organization's legal name"
            />
            <FormField
              label="Time Zone"
              type="select"
              value={formData.general?.timezone || ''}
              onChange={(value) => setFormData({
                ...formData,
                general: { ...formData.general, timezone: value }
              })}
              helperText="Default timezone for the system"
            />
            <FormField
              label="Date Format"
              type="select"
              value={formData.general?.dateFormat || ''}
              onChange={(value) => setFormData({
                ...formData,
                general: { ...formData.general, dateFormat: value }
              })}
            />
            <FormField
              label="Currency"
              type="select"
              value={formData.general?.currency || ''}
              onChange={(value) => setFormData({
                ...formData,
                general: { ...formData.general, currency: value }
              })}
            />
          </div>
        </div>
      </Card>

      {/* Email Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
            <Button size="sm" onClick={() => handleSave('email')} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="SMTP Host"
              type="text"
              value={formData.email?.smtpHost || ''}
              onChange={(value) => setFormData({
                ...formData,
                email: { ...formData.email, smtpHost: value }
              })}
            />
            <FormField
              label="SMTP Port"
              type="number"
              value={formData.email?.smtpPort || ''}
              onChange={(value) => setFormData({
                ...formData,
                email: { ...formData.email, smtpPort: value }
              })}
            />
            <FormField
              label="From Email"
              type="email"
              value={formData.email?.fromEmail || ''}
              onChange={(value) => setFormData({
                ...formData,
                email: { ...formData.email, fromEmail: value }
              })}
            />
            <FormField
              label="From Name"
              type="text"
              value={formData.email?.fromName || ''}
              onChange={(value) => setFormData({
                ...formData,
                email: { ...formData.email, fromName: value }
              })}
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            <Button size="sm" onClick={() => handleSave('security')} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Session Timeout (minutes)"
              type="number"
              value={formData.security?.sessionTimeout || ''}
              onChange={(value) => setFormData({
                ...formData,
                security: { ...formData.security, sessionTimeout: value }
              })}
              helperText="Automatic logout after inactivity"
            />
            <FormField
              label="Password Min Length"
              type="number"
              value={formData.security?.passwordMinLength || ''}
              onChange={(value) => setFormData({
                ...formData,
                security: { ...formData.security, passwordMinLength: value }
              })}
            />
            <FormField
              label="Require 2FA"
              type="checkbox"
              value={formData.security?.require2FA || false}
              onChange={(value) => setFormData({
                ...formData,
                security: { ...formData.security, require2FA: value }
              })}
              helperText="Enforce two-factor authentication"
            />
            <FormField
              label="Allow Password Reset"
              type="checkbox"
              value={formData.security?.allowPasswordReset || false}
              onChange={(value) => setFormData({
                ...formData,
                security: { ...formData.security, allowPasswordReset: value }
              })}
            />
          </div>
        </div>
      </Card>

      {/* Backup Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Backup & Maintenance</h3>
            <Button size="sm" onClick={() => handleSave('backup')} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Auto Backup"
              type="checkbox"
              value={formData.backup?.autoBackup || false}
              onChange={(value) => setFormData({
                ...formData,
                backup: { ...formData.backup, autoBackup: value }
              })}
              helperText="Enable automatic daily backups"
            />
            <FormField
              label="Backup Retention (days)"
              type="number"
              value={formData.backup?.retentionDays || ''}
              onChange={(value) => setFormData({
                ...formData,
                backup: { ...formData.backup, retentionDays: value }
              })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Run Backup Now</Button>
            <Button variant="outline">Restore from Backup</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
