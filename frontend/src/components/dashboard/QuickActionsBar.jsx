/**
 * QuickActionsBar Component
 * 
 * Displays role-specific quick action buttons for common tasks.
 * Supports navigation and modal actions with keyboard accessibility.
 * 
 * Requirements: 10.1, 10.6, 14.4
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/design-system/utils';
import Button from '@/design-system/components/Button';

/**
 * Quick Actions Bar Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.actions - Array of action objects
 * @param {string} props.role - User role for analytics
 * @param {Function} [props.onActionClick] - Optional callback for action clicks
 * @param {string} [props.className] - Additional CSS classes
 */
const QuickActionsBar = ({
  actions = [],
  role,
  onActionClick,
  className,
}) => {
  const navigate = useNavigate();

  /**
   * Handle action click
   */
  const handleActionClick = useCallback(
    (action) => {
      // Call optional callback for analytics/tracking
      if (onActionClick) {
        onActionClick(action);
      }

      // Handle navigation
      if (action.route) {
        navigate(action.route);
      }

      // Handle modal opening
      if (action.modal) {
        // Modal handling would be implemented here
        // For now, we'll just log it
        console.log('Open modal:', action.modal);
      }

      // Handle custom action
      if (action.onClick) {
        action.onClick();
      }
    },
    [navigate, onActionClick]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event, action) => {
      // Enter or Space to activate
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleActionClick(action);
      }
    },
    [handleActionClick]
  );

  /**
   * Render action icon
   */
  const renderIcon = (iconName) => {
    // Icon mapping - using simple SVG icons
    // In a real implementation, you'd use a proper icon library
    const icons = {
      'user-plus': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      'plus': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      'document': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'chart': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'settings': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };

    return icons[iconName] || icons['plus'];
  };

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('flex flex-wrap items-center gap-3', className)}
      role="toolbar"
      aria-label="Quick actions"
    >
      {actions.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="md"
          icon={renderIcon(action.icon)}
          iconPosition="left"
          onClick={() => handleActionClick(action)}
          onKeyDown={(e) => handleKeyDown(e, action)}
          aria-label={action.label}
          className="shadow-sm hover:shadow-md"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

QuickActionsBar.propTypes = {
  /** Array of action objects with id, label, icon, route/modal/onClick */
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      route: PropTypes.string,
      modal: PropTypes.string,
      onClick: PropTypes.func,
    })
  ).isRequired,
  /** User role for analytics */
  role: PropTypes.string.isRequired,
  /** Optional callback for action clicks */
  onActionClick: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default QuickActionsBar;
