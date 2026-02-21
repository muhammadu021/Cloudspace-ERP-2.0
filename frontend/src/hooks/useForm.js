import { useState, useCallback } from 'react'
import { validateForm, validateField } from '@/utils/validation'

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }, [errors])

  const setFieldValue = setValue

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }, [])

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }))
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value
    setValue(name, fieldValue)
  }, [setValue])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setFieldTouched(name, true)

    // Validate field on blur if validation schema exists
    if (validationSchema[name]) {
      const fieldError = validateField(values[name], validationSchema[name])
      if (fieldError !== true) {
        setFieldError(name, fieldError)
      }
    }
  }, [values, validationSchema, setFieldTouched, setFieldError])

  const validateForm = useCallback(() => {
    const { isValid, errors: formErrors } = validateForm(values, validationSchema)
    setErrors(formErrors)
    return isValid
  }, [values, validationSchema])

  const validateField = useCallback((name) => {
    if (validationSchema[name]) {
      const fieldError = validateField(values[name], validationSchema[name])
      if (fieldError !== true) {
        setFieldError(name, fieldError)
        return false
      } else {
        setFieldError(name, undefined)
        return true
      }
    }
    return true
  }, [values, validationSchema, setFieldError])

  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e) {
        e.preventDefault()
      }

      setIsSubmitting(true)

      // Mark all fields as touched
      const touchedFields = {}
      Object.keys(validationSchema).forEach(field => {
        touchedFields[field] = true
      })
      setTouched(touchedFields)

      // Validate form
      const isValid = validateForm()

      if (isValid) {
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
        }
      }

      setIsSubmitting(false)
    }
  }, [values, validationSchema, validateForm])

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFormValues = useCallback((newValues) => {
    setValues(newValues)
  }, [])

  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors)
  }, [])

  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && errors[name],
      'aria-invalid': touched[name] && !!errors[name]
    }
  }, [values, errors, touched, handleChange, handleBlur])

  const getFieldError = useCallback((name) => {
    return touched[name] && errors[name]
  }, [touched, errors])

  const isFieldValid = useCallback((name) => {
    return !getFieldError(name)
  }, [getFieldError])

  const hasErrors = Object.keys(errors).some(key => errors[key])
  const isValid = !hasErrors && Object.keys(touched).length > 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    setValue: setFieldValue,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues: setFormValues,
    setErrors: setFormErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    validateField,
    reset,
    getFieldProps,
    getFieldError,
    isFieldValid
  }
}