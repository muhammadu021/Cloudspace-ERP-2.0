import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ApprovalModal = ({ type, request, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    action: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);

  const getModalTitle = () => {
    switch (type) {
      case 'approval':
        return 'Department Approval';
      case 'procurement':
        return 'Procurement Review';
      case 'finance':
        return 'Finance Approval';
      case 'payment':
        return 'Payment Processing';
      case 'delivery':
        return 'Delivery Confirmation';
      default:
        return 'Action Required';
    }
  };

  const getActionOptions = () => {
    switch (type) {
      case 'approval':
        return [
          { value: 'approve', label: 'Approve Request', color: 'green' },
          { value: 'reject', label: 'Reject Request', color: 'red' }
        ];
      case 'procurement':
        return [
          { value: 'approve', label: 'Approve Vendor', color: 'green' },
          { value: 'reject', label: 'Reject Vendor', color: 'red' }
        ];
      case 'finance':
        return [
          { value: 'approve', label: 'Approve Budget', color: 'green' },
          { value: 'reject', label: 'Reject Budget', color: 'red' }
        ];
      default:
        return [];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.action) {
      toast.warning('Please select an action');
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900">Request Summary</h4>
          <p className="text-sm text-gray-600 mt-1">
            <strong>ID:</strong> {request.request_id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Requester:</strong> {request.requester_name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Amount:</strong> ₦{parseFloat(request.amount).toLocaleString()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action *
            </label>
            <div className="space-y-2">
              {getActionOptions().map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value={option.value}
                    checked={formData.action === option.value}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments
            </label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your comments..."
            />
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.action}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;