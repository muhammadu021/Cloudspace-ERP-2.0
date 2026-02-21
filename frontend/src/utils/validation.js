import { REGEX_PATTERNS, ERROR_MESSAGES } from './constants'

// Basic validation functions
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const isEmail = (email) => {
  if (!email) return false
  return REGEX_PATTERNS.EMAIL.test(email)
}

export const isPhone = (phone) => {
  if (!phone) return false
  return REGEX_PATTERNS.PHONE.test(phone.replace(/\s/g, ''))
}

export const isStrongPassword = (password) => {
  if (!password) return false
  return REGEX_PATTERNS.PASSWORD.test(password)
}

export const isNumeric = (value) => {
  if (!value) return false
  return REGEX_PATTERNS.NUMERIC.test(value)
}

export const isDecimal = (value) => {
  if (!value) return false
  return REGEX_PATTERNS.DECIMAL.test(value)
}

export const isAlphanumeric = (value) => {
  if (!value) return false
  return REGEX_PATTERNS.ALPHANUMERIC.test(value)
}

export const minLength = (value, min) => {
  if (!value) return false
  return value.length >= min
}

export const maxLength = (value, max) => {
  if (!value) return true
  return value.length <= max
}

export const isInRange = (value, min, max) => {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  return num >= min && num <= max
}

export const isValidDate = (date) => {
  if (!date) return false
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj)
}

export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) > new Date()
}

export const isPastDate = (date) => {
  if (!isValidDate(date)) return false
  return new Date(date) < new Date()
}

// Validation rule builders
export const createValidationRules = (rules) => {
  return (value) => {
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }
}

export const required = (message = ERROR_MESSAGES.REQUIRED_FIELD) => {
  return (value) => isRequired(value) || message
}

export const email = (message = ERROR_MESSAGES.INVALID_EMAIL) => {
  return (value) => !value || isEmail(value) || message
}

export const phone = (message = ERROR_MESSAGES.INVALID_PHONE) => {
  return (value) => !value || isPhone(value) || message
}

export const strongPassword = (message = ERROR_MESSAGES.PASSWORD_TOO_SHORT) => {
  return (value) => !value || isStrongPassword(value) || message
}

export const min = (minValue, message) => {
  return (value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num >= minValue || message || `Value must be at least ${minValue}`
  }
}

export const max = (maxValue, message) => {
  return (value) => {
    if (!value) return true
    const num = parseFloat(value)
    return !isNaN(num) && num <= maxValue || message || `Value must be at most ${maxValue}`
  }
}

export const minLen = (minLength, message) => {
  return (value) => !value || value.length >= minLength || message || `Must be at least ${minLength} characters`
}

export const maxLen = (maxLength, message) => {
  return (value) => !value || value.length <= maxLength || message || `Must be at most ${maxLength} characters`
}

export const pattern = (regex, message) => {
  return (value) => !value || regex.test(value) || message || 'Invalid format'
}

export const matches = (otherValue, message = ERROR_MESSAGES.PASSWORDS_DONT_MATCH) => {
  return (value) => value === otherValue || message
}

// Form validation helpers
export const validateForm = (data, validationSchema) => {
  const errors = {}
  let isValid = true

  Object.keys(validationSchema).forEach(field => {
    const rules = validationSchema[field]
    const value = data[field]
    
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        errors[field] = result
        isValid = false
        break
      }
    }
  })

  return { isValid, errors }
}

export const validateField = (value, rules) => {
  for (const rule of rules) {
    const result = rule(value)
    if (result !== true) {
      return result
    }
  }
  return true
}

// Common validation schemas
export const loginValidationSchema = {
  email: [required(), email()],
  password: [required()]
}

export const registerValidationSchema = {
  firstName: [required(), minLen(2), maxLen(50)],
  lastName: [required(), minLen(2), maxLen(50)],
  email: [required(), email()],
  password: [required(), strongPassword()],
  confirmPassword: [required()]
}

export const profileValidationSchema = {
  firstName: [required(), minLen(2), maxLen(50)],
  lastName: [required(), minLen(2), maxLen(50)],
  email: [required(), email()],
  phone: [phone()]
}

export const changePasswordValidationSchema = {
  currentPassword: [required()],
  newPassword: [required(), strongPassword()],
  confirmPassword: [required()]
}

export const projectValidationSchema = {
  name: [required(), minLen(3), maxLen(100)],
  description: [maxLen(500)],
  startDate: [required()],
  endDate: [required()],
  budget: [min(0)]
}

export const taskValidationSchema = {
  title: [required(), minLen(3), maxLen(100)],
  description: [maxLen(500)],
  dueDate: [required()],
  priority: [required()],
  assignedTo: [required()]
}

export const employeeValidationSchema = {
  firstName: [required(), minLen(2), maxLen(50)],
  lastName: [required(), minLen(2), maxLen(50)],
  email: [required(), email()],
  phone: [phone()],
  position: [required(), minLen(2), maxLen(100)],
  departmentId: [required()],
  hireDate: [required()],
  salary: [min(0)]
}

export const inventoryValidationSchema = {
  name: [required(), minLen(2), maxLen(100)],
  sku: [required(), minLen(2), maxLen(50)],
  category: [required()],
  unitCost: [required(), min(0)],
  currentQuantity: [required(), min(0)],
  minimumQuantity: [required(), min(0)]
}

export const leaveRequestValidationSchema = {
  leaveType: [required()],
  startDate: [required()],
  endDate: [required()],
  reason: [required(), minLen(10), maxLen(500)]
}

// File validation
export const validateFile = (file, maxSize, allowedTypes) => {
  if (!file) return ERROR_MESSAGES.REQUIRED_FIELD

  if (file.size > maxSize) {
    return ERROR_MESSAGES.FILE_TOO_LARGE
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE
  }

  return true
}

// Custom validation helpers
export const createCustomValidator = (validatorFn, message) => {
  return (value) => validatorFn(value) || message
}

export const conditionalValidation = (condition, rules) => {
  return (value, formData) => {
    if (!condition(formData)) return true
    
    for (const rule of rules) {
      const result = rule(value)
      if (result !== true) {
        return result
      }
    }
    return true
  }
}