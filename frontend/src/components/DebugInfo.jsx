import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { storage } from '@/utils/storage'

const DebugInfo = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const token = storage.getItem('token')
  const storedUser = storage.getItem('user')
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Auth Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>User ID: {user?.id || 'None'}</div>
        <div>User Name: {user?.first_name || 'None'}</div>
        <div>Token Exists: {token ? 'Yes' : 'No'}</div>
        <div>Token Length: {token?.length || 0}</div>
        <div>Stored User: {storedUser ? 'Yes' : 'No'}</div>
        <div>Current URL: {window.location.pathname}</div>
      </div>
    </div>
  )
}

export default DebugInfo