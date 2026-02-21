import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import toast from 'react-hot-toast';
import { LayoutGrid, List as ListIcon, BarChart3, Eye, Download, X, ChevronDown, ChevronUp, FileText, RefreshCw, ExternalLink } from 'lucide-react';
import PurchaseReceipt from './PurchaseReceipt';
import jsPDF from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';

const FinancePayment = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [confirmPaymentRequests, setConfirmPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('approval'); // 'approval', 'payment', or 'confirm_payment'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'dashboard'
  const [collapsedColumns, setCollapsedColumns] = useState({}); // Track collapsed state for each priority
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [financeData, setFinanceData] = useState({
    action: '',
    comments: '',
    budget_code: '',
    payment_method: 'bank_transfer',
    finance_notes: ''
  });
  // Get default payment letter template
  const getDefaultTemplate = (request) => {
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const defaultDate = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    
    return `${defaultDate}

To the Manager,
Access Bank.

Dear Sir,

REQUEST FOR TRANSFER

Kindly take this as authorization to debit our account number 1876520128 - Cloudspace Agro Allied & General Services Limited with a total amount of [AMOUNT WILL BE AUTO-FILLED] and transfer to the following beneficiary.

Account: ${request?.vendor_name || '[Vendor Name]'}
Bank of Beneficiary: [BANK DETAILS WILL BE AUTO-FILLED]
Beneficiary A/C: [ACCOUNT NUMBER WILL BE AUTO-FILLED]
Amount: [AMOUNT WILL BE AUTO-FILLED]

Thank you

Yours faithfully,
KABIR AL-AMIN ABBA`;
  };

  const [paymentData, setPaymentData] = useState({
    payment_reference: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    comments: '',
    letterhead: 'Template.pdf',
    document_template: ''
  });
  
  const [confirmPaymentData, setConfirmPaymentData] = useState({
    payment_reference: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    comments: ''
  });
  
  const [originalTemplate, setOriginalTemplate] = useState('');
  
  // Validation function to check if protected placeholders are intact
  const validateTemplate = () => {
    const template = paymentData.document_template;
    const originalTemp = originalTemplate;
    
    // Count occurrences of AUTO-FILLED in both templates
    const countAutoFilled = (text) => {
      const matches = text.match(/AUTO-FILLED/g);
      return matches ? matches.length : 0;
    };
    
    const originalCount = countAutoFilled(originalTemp);
    const currentCount = countAutoFilled(template);
    
    // If any AUTO-FILLED text has been removed
    if (currentCount < originalCount) {
      return {
        valid: false,
        message: `Protected "AUTO-FILLED" placeholder has been removed or modified. Please restore the original template.`
      };
    }
    
    // Also check for the specific required placeholders
    const requiredPlaceholders = [
      '[AMOUNT WILL BE AUTO-FILLED]',
      '[BANK DETAILS WILL BE AUTO-FILLED]',
      '[ACCOUNT NUMBER WILL BE AUTO-FILLED]'
    ];
    
    for (const placeholder of requiredPlaceholders) {
      if (!template.includes(placeholder)) {
        return {
          valid: false,
          message: `Protected placeholder "${placeholder}" has been removed or modified. Please restore it.`
        };
      }
    }
    
    return { valid: true, message: '' };
  };

  // Available letterheads
  const letterheads = [
    { value: 'Template.pdf', label: 'Default Template' },
    { value: 'Buildwise.pdf', label: 'Buildwise' },
    { value: 'lasershield.pdf', label: 'Lasershield' },
    { value: 'Maz logistics.pdf', label: 'Maz Logistics' },
    { value: 'ClearDesk agro.pdf', label: 'Cloudspace Agro' },
    { value: 'ClearDesk energy.pdf', label: 'Cloudspace Energy' },
    { value: 'Swingtide.pdf', label: 'Swingtide' }
  ];

  useEffect(() => {
    fetchFinanceRequests();
  }, []);

  const handleDownloadPaymentLetter = async () => {
    if (!selectedRequest) {
      throw new Error('No request selected');
    }
    
    // Validate template before downloading
    const validation = validateTemplate();
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    try {
      console.log('Starting PDF generation...');
      console.log('Selected letterhead:', paymentData.letterhead);
      
      // Load the selected letterhead PDF
      const letterheadPath = `/${paymentData.letterhead}`;
      console.log('Fetching letterhead from:', letterheadPath);
      
      const response = await fetch(letterheadPath);
      if (!response.ok) {
        throw new Error(`Failed to load letterhead: ${response.status} ${response.statusText}`);
      }
      
      const letterheadBytes = await response.arrayBuffer();
      console.log('Letterhead loaded, size:', letterheadBytes.byteLength, 'bytes');
      
      // Load the letterhead PDF
      const letterheadPdf = await PDFDocument.load(letterheadBytes);
      
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Copy the first page of the letterhead
      const [letterheadPage] = await pdfDoc.copyPages(letterheadPdf, [0]);
      const page = pdfDoc.addPage(letterheadPage);
      
      const { width, height } = page.getSize();
      const fontSize = 11;
      const margin = 50;
      let yPosition = height - 200; // Start below letterhead header

      // Replace placeholders in the template with actual values
      let finalContent = paymentData.document_template;
      
      // Replace amount placeholders (use 'N' instead of '₦' for PDF compatibility)
      const amountValue = selectedRequest.amount ? parseFloat(selectedRequest.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
      const amountText = `N${amountValue}`; // Use 'N' instead of '₦'
      finalContent = finalContent.replace(/\[AMOUNT WILL BE AUTO-FILLED\]/g, amountText);
      
      // Replace bank details placeholders
      const bankDetails = selectedRequest.vendor_bank_details || 'Not provided';
      finalContent = finalContent.replace(/\[BANK DETAILS WILL BE AUTO-FILLED\]/g, bankDetails);
      finalContent = finalContent.replace(/\[ACCOUNT NUMBER WILL BE AUTO-FILLED\]/g, bankDetails);
      
      // Replace vendor name
      finalContent = finalContent.replace(/\[Vendor Name\]/g, selectedRequest.vendor_name || 'N/A');
      
      // Remove any remaining ₦ symbols that might cause encoding issues
      finalContent = finalContent.replace(/₦/g, 'N');

      // Function to wrap text to fit within page width
      const wrapText = (text, maxWidth) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = testLine.length * (fontSize * 0.5); // Approximate width
          
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        return lines;
      };

      // Split content into lines and wrap long lines
      const rawLines = finalContent.split('\n');
      const lines = [];
      const maxWidth = width - (margin * 2);
      
      for (const rawLine of rawLines) {
        if (rawLine.trim() === '') {
          lines.push(''); // Preserve empty lines
        } else {
          const wrappedLines = wrapText(rawLine, maxWidth);
          lines.push(...wrappedLines);
        }
      }
      
      // Draw text on the page
      let currentPage = page;
      for (const line of lines) {
        if (yPosition < 50) {
          // Add new page with letterhead if content is too long
          const [newLetterheadPage] = await pdfDoc.copyPages(letterheadPdf, [0]);
          currentPage = pdfDoc.addPage(newLetterheadPage);
          yPosition = height - 200;
        }
        
        currentPage.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= fontSize + 4;
      }

      // Add GMD Signature if available
      try {
        // Get settings from localStorage to retrieve signature URL
        const settingsStr = localStorage.getItem('purchaseRequestSettings');
        if (settingsStr) {
          const settings = JSON.parse(settingsStr);
          const signatureUrl = settings.md_signature_url;
          
          if (signatureUrl) {
            console.log('Adding GMD signature to payment letter...');
            
            // Fetch the signature image
            const signatureResponse = await fetch(signatureUrl);
            if (signatureResponse.ok) {
              const signatureBytes = await signatureResponse.arrayBuffer();
              
              // Embed the signature image in the PDF
              let signatureImage;
              if (signatureUrl.toLowerCase().endsWith('.png')) {
                signatureImage = await pdfDoc.embedPng(signatureBytes);
              } else {
                signatureImage = await pdfDoc.embedJpg(signatureBytes);
              }
              
              // Calculate signature dimensions (maintain aspect ratio)
              const signatureWidth = 150;
              const signatureHeight = (signatureImage.height / signatureImage.width) * signatureWidth;
              
              // Position signature at the bottom of the page
              const signatureY = yPosition - signatureHeight - 20;
              
              // Draw the signature
              currentPage.drawImage(signatureImage, {
                x: margin,
                y: signatureY > 50 ? signatureY : 50,
                width: signatureWidth,
                height: signatureHeight,
              });
              
              console.log('GMD signature added successfully');
            } else {
              console.warn('Failed to fetch signature image:', signatureResponse.status);
            }
          } else {
            console.log('No GMD signature URL found in settings');
          }
        }
      } catch (signatureError) {
        console.error('Error adding signature to PDF:', signatureError);
        // Don't fail the entire PDF generation if signature fails
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Letter_${selectedRequest.request_id}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Payment letter downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF: ' + error.message);
    }
  };

  const fetchFinanceRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL requests pending finance approval (no user filtering)
      const approvalResponse = await purchaseRequestService.getAllRequests({
        status: 'pending_finance_approval',
        current_stage: 'finance_stage',
        show_all: true, // IMPORTANT: Remove user restrictions - show ALL finance requests
        limit: 100 // Increased limit to fetch more requests
      });
      setPendingRequests(approvalResponse.data.data.requests || []);

      // Fetch ALL requests in payment processing (no user filtering)
      const paymentResponse = await purchaseRequestService.getAllRequests({
        status: 'payment_in_progress',
        current_stage: 'pay_vendor_stage',
        show_all: true, // IMPORTANT: Remove user restrictions - show ALL payment requests
        limit: 100 // Increased limit to fetch more requests
      });
      setPaymentRequests(paymentResponse.data.data.requests || []);

      // Fetch ALL requests awaiting payment confirmation (no user filtering)
      const confirmPaymentResponse = await purchaseRequestService.getAllRequests({
        status: 'awaiting_payment_confirmation',
        current_stage: 'confirm_payment_stage',
        show_all: true, // IMPORTANT: Remove user restrictions - show ALL confirmation requests
        limit: 100 // Increased limit to fetch more requests
      });
      setConfirmPaymentRequests(confirmPaymentResponse.data.data.requests || []);
      
    } catch (error) {
      console.error('Fetch finance requests error:', error);
      toast.error('Failed to fetch finance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceApproval = async (requestId, action, additionalData = {}) => {
    try {
      setProcessingId(requestId);
      
      const data = {
        action: action,
        comments: additionalData.comments || '',
        stage: 'finance_stage',
        additional_data: {
          budget_code: additionalData.budget_code || '',
          payment_method: additionalData.payment_method || 'bank_transfer',
          finance_notes: additionalData.finance_notes || '',
          budget_approval_reference: additionalData.budget_approval_reference || ''
        }
      };

      await purchaseRequestService.processFinance(requestId, data);
      
      toast.success(`Request ${action === 'approve' ? 'approved for payment' : 'rejected'} successfully`);
      
      // Refresh the lists
      fetchFinanceRequests();
      
      // Close modals
      setShowFinanceModal(false);
      setShowViewModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Finance approval error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePaymentProcessing = async (requestId, paymentData) => {
    try {
      setProcessingId(requestId);
      
      const data = {
        action: 'complete',
        comments: paymentData.comments || '',
        stage: 'pay_vendor_stage',
        additional_data: {
          payment_reference: paymentData.payment_reference,
          transaction_id: paymentData.transaction_id || '',
          payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
          payment_method: paymentData.payment_method || 'bank_transfer'
        }
      };

      await purchaseRequestService.processPayment(requestId, data);
      
      toast.success('Payment processed successfully');
      
      // Refresh the lists
      fetchFinanceRequests();
      
      // Close modals
      setShowPaymentModal(false);
      setShowViewModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownloadReceipt = (request) => {
    setSelectedRequest(request);
    setShowReceipt(true);
  };

  const groupByPriority = (requests) => {
    const groups = {
      urgent: [],
      high: [],
      medium: [],
      low: []
    };
    
    requests.forEach(request => {
      const priority = request.priority || 'medium';
      if (groups[priority]) {
        groups[priority].push(request);
      }
    });
    
    return groups;
  };

  const getCurrentRequests = () => {
    if (activeTab === 'approval') return pendingRequests;
    if (activeTab === 'payment') return paymentRequests;
    if (activeTab === 'confirm_payment') return confirmPaymentRequests;
    return [];
  };

  const toggleColumnCollapse = (priority) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const openFinanceModal = (request, action) => {
    setSelectedRequest(request);
    setFinanceData({
      action: action,
      comments: '',
      budget_code: '',
      payment_method: 'bank_transfer',
      finance_notes: ''
    });
    setShowFinanceModal(true);
  };

  const openPaymentModal = (request) => {
    setSelectedRequest(request);
    const template = getDefaultTemplate(request);
    setOriginalTemplate(template); // Store original template
    setPaymentData({
      payment_reference: '',
      transaction_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'bank_transfer',
      comments: '',
      letterhead: 'Template.pdf',
      document_template: template
    });
    setShowPaymentModal(true);
  };

  const handleSubmitFinanceAction = () => {
    if (!financeData.comments.trim()) {
      toast.warning('Please provide comments for this action');
      return;
    }

    if (financeData.action === 'approve' && !financeData.budget_code.trim()) {
      toast.warning('Please provide a budget code for approval');
      return;
    }

    const additionalData = {
      budget_code: financeData.budget_code,
      payment_method: financeData.payment_method,
      comments: financeData.comments,
      finance_notes: financeData.finance_notes || (financeData.action === 'approve' ? 'Budget approved and payment authorized' : 'Request rejected during finance review')
    };

    handleFinanceApproval(selectedRequest.request_id, financeData.action, additionalData);
    setShowFinanceModal(false);
    setSelectedRequest(null);
  };

  const handleSubmitPayment = async () => {
    if (!selectedRequest) {
      toast.error('No request selected');
      return;
    }

    // Validate template before processing
    const validation = validateTemplate();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      // Set processing state
      setProcessingId(selectedRequest.request_id);
      
      // STEP 1: First, approve and move request to confirm payment stage
      await purchaseRequestService.processPayment(selectedRequest.request_id, {
        letterhead: paymentData.letterhead,
        document_template: paymentData.document_template,
        status: 'awaiting_payment_confirmation',
        current_stage: 'confirm_payment_stage'
      });
      
      // STEP 2: Only after approval, download the payment letter
      await handleDownloadPaymentLetter();
      
      // Success - show message and close modal
      toast.success('Payment processed successfully! Letter downloaded and request moved to Confirm Payment stage.');
      
      // Close modal and reset state
      setShowPaymentModal(false);
      setSelectedRequest(null);
      setPaymentData({
        payment_reference: '',
        transaction_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        comments: '',
        letterhead: 'Template.pdf',
        document_template: ''
      });
      
      // Refresh the requests
      await fetchFinanceRequests();
      
    } catch (error) {
      console.error('Error processing payment:', error);
      const errorMessage = error.message || error.response?.data?.message || 'Failed to process payment';
      toast.error(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Payment Processing</h1>
          <p className="text-gray-600 mt-1">Approve budgets and process vendor payments</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListIcon size={18} />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>

          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} Pending Approval
          </span>
          <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
            {paymentRequests.length} Payment Processing
          </span>
          
          <button
            onClick={fetchFinanceRequests}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Finance Requests"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="space-y-6">
          {/* Tabs for Kanban */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('approval')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approval'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Budget Approval ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pay Vendor ({paymentRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('confirm_payment')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'confirm_payment'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Confirm Payment ({confirmPaymentRequests.length})
              </button>
            </nav>
          </div>

          {/* Kanban Board */}
          <div className="flex gap-4">
            {Object.entries(groupByPriority(getCurrentRequests())).map(([priority, requests]) => {
              const config = {
                urgent: { label: 'Urgent', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
                high: { label: 'High', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
                medium: { label: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
                low: { label: 'Low', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
              }[priority];

              const isCollapsed = collapsedColumns[priority];

              return (
                <div 
                  key={priority} 
                  className={`flex flex-col transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-16' : 'w-80'
                  }`}
                >
                  {isCollapsed ? (
                    // Collapsed view - vertical text
                    <div 
                      className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity h-full flex flex-col items-center justify-center`}
                      onClick={() => toggleColumnCollapse(priority)}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <ChevronDown className="h-4 w-4 text-gray-600 rotate-90" />
                        <div 
                          className="whitespace-nowrap font-semibold text-gray-900 text-sm"
                          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                        >
                          {config.label}
                        </div>
                        <span className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}>
                          {requests.length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Expanded view
                    <>
                      <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-t-lg p-3 cursor-pointer hover:opacity-90 transition-opacity`}
                           onClick={() => toggleColumnCollapse(priority)}>
                        <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <span>{config.label} Priority</span>
                            <ChevronUp className="h-4 w-4 text-gray-600 -rotate-90" />
                          </span>
                          <span className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}>
                            {requests.length}
                          </span>
                        </h3>
                      </div>
                      <div className="bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                        <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {requests.map(request => (
                      <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="text-sm font-semibold text-primary mb-2">{request.request_id}</div>
                        <p className="text-xs text-gray-600 mb-1"><strong>Requester:</strong> {request.requester_name}</p>
                        <p className="text-xs text-gray-600 mb-1"><strong>Vendor:</strong> {request.vendor_name}</p>
                        <p className={`text-sm font-bold mb-2 ${activeTab === 'approval' ? 'text-indigo-900' : 'text-pink-900'}`}>
                          {formatCurrency(request.amount)}
                        </p>
                        <p className="text-xs text-gray-700 mb-3 line-clamp-2">{request.item_service_requested}</p>
                        
                        <button
                          onClick={() => { setSelectedRequest(request); setShowViewModal(true); }}
                          className="w-full mb-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600 flex items-center justify-center space-x-2 text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        
                        {activeTab === 'approval' ? (
                          <div className="pt-2 border-t border-gray-200 space-y-2">
                            <button onClick={() => openFinanceModal(request, 'approve')} disabled={processingId === request.request_id} className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">Approve Budget</button>
                            <button onClick={() => openFinanceModal(request, 'reject')} disabled={processingId === request.request_id} className="w-full px-3 py-1.5 border border-red-300 text-red-700 rounded text-xs hover:bg-red-50 disabled:opacity-50">Reject</button>
                          </div>
                        ) : activeTab === 'payment' ? (
                          <div className="pt-2 border-t border-gray-200">
                            <button onClick={() => openPaymentModal(request)} disabled={processingId === request.request_id} className="w-full px-3 py-1.5 bg-pink-600 text-white rounded text-xs hover:bg-pink-700 disabled:opacity-50">Process Payment</button>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-gray-200">
                            <button onClick={() => {
                              setSelectedRequest(request);
                              setShowConfirmPaymentModal(true);
                            }} disabled={processingId === request.request_id} className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">Confirm Payment</button>
                          </div>
                        )}
                      </div>
                    ))}
                          {requests.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">No {config.label.toLowerCase()} priority requests</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-indigo-900">{pendingRequests.length}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(pendingRequests.reduce((sum, req) => sum + parseFloat(req.amount), 0))}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
              <p className="text-sm text-gray-600 mb-1">Payment Processing</p>
              <p className="text-3xl font-bold text-pink-900">{paymentRequests.length}</p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(paymentRequests.reduce((sum, req) => sum + parseFloat(req.amount), 0))}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency([...pendingRequests, ...paymentRequests].reduce((sum, req) => sum + parseFloat(req.amount), 0))}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600 mb-1">Total Active</p>
              <p className="text-3xl font-bold text-gray-900">{pendingRequests.length + paymentRequests.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...pendingRequests, ...paymentRequests].slice(0, 10).map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link to={`/purchase-requests/${request.request_id}`} className="text-primary hover:text-blue-800 font-medium">{request.request_id}</Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.requester_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{request.vendor_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(request.amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending_finance_approval' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'}`}>
                          {request.status === 'pending_finance_approval' ? 'Pending Approval' : 'Payment Processing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* List View - Tabs */}
      {viewMode === 'list' && (
        <div>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('approval')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'approval'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Budget Approval ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payment'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Payment Processing ({paymentRequests.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Budget Approval Tab */}
          {activeTab === 'approval' && (
        <div className="space-y-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No pending budget approvals</p>
                <p className="text-sm mt-1">All requests have been processed</p>
              </div>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                {/* Request Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request {request.request_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ready for budget approval and payment authorization
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-900">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-sm text-indigo-600 font-medium">
                        BUDGET APPROVAL REQUIRED
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Request Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Requester:</span> {request.requester_name}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Department:</span> {purchaseRequestService.formatDepartment(request.department)}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Vendor:</span> {request.vendor_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Amount:</span> {formatCurrency(request.amount)}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Priority:</span> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                            request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.priority.toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Item/Service</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                      {request.item_service_requested}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vendor Bank Details</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                      {request.vendor_bank_details}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/purchase-requests/${request.request_id}`}
                      className="text-primary hover:text-blue-800 text-sm font-medium"
                    >
                      View Full Details
                    </Link>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openFinanceModal(request, 'reject')}
                        disabled={processingId === request.request_id}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject Budget
                      </button>
                      
                      <button
                        onClick={() => openFinanceModal(request, 'approve')}
                        disabled={processingId === request.request_id}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {processingId === request.request_id ? 'Processing...' : 'Approve & Authorize Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Payment Processing Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {paymentRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-500">
                <p className="text-lg font-medium">No payments to process</p>
                <p className="text-sm mt-1">All authorized payments have been completed</p>
              </div>
            </div>
          ) : (
            paymentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200">
                {/* Request Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-pink-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payment {request.request_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Budget approved - Ready for vendor payment
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-900">
                        {formatCurrency(request.amount)}
                      </p>
                      <p className="text-sm text-pink-600 font-medium">
                        PAYMENT PROCESSING
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Vendor:</span> {request.vendor_name}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Amount:</span> {formatCurrency(request.amount)}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Requester:</span> {request.requester_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Instructions</h4>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-sm text-green-800">
                          ✅ Budget approved and payment authorized
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Proceed with vendor payment using provided bank details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vendor Bank Details</h4>
                    <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200 whitespace-pre-wrap">
                      {request.vendor_bank_details}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Item/Service</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                      {request.item_service_requested}
                    </p>
                  </div>
                </div>

                {/* Payment Action */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/purchase-requests/${request.request_id}`}
                      className="text-primary hover:text-blue-800 text-sm font-medium"
                    >
                      View Full Details
                    </Link>
                    
                    <button
                      onClick={() => openPaymentModal(request)}
                      disabled={processingId === request.request_id}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingId === request.request_id ? 'Processing...' : 'Confirm Payment Completed'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Finance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-900">{pendingRequests.length}</p>
            <p className="text-sm text-gray-600">Pending Approval</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-900">{paymentRequests.length}</p>
            <p className="text-sm text-gray-600">Payment Processing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency([...pendingRequests, ...paymentRequests].reduce((sum, req) => sum + parseFloat(req.amount), 0))}
            </p>
            <p className="text-sm text-gray-600">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {pendingRequests.length + paymentRequests.length}
            </p>
            <p className="text-sm text-gray-600">Total Active</p>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {activeTab === 'approval' ? 'Finance Approval' : 'Payment Processing'} - {selectedRequest.request_id}
              </h3>
              <button onClick={() => { setShowViewModal(false); setSelectedRequest(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className={`${activeTab === 'approval' ? 'bg-indigo-50' : 'bg-pink-50'} p-4 rounded-lg`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className={`text-2xl font-bold ${activeTab === 'approval' ? 'text-indigo-900' : 'text-pink-900'}`}>{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Requester Information</h4>
                  <p className="text-sm text-gray-700"><strong>Name:</strong> {selectedRequest.requester_name}</p>
                  <p className="text-sm text-gray-700"><strong>Email:</strong> {selectedRequest.requester_email}</p>
                  <p className="text-sm text-gray-700"><strong>Department:</strong> {purchaseRequestService.formatDepartment(selectedRequest.department)}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Vendor Information</h4>
                  <p className="text-sm text-gray-700"><strong>Vendor:</strong> {selectedRequest.vendor_name}</p>
                  <p className="text-sm text-gray-700"><strong>Amount:</strong> {formatCurrency(selectedRequest.amount)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Item/Service Requested</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">{selectedRequest.item_service_requested}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vendor Bank Details</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-wrap">{selectedRequest.vendor_bank_details}</p>
              </div>

              {/* Supporting Document */}
              {(selectedRequest.cloudinary_url || selectedRequest.supporting_document_path) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Supporting Document</h4>
                  <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Supporting Document</p>
                        <p className="text-xs text-gray-500">Click to view or download</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(selectedRequest.cloudinary_url || selectedRequest.supporting_document_path) && (
                        <>
                          <a
                            href={selectedRequest.cloudinary_url || selectedRequest.supporting_document_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary-600 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                          <a
                            href={selectedRequest.cloudinary_url || selectedRequest.supporting_document_path}
                            download
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <button onClick={() => handleDownloadReceipt(selectedRequest)} className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                <Download className="h-4 w-4" />
                <span>Download Receipt</span>
              </button>
              
              {activeTab === 'approval' ? (
                <div className="flex space-x-3">
                  <button onClick={() => { setShowViewModal(false); openFinanceModal(selectedRequest, 'reject'); }} disabled={processingId === selectedRequest.request_id} className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50">Reject Budget</button>
                  <button onClick={() => { setShowViewModal(false); openFinanceModal(selectedRequest, 'approve'); }} disabled={processingId === selectedRequest.request_id} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Approve Budget</button>
                </div>
              ) : (
                <button onClick={() => { setShowViewModal(false); openPaymentModal(selectedRequest); }} disabled={processingId === selectedRequest.request_id} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Confirm Payment</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finance Approval Modal */}
      {showFinanceModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {financeData.action === 'approve' ? 'Approve Budget & Authorize Payment' : 'Reject Budget Request'}
              </h3>
              <button
                onClick={() => {
                  setShowFinanceModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900">Request Summary</h4>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p><strong>ID:</strong> {selectedRequest.request_id}</p>
                  <p><strong>Requester:</strong> {selectedRequest.requester_name}</p>
                  <p><strong>Department:</strong> {purchaseRequestService.formatDepartment(selectedRequest.department)}</p>
                </div>
                <div>
                  <p><strong>Amount:</strong> {formatCurrency(selectedRequest.amount)}</p>
                  <p><strong>Vendor:</strong> {selectedRequest.vendor_name}</p>
                  <p><strong>Priority:</strong> {selectedRequest.priority.toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Budget Code (for approval) */}
              {financeData.action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Code *
                  </label>
                  <input
                    type="text"
                    value={financeData.budget_code}
                    onChange={(e) => setFinanceData(prev => ({ ...prev, budget_code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter budget code (e.g., DEPT-2024-001)"
                  />
                </div>
              )}

              {/* Payment Method (for approval) */}
              {financeData.action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={financeData.payment_method}
                    onChange={(e) => setFinanceData(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="wire_transfer">Wire Transfer</option>
                  </select>
                </div>
              )}

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {financeData.action === 'approve' ? 'Approval Comments' : 'Rejection Reason'} *
                </label>
                <textarea
                  value={financeData.comments}
                  onChange={(e) => setFinanceData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={financeData.action === 'approve' 
                    ? 'Enter approval comments...'
                    : 'Enter reason for budget rejection...'}
                />
              </div>

              {/* Finance Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finance Notes
                </label>
                <textarea
                  value={financeData.finance_notes}
                  onChange={(e) => setFinanceData(prev => ({ ...prev, finance_notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Additional finance notes (optional)..."
                />
              </div>

              {/* Action Impact */}
              <div className={`p-3 rounded border ${
                financeData.action === 'approve' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  financeData.action === 'approve' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {financeData.action === 'approve' ? '✓ This will:' : '⚠️ This will:'}
                </p>
                <ul className={`text-sm mt-1 ml-4 list-disc ${
                  financeData.action === 'approve' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {financeData.action === 'approve' ? (
                    <>
                      <li>Approve budget allocation for this request</li>
                      <li>Authorize payment processing</li>
                      <li>Move request to payment processing queue</li>
                      <li>Assign budget code: {financeData.budget_code || '[Budget Code]'}</li>
                    </>
                  ) : (
                    <>
                      <li>Reject the budget request</li>
                      <li>Stop the approval workflow</li>
                      <li>Notify requester of budget rejection</li>
                      <li>Request will need to be resubmitted</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowFinanceModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFinanceAction}
                disabled={processingId === selectedRequest.request_id}
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  financeData.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {processingId === selectedRequest.request_id ? 'Processing...' : 
                 financeData.action === 'approve' ? 'Approve & Authorize Payment' : 'Reject Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pay Vendor - Download Payment Letter
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-3">Payment Summary (Read-Only)</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <label className="text-gray-600 text-xs">Request ID</label>
                    <p className="font-semibold text-gray-900">{selectedRequest.request_id}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Vendor Name</label>
                    <p className="font-semibold text-gray-900">{selectedRequest.vendor_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Amount (Cannot be changed)</label>
                    <p className="font-bold text-green-600 text-lg">{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-gray-600 text-xs">Requester</label>
                    <p className="font-semibold text-gray-900">{selectedRequest.requester_name}</p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Bank Details (Cannot be changed)</label>
                    <p className="font-semibold text-gray-900 text-xs bg-white p-2 rounded border border-gray-200">
                      {selectedRequest.vendor_bank_details || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Letterhead Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Letterhead *
                </label>
                <select
                  value={paymentData.letterhead}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, letterhead: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {letterheads.map(lh => (
                    <option key={lh.value} value={lh.value}>{lh.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the company letterhead for the payment document</p>
              </div>

              {/* Document Template Editor */}
              <div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Letter Content
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    The payment letter will be automatically downloaded when you confirm the payment.
                  </p>
                </div>
                <textarea
                  value={paymentData.document_template}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, document_template: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="The default template will be loaded automatically. You can edit it as needed."
                />
                
                {/* Validation Warning */}
                {!validateTemplate().valid && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 font-medium flex items-center">
                      <span className="mr-2">⚠️</span>
                      {validateTemplate().message}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      You cannot download the PDF or submit payment until all protected placeholders are restored.
                    </p>
                  </div>
                )}
                
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 font-medium">
                    ⚠️ Protected Information (Auto-included in PDF):
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Amount: <strong>N{selectedRequest?.amount ? parseFloat(selectedRequest.amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</strong> (Cannot be changed)</li>
                    <li>Bank Details: <strong>{selectedRequest?.vendor_bank_details || 'Not provided'}</strong> (Cannot be changed)</li>
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    These details will be automatically included in the downloaded PDF and cannot be modified.
                  </p>
                </div>
              </div>

              {/* Next Step Info */}
              <div className="bg-primary-50 border border-primary-200 rounded p-3">
                <p className="text-sm font-medium text-blue-800">
                  ℹ️ After downloading the payment letter:
                </p>
                <ul className="text-sm text-primary-700 mt-1 ml-4 list-disc">
                  <li>Process the payment through your bank</li>
                  <li>Request will move to "Confirm Payment" tab</li>
                  <li>Enter payment reference number in the next stage</li>
                  <li>Complete final payment confirmation</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={processingId === selectedRequest.request_id || !validateTemplate().valid}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!validateTemplate().valid ? 'Please restore all protected placeholders before submitting' : ''}
              >
                {processingId === selectedRequest.request_id ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Process Payment & Download Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Completion Modal */}
      {showConfirmPaymentModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Payment Completion
              </h3>
              <button
                onClick={() => {
                  setShowConfirmPaymentModal(false);
                  setSelectedRequest(null);
                  setConfirmPaymentData({
                    payment_reference: '',
                    transaction_id: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'bank_transfer',
                    comments: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-3">Request Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600 text-xs">Request ID</label>
                  <p className="font-semibold text-gray-900">{selectedRequest.request_id}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs">Vendor Name</label>
                  <p className="font-semibold text-gray-900">{selectedRequest.vendor_name}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs">Amount</label>
                  <p className="font-bold text-green-600 text-lg">{formatCurrency(selectedRequest.amount)}</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs">Requester</label>
                  <p className="font-semibold text-gray-900">{selectedRequest.requester_name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Payment Reference - REQUIRED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference Number *
                </label>
                <input
                  type="text"
                  value={confirmPaymentData.payment_reference}
                  onChange={(e) => setConfirmPaymentData(prev => ({ ...prev, payment_reference: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter payment reference number from bank"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter the reference number provided by your bank after payment</p>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={confirmPaymentData.transaction_id}
                  onChange={(e) => setConfirmPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter transaction ID (optional)"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={confirmPaymentData.payment_date}
                  onChange={(e) => setConfirmPaymentData(prev => ({ ...prev, payment_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={confirmPaymentData.payment_method}
                  onChange={(e) => setConfirmPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="wire_transfer">Wire Transfer</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Confirmation Comments
                </label>
                <textarea
                  value={confirmPaymentData.comments}
                  onChange={(e) => setConfirmPaymentData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter any additional comments about the payment..."
                />
              </div>

              {/* Completion Impact */}
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm font-medium text-green-800">
                  ✓ Confirming payment will:
                </p>
                <ul className="text-sm text-green-700 mt-1 ml-4 list-disc">
                  <li>Mark payment as completed</li>
                  <li>Move request to delivery confirmation stage</li>
                  <li>Notify operations team for delivery tracking</li>
                  <li>Update financial records with payment details</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowConfirmPaymentModal(false);
                  setSelectedRequest(null);
                  setConfirmPaymentData({
                    payment_reference: '',
                    transaction_id: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'bank_transfer',
                    comments: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!confirmPaymentData.payment_reference.trim()) {
                    toast.error('Payment reference number is required');
                    return;
                  }
                  
                  try {
                    setProcessingId(selectedRequest.request_id);
                    
                    await purchaseRequestService.confirmPayment(selectedRequest.request_id, confirmPaymentData);
                    
                    toast.success('Payment confirmed successfully!');
                    
                    setShowConfirmPaymentModal(false);
                    setSelectedRequest(null);
                    setConfirmPaymentData({
                      payment_reference: '',
                      transaction_id: '',
                      payment_date: new Date().toISOString().split('T')[0],
                      payment_method: 'bank_transfer',
                      comments: ''
                    });
                    
                    await fetchFinanceRequests();
                  } catch (error) {
                    console.error('Confirm payment error:', error);
                    toast.error(error.response?.data?.message || 'Failed to confirm payment');
                  } finally {
                    setProcessingId(null);
                  }
                }}
                disabled={processingId === selectedRequest.request_id || !confirmPaymentData.payment_reference.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === selectedRequest.request_id ? (
                  <span>Processing...</span>
                ) : (
                  <span>Confirm Payment Completion</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Receipt Modal */}
      {showReceipt && selectedRequest && (
        <PurchaseReceipt 
          request={selectedRequest} 
          onClose={() => {
            setShowReceipt(false);
            setSelectedRequest(null);
          }} 
        />
      )}
    </div>
  );
};

export default FinancePayment;