import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import toast from 'react-hot-toast';
import { Download, FileText, ExternalLink } from 'lucide-react';
import PurchaseReceipt from './PurchaseReceipt';

const PurchaseRequestDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await purchaseRequestService.getRequestById(requestId);
      setRequest(response.data.data.request);
    } catch (error) {
      console.error('Fetch request details error:', error);
      toast.error('Failed to fetch request details');
      navigate('/purchase-requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    setShowReceipt(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Request not found</h3>
        <p className="text-gray-500 mt-2">The requested purchase request could not be found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/purchase-requests')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.request_id}</h1>
            <p className="text-gray-600 mt-1">Purchase Request Details</p>
          </div>
        </div>
        
        <button
          onClick={handleDownloadReceipt}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Download Receipt</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requester
            </label>
            <p className="text-sm text-gray-900">{request.requester_name}</p>
            <p className="text-sm text-gray-500">{request.requester_email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <p className="text-sm text-gray-900">{request.department}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <p className="text-lg font-semibold text-gray-900">
              NGN {parseFloat(request.amount).toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {request.status}
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item/Service Requested
          </label>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {request.item_service_requested}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name
            </label>
            <p className="text-sm text-gray-900">{request.vendor_name}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Details
          </label>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {request.vendor_bank_details}
          </p>
        </div>
      </div>

      {/* Supporting Document Section */}
      {(request.cloudinary_url || request.supporting_document_path) && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supporting Document</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-gray-900">Supporting Document</p>
                <p className="text-xs text-gray-500">Click to view or download</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(request.cloudinary_url || request.supporting_document_path) && (
                <>
                  <a
                    href={request.cloudinary_url || request.supporting_document_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Document
                  </a>
                  <a
                    href={request.cloudinary_url || request.supporting_document_path}
                    download
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments/Notes Footer Section */}
      {request.notes && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-t-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {request.notes}
            </p>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <PurchaseReceipt 
          request={request} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
};

export default PurchaseRequestDetail;