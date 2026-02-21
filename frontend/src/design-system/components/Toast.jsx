/**
 * Toast Component
 * 
 * A toast notification system built on Radix UI Toast primitive.
 * Supports auto-dismiss, action buttons, and multiple types.
 * 
 * @example
 * // Provider setup (wrap your app)
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // Using the hook
 * const { showToast } = useToast();
 * showToast({
 *   type: 'success',
 *   message: 'Changes saved successfully',
 *   duration: 3000,
 *   action: { label: 'Undo', onClick: handleUndo }
 * });
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '../utils';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export const ToastProvider = ({ children, swipeDirection = 'right' }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type: toast.type || 'info',
      message: toast.message,
      duration: toast.duration || 3000,
      action: toast.action,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      <ToastPrimitive.Provider swipeDirection={swipeDirection}>
        {children}
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 right-0 flex flex-col gap-2 w-full max-w-md p-6 z-[2000] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
  swipeDirection: PropTypes.oneOf(['right', 'left', 'up', 'down']),
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Individual Toast Item Component
const ToastItem = ({ id, type, message, duration, action, onDismiss }) => {
  // Type configurations
  const typeConfig = {
    info: {
      icon: Info,
      containerClass: 'bg-info-50 border-info-200',
      iconClass: 'text-info-500',
      textClass: 'text-info-900',
    },
    success: {
      icon: CheckCircle,
      containerClass: 'bg-success-50 border-success-200',
      iconClass: 'text-success-500',
      textClass: 'text-success-900',
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'bg-warning-50 border-warning-200',
      iconClass: 'text-warning-500',
      textClass: 'text-warning-900',
    },
    error: {
      icon: XCircle,
      containerClass: 'bg-error-50 border-error-200',
      iconClass: 'text-error-500',
      textClass: 'text-error-900',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <ToastPrimitive.Root
      duration={duration}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-lg',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[swipe=end]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        config.containerClass
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0" aria-hidden="true">
        <Icon className={cn('h-5 w-5', config.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Description 
          className={cn('text-sm font-medium', config.textClass)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </ToastPrimitive.Description>
      </div>

      {/* Action button */}
      {action && (
        <ToastPrimitive.Action
          altText={action.label}
          onClick={action.onClick}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            type === 'info' && 'text-info-700 hover:bg-info-100 focus:ring-info-500',
            type === 'success' && 'text-success-700 hover:bg-success-100 focus:ring-success-500',
            type === 'warning' && 'text-warning-700 hover:bg-warning-100 focus:ring-warning-500',
            type === 'error' && 'text-error-700 hover:bg-error-100 focus:ring-error-500'
          )}
        >
          {action.label}
        </ToastPrimitive.Action>
      )}

      {/* Close button */}
      <ToastPrimitive.Close
        className={cn(
          'flex-shrink-0 rounded-md p-1 transition-colors duration-150',
          'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
          type === 'info' && 'focus:ring-info-500',
          type === 'success' && 'focus:ring-success-500',
          type === 'warning' && 'focus:ring-warning-500',
          type === 'error' && 'focus:ring-error-500'
        )}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

ToastItem.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']).isRequired,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  onDismiss: PropTypes.func.isRequired,
};
