/**
 * Modal Component
 * 
 * A dialog overlay component built on Radix UI Dialog primitive.
 * Supports multiple sizes, backdrop overlay, and keyboard interactions.
 * 
 * @example
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Modal Title"
 *   size="md"
 *   footer={<Button>Save</Button>}
 * >
 *   Modal content goes here
 * </Modal>
 */

import React from 'react';
import PropTypes from 'prop-types';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../utils';
import { X } from 'lucide-react';

const Modal = ({
  open = false,
  onClose,
  title,
  size = 'md',
  footer,
  closeOnOverlayClick = true,
  children,
  className,
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[calc(100vw-2rem)]',
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 z-[1000] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />

        {/* Content */}
        <Dialog.Content
          onPointerDownOutside={(e) => {
            if (!closeOnOverlayClick) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (!closeOnOverlayClick) {
              e.preventDefault();
            }
          }}
          className={cn(
            'fixed left-[50%] top-[50%] z-[1001] translate-x-[-50%] translate-y-[-50%]',
            'w-full bg-white rounded-xl shadow-lg',
            'max-h-[90vh] flex flex-direction-column',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
            <Dialog.Title className="text-h4 font-semibold text-neutral-900">
              {title}
            </Dialog.Title>
            <Dialog.Close
              className={cn(
                'rounded-md p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
              )}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

Modal.propTypes = {
  /** Whether the modal is open */
  open: PropTypes.bool.isRequired,
  /** Function to call when modal should close */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string.isRequired,
  /** Modal size */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Footer content (typically buttons) */
  footer: PropTypes.node,
  /** Whether clicking overlay closes the modal */
  closeOnOverlayClick: PropTypes.bool,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Modal;
