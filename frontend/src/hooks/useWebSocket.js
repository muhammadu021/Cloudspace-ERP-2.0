import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null)
  const [lastMessage, setLastMessage] = useState(null)
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING)
  const [connectionError, setConnectionError] = useState(null)
  const { user } = useAuth()
  
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = options.maxReconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = useCallback(() => {
    if (!user || !user.token) return

    try {
      const wsUrl = `${url}?token=${user.token}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setReadyState(WebSocket.OPEN)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
        
        if (options.onOpen) {
          options.onOpen()
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          
          if (options.onMessage) {
            options.onMessage(data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setReadyState(WebSocket.CLOSED)
        setSocket(null)
        
        if (options.onClose) {
          options.onClose(event)
        }

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError(error)
        
        if (options.onError) {
          options.onError(error)
        }
      }

      setSocket(ws)
      setReadyState(WebSocket.CONNECTING)
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      setConnectionError(error)
    }
  }, [url, user, options, maxReconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, 'Manual disconnect')
    }
  }, [socket])

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(messageString)
      return true
    }
    return false
  }, [socket])

  const sendJsonMessage = useCallback((message) => {
    return sendMessage(JSON.stringify(message))
  }, [sendMessage])

  useEffect(() => {
    if (user && user.token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    socket,
    lastMessage,
    readyState,
    connectionError,
    sendMessage,
    sendJsonMessage,
    connect,
    disconnect,
    isConnecting: readyState === WebSocket.CONNECTING,
    isOpen: readyState === WebSocket.OPEN,
    isClosing: readyState === WebSocket.CLOSING,
    isClosed: readyState === WebSocket.CLOSED
  }
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const { user } = useAuth()

  const { lastMessage, sendJsonMessage, isOpen } = useWebSocket(
    `ws://localhost:5000/ws/notifications`,
    {
      onMessage: (data) => {
        if (data.type === 'notification') {
          setNotifications(prev => [data.payload, ...prev])
        }
      },
      onOpen: () => {
        console.log('Notifications WebSocket connected')
      },
      onError: (error) => {
        console.error('Notifications WebSocket error:', error)
      }
    }
  )

  const markAsRead = useCallback((notificationId) => {
    if (isOpen) {
      sendJsonMessage({
        type: 'mark_read',
        notificationId
      })
    }
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )
    )
  }, [isOpen, sendJsonMessage])

  const markAllAsRead = useCallback(() => {
    if (isOpen) {
      sendJsonMessage({
        type: 'mark_all_read'
      })
    }
    
    setNotifications(prev => 
      prev.map(notification => ({
        ...notification,
        read_at: notification.read_at || new Date().toISOString()
      }))
    )
  }, [isOpen, sendJsonMessage])

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  const unreadCount = notifications.filter(n => !n.read_at).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isConnected: isOpen
  }
}