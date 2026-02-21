import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const QntrlStylePurchaseRequests = () => {
  const [activeView, setActiveView] = useState("kanban"); // kanban, list, dashboard
  const [activeStage, setActiveStage] = useState("all"); // all, request_creation, approval_stage, etc.
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  // Process stages configuration
  const stages = [
    { id: "all", name: "All Requests", icon: "📋", color: "gray" },
    { id: "request_creation", name: "Created", icon: "📝", color: "blue" },
    {
      id: "approval_stage",
      name: "Pending Approval",
      icon: "⏳",
      color: "yellow",
    },
    {
      id: "procurement_stage",
      name: "Procurement Review",
      icon: "🛒",
      color: "purple",
    },
    {
      id: "finance_stage",
      name: "Finance Approval",
      icon: "💰",
      color: "orange",
    },
    {
      id: "pay_vendor_stage",
      name: "Payment Processing",
      icon: "💳",
      color: "indigo",
    },
    {
      id: "delivery_stage",
      name: "Awaiting Delivery",
      icon: "🚚",
      color: "teal",
    },
    { id: "completed", name: "Completed", icon: "✅", color: "green" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

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

  const getStageColor = (stageId) => {
    const stage = stages.find((s) => s.id === stageId);
    return stage?.color || "gray";
  };

  const getStageRequests = (stageId) => {
    if (stageId === "all") return requests;
    return requests.filter((r) => r.current_stage === stageId);
  };

  const filteredRequests = getStageRequests(activeStage).filter((request) => {
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

  // Kanban View
  const KanbanView = () => {
    const kanbanStages = stages.filter((s) => s.id !== "all");

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {kanbanStages.map((stage) => {
            const stageRequests = getStageRequests(stage.id).filter(
              (request) => {
                const matchesSearch =
                  searchTerm === "" ||
                  request.request_id
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  request.item_service_requested
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
                const matchesPriority =
                  filterPriority === "all" ||
                  request.priority === filterPriority;
                return matchesSearch && matchesPriority;
              }
            );

            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div
                  className={`bg-${stage.color}-50 border-2 border-${stage.color}-200 rounded-lg`}
                >
                  <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{stage.icon}</span>
                        <h3 className="font-semibold text-gray-900">
                          {stage.name}
                        </h3>
                      </div>
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                        {stageRequests.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {stageRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No requests</p>
                      </div>
                    ) : (
                      stageRequests.map((request) => (
                        <RequestCard key={request.id} request={request} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <span className="text-xs text-gray-600">
                    {stages.find((s) => s.id === request.current_stage)?.name ||
                      request.current_stage}
                  </span>
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
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={stats?.overview?.total_requests || 0}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="blue"
          subtitle={`${stats?.overview?.this_month || 0} this month`}
        />
        <StatCard
          title="Total Amount"
          value={`₦${(stats?.overview?.total_amount || 0).toLocaleString()}`}
          icon={<CreditCard className="h-6 w-6" />}
          color="green"
          subtitle={`Avg: ₦${Math.round(
            (stats?.overview?.total_amount || 0) /
              (stats?.overview?.total_requests || 1)
          ).toLocaleString()}`}
        />
        <StatCard
          title="Processing Time"
          value={`${stats?.overview?.avg_processing_time_days || 0} days`}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          subtitle="average"
        />
        <StatCard
          title="Monthly Change"
          value={`${stats?.trends?.monthly_change || 0}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
          subtitle="vs last month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(stats?.status_breakdown || {}).map(
              ([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {status.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (count / (stats?.overview?.total_requests || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stage Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats?.stage_breakdown || {}).map(
              ([stage, count]) => {
                const stageInfo = stages.find((s) => s.id === stage);
                return (
                  <div
                    key={stage}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{stageInfo?.icon || "📋"}</span>
                      <span className="text-sm text-gray-700">
                        {stageInfo?.name || stage}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${
                            stageInfo?.color || "gray"
                          }-600 h-2 rounded-full`}
                          style={{
                            width: `${
                              (count / (stats?.overview?.total_requests || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Request Card Component
  const RequestCard = ({ request }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-primary">
              {request.request_id}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(
                request.priority
              )}`}
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

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="text-sm font-semibold text-gray-900">
          {formatCurrency(request.amount)}
        </div>
        <div className="flex items-center space-x-1">
          <Link
            to={`/purchase-requests/${request.request_id}`}
            className="p-1 text-gray-400 hover:text-primary rounded"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        {formatDate(request.created_at)}
      </div>
    </div>
  );

  // Stat Card Component
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg text-${color}-600`}>
          {icon}
        </div>
      </div>
      {subtitle && <div className="mt-3 text-sm text-gray-500">{subtitle}</div>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                Manage and track purchase request workflows
              </p>
            </div>
            <Link
              to="/purchase-requests/new"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Request</span>
            </Link>
          </div>

          {/* Stage Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeStage === stage.id
                    ? `bg-${stage.color}-100 text-${stage.color}-700 border-2 border-${stage.color}-300`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{stage.icon}</span>
                <span className="font-medium">{stage.name}</span>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-semibold">
                  {getStageRequests(stage.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* View Tabs & Filters */}
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
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === "kanban" && <KanbanView />}
        {activeView === "list" && <ListView />}
        {activeView === "dashboard" && <DashboardView />}
      </div>
    </div>
  );
};

export default QntrlStylePurchaseRequests;
