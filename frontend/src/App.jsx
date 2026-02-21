import React from 'react'
import { Routes, Route, useRoutes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { PageHeaderProvider } from '@/contexts/PageHeaderContext'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import ErrorBoundary from '@/components/ErrorBoundary'
import { routes } from '@/router/routes'
import '@/styles/print.css'

/**
 * Main App component with router configuration
 * Uses React Router v6 with nested routes and lazy loading for optimal performance
 */
function App() {
  // Generate route elements from configuration
  const routeElements = useRoutes(routes);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ModuleAccessProvider>
            <WebSocketProvider>
              <PageHeaderProvider>
                <PWAInstallPrompt />
                {routeElements}
              </PageHeaderProvider>
            </WebSocketProvider>
          </ModuleAccessProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App