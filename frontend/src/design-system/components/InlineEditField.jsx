/**
 * InlineEditField Component
 * 
 * A reusable inline editing component that supports click-to-edit functionality
 * with auto-save on blur, optimistic updates, and inline validation.
 * 
 * Features:
 * - Click to edit mode
 * - Auto-save on blur or Enter key
 * - Cancel on Escape key
 * - Optimistic updates with rollback on error
 * - Inline validation feedback
 * - Loading states during save operations
 * 
 * @example
 * <InlineEditField
 *   value={project.name}
 *   onSave={(value) => updateProject({ id: project.id, name: value })}
 *   type="text"
 *   label="Project Name"
 *   validation={(value) => value.length > 0 ? null : 'Name is required'}
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import FormField from './FormField';
import Button from './Button';

const InlineEditField = ({
  value,
  onSave,
  type = 'text',
  label,
  placeholder,
  validation,
  options = [],
  rows = 3,
  className,
  displayFormatter,
  multiline = false,
  required = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select text for easier editing
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editValue]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validate
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Check if value changed
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    // Save
    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
      // Rollback on error
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = displayFormatter ? displayFormatter(value) : value;

  if (!isEditing) {
    return (
      <div className={cn('group', className)}>
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <button
          onClick={handleEdit}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md border border-transparent',
            'hover:border-neutral-300 hover:bg-neutral-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'transition-colors duration-150',
            'flex items-center justify-between gap-2',
            'min-h-[44px]' // Touch-friendly minimum height
          )}
          aria-label={`Edit ${label || 'field'}`}
        >
          <span className={cn(
            'flex-1',
            !displayValue && 'text-neutral-400 italic'
          )}>
            {displayValue || placeholder || 'Click to edit'}
          </span>
          <Edit2 className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <FormField
        ref={inputRef}
        type={multiline ? 'textarea' : type}
        label={label}
        name="inline-edit"
        value={editValue}
        onChange={setEditValue}
        error={error}
        placeholder={placeholder}
        required={required}
        disabled={isSaving}
        options={options}
        rows={rows}
        onKeyDown={handleKeyDown}
      />
      
      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-[44px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Save
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSaving}
          className="min-h-[44px]"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

InlineEditField.propTypes = {
  /** Current value */
  value: PropTypes.any,
  /** Save handler - should return a promise */
  onSave: PropTypes.func.isRequired,
  /** Input type */
  type: PropTypes.oneOf(['text', 'number', 'email', 'date', 'select', 'textarea']),
  /** Field label */
  label: PropTypes.string,
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Validation function - returns error message or null */
  validation: PropTypes.func,
  /** Options for select type */
  options: PropTypes.array,
  /** Rows for textarea */
  rows: PropTypes.number,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Function to format display value */
  displayFormatter: PropTypes.func,
  /** Enable multiline editing */
  multiline: PropTypes.bool,
  /** Required field */
  required: PropTypes.bool,
};

export default InlineEditField;
