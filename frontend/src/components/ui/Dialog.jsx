import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

const DialogContext = createContext();

const Dialog = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({ asChild, children, ...props }) => {
  const context = useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        children.props.onClick?.(e);
        context?.onOpenChange(true);
      }
    });
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        context?.onOpenChange(true);
      }}
    >
      {children}
    </button>
  );
};

const DialogContent = ({ className, children, ...props }) => {
  const context = useContext(DialogContext);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        context?.onOpenChange(false);
      }
    };

    if (context?.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [context?.isOpen]);

  if (!context?.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => context?.onOpenChange(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          'relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg',
          className
        )}
        {...props}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={() => context?.onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }) => (
  <p
    className={cn('text-sm text-gray-600', className)}
    {...props}
  />
);

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };