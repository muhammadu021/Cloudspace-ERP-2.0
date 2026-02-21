import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PurchaseReceipt = ({ request, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDepartment = (department) => {
    if (!department) return '';
    return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStage = (stage) => {
    const stages = {
      'request_creation': 'Request Creation',
      'approval_stage': 'Department Approval',
      'processing_stage': 'Processing',
      'procurement_stage': 'Procurement Review',
      'finance_stage': 'Finance Approval',
      'pay_vendor_stage': 'Payment Processing',
      'delivery_stage': 'Delivery Confirmation',
      'completed': 'Completed'
    };
    return stages[stage] || stage;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_approval': { letter: 'P', color: 'bg-yellow-500', label: 'Pending Approval' },
      'pending_manager_approval': { letter: 'M', color: 'bg-orange-500', label: 'Manager Approval' },
      'pending_procurement_review': { letter: 'R', color: 'bg-purple-500', label: 'Procurement Review' },
      'pending_finance_approval': { letter: 'F', color: 'bg-indigo-500', label: 'Finance Approval' },
      'payment_in_progress': { letter: '$', color: 'bg-primary-500', label: 'Payment Processing' },
      'awaiting_delivery': { letter: 'D', color: 'bg-teal-500', label: 'Awaiting Delivery' },
      'completed': { letter: '✓', color: 'bg-green-500', label: 'Completed' },
      'rejected': { letter: 'X', color: 'bg-red-500', label: 'Rejected' },
      'cancelled': { letter: 'C', color: 'bg-gray-500', label: 'Cancelled' }
    };
    
    return statusConfig[status] || { letter: 'N', color: 'bg-gray-400', label: formatStatus(status) };
  };

  const handleDownload = async () => {
    const element = document.getElementById('receipt-content');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: document.documentElement.offsetWidth
      });

      const imgData = canvas.toDataURL('image/png');

      // PDF setup
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions for the PDF width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If content height is less than one page, simple add
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // Add image in slices across multiple pages
        let position = 0;
        let remainingHeight = imgHeight;
        let pageIndex = 0;

        while (remainingHeight > 0) {
          const sourceY = (position / imgHeight) * canvas.height;
          const sliceHeightPx = Math.min((pageHeight / imgHeight) * canvas.height, canvas.height - sourceY);

          // Create a temporary canvas for each slice
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeightPx;
          const ctx = sliceCanvas.getContext('2d');

          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            sliceCanvas.width,
            sliceCanvas.height
          );

          const sliceData = sliceCanvas.toDataURL('image/png');

          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(
            sliceData,
            'PNG',
            0,
            0,
            imgWidth,
            (sliceHeightPx / canvas.width) * imgWidth
          );

          position += pageHeight;
          remainingHeight -= pageHeight;
          pageIndex += 1;
        }
      }

      pdf.save(`Purchase_Request_${request.request_id}_Receipt.pdf`);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-10 mx-auto p-5 w-full max-w-5xl">
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 font-medium"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            Close
          </button>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" className="bg-white shadow-lg">
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="Cloudspace Logo" 
                  className="h-20 w-auto"
                  crossOrigin="anonymous"
                />
              </div>
              
              {/* Professional Status Badge - Between Logo and QR */}
              <div className="flex items-center">
                <div className={`${getStatusBadge(request.status).color} text-white px-6 py-3 rounded-full shadow-lg`}>
                  <p className="text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                    {getStatusBadge(request.status).label}
                  </p>
                </div>
              </div>
              
              <div className="w-32 h-32 border-2 border-gray-300 p-1">
                <img 
                  src="/qrcode.png" 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold mt-8 mb-4 tracking-wide text-gray-900">
              PURCHASE REQUEST RECEIPT
            </h1>
            <p className="text-lg text-gray-700">
              Generated on: {formatDate(new Date())}
            </p>
          </div>

          {/* Request Information Section */}
          <div className="bg-primary text-white px-8 py-4">
            <h2 className="text-xl font-bold tracking-wide">
              REQUEST INFORMATION
            </h2>
          </div>
          <div className="border-x border-b border-gray-300">
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Request ID:
              </div>
              <div className="col-span-3 p-4">{request.request_id}</div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Status:
              </div>
              <div className="col-span-3 p-4">{formatStatus(request.status)}</div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Current Stage:
              </div>
              <div className="col-span-3 p-4">{formatStage(request.current_stage)}</div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Priority:
              </div>
              <div className="col-span-3 p-4">{request.priority?.toUpperCase() || 'N/A'}</div>
            </div>
            <div className="grid grid-cols-4">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Created Date:
              </div>
              <div className="col-span-3 p-4">{formatDate(request.created_at)}</div>
            </div>
          </div>

          {/* Requester Information Section */}
          <div className="bg-primary text-white px-8 py-4 mt-8">
            <h2 className="text-xl font-bold tracking-wide">
              REQUESTER INFORMATION
            </h2>
          </div>
          <div className="border-x border-b border-gray-300">
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Name:
              </div>
              <div className="col-span-3 p-4">{request.requester_name}</div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Email:
              </div>
              <div className="col-span-3 p-4">{request.requester_email}</div>
            </div>
            <div className="grid grid-cols-4">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Department:
              </div>
              <div className="col-span-3 p-4">{formatDepartment(request.department)}</div>
            </div>
          </div>

          {/* Request Details Section */}
          <div className="bg-primary text-white px-8 py-4 mt-8">
            <h2 className="text-xl font-bold tracking-wide">REQUEST DETAILS</h2>
          </div>
          <div className="border-x border-b border-gray-300">
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Item/Service:
              </div>
              <div className="col-span-3 p-4 min-h-[100px] whitespace-pre-wrap">
                {request.item_service_requested}
              </div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Amount:
              </div>
              <div className="col-span-3 p-4 text-lg font-bold text-green-700">
                {formatCurrency(request.amount)}
              </div>
            </div>
            <div className="grid grid-cols-4 border-b border-gray-300">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Vendor:
              </div>
              <div className="col-span-3 p-4">{request.vendor_name}</div>
            </div>
            <div className="grid grid-cols-4">
              <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                Vendor Bank Details:
              </div>
              <div className="col-span-3 p-4 whitespace-pre-wrap">
                {request.vendor_bank_details}
              </div>
            </div>
          </div>

          {/* Approval Information (if available) */}
          {request.WorkflowApprovals && request.WorkflowApprovals.length > 0 && (
            <>
              <div className="bg-primary text-white px-8 py-4 mt-8">
                <h2 className="text-xl font-bold tracking-wide">APPROVAL HISTORY</h2>
              </div>
              <div className="border-x border-b border-gray-300">
                {request.WorkflowApprovals.map((approval, index) => {
                  // Try to extract approver first name from common shapes
                  const approverName = approval.approver?.first_name || approval.approver_firstname || approval.approver_first_name || approval.approver_name || approval.user?.first_name || approval.user_firstname || '';
                  const firstName = approverName ? String(approverName).split(' ')[0] : '';
                  const displayDate = formatDate(approval.created_at || approval.approved_at || approval.updated_at);
                  return (
                    <div key={index} className="grid grid-cols-4 border-b border-gray-300 last:border-b-0">
                      <div className="col-span-1 p-4 bg-gray-50 border-r border-gray-300 font-semibold">
                        {formatStage(approval.stage)}{firstName ? ` – ${firstName}` : ''}:
                      </div>
                      <div className="col-span-3 p-4">
                        <div className="font-medium">{approval.action?.toUpperCase() || 'ACTION'}</div>
                        {approval.comments && (
                          <div className="text-sm text-gray-600">Comments: {approval.comments}</div>
                        )}
                        {displayDate && (
                          <div className="text-xs text-gray-500 mt-1">{displayDate}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="p-8 text-center border-t border-gray-200 mt-8">
            <p className="text-sm font-semibold mb-1">
              This is an automatically generated receipt for purchase request {request.request_id}
            </p>
            <p className="text-sm text-gray-600">
              Cloudspace Ltd - Purchase Request Management System
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Generated on {formatDate(new Date())}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceipt;
