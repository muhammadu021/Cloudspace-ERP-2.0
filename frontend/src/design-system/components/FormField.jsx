/**
 * FormField Component
 * 
 * A comprehensive form field component supporting multiple input types.
 * Includes label, helper text, error handling, and accessibility features.
 * 
 * @example
 * <FormField
 *   type="text"
 *   label="Email"
 *   name="email"
 *   value={email}
 *   onChange={setEmail}
 *   required
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';

const FormField = React.forwardRef(({
  type = 'text',
  label,
  name,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  options = [],
  rows = 4,
  className,
  ...props
}, ref) => {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  // Base input styles
  const baseInputStyles = 'w-full px-3 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50';
  
  // Input state styles
  const inputStateStyles = error
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
    : 'border-neutral-300 hover:border-neutral-400';

  // Label component
  const Label = () => (
    <label
      htmlFor={fieldId}
      className="block text-sm font-medium text-neutral-700 mb-1"
    >
      {label}
      {required && <span className="text-error-500 ml-1">*</span>}
    </label>
  );

  // Helper text component
  const HelperText = () => {
    if (!helperText && !error) return null;
    
    return (
      <p
        id={error ? errorId : helperId}
        className={cn(
          'mt-1 text-sm',
          error ? 'text-error-600' : 'text-neutral-500'
        )}
      >
        {error || helperText}
      </p>
    );
  };

  // Render different input types
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(baseInputStyles, inputStateStyles, 'resize-vertical')}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            ref={ref}
            id={fieldId}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(baseInputStyles, inputStateStyles)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={typeof option === 'object' ? option.value : option}
                value={typeof option === 'object' ? option.value : option}
              >
                {typeof option === 'object' ? option.label : option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox.Root
              ref={ref}
              id={fieldId}
              name={name}
              checked={value}
              onCheckedChange={onChange}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              className={cn(
                'w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                error ? 'border-error-500' : 'border-neutral-300',
                value ? 'bg-primary-500 border-primary-500' : 'bg-white'
              )}
              {...props}
            >
              <Checkbox.Indicator>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                    fill="white"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Checkbox.Indicator>
            </Checkbox.Root>
            <label
              htmlFor={fieldId}
              className="text-sm text-neutral-700 cursor-pointer select-none"
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup.Root
            ref={ref}
            name={name}
            value={value}
            onValueChange={onChange}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className="flex flex-col gap-2"
          >
            {options.map((option) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const optionId = `${fieldId}-${optionValue}`;

              return (
                <div key={optionValue} className="flex items-center gap-2">
                  <RadioGroup.Item
                    id={optionId}
                    value={optionValue}
                    className={cn(
                      'w-5 h-5 rounded-full border-2 transition-colors duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      error ? 'border-error-500' : 'border-neutral-300'
                    )}
                  >
                    <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2.5 after:h-2.5 after:rounded-full after:bg-primary-500" />
                  </RadioGroup.Item>
                  <label
                    htmlFor={optionId}
                    className="text-sm text-neutral-700 cursor-pointer select-none"
                  >
                    {optionLabel}
                  </label>
                </div>
              );
            })}
          </RadioGroup.Root>
        );

      case 'switch':
        return (
          <div className="flex items-center gap-2">
            <Switch.Root
              ref={ref}
              id={fieldId}
              name={name}
              checked={value}
              onCheckedChange={onChange}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              className={cn(
                'w-11 h-6 rounded-full transition-colors duration-150 relative',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                value ? 'bg-primary-500' : 'bg-neutral-300'
              )}
              {...props}
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-150 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
            <label
              htmlFor={fieldId}
              className="text-sm text-neutral-700 cursor-pointer select-none"
            >
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          </div>
        );

      default:
        // text, number, email, password, date, etc.
        return (
          <input
            ref={ref}
            type={type}
            id={fieldId}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(baseInputStyles, inputStateStyles)}
            {...props}
          />
        );
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && !['checkbox', 'switch'].includes(type) && <Label />}
      {renderInput()}
      <HelperText />
    </div>
  );
});

FormField.displayName = 'FormField';

FormField.propTypes = {
  /** Input type */
  type: PropTypes.oneOf([
    'text',
    'number',
    'email',
    'password',
    'textarea',
    'select',
    'date',
    'datetime-local',
    'time',
    'tel',
    'url',
    'checkbox',
    'radio',
    'switch',
  ]),
  /** Field label */
  label: PropTypes.string.isRequired,
  /** Field name */
  name: PropTypes.string.isRequired,
  /** Field value */
  value: PropTypes.any,
  /** Change handler */
  onChange: PropTypes.func.isRequired,
  /** Error message */
  error: PropTypes.string,
  /** Helper text */
  helperText: PropTypes.string,
  /** Required field */
  required: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Options for select/radio (array of strings or {value, label} objects) */
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  /** Rows for textarea */
  rows: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default FormField;
