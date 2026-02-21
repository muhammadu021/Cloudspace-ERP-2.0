import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import PermissionGuard from "../PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { PuffinLoader } from "../ui/PuffinLoader";
import {
  recoverFromAuthError,
  getAuthErrorMessage,
} from "../../utils/authRecovery";
import { forceLogout, checkAuthState } from "../../utils/forceLogout";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  User,
  Building,
  LayoutGrid,
  List as ListIcon,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  RefreshCw,
} from "lucide-react";
import PurchaseReceipt from "./PurchaseReceipt";
import { AllPurchaseCharts } from "./PurchaseRequestCharts";

const PurchaseRequestDashboard = () => {
  const { hasPermission, isAuthenticated, user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban', 'list', 'stats'
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [collapsedColumns, setCollapsedColumns] = useState({});
  const [showPaymentAuthModal, setShowPaymentAuthModal] = useState(false);
  const [authorizingRequest, setAuthorizingRequest] = useState(null);
  const [authComments, setAuthComments] = useState("");
  const [showMDApprovalModal, setShowMDApprovalModal] = useState(false);
  const [mdApprovingRequest, setMDApprovingRequest] = useState(null);
  const [mdComments, setMDComments] = useState("");

  const toggleColumn = (stageKey) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [stageKey]: !prev[stageKey],
    }));
  };

  useEffect(() => {
    // Always try to fetch data - let the API handle authentication
    fetchDashboardData();
  }, []);

  const handleAuthRecovery = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await recoverFromAuthError();
      const success = result === "recovered";
      if (success) {
        // Retry loading data
        await fetchDashboardData();
      } else {
        setError("Recovery failed. Please try logging out and back in.");
      }
    } catch (error) {
      console.error("Recovery failed:", error);
      setError("Recovery failed. Please try logging out and back in.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = () => {
    console.log("🔄 Force logout initiated from dashboard");
    checkAuthState(); // Log current state
    forceLogout();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get tokens from both sources for comparison
      const localStorageToken = localStorage.getItem("token");
      const authContextToken = token;

      console.log("🔍 Token Debug Info:", {
        localStorageToken: localStorageToken
          ? `${localStorageToken.substring(0, 20)}...`
          : "Missing",
        authContextToken: authContextToken
          ? `${authContextToken.substring(0, 20)}...`
          : "Missing",
        tokensMatch: localStorageToken === authContextToken,
        isAuthenticated: isAuthenticated,
        userEmail: user?.email,
      });

      // Use AuthContext token first, fallback to localStorage
      const tokenToUse = authContextToken || localStorageToken;

      if (!tokenToUse) {
        setError("Please log in to view the dashboard.");
        setLoading(false);
        return;
      }

      console.log(
        "🔑 Using token from:",
        authContextToken ? "AuthContext" : "localStorage"
      );

      // Get API base URL from environment
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";

      // Test token with a simple endpoint first
      console.log("🧪 Testing token with /auth/me endpoint...");
      try {
        const testResponse = await fetch(`${apiBaseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            "Content-Type": "application/json",
          },
        });
        console.log("🧪 Token test result:", {
          status: testResponse.status,
          ok: testResponse.ok,
        });

        if (!testResponse.ok) {
          const testError = await testResponse.text();
          console.log("🧪 Token test error:", testError);
        }
      } catch (testError) {
        console.log("🧪 Token test failed:", testError.message);
      }

      // Fetch both stats and requests in parallel
      const [statsResponse, requestsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/purchase-requests/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${apiBaseUrl}/purchase-requests/dashboard/requests?limit=100`, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      // Check for authentication errors
      if (statsResponse.status === 401 || requestsResponse.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }

      if (statsResponse.status === 403 || requestsResponse.status === 403) {
        // Get error details to understand the issue
        let errorText = "";
        try {
          errorText = await (statsResponse.ok
            ? requestsResponse.text()
            : statsResponse.text());
          console.log("403 Error details:", errorText);
        } catch (e) {
          console.log("Could not parse error response");
        }

        // Only treat as token issue if explicitly mentioned
        if (
          errorText.includes("Invalid token") ||
          errorText.includes("jwt malformed") ||
          errorText.includes("invalid signature") ||
          errorText.includes("JsonWebTokenError")
        ) {
          throw new Error(
            "Your login session is no longer valid. This usually happens after a server restart. Please log out and log back in."
          );
        }

        // Otherwise it's likely a permissions issue
        throw new Error(
          "Access denied. You may not have permission to view the Purchase Dashboard."
        );
      }

      if (!statsResponse.ok || !requestsResponse.ok) {
        let errorText = "";
        try {
          errorText = await (statsResponse.ok
            ? requestsResponse.text()
            : statsResponse.text());
          console.error("API Error Response:", {
            statsStatus: statsResponse.status,
            requestsStatus: requestsResponse.status,
            errorText: errorText,
          });
        } catch (e) {
          console.error("Could not parse error response");
        }

        // Provide more specific error messages
        if (statsResponse.status === 404 || requestsResponse.status === 404) {
          throw new Error(
            "Dashboard endpoints not found. Please contact your administrator."
          );
        }

        throw new Error(
          `Failed to fetch dashboard data (${statsResponse.status}/${requestsResponse.status}). Please try again later.`
        );
      }

      const [statsData, requestsData] = await Promise.all([
        statsResponse.json(),
        requestsResponse.json(),
      ]);

      // Debug logging to see what we're getting
      console.log("Dashboard API responses:", {
        statsData: statsData,
        requestsData: requestsData,
        statsSuccess: statsData.success,
        requestsSuccess: requestsData.success,
      });

      setStats(statsData.data);
      setRequests(requestsData.data.requests || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);

      // Show toast for non-auth errors
      if (
        !error.message.includes("Authentication") &&
        !error.message.includes("session has expired")
      ) {
        toast.error("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800",
      pending_approval: "bg-yellow-100 text-yellow-800",
      pending_procurement_review: "bg-purple-100 text-purple-800",
      pending_finance_approval: "bg-orange-100 text-orange-800",
      payment_in_progress: "bg-indigo-100 text-indigo-800",
      awaiting_delivery_confirmation: "bg-teal-100 text-teal-800",
      completed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStageColor = (stage) => {
    const colors = {
      request_creation: "bg-blue-100 text-blue-800",
      approval_stage: "bg-yellow-100 text-yellow-800",
      procurement_stage: "bg-purple-100 text-purple-800",
      finance_stage: "bg-orange-100 text-orange-800",
      pay_vendor_stage: "bg-indigo-100 text-indigo-800",
      delivery_stage: "bg-teal-100 text-teal-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleDownloadReceipt = (request) => {
    setSelectedRequest(request);
    setShowReceipt(true);
  };

  const handleMDApproval = async (action) => {
    if (!mdApprovingRequest) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1"
        }/purchase-requests/${mdApprovingRequest.request_id}/md-approval`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            action, // 'approve' or 'reject'
            comments: mdComments,
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process MD approval");
      }

      const data = await response.json();

      toast.success(
        action === "approve"
          ? "MD approved successfully! Request moved to Payment Processing."
          : "MD approval rejected. Request returned to Finance."
      );

      // Refresh dashboard data
      await fetchDashboardData();

      // Close modal and reset
      setShowMDApprovalModal(false);
      setMDApprovingRequest(null);
      setMDComments("");
    } catch (error) {
      console.error("MD approval error:", error);
      toast.error(error.message || "Failed to process MD approval");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAuthorization = async (action) => {
    if (!authorizingRequest) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1"
        }/purchase-requests/${authorizingRequest.request_id}/authorize-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            action, // 'approve' or 'reject'
            comments: authComments,
            authorized_by: user?.id,
            authorized_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process payment authorization");
      }

      const data = await response.json();

      toast.success(
        action === "approve"
          ? "Payment authorized successfully! Request moved to Pay Vendor stage."
          : "Payment authorization rejected."
      );

      // Refresh dashboard data
      await fetchDashboardData();

      // Close modal and reset
      setShowPaymentAuthModal(false);
      setAuthorizingRequest(null);
      setAuthComments("");
    } catch (error) {
      console.error("Payment authorization error:", error);
      toast.error(error.message || "Failed to process payment authorization");
    } finally {
      setLoading(false);
    }
  };

  // Group requests by stage for Kanban board
  const groupRequestsByStage = () => {
    const stages = {
      approval_stage: {
        title: "Manager Approval",
        requests: [],
        color: "border-yellow-200 bg-yellow-50",
      },
      procurement_stage: {
        title: "Procurement Confirmation",
        requests: [],
        color: "border-purple-200 bg-purple-50",
      },
      finance_stage: {
        title: "Finance Confirmation",
        requests: [],
        color: "border-orange-200 bg-orange-50",
      },
      md_approval_stage: {
        title: "MD Approval",
        requests: [],
        color: "border-red-200 bg-red-50",
      },
      payment_authorization_stage: {
        title: "Payment Authorization",
        requests: [],
        color: "border-indigo-200 bg-indigo-50",
      },
      delivery_stage: {
        title: "Pay Vendor",
        requests: [],
        color: "border-teal-200 bg-teal-50",
      },
      completed: {
        title: "Request Closed",
        requests: [],
        color: "border-green-200 bg-green-50",
      },
    };

    requests.forEach((request) => {
      if (stages[request.current_stage]) {
        stages[request.current_stage].requests.push(request);
      }
    });

    return stages;
  };

  const kanbanStages = groupRequestsByStage();

  // Render Kanban View
  const renderKanbanView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Purchase Request Workflow
      </h3>
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {Object.entries(kanbanStages).map(([stageKey, stage]) => {
            const isCollapsed = collapsedColumns[stageKey];

            return (
              <div
                key={stageKey}
                className={`flex-shrink-0 border-2 rounded-lg ${
                  stage.color
                } transition-all duration-300 ${isCollapsed ? "w-16" : "w-80"}`}
              >
                {isCollapsed ? (
                  // Collapsed view - vertical title
                  <div className="h-full flex flex-col items-center justify-between py-4">
                    <button
                      onClick={() => toggleColumn(stageKey)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors mb-2"
                      title="Expand column"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>

                    <div className="flex-1 flex items-center justify-center">
                      <div className="transform -rotate-90 whitespace-nowrap">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {stage.title}
                        </h4>
                      </div>
                    </div>

                    <div className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600 mt-2">
                      {stage.requests.length}
                    </div>
                  </div>
                ) : (
                  // Expanded view - normal
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {stage.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                            {stage.requests.length}
                          </span>
                          <button
                            onClick={() => toggleColumn(stageKey)}
                            className="p-1 hover:bg-white/50 rounded transition-colors"
                            title="Collapse column"
                          >
                            <ChevronLeft className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {stage.requests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No requests</p>
                        </div>
                      ) : (
                        stage.requests.map((request) => (
                          <div
                            key={request.id}
                            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-primary">
                                    {request.request_id}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      request.priority === "urgent"
                                        ? "bg-red-100 text-red-700"
                                        : request.priority === "high"
                                        ? "bg-orange-100 text-orange-700"
                                        : request.priority === "medium"
                                        ? "bg-blue-100 text-primary-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {request.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                                  {request.item_service_requested}
                                </p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {request.requester_name}
                                  </div>
                                  <div className="flex items-center">
                                    <Building className="h-3 w-3 mr-1" />
                                    {request.department}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCurrency(request.amount)}
                              </div>
                              <div className="flex items-center space-x-1">
                                <Link
                                  to={`/purchase-requests/${request.request_id}`}
                                  className="p-1 text-gray-400 hover:text-primary rounded"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDownloadReceipt(request)}
                                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                                  title="Download Receipt"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-500">
                              Created {formatDate(request.created_at)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        All Purchase Requests
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item/Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/purchase-requests/${request.request_id}`}
                    className="text-sm font-medium text-primary hover:text-blue-800"
                  >
                    {request.request_id}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {request.item_service_requested}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.requester_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.department}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(request.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(
                      request.current_stage
                    )}`}
                  >
                    {request.current_stage.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      request.priority === "urgent"
                        ? "bg-red-100 text-red-800"
                        : request.priority === "high"
                        ? "bg-orange-100 text-orange-800"
                        : request.priority === "medium"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/purchase-requests/${request.request_id}`}
                      className="text-primary hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDownloadReceipt(request)}
                      className="text-green-600 hover:text-green-900"
                      title="Download Receipt"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Stats View
  const renderStatsView = () => (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Status Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(
            requests.reduce((acc, req) => {
              acc[req.status] = (acc[req.status] || 0) + 1;
              return acc;
            }, {})
          ).map(([status, count]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div
                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(
                  status
                )}`}
              >
                {status.replace(/_/g, " ")}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">
                {((count / requests.length) * 100).toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Department Breakdown
        </h3>
        <div className="space-y-4">
          {Object.entries(
            requests.reduce((acc, req) => {
              const dept = req.department || "Unknown";
              if (!acc[dept]) {
                acc[dept] = { count: 0, amount: 0 };
              }
              acc[dept].count++;
              acc[dept].amount += parseFloat(req.amount);
              return acc;
            }, {})
          )
            .sort((a, b) => b[1].count - a[1].count)
            .map(([dept, data]) => (
              <div
                key={dept}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{dept}</div>
                  <div className="text-sm text-gray-600">
                    {data.count} requests
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatCurrency(data.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg: {formatCurrency(data.amount / data.count)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Priority Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["urgent", "high", "medium", "low"].map((priority) => {
            const count = requests.filter(
              (req) => req.priority === priority
            ).length;
            const amount = requests
              .filter((req) => req.priority === priority)
              .reduce((sum, req) => sum + parseFloat(req.amount), 0);

            return (
              <div key={priority} className="bg-gray-50 rounded-lg p-4">
                <div
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                    priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : priority === "medium"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {priority.toUpperCase()}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PuffinLoader size="md" message="Loading dashboard..." />
      </div>
    );
  }

  // Check if user has permission to view dashboard
  if (
    hasPermission &&
    typeof hasPermission === "function" &&
    !hasPermission("purchase-dashboard")
  ) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Access Restricted
              </h3>
              <p className="text-yellow-700 mb-4">
                You don't have permission to view the Purchase Request
                Dashboard. Please contact your administrator to request access.
              </p>
              <Link
                to="/purchase-requests"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Go to Purchase Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <XCircle className="h-6 w-6 text-red-400 mr-3 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Dashboard Error
              </h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex space-x-3">
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
                {error.includes("Authentication") ||
                error.includes("token") ||
                error.includes("session") ||
                error.includes("login session") ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Refresh Page
                    </button>
                    <Link
                      to="/login"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                    >
                      Go to Login
                    </Link>
                  </div>
                ) : error.includes("Please log in") ? (
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Go to Login
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6">
      {/* MD APPROVAL SECTION - MINIMAL */}
      {kanbanStages.md_approval_stage?.requests?.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-3 mb-4 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-white animate-pulse" />
              <span className="text-white font-semibold text-sm">
                GMD Approval Required
              </span>
              <span className="bg-white text-red-600 px-2 py-0.5 rounded-full font-bold text-xs">
                {kanbanStages.md_approval_stage.requests.length}
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {kanbanStages.md_approval_stage.requests.map((request) => (
                <button
                  key={request.request_id}
                  onClick={() => {
                    setMDApprovingRequest(request);
                    setShowMDApprovalModal(true);
                  }}
                  className="bg-white hover:bg-gray-50 text-gray-900 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap border border-red-200 hover:border-red-400"
                >
                  <span className="font-bold">PR-{request.request_id}</span>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(request.amount)}
                  </span>
                  <Shield className="h-3 w-3 text-red-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Purchase Requests Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage purchase request workflows
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
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
              <ListIcon size={18} />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode("stats")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === "stats"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Statistics</span>
            </button>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Dashboard Data"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          {/* <PermissionGuard permission="purchase-create" mode="item">
            <Link
              to="/purchase-requests/new"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>New Request</span>
            </Link>
          </PermissionGuard> */}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview?.total_requests || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">
              {stats?.overview?.this_month || 0} this month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                ₦{(stats?.overview?.total_amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              Avg: ₦
              {Math.round(
                (stats?.overview?.total_amount || 0) /
                  (stats?.overview?.total_requests || 1)
              ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Processing Time
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview?.avg_processing_time_days || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">days average</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Monthly Change
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.trends?.monthly_change || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">vs last month</span>
          </div>
        </div>
      </div>

      {/* Payment Authorization Section - REMOVED (no longer part of workflow) */}

      {/* Analytics Charts Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Purchase Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Visual insights into purchase request trends and patterns
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200">
              📊 {requests.length} Requests
            </span>
          </div>
        </div>
        <AllPurchaseCharts requests={requests} />
      </div>

      {/* View Content */}
      {viewMode === "kanban" && renderKanbanView()}
      {viewMode === "list" && renderListView()}
      {viewMode === "stats" && renderStatsView()}

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PermissionGuard permission="purchase-create" mode="item">
            <Link
              to="/purchase-requests/new"
              className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-blue-100 text-primary-700 px-4 py-3 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Create Request</span>
            </Link>
          </PermissionGuard>
          
          <PermissionGuard permission="purchase-pending" mode="item">
            <Link
              to="/purchase-requests/pending-approval"
              className="flex items-center justify-center space-x-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg transition-colors"
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">Pending Approval</span>
            </Link>
          </PermissionGuard>
          
          <PermissionGuard permission="purchase-procurement" mode="item">
            <Link
              to="/purchase-requests/procurement"
              className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Procurement</span>
            </Link>
          </PermissionGuard>
          
          <PermissionGuard permission="purchase-finance" mode="item">
            <Link
              to="/purchase-requests/finance"
              className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors"
            >
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Finance</span>
            </Link>
          </PermissionGuard>
        </div>
      </div> */}

      {/* Administration Section */}
      {/* <PermissionGuard permission="purchase-settings" mode="item">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Administration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/purchase-requests/settings"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-primary-200 hover:border-blue-300"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-md bg-blue-100">
                  <span className="text-primary text-xl">⚙️</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Settings</h3>
                  <p className="text-sm text-gray-600 mb-3">Configure approval thresholds and workflow stages</p>
                </div>
              </div>
            </Link>

            <Link
              to="/purchase-requests/settings"
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-green-200 hover:border-green-300"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-md bg-green-100">
                  <span className="text-green-600 text-xl">👥</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manager Assignment</h3>
                  <p className="text-sm text-gray-600 mb-3">Assign department managers and approval hierarchies</p>
                </div>
              </div>
            </Link>

            <Link
              to="/purchase-requests/history"
              className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-purple-200 hover:border-purple-300"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-md bg-purple-100">
                  <span className="text-purple-600 text-xl">📊</span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Request History</h3>
                  <p className="text-sm text-gray-600 mb-3">View complete history of all purchase requests</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </PermissionGuard> */}
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

      {/* MD APPROVAL MODAL */}
      {showMDApprovalModal && mdApprovingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-10 w-10 mr-3 animate-pulse" />
                  <div>
                    <h2 className="text-3xl font-bold">
                      GMD APPROVAL REQUIRED
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                      Managing Director final approval before payment
                      authorization
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMDApprovalModal(false);
                    setMDApprovingRequest(null);
                    setMDComments("");
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Request Details */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-5 border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <FileText className="h-6 w-6 mr-2 text-red-600" />
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Request ID
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      PR-{mdApprovingRequest.request_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Amount</p>
                    <p className="font-bold text-green-600 text-2xl">
                      {formatCurrency(mdApprovingRequest.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Requester
                    </p>
                    <p className="font-semibold text-gray-900">
                      {mdApprovingRequest.requester_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Department
                    </p>
                    <p className="font-semibold text-gray-900">
                      {mdApprovingRequest.department}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-medium">
                      Description
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {mdApprovingRequest.description}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 font-medium">Vendor</p>
                    <p className="font-medium text-gray-900">
                      {mdApprovingRequest.vendor_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Workflow Status */}
              <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Approval Workflow Status
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Manager:</strong> Approved
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Procurement:</strong> Reviewed & Approved
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Finance:</strong> Budget Approved
                    </span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-orange-600 animate-pulse" />
                    <span className="text-orange-700 font-bold">
                      <strong>MD Approval:</strong> PENDING - Awaiting your
                      decision
                    </span>
                  </li>
                </ul>
              </div>

              {/* MD Comments */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  MD Comments / Decision Notes
                </label>
                <textarea
                  value={mdComments}
                  onChange={(e) => setMDComments(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  placeholder="Enter your comments or decision notes (optional)..."
                />
              </div>

              {/* View/Download Purchase Order */}
              <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Purchase Order Document
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  Review the complete purchase request details before making
                  your decision.
                </p>
                <button
                  onClick={() => handleDownloadReceipt(mdApprovingRequest)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center shadow-md transform hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  View / Download Purchase Order
                </button>
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      <strong>Important:</strong> Your approval will move this
                      request to Payment Processing.
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Rejection will return the request to Finance for review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowMDApprovalModal(false);
                    setMDApprovingRequest(null);
                    setMDComments("");
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMDApproval("reject")}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors flex items-center shadow-lg"
                  disabled={loading}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  REJECT
                </button>
                <button
                  onClick={() => handleMDApproval("approve")}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold transition-all duration-200 flex items-center shadow-lg transform hover:scale-105"
                  disabled={loading}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {loading ? "PROCESSING..." : "MD APPROVE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Authorization Modal */}
      {showPaymentAuthModal && authorizingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">
                      Payment Authorization
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      Final approval before payment processing
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentAuthModal(false);
                    setAuthorizingRequest(null);
                    setAuthComments("");
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Request Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request ID</p>
                    <p className="font-semibold text-gray-900">
                      PR-{authorizingRequest.request_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-green-600 text-lg">
                      {formatCurrency(authorizingRequest.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requester</p>
                    <p className="font-semibold text-gray-900">
                      {authorizingRequest.requester_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-semibold text-gray-900">
                      {authorizingRequest.department}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-gray-900">
                      {authorizingRequest.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Authorization Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Authorization Checklist
                </h4>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <span>Finance approval completed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                    <span>Budget allocation verified</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-yellow-600" />
                    <span>Final payment authorization required</span>
                  </li>
                </ul>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authorization Comments
                </label>
                <textarea
                  value={authComments}
                  onChange={(e) => setAuthComments(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter any comments or notes for this authorization..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPaymentAuthModal(false);
                    setAuthorizingRequest(null);
                    setAuthComments("");
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePaymentAuthorization("reject")}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center"
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handlePaymentAuthorization("approve")}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center"
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? "Processing..." : "Authorize Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestDashboard;
