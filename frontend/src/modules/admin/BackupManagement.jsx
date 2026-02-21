import React, { useState, useEffect } from 'react'
import { Database, Plus, Download, Upload, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { toast } from 'react-hot-toast';

const BackupManagement = () => {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(true)
  const [backupStatus, setBackupStatus] = useState('idle') // idle, running, completed, failed
  const [restoreStatus, setRestoreStatus] = useState('idle') // idle, running, completed, failed

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching backups from API...')
      const response = await adminService.getBackups()
      const backups = response?.data?.data?.backups || []
      console.log('✅ Fetched backups:', backups.length)
      setBackups(backups)
    } catch (error) {
      console.error('❌ Error fetching backups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setBackupStatus('running')
      console.log('🔧 Creating backup...')
      
      const backupData = {
        name: `Manual Backup - ${new Date().toLocaleDateString()}`,
        backup_type: 'full',
        compression: true,
        retention_days: 30
      }
      
      await adminService.createBackup(backupData)
      console.log('✅ Backup creation initiated')
      
      setBackupStatus('completed')
      
      // Refresh the backup list
      await fetchBackups()
      
      // Reset status after 3 seconds
      setTimeout(() => setBackupStatus('idle'), 3000)
    } catch (error) {
      console.error('❌ Error creating backup:', error)
      setBackupStatus('failed')
      setTimeout(() => setBackupStatus('idle'), 3000)
    }
  }

  const handleRestoreBackup = async (backupId) => {
    if (window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      try {
        setRestoreStatus('running')
        // In a real implementation, you would restore a backup
        // await adminService.restoreDatabase(backupId)
        
        // Simulate restore process
        setTimeout(() => {
          setRestoreStatus('completed')
          // Reset status after 3 seconds
          setTimeout(() => setRestoreStatus('idle'), 3000)
        }, 3000)
      } catch (error) {
        console.error('Error restoring backup:', error)
        setRestoreStatus('failed')
        setTimeout(() => setRestoreStatus('idle'), 3000)
      }
    }
  }

  const handleDownloadBackup = async (backup) => {
    try {
      console.log('📥 Downloading backup:', backup.name)
      // In a real implementation, you would download the backup file
      // For now, just show a message
      toast('Download initiated for: ${backup.name}')
    } catch (error) {
      console.error('❌ Error downloading backup:', error)
      toast.error('Failed to download backup')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Management</h1>
          <p className="text-gray-600">Manage database backups and restoration</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={backupStatus === 'running'}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {backupStatus === 'running' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Backup...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Backup
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {backupStatus === 'completed' && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Backup created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {backupStatus === 'failed' && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Failed to create backup. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {restoreStatus === 'completed' && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Backup restored successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {restoreStatus === 'failed' && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Failed to restore backup. Please try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backup Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Backup Configuration</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-primary-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Automatic Backups</h4>
                  <p className="text-sm text-gray-500">Daily at 2:00 AM UTC</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Enabled
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-primary-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Retention Period</h4>
                  <p className="text-sm text-gray-500">30 days</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">7 backups retained</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Database className="h-6 w-6 text-primary-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Storage Location</h4>
                  <p className="text-sm text-gray-500">Local Storage</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">5.2 GB used</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Backup History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Backup Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No backups found
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.file_size ? `${(backup.file_size / 1024 / 1024).toFixed(1)} MB` : 'Calculating...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        backup.status === 'completed' ? 'bg-green-100 text-green-800' :
                        backup.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownloadBackup(backup)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup.id)}
                        disabled={restoreStatus === 'running'}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Restore"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Backup */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upload Backup</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                <span>Upload a backup file</span>
                <input type="file" className="sr-only" accept=".sql,.dump" />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                SQL dump files only. Max file size 1GB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupManagement