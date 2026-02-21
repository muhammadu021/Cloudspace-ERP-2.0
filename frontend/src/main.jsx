import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import './styles/theme.css'
import { store } from './store'
import { fixTokenStorage } from './utils/fixTokenStorage'
import { installDemoFetch } from './utils/installDemoFetch'
import { installMockInterceptor } from './mocks'
import { appConfig } from './config/appConfig'

// Fix any existing tokens that were JSON.stringify'd
fixTokenStorage()
installDemoFetch()

// Install mock API interceptor if enabled
installMockInterceptor()

if (typeof window !== 'undefined') {
  window.DEMO_MODE = appConfig.demoMode
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always consider data stale for debugging
      cacheTime: 0, // Disable cache for debugging
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2000,
              style: {
                background: '#ffffffff',
                color: '#000000ff',
              },
              success: {
                duration: 1000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)

// Register / cleanup Service Worker for PWA
if ('serviceWorker' in navigator) {
  if (window.DEMO_MODE) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister())
    })
  } else {
    window.addEventListener('load', () => {
      if (window.DEMO_MODE) return
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope)
        })
        .catch((error) => {
          console.log('❌ Service Worker registration failed:', error)
        })
    })
  }
}
