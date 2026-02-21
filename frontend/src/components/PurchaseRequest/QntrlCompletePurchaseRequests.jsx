import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  LayoutGrid,
  List,
  BarChart3,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Eye,
  Download,
  User,
  Building,
  Calendar,
  Filter,
  Search,
  Plus,
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  Send,
  Package,
  CreditCard,
} from "lucide-react";
import PurchaseRequestForm from "./PurchaseRequestForm";

const QntrlCompletePurchaseRequests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create"); // create, pending, procurement, payment
  const [activeView, setActiveView] = useState("kanban"); // kanban, list, dashboard
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Main tabs configuration
  const mainTabs = [
    {
      id: "create",
      name: "Create Request",
      icon: <Plus className="h-4 w-4" />,
      color: "blue",
      description: "Submit new purchase requests",
    },
    {
      id: "pending",
      name: "Pending Approval",
      icon: <Clock className="h-4 w-4" />,
      color: "yellow",
      description: "Requests awaiting manager approval",
      stages: ["submitted", "pending_approval"],
    },
    {
      id: "procurement",
      name: "Procurement Approval",
      icon: <Package className="h-4 w-4" />,
      color: "purple",
      description: "Requests in procurement review",
      stages: ["pending_procurement_review"],
    },
    {
      id: "payment",
      name: "Payment Process",
      icon: <CreditCard className="h-4 w-4" />,
      color: "green",
      description: "Requests in payment processing",
      stages: [
        "pending_finance_approval",
        "payment_in_progress",
        "awaiting_delivery_confirmation",
      ],
    },
  ];

  useEffect(() => {
    if (activeTab !== "create") {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiBaseUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1";

      const [statsResponse, requestsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/purchase-requests/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBaseUrl}/purchase-requests/dashboard/requests?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsResponse.ok && requestsResponse.ok) {
        const [statsData, requestsData] = await Promise.all([
          statsResponse.json(),
          requestsResponse.json(),
        ]);
        setStats(statsData.data);
        setRequests(requestsData.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getTabRequests = (tabId) => {
    const tab = mainTabs.find((t) => t.id === tabId);
    if (!tab || !tab.stages) return [];
    return requests.filter((r) => tab.stages.includes(r.status));
  };

  const filteredRequests = getTabRequests(activeTab).filter((request) => {
    const matchesSearch =
      searchTerm === "" ||
      request.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_service_requested
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      filterPriority === "all" || request.priority === filterPriority;

    return matchesSearch && matchesPriority;
  });

  const formatCurrency = (amount) => `₦${parseFloat(amount).toLocaleString()}`;
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "bg-red-100 text-red-700 border-red-200",
      high: "bg-orange-100 text-orange-700 border-orange-200",
      medium: "bg-blue-100 text-primary-700 border-primary-200",
      low: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[priority] || colors.low;
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: { label: "Submitted", color: "bg-blue-100 text-primary-700" },
      pending_approval: {
        label: "Pending Approval",
        color: "bg-yellow-100 text-yellow-700",
      },
      pending_procurement_review: {
        label: "Procurement Review",
        color: "bg-purple-100 text-purple-700",
      },
      pending_finance_approval: {
        label: "Finance Approval",
        color: "bg-orange-100 text-orange-700",
      },
      payment_in_progress: {
        label: "Payment Processing",
        color: "bg-indigo-100 text-indigo-700",
      },
      awaiting_delivery_confirmation: {
        label: "Awaiting Delivery",
        color: "bg-teal-100 text-teal-700",
      },
      completed: { label: "Completed", color: "bg-green-100 text-green-700" },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
    };
    const badge = badges[status] || {
      label: status,
      color: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  // Request Card Component
  const RequestCard = ({ request }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-primary">
              {request.request_id}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(
                request.priority
              )}`}
            >
              {request.priority}
            </span>
          </div>
          <p className="text-sm text-gray-900 line-clamp-2 mb-2">
            {request.item_service_requested}
          </p>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              {request.requester_name}
            </div>
            <div className="flex items-center">
              <Building className="h-3 w-3 mr-1" />
              {request.department}
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm font-bold text-gray-900">
          {formatCurrency(request.amount)}
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/purchase-requests/${request.request_id}`}
            className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-primary-50"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Created {formatDate(request.created_at)}
      </div>
    </div>
  );

  // Kanban View
  const KanbanView = () => {
    const statusGroups = {
      submitted: { title: "Submitted", requests: [], color: "blue" },
      pending_approval: {
        title: "Pending Approval",
        requests: [],
        color: "yellow",
      },
      pending_procurement_review: {
        title: "Procurement Review",
        requests: [],
        color: "purple",
      },
      pending_finance_approval: {
        title: "Finance Approval",
        requests: [],
        color: "orange",
      },
      payment_in_progress: {
        title: "Payment Processing",
        requests: [],
        color: "indigo",
      },
      awaiting_delivery_confirmation: {
        title: "Awaiting Delivery",
        requests: [],
        color: "teal",
      },
    };

    filteredRequests.forEach((request) => {
      if (statusGroups[request.status]) {
        statusGroups[request.status].requests.push(request);
      }
    });

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {Object.entries(statusGroups).map(([status, group]) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div
                className={`bg-${group.color}-50 border-2 border-${group.color}-200 rounded-lg`}
              >
                <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {group.title}
                    </h3>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                      {group.requests.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                  {group.requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No requests</p>
                    </div>
                  ) : (
                    group.requests.map((request) => (
                      <RequestCard key={request.id} request={request} />
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // List View
  const ListView = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Item/Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-primary">
                    {request.request_id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {request.item_service_requested}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {request.requester_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(request.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                      request.priority
                    )}`}
                  >
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/purchase-requests/${request.request_id}`}
                    className="text-primary hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4 inline" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredRequests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No requests found</p>
        </div>
      )}
    </div>
  );

  // Dashboard View
  const DashboardView = () => {
    const tabRequests = getTabRequests(activeTab);
    const totalAmount = tabRequests.reduce(
      (sum, r) => sum + parseFloat(r.amount),
      0
    );
    const avgAmount =
      tabRequests.length > 0 ? totalAmount / tabRequests.length : 0;

    const priorityBreakdown = {
      urgent: tabRequests.filter((r) => r.priority === "urgent").length,
      high: tabRequests.filter((r) => r.priority === "high").length,
      medium: tabRequests.filter((r) => r.priority === "medium").length,
      low: tabRequests.filter((r) => r.priority === "low").length,
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {tabRequests.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-primary">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ₦{Math.round(avgAmount).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Urgent Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {priorityBreakdown.urgent}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Priority Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(priorityBreakdown).map(([priority, count]) => (
                <div
                  key={priority}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700 capitalize">
                    {priority}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (count / (tabRequests.length || 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {tabRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {request.request_id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.requester_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Purchase Requests
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage purchase request workflows
              </p>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "create") {
                    setActiveView("kanban");
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-600 text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
                {tab.stages && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? "bg-white bg-opacity-30"
                        : "bg-white"
                    }`}
                  >
                    {getTabRequests(tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* View Tabs & Filters - Only show for non-create tabs */}
        {activeTab !== "create" && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* View Tabs */}
              <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setActiveView("kanban")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeView === "kanban"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="font-medium">Kanban</span>
                </button>
                <button
                  onClick={() => setActiveView("list")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeView === "list"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="font-medium">List</span>
                </button>
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    activeView === "dashboard"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Dashboard</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                  />
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "create" ? (
          <PurchaseRequestForm />
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeView === "kanban" && <KanbanView />}
            {activeView === "list" && <ListView />}
            {activeView === "dashboard" && <DashboardView />}
          </>
        )}
      </div>
    </div>
  );
};

export default QntrlCompletePurchaseRequests;
