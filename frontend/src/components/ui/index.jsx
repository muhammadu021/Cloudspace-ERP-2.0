// Simple UI components for Leave Management
import React from 'react'

// Card Components
export const Card = ({ children, className = '', ...props }) => {
  const cardClasses = `bg-white rounded-lg shadow ${className}`
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '', ...props }) => {
  const headerClasses = `px-6 py-4 border-b border-gray-200 ${className}`
  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className = '', ...props }) => {
  const descriptionClasses = `text-sm text-gray-600 ${className}`
  return (
    <p className={descriptionClasses} {...props}>
      {children}
    </p>
  )
}

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
)

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Badge Component
export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}

// Tabs Components
export const Tabs = ({ children, value, onValueChange, className = '', ...props }) => (
  <div className={className} {...props}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab: value, onTabChange: onValueChange })
    )}
  </div>
)

export const TabsList = ({ children, activeTab, onTabChange, className = '', ...props }) => (
  <div className={`flex space-x-1 bg-gray-100 p-1 rounded-lg ${className}`} {...props}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, onTabChange })
    )}
  </div>
)

export const TabsTrigger = ({ children, value, activeTab, onTabChange, className = '', ...props }) => (
  <button
    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === value
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'
    } ${className}`}
    onClick={() => onTabChange(value)}
    {...props}
  >
    {children}
  </button>
)

export const TabsContent = ({ children, value, activeTab, className = '', ...props }) => {
  if (activeTab !== value) return null
  
  return (
    <div className={`mt-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

// Dialog Components
export const Dialog = ({ children, open, onOpenChange, ...props }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto" style={{ maxHeight: '90vh' }}>
        {children}
      </div>
    </div>
  )
}

export const DialogContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
)

export const DialogHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
)

export const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h2>
)

export const DialogTrigger = ({ children, ...props }) => (
  <div {...props}>
    {children}
  </div>
)

// Table Components
export const Table = ({ children, className = '', ...props }) => (
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </table>
  </div>
)

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-gray-50 ${className}`} {...props}>
    {children}
  </thead>
)

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
    {children}
  </tbody>
)

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-gray-50 ${className}`} {...props}>
    {children}
  </tr>
)

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
)

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} {...props}>
    {children}
  </td>
)

// Form Components
export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
    {...props}
  />
)

export const Label = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
    {children}
  </label>
)

export const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
    {...props}
  />
)

// Select Components
export const Select = ({ children, value, onValueChange, ...props }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
)

export const SelectContent = ({ children }) => children
export const SelectItem = ({ children, value, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
)
export const SelectTrigger = ({ children }) => children
export const SelectValue = ({ placeholder }) => <option value="">{placeholder}</option>

// Alert Components
export const Alert = ({ children, className = '', ...props }) => (
  <div className={`p-4 rounded-lg border ${className}`} {...props}>
    {children}
  </div>
)

export const AlertDescription = ({ children, className = '', ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
)

// Progress Component
export const Progress = ({ value = 0, className = '', ...props }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`} {...props}>
    <div
      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

// Switch Component
export const Switch = ({ checked, onCheckedChange, className = '', ...props }) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
      checked ? 'bg-primary-600' : 'bg-gray-200'
    } ${className}`}
    onClick={() => onCheckedChange(!checked)}
    {...props}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

// Checkbox Component
export const Checkbox = ({ checked, onCheckedChange, className = '', id, ...props }) => {
  const checkboxClasses = `h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${className}`
  
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={checkboxClasses}
      {...props}
    />
  )
}

// Avatar Component
export const Avatar = ({ src, alt, size = 'md', className = '', fallback, children, ...props }) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl'
  }
  
  const avatarClasses = `relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden ${sizeClasses[size]} ${className}`
  
  return (
    <div className={avatarClasses} {...props}>
      {children || (
        src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center">
            {fallback || (alt ? alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?')}
          </div>
        )
      )}
    </div>
  )
}

// Avatar sub-components for more flexible usage
export const AvatarImage = ({ src, alt, className = '', ...props }) => {
  return (
    <img
      src={src}
      alt={alt || 'Avatar'}
      className={`w-full h-full object-cover ${className}`}
      {...props}
    />
  )
}

export const AvatarFallback = ({ children, className = '', ...props }) => {
  return (
    <div className={`w-full h-full bg-primary-100 text-primary-700 font-medium flex items-center justify-center ${className}`} {...props}>
      {children}
    </div>
  )
}

// DropdownMenu Components
export const DropdownMenu = ({ children, ...props }) => {
  return (
    <div className="relative inline-block text-left" {...props}>
      {children}
    </div>
  )
}

export const DropdownMenuTrigger = ({ children, asChild = false, ...props }) => {
  if (asChild) {
    return React.cloneElement(children, props)
  }
  return (
    <button
      type="button"
      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      {...props}
    >
      {children}
    </button>
  )
}

export const DropdownMenuContent = ({ children, className = '', align = 'right', ...props }) => {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }
  
  const contentClasses = `absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${alignClasses[align]} ${className}`
  
  return (
    <div className={contentClasses} {...props}>
      <div className="py-1" role="menu">
        {children}
      </div>
    </div>
  )
}

export const DropdownMenuItem = ({ children, className = '', onClick, disabled = false, ...props }) => {
  const itemClasses = `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`
  
  return (
    <div
      className={itemClasses}
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export const DropdownMenuSeparator = ({ className = '', ...props }) => (
  <div className={`border-t border-gray-100 my-1 ${className}`} {...props} />
)

export const DropdownMenuLabel = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </div>
)

// Separator Component
export const Separator = ({ className = '', ...props }) => (
  <hr className={`border-gray-200 ${className}`} {...props} />
)