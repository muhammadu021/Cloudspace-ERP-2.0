import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import purchaseRequestService from "../../services/purchaseRequestService";
import toast from "react-hot-toast";
import {
  LayoutGrid,
  List,
  BarChart3,
  Eye,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import PurchaseReceipt from "./PurchaseReceipt";

const ManagerApproval = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentManager, setCurrentManager] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban', 'list', 'dashboard'
  const [collapsedColumns, setCollapsedColumns] = useState({}); // Track collapsed state for each priority
  const [approvalData, setApprovalData] = useState({
    action: "",
    comments: "",
  });

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      // Now gets ALL pending approvals, not filtered by manager
      const response = await purchaseRequestService.getPendingApprovals({
        limit: 50,
      });
      console.log("All pending approvals:", response.data);
      setPendingRequests(response.data.data.requests || []);
      setCurrentManager(response.data.data.currentManager || null);
    } catch (error) {
      console.error("Fetch pending approvals error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch pending approvals"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, action, comments = "") => {
    try {
      setProcessingId(requestId);

      const data = {
        action: action,
        comments: comments,
        stage: "approval_stage",
      };

      await purchaseRequestService.processApproval(requestId, data);

      toast.success(
        `Request ${action === "approve" ? "approved" : "rejected"} successfully`
      );

      // Refresh the list
      fetchPendingApprovals();

      // Close modals
      setShowApprovalModal(false);
      setShowViewModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(
        error.response?.data?.message || `Failed to ${action} request`
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadReceipt = (request) => {
    setSelectedRequest(request);
    setShowReceipt(true);
  };

  const getThreshold = () => {
    const savedSettings = localStorage.getItem("purchaseRequestSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.procurement_threshold || 1000000;
    }
    return 1000000;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getNextStage = (amount) => {
    const threshold = getThreshold();
    return parseFloat(amount) >= threshold
      ? "Procurement Review"
      : "Finance Approval";
  };

  // Check if current user is the assigned manager for a request
  const isAssignedManager = (request) => {
    if (!currentManager || !request.approving_manager_id) return false;
    return currentManager.id === request.approving_manager_id;
  };

  // Group requests by priority for Kanban view
  const groupByPriority = () => {
    const groups = {
      urgent: [],
      high: [],
      medium: [],
      low: [],
    };

    pendingRequests.forEach((request) => {
      const priority = request.priority || "medium";
      if (groups[priority]) {
        groups[priority].push(request);
      }
    });

    return groups;
  };

  // Calculate dashboard statistics
  const getDashboardStats = () => {
    const totalValue = pendingRequests.reduce(
      (sum, req) => sum + parseFloat(req.amount),
      0
    );
    const myRequests = pendingRequests.filter((req) => isAssignedManager(req));
    const myValue = myRequests.reduce(
      (sum, req) => sum + parseFloat(req.amount),
      0
    );
    const requireProcurement = pendingRequests.filter(
      (req) => parseFloat(req.amount) >= getThreshold()
    ).length;

    const byDepartment = {};
    pendingRequests.forEach((req) => {
      const dept = req.department || "Unknown";
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, value: 0 };
      }
      byDepartment[dept].count++;
      byDepartment[dept].value += parseFloat(req.amount);
    });

    return {
      total: pendingRequests.length,
      totalValue,
      myRequests: myRequests.length,
      myValue,
      requireProcurement,
      byDepartment,
    };
  };

  const renderActionButtons = (request) => {
    const canApprove = isAssignedManager(request);

    if (!canApprove) {
      return (
        <div className="text-sm text-gray-500 italic">
          Assigned to: {request.ApprovingManager?.name || "Another manager"}
        </div>
      );
    }

    return (
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setSelectedRequest(request);
            setApprovalData({ action: "reject", comments: "" });
            setShowApprovalModal(true);
          }}
          disabled={processingId === request.request_id}
          className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
        >
          {processingId === request.request_id ? "Processing..." : "Reject"}
        </button>

        <button
          onClick={() => {
            setSelectedRequest(request);
            setApprovalData({ action: "approve", comments: "" });
            setShowApprovalModal(true);
          }}
          disabled={processingId === request.request_id}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {processingId === request.request_id ? "Processing..." : "Approve"}
        </button>
      </div>
    );
  };

  const toggleColumnCollapse = (priority) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  };

  const renderKanbanView = () => {
    const groups = groupByPriority();
    const priorityConfig = {
      urgent: {
        label: "Urgent",
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      },
      high: {
        label: "High",
        color: "orange",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      },
      medium: {
        label: "Medium",
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      },
      low: {
        label: "Low",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      },
    };

    return (
      <div className="flex gap-4">
        {Object.entries(priorityConfig).map(([priority, config]) => {
          const isCollapsed = collapsedColumns[priority];

          return (
            <div
              key={priority}
              className={`flex flex-col transition-all duration-300 ease-in-out ${
                isCollapsed ? "w-16" : "w-80"
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
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                      }}
                    >
                      {config.label}
                    </div>
                    <span
                      className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}
                    >
                      {groups[priority].length}
                    </span>
                  </div>
                </div>
              ) : (
                // Expanded view
                <>
                  <div
                    className={`${config.bgColor} ${config.borderColor} border-2 rounded-t-lg p-3 cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => toggleColumnCollapse(priority)}
                  >
                    <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span>{config.label} Priority</span>
                        <ChevronUp className="h-4 w-4 text-gray-600 -rotate-90" />
                      </span>
                      <span
                        className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}
                      >
                        {groups[priority].length}
                      </span>
                    </h3>
                  </div>
                  <div className="bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                    <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
                      {groups[priority].map((request) => (
                        <div
                          key={request.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-primary mb-1">
                                {request.request_id}
                              </div>
                              {isAssignedManager(request) && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded inline-block mb-2">
                                  Assigned to you
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Requester:</strong> {request.requester_name}
                          </p>
                          <p className="text-xs text-gray-600 mb-1">
                            <strong>Department:</strong>{" "}
                            {purchaseRequestService.formatDepartment(
                              request.department
                            )}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mb-2">
                            {formatCurrency(request.amount)}
                          </p>

                          <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                            {request.item_service_requested}
                          </p>

                          {/* View Button */}
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowViewModal(true);
                            }}
                            className="w-full mb-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600 flex items-center justify-center space-x-2 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>

                          {/* Action Buttons for assigned manager */}
                          {isAssignedManager(request) && (
                            <div className="pt-2 border-t border-gray-200 space-y-2">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({
                                    action: "approve",
                                    comments: "",
                                  });
                                  setShowApprovalModal(true);
                                }}
                                disabled={processingId === request.request_id}
                                className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({
                                    action: "reject",
                                    comments: "",
                                  });
                                  setShowApprovalModal(true);
                                }}
                                disabled={processingId === request.request_id}
                                className="w-full px-3 py-1.5 border border-red-300 text-red-700 rounded text-xs hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {!isAssignedManager(request) && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500 italic text-center">
                                Assigned to:{" "}
                                {request.ApprovingManager?.name ||
                                  "Another manager"}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {groups[priority].length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No {config.label.toLowerCase()} priority requests
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-6">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No pending approvals</p>
              <p className="text-sm mt-1">All requests have been processed</p>
            </div>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-md border border-gray-200"
            >
              {/* Request Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request {request.request_id}
                      </h3>
                      {isAssignedManager(request) && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          Assigned to you
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Submitted on{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Next: {getNextStage(request.amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Requester Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Requester Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Name:</span>{" "}
                        {request.requester_name}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Email:</span>{" "}
                        {request.requester_email}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Department:</span>{" "}
                        {purchaseRequestService.formatDepartment(
                          request.department
                        )}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Priority:</span>
                        <span
                          className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                            request.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : request.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : request.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {request.priority.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Vendor Information
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Vendor:</span>{" "}
                        {request.vendor_name}
                      </p>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">Amount:</span>{" "}
                        {formatCurrency(request.amount)}
                      </p>
                      {parseFloat(request.amount) >= getThreshold() && (
                        <div className="bg-primary-50 border border-primary-200 rounded p-2 mt-2">
                          <p className="text-xs text-blue-800">
                            ⚠️ This request requires procurement review due to
                            amount ≥ {formatCurrency(getThreshold())}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Item Description */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Item/Service Requested
                  </h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                    {request.item_service_requested}
                  </p>
                </div>

                {/* Bank Details */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Vendor Bank Details
                  </h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                    {request.vendor_bank_details}
                  </p>
                </div>

                {/* Notes */}
                {request.notes && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                      {request.notes}
                    </p>
                  </div>
                )}
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

                  {renderActionButtons(request)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderDashboardView = () => {
    const stats = getDashboardStats();

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Pending</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.totalValue)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Assigned to You</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.myRequests}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.myValue)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Require Procurement</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.requireProcurement}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ≥ {formatCurrency(getThreshold())}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Departments</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.keys(stats.byDepartment).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Active departments</p>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Requests by Department
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byDepartment)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([dept, data]) => (
                <div
                  key={dept}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {purchaseRequestService.formatDepartment(dept)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {data.count} request{data.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(data.value)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Requests
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.slice(0, 10).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/purchase-requests/${request.request_id}`}
                        className="text-primary hover:text-blue-800 font-medium"
                      >
                        {request.request_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {request.requester_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {purchaseRequestService.formatDepartment(
                        request.department
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : request.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : request.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {request.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {isAssignedManager(request) ? (
                        <span className="text-green-600 font-medium">
                          Assigned to you
                        </span>
                      ) : (
                        <span className="text-gray-500">Other manager</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Approvals
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve purchase requests.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List size={18} />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode("dashboard")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "dashboard"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>

          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} Pending
          </span>

          <button
            onClick={fetchPendingApprovals}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Pending Approvals"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === "kanban" && renderKanbanView()}
      {viewMode === "list" && renderListView()}
      {viewMode === "dashboard" && renderDashboardView()}

      {/* View Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Request Details - {selectedRequest.request_id}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Request Details */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedRequest.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Stage</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getNextStage(selectedRequest.amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requester & Vendor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Requester Information
                  </h4>
                  <p className="text-sm text-gray-700">
                    <strong>Name:</strong> {selectedRequest.requester_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {selectedRequest.requester_email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Department:</strong>{" "}
                    {purchaseRequestService.formatDepartment(
                      selectedRequest.department
                    )}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Priority:</strong>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedRequest.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : selectedRequest.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : selectedRequest.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Vendor Information
                  </h4>
                  <p className="text-sm text-gray-700">
                    <strong>Vendor:</strong> {selectedRequest.vendor_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(selectedRequest.amount)}
                  </p>
                  {parseFloat(selectedRequest.amount) >= getThreshold() && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Requires procurement review (≥{" "}
                        {formatCurrency(getThreshold())})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Item/Service Requested
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                  {selectedRequest.item_service_requested}
                </p>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Vendor Bank Details
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                  {selectedRequest.vendor_bank_details}
                </p>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Additional Notes
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => handleDownloadReceipt(selectedRequest)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Receipt</span>
              </button>

              {isAssignedManager(selectedRequest) ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setApprovalData({ action: "reject", comments: "" });
                      setShowViewModal(false);
                      setShowApprovalModal(true);
                    }}
                    disabled={processingId === selectedRequest.request_id}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      setApprovalData({ action: "approve", comments: "" });
                      setShowViewModal(false);
                      setShowApprovalModal(true);
                    }}
                    disabled={processingId === selectedRequest.request_id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Assigned to:{" "}
                  {selectedRequest.ApprovingManager?.name || "Another manager"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {approvalData.action === "approve"
                  ? "Confirm Request"
                  : "Reject Request"}
              </h3>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                  setApprovalData({ action: "", comments: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900">Request Summary</h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>ID:</strong> {selectedRequest.request_id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Requester:</strong> {selectedRequest.requester_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Amount:</strong>{" "}
                {formatCurrency(selectedRequest.amount)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Next Stage:</strong>{" "}
                {getNextStage(selectedRequest.amount)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalData.action === "approve"
                    ? "Approval Comments"
                    : "Rejection Reason"}
                </label>
                <textarea
                  value={approvalData.comments}
                  onChange={(e) =>
                    setApprovalData((prev) => ({
                      ...prev,
                      comments: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={
                    approvalData.action === "approve"
                      ? "Enter approval comments (optional)..."
                      : "Enter reason for rejection (required)..."
                  }
                />
              </div>

              {approvalData.action === "approve" && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">
                    <strong>✓ Approving this request will:</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-1 ml-4 list-disc">
                    <li>Move to {getNextStage(selectedRequest.amount)}</li>
                    <li>Send notification to next approver</li>
                    <li>Update request status automatically</li>
                  </ul>
                </div>
              )}

              {approvalData.action === "reject" && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Rejecting this request will:</strong>
                  </p>
                  <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                    <li>Stop the approval workflow</li>
                    <li>Notify the requester of rejection</li>
                    <li>Require a new request to be submitted</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                  setApprovalData({ action: "", comments: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (
                    approvalData.action === "reject" &&
                    !approvalData.comments.trim()
                  ) {
                    toast.warning("Please provide a reason for rejection");
                    return;
                  }
                  handleApproval(
                    selectedRequest.request_id,
                    approvalData.action,
                    approvalData.comments
                  );
                }}
                disabled={processingId === selectedRequest.request_id}
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  approvalData.action === "approve"
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                }`}
              >
                {processingId === selectedRequest.request_id
                  ? "Processing..."
                  : approvalData.action === "approve"
                  ? "Confirm Request"
                  : "Reject Request"}
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

export default ManagerApproval;
