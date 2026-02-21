/**
 * DashboardTypeSelector Component
 * 
 * Dropdown selector for System Administrators to switch between dashboard types.
 * Only visible to System Administrator users.
 * 
 * Requirements: 2.1, 2.2, 2.3, 14.1, 14.2
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/design-system/utils';
import { getAvailableDashboardTypes } from '@/utils/roleMapping';
import { announceToScreenReader } from '@/utils/accessibility';

/**
 * Dashboard Type Selector Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedType - Currently selected dashboard type
 * @param {Function} props.onChange - Callback when dashboard type changes
 * @param {boolean} [props.disabled] - Disable the selector
 * @param {string} [props.className] - Additional CSS classes
 */
const DashboardTypeSelector = ({
  selectedType,
  onChange,
  disabled = false,
  className,
}) => {
  const dashboardTypes = getAvailableDashboardTypes();

  /**
   * Handle dashboard type change
   */
  const handleChange = useCallback(
    (event) => {
      const newType = event.target.value;
      onChange(newType);
      
      // Announce change to screen readers
      const selectedOption = dashboardTypes.find(type => type.value === newType);
      if (selectedOption) {
        announceToScreenReader(`Dashboard changed to ${selectedOption.label}`);
      }
    },
    [onChange, dashboardTypes]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event) => {
      // Allow Escape to blur the select
      if (event.key === 'Escape') {
        event.target.blur();
      }
    },
    []
  );

  return (
    <select
      id="dashboard-type-selector"
      value={selectedType || ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Select dashboard type to view"
      className={cn(
        'px-2 py-1 border rounded-md transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50',
        'border-neutral-300 hover:border-neutral-400',
        'text-xs font-medium text-neutral-900',
        'min-w-[140px]',
        className
      )}
    >
      {dashboardTypes.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label.replace(' Dashboard', '')}
        </option>
      ))}
    </select>
  );
};

DashboardTypeSelector.propTypes = {
  /** Currently selected dashboard type */
  selectedType: PropTypes.string,
  /** Callback when dashboard type changes */
  onChange: PropTypes.func.isRequired,
  /** Disable the selector */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default DashboardTypeSelector;
