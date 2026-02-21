/**
 * Feedback Components Usage Examples
 * 
 * This file demonstrates how to use Modal, Alert, Toast, and Badge components.
 */

import React, { useState } from 'react';
import { Modal, Alert, Badge, Button, ToastProvider, useToast } from '../components';

// Toast Example Component (must be inside ToastProvider)
const ToastExample = () => {
  const { showToast } = useToast();

  const handleShowInfoToast = () => {
    showToast({
      type: 'info',
      message: 'This is an informational message',
      duration: 3000,
    });
  };

  const handleShowSuccessToast = () => {
    showToast({
      type: 'success',
      message: 'Changes saved successfully!',
      duration: 3000,
    });
  };

  const handleShowWarningToast = () => {
    showToast({
      type: 'warning',
      message: 'Please review your changes',
      duration: 4000,
    });
  };

  const handleShowErrorToast = () => {
    showToast({
      type: 'error',
      message: 'Failed to save changes',
      duration: 5000,
    });
  };

  const handleShowToastWithAction = () => {
    showToast({
      type: 'success',
      message: 'Item deleted successfully',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-h3 font-semibold mb-4">Toast Notifications</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleShowInfoToast}>Show Info Toast</Button>
        <Button onClick={handleShowSuccessToast} variant="primary">
          Show Success Toast
        </Button>
        <Button onClick={handleShowWarningToast} variant="outline">
          Show Warning Toast
        </Button>
        <Button onClick={handleShowErrorToast} variant="danger">
          Show Error Toast
        </Button>
        <Button onClick={handleShowToastWithAction} variant="secondary">
          Show Toast with Action
        </Button>
      </div>
    </div>
  );
};

// Main Example Component
const FeedbackComponentsExample = () => {
  // Modal states
  const [modalSmOpen, setModalSmOpen] = useState(false);
  const [modalMdOpen, setModalMdOpen] = useState(false);
  const [modalLgOpen, setModalLgOpen] = useState(false);
  const [modalXlOpen, setModalXlOpen] = useState(false);
  const [modalFullOpen, setModalFullOpen] = useState(false);
  const [modalWithFooterOpen, setModalWithFooterOpen] = useState(false);

  // Alert states
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(true);
  const [showWarningAlert, setShowWarningAlert] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(true);

  return (
    <ToastProvider>
      <div className="p-8 space-y-12 max-w-7xl mx-auto">
        <div>
          <h1 className="text-h1 font-bold mb-2">Feedback Components</h1>
          <p className="text-body text-neutral-600">
            Examples of Modal, Alert, Toast, and Badge components
          </p>
        </div>

        {/* Modal Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-h2 font-semibold mb-4">Modal Component</h2>
            <p className="text-body text-neutral-600 mb-4">
              Dialog overlays with multiple sizes and optional footer
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setModalSmOpen(true)}>Small Modal</Button>
            <Button onClick={() => setModalMdOpen(true)}>Medium Modal</Button>
            <Button onClick={() => setModalLgOpen(true)}>Large Modal</Button>
            <Button onClick={() => setModalXlOpen(true)}>Extra Large Modal</Button>
            <Button onClick={() => setModalFullOpen(true)}>Full Modal</Button>
            <Button onClick={() => setModalWithFooterOpen(true)} variant="primary">
              Modal with Footer
            </Button>
          </div>

          {/* Small Modal */}
          <Modal
            open={modalSmOpen}
            onClose={() => setModalSmOpen(false)}
            title="Small Modal"
            size="sm"
          >
            <p className="text-body">
              This is a small modal (400px width). Perfect for simple confirmations or
              short messages.
            </p>
          </Modal>

          {/* Medium Modal */}
          <Modal
            open={modalMdOpen}
            onClose={() => setModalMdOpen(false)}
            title="Medium Modal"
            size="md"
          >
            <p className="text-body mb-4">
              This is a medium modal (600px width). This is the default size and works
              well for most use cases.
            </p>
            <p className="text-body">
              You can include any content here - forms, lists, images, etc.
            </p>
          </Modal>

          {/* Large Modal */}
          <Modal
            open={modalLgOpen}
            onClose={() => setModalLgOpen(false)}
            title="Large Modal"
            size="lg"
          >
            <div className="space-y-4">
              <p className="text-body">
                This is a large modal (800px width). Great for more complex content or
                forms with multiple sections.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Section 1</h4>
                  <p className="text-sm text-neutral-600">Content goes here</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Section 2</h4>
                  <p className="text-sm text-neutral-600">Content goes here</p>
                </div>
              </div>
            </div>
          </Modal>

          {/* Extra Large Modal */}
          <Modal
            open={modalXlOpen}
            onClose={() => setModalXlOpen(false)}
            title="Extra Large Modal"
            size="xl"
          >
            <p className="text-body">
              This is an extra large modal (1200px width). Use for data tables, detailed
              forms, or complex layouts.
            </p>
          </Modal>

          {/* Full Modal */}
          <Modal
            open={modalFullOpen}
            onClose={() => setModalFullOpen(false)}
            title="Full Width Modal"
            size="full"
          >
            <p className="text-body">
              This is a full width modal (100vw - 32px). Use when you need maximum space
              for content.
            </p>
          </Modal>

          {/* Modal with Footer */}
          <Modal
            open={modalWithFooterOpen}
            onClose={() => setModalWithFooterOpen(false)}
            title="Modal with Footer"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalWithFooterOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setModalWithFooterOpen(false)}>
                  Save Changes
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-body">
                This modal includes a footer with action buttons. The footer is sticky at
                the bottom even when content scrolls.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
            </div>
          </Modal>
        </section>

        {/* Alert Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-h2 font-semibold mb-4">Alert Component</h2>
            <p className="text-body text-neutral-600 mb-4">
              Display important messages with different severity levels
            </p>
          </div>

          <div className="space-y-4">
            {/* Info Alert */}
            {showInfoAlert && (
              <Alert
                type="info"
                title="Information"
                message="This is an informational alert. Use it to provide helpful context or tips."
                dismissible
                onDismiss={() => setShowInfoAlert(false)}
              />
            )}

            {/* Success Alert */}
            {showSuccessAlert && (
              <Alert
                type="success"
                title="Success"
                message="Your changes have been saved successfully!"
                dismissible
                onDismiss={() => setShowSuccessAlert(false)}
              />
            )}

            {/* Warning Alert */}
            {showWarningAlert && (
              <Alert
                type="warning"
                title="Warning"
                message="Please review your changes before proceeding. Some fields may need attention."
                dismissible
                onDismiss={() => setShowWarningAlert(false)}
              />
            )}

            {/* Error Alert */}
            {showErrorAlert && (
              <Alert
                type="error"
                title="Error"
                message="Failed to save changes. Please check your connection and try again."
                dismissible
                onDismiss={() => setShowErrorAlert(false)}
                actions={
                  <Button size="sm" variant="outline">
                    Retry
                  </Button>
                }
              />
            )}

            {/* Alert without title */}
            <Alert
              type="info"
              message="This alert has no title, just a message."
            />

            {/* Non-dismissible alert */}
            <Alert
              type="warning"
              message="This alert cannot be dismissed."
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setShowInfoAlert(true);
              setShowSuccessAlert(true);
              setShowWarningAlert(true);
              setShowErrorAlert(true);
            }}
          >
            Reset Alerts
          </Button>
        </section>

        {/* Toast Examples */}
        <section className="space-y-6">
          <ToastExample />
        </section>

        {/* Badge Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-h2 font-semibold mb-4">Badge Component</h2>
            <p className="text-body text-neutral-600 mb-4">
              Small labels for status, counts, or categories
            </p>
          </div>

          <div className="space-y-6">
            {/* Default size badges */}
            <div>
              <h3 className="text-h4 font-semibold mb-3">Default Size</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="neutral">Neutral</Badge>
              </div>
            </div>

            {/* Small size badges */}
            <div>
              <h3 className="text-h4 font-semibold mb-3">Small Size</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" size="sm">Default</Badge>
                <Badge variant="info" size="sm">Info</Badge>
                <Badge variant="success" size="sm">Success</Badge>
                <Badge variant="warning" size="sm">Warning</Badge>
                <Badge variant="error" size="sm">Error</Badge>
                <Badge variant="neutral" size="sm">Neutral</Badge>
              </div>
            </div>

            {/* Badges with dot indicator */}
            <div>
              <h3 className="text-h4 font-semibold mb-3">With Dot Indicator</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success" dot>Active</Badge>
                <Badge variant="error" dot>Offline</Badge>
                <Badge variant="warning" dot>Pending</Badge>
                <Badge variant="info" dot>In Progress</Badge>
              </div>
            </div>

            {/* Usage examples */}
            <div>
              <h3 className="text-h4 font-semibold mb-3">Usage Examples</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-body">User Status:</span>
                  <Badge variant="success" dot>Online</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body">Order Status:</span>
                  <Badge variant="info">Processing</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body">Priority:</span>
                  <Badge variant="error">High</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-body">Notifications:</span>
                  <Badge variant="warning">3</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ToastProvider>
  );
};

export default FeedbackComponentsExample;
