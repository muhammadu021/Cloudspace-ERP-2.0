import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

// Date formatting utilities
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return format(dateObj, formatString)
}

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return ''
  
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

// Currency formatting
export const formatCurrency = (amount, currency = 'NGN', locale = 'en-NG') => {
  if (amount === null || amount === undefined) return ''
  
  // For NGN, use custom formatting with Naira symbol
  if (currency === 'NGN') {
    const formatted = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    return `₦${formatted}`
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Number formatting
export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return ''
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
  
  return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number)
}

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return ''
  
  return `${(value * 100).toFixed(decimals)}%`
}

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Text formatting
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ')
}

export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last
}

// Status formatting
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    pending: 'text-yellow-600 bg-yellow-100',
    approved: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    completed: 'text-primary bg-blue-100',
    in_progress: 'text-purple-600 bg-purple-100',
    on_hold: 'text-orange-600 bg-orange-100',
    cancelled: 'text-red-600 bg-red-100',
    draft: 'text-gray-600 bg-gray-100'
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}

export const getPriorityColor = (priority) => {
  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  }
  
  return priorityColors[priority] || 'text-gray-600 bg-gray-100'
}

// Validation helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })
}

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value)
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params) {
    result[key] = value
  }
  
  return result
}