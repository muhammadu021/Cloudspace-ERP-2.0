import React from 'react';

const WorkflowTimeline = ({ currentStage, status, auditTrail }) => {
  const workflowSteps = [
    { id: 'request_creation', name: 'Request Creation', description: 'Initial request submission' },
    { id: 'approval_stage', name: 'Department Approval', description: 'Department head approval' },
    { id: 'processing_stage', name: 'Processing', description: 'Conditional routing based on amount' },
    { id: 'procurement_stage', name: 'Procurement Review', description: 'Vendor validation (for amounts ≥ ₦1,000,000)' },
    { id: 'finance_stage', name: 'Finance Approval', description: 'Budget approval and payment authorization' },
    { id: 'pay_vendor_stage', name: 'Payment Processing', description: 'Vendor payment execution' },
    { id: 'delivery_stage', name: 'Delivery Confirmation', description: 'Operations 2 delivery confirmation' },
    { id: 'completed', name: 'Completed', description: 'Workflow completed successfully' }
  ];

  const getStepStatus = (stepId) => {
    const stepIndex = workflowSteps.findIndex(step => step.id === stepId);
    const currentIndex = workflowSteps.findIndex(step => step.id === currentStage);
    
    if (status === 'rejected' || status === 'cancelled') {
      if (stepIndex <= currentIndex) {
        return stepIndex === currentIndex ? 'rejected' : 'completed';
      }
      return 'pending';
    }
    
    if (status === 'completed') {
      return 'completed';
    }
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStepIcon = (stepId) => {
    const stepStatus = getStepStatus(stepId);
    
    switch (stepStatus) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
            <span className="text-white text-sm">✓</span>
          </div>
        );
      case 'current':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-primary-500 rounded-full">
            <span className="text-white text-sm">⏱</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-full">
            <span className="text-white text-sm">✗</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Workflow Progress</h3>
      </div>
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {workflowSteps.map((step, stepIdx) => {
              const isLast = stepIdx === workflowSteps.length - 1;
              
              return (
                <li key={step.id}>
                  <div className="relative pb-8">
                    {!isLast && (
                      <span
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          getStepStatus(step.id) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>{getStepIcon(step.id)}</div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {step.name}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>
                        
                        {getStepStatus(step.id) === 'current' && (
                          <div className="mt-2">
                            <div className="flex items-center text-sm text-primary">
                              <span>In Progress</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkflowTimeline;