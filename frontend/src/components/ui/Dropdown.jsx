import React, { useState, useRef, useEffect } from 'react'

// Dropdown Component with proper functionality
export const Dropdown = ({ trigger, children, align = 'right', className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} {...props}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none ${alignClasses[align]} ${className}`}>
          <div className="py-1" role="menu">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) {
                      child.props.onClick(e)
                    }
                    setIsOpen(false)
                  }
                })
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({ children, className = '', onClick, disabled = false, ...props }) => {
  const itemClasses = `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer w-full text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`
  
  return (
    <button
      type="button"
      className={itemClasses}
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export const DropdownSeparator = ({ className = '', ...props }) => (
  <div className={`border-t border-gray-100 my-1 ${className}`} {...props} />
)

export const DropdownLabel = ({ children, className = '', ...props }) => (
  <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </div>
)

// Re-export from main UI components
export { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './index.jsx'

// Default export
export default Dropdown