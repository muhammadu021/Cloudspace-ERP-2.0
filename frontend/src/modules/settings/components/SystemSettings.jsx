import React, { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { toast } from 'react-hot-toast';

const SystemSettings = () => {
  // Helper function to safely update nested settings
  const updateSetting = (section, key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...(prevSettings[section] || {}),
        [key]: value
      }
    }))
  }

  const [settings, setSettings] = useState({
    company: {
      name: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      logo: ''
    },
    system: {
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      currency: 'NGN',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      twoFactorEnabled: false
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpSecure: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminService.getSystemSettings()
      
      // console.log('API Response:-----------------------', response.data)
      
      // The API now returns the correct format directly
      const fetchedSettings = response?.data?.data || {}
      
      // Use the fetched settings directly since they're in the correct format
      if (fetchedSettings && typeof fetchedSettings === 'object') {
        setSettings({
          company: {
            name: fetchedSettings.company?.name || settings.company.name,
            email: fetchedSettings.company?.email || settings.company.email,
            phone: fetchedSettings.company?.phone || settings.company.phone,
            address: fetchedSettings.company?.address || settings.company.address,
            website: fetchedSettings.company?.website || settings.company.website,
            logo: fetchedSettings.company?.logo || settings.company.logo
          },
          system: {
            timezone: fetchedSettings.system?.timezone || settings.system.timezone,
            dateFormat: fetchedSettings.system?.dateFormat || settings.system.dateFormat,
            currency: fetchedSettings.system?.currency || settings.system.currency,
            language: fetchedSettings.system?.language || settings.system.language,
            maintenanceMode: fetchedSettings.system?.maintenanceMode || settings.system.maintenanceMode
          },
          security: {
            passwordMinLength: fetchedSettings.security?.passwordMinLength || settings.security.passwordMinLength,
            passwordRequireSpecialChars: fetchedSettings.security?.passwordRequireSpecialChars || settings.security.passwordRequireSpecialChars,
            sessionTimeout: fetchedSettings.security?.sessionTimeout || settings.security.sessionTimeout,
            maxLoginAttempts: fetchedSettings.security?.maxLoginAttempts || settings.security.maxLoginAttempts,
            twoFactorEnabled: fetchedSettings.security?.twoFactorEnabled || settings.security.twoFactorEnabled
          },
          email: {
            smtpHost: fetchedSettings.email?.smtpHost || settings.email.smtpHost,
            smtpPort: fetchedSettings.email?.smtpPort || settings.email.smtpPort,
            smtpUser: fetchedSettings.email?.smtpUser || settings.email.smtpUser,
            smtpSecure: fetchedSettings.email?.smtpSecure || settings.email.smtpSecure
          }
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      console.error('Error details:', error.response?.data)
      // Keep the default settings if API call fails
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      console.log('Saving settings:', settings)
      const response = await adminService.updateSystemSettings(settings)
      console.log('Save response:', response.data)
      toast.success('Settings saved successfully!')
      // Refresh settings to get the latest data
      await fetchSettings()
    } catch (error) {
      console.error('Error saving settings:', error)
      console.error('Error details:', error.response?.data)
      const errorMessage = error.response?.data?.message || 'Error saving settings. Please try again.'
      toast(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        company: {
          name: 'Cloudspace',
          email: 'info@cloudspace.com',
          phone: '+1-555-0000',
          address: '123 Business Street, City, State 12345',
          website: 'https://cloudspace.com',
          logo: '/assets/logo.png'
        },
        system: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD',
          language: 'en',
          maintenanceMode: false
        },
        security: {
          passwordMinLength: 8,
          passwordRequireSpecialChars: true,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          twoFactorEnabled: false
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpSecure: false
        }
      })
    }
  }

  // Add safety check to ensure settings is properly initialized
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Ensure settings object is properly structured
  const safeSettings = {
    company: settings.company || {},
    system: settings.system || {},
    security: settings.security || {},
    email: settings.email || {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure system-wide settings and preferences</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.company.name || ''}
                onChange={(e) => updateSetting('company', 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.company.email || ''}
                onChange={(e) => updateSetting('company', 'email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.company.phone || ''}
                onChange={(e) => updateSetting('company', 'phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.company.website || ''}
                onChange={(e) => updateSetting('company', 'website', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.company.address || ''}
                onChange={(e) => updateSetting('company', 'address', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={safeSettings.system.timezone || 'UTC'}
                onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Format</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.system.dateFormat}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {...settings.system, dateFormat: e.target.value}
                })}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.system.currency}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {...settings.system, currency: e.target.value}
                })}
              >
                <option value="NGN">NGN - Nigerian Naira (₦)</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.system.language}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {...settings.system, language: e.target.value}
                })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="maintenance-mode"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={settings.system.maintenanceMode}
                onChange={(e) => setSettings({
                  ...settings,
                  system: {...settings.system, maintenanceMode: e.target.checked}
                })}
              />
              <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
                Maintenance Mode
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
              <input
                type="number"
                min="6"
                max="128"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.security.passwordMinLength}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {...settings.security, passwordMinLength: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="flex items-center">
              <input
                id="require-special-chars"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={settings.security.passwordRequireSpecialChars}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {...settings.security, passwordRequireSpecialChars: e.target.checked}
                })}
              />
              <label htmlFor="require-special-chars" className="ml-2 block text-sm text-gray-900">
                Require Special Characters in Passwords
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Session Timeout (seconds)</label>
              <input
                type="number"
                min="60"
                max="86400"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {...settings.security, sessionTimeout: parseInt(e.target.value)}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Login Attempts</label>
              <input
                type="number"
                min="1"
                max="20"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {...settings.security, maxLoginAttempts: parseInt(e.target.value)}
                })}
              />
            </div>
            <div className="flex items-center">
              <input
                id="two-factor"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={settings.security.twoFactorEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {...settings.security, twoFactorEnabled: e.target.checked}
                })}
              />
              <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Email Configuration</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.email.smtpHost}
                onChange={(e) => setSettings({
                  ...settings,
                  email: {...settings.email, smtpHost: e.target.value}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input
                type="number"
                min="1"
                max="65535"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.email.smtpPort}
                onChange={(e) => setSettings({
                  ...settings,
                  email: {...settings.email, smtpPort: parseInt(e.target.value)}
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SMTP Username</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={settings.email.smtpUser}
                onChange={(e) => setSettings({
                  ...settings,
                  email: {...settings.email, smtpUser: e.target.value}
                })}
              />
            </div>
            <div className="flex items-center">
              <input
                id="smtp-secure"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={settings.email.smtpSecure}
                onChange={(e) => setSettings({
                  ...settings,
                  email: {...settings.email, smtpSecure: e.target.checked}
                })}
              />
              <label htmlFor="smtp-secure" className="ml-2 block text-sm text-gray-900">
                Use Secure Connection (SSL/TLS)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleResetSettings}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default SystemSettings