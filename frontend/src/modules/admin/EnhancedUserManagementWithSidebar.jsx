import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  SIDEBAR_MODULES_ARRAY,
  groupModulesByCategory,
} from "@/config/sidebarConfig";
import { getCustomIcon } from "@/config/iconMapping";
import { adminService } from "@/services/adminService";
import api from "@/services/api";
import { getCompanyId } from "@/utils/company";
import { toast } from "react-hot-toast";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Check,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LayoutGrid,
  List,
  Key,
  UserCog,
} from "lucide-react";

const EnhancedUserManagementWithSidebar = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [userTypesView, setUserTypesView] = useState("list"); // 'grid' or 'list'
  const [companyAllowedModules, setCompanyAllowedModules] = useState([]);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const usersPerPage = 10;

  // Get sidebar structure filtered by company's allowed modules and sub_items
  const sidebarStructure = React.useMemo(() => {
    if (!companyAllowedModules.length) return [];
    
    // Create a map of allowed module IDs and their sub_items
    const allowedModuleMap = {};
    companyAllowedModules.forEach((mod) => {
      allowedModuleMap[mod.module_id] = mod.sub_items || [];
    });

    return SIDEBAR_MODULES_ARRAY
      .filter((module) => allowedModuleMap[module.id])
      .map((module) => {
        const allowedSubItems = allowedModuleMap[module.id] || [];
        return {
          id: module.id,
          name: module.name,
          description: module.description,
          icon: module.icon,
          category: module.category,
          items: module.subItems
            .filter((subItem) => allowedSubItems.includes(subItem.permissionId || subItem.id))
            .map((subItem) => ({
              id: subItem.permissionId || subItem.id,
              name: subItem.name,
              description: subItem.description,
            })),
        };
      })
      .filter((module) => module.items.length > 0);
  }, [companyAllowedModules]);

  // Form state for creating/editing user types
  const [userTypeForm, setUserTypeForm] = useState({
    name: "",
    display_name: "",
    description: "",
    color: "blue",
    selectedModules: {}, // Changed to object to track individual items
    selectedItems: {}, // Track individual sub-items
  });

  // Load data on component mount
  useEffect(() => {
    loadCompanyModules();
    loadUserTypes();
    loadUsers();
  }, []);

  const loadCompanyModules = async () => {
    try {
      const company_id = getCompanyId();
      // Use company-users/available-modules which returns full modules with sub_items
      const response = await api.get("/company-users/available-modules", { params: { company_id } });
      if (response.data?.success) {
        const availableModules = response.data.data?.available_modules || [];
        setCompanyAllowedModules(availableModules);
      }
    } catch (error) {
      console.error("Error loading company modules:", error);
      // Fallback to empty - will show no modules
      setCompanyAllowedModules([]);
    }
  };

  const loadUserTypes = async () => {
    try {
      const response = await adminService.getUserTypes();
      if (response.data.success) {
        setUserTypes(response.data.data.userTypes || []);
      }
    } catch (error) {
      console.error("Error loading user types:", error);
    }
  };

  const loadUsers = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: usersPerPage,
      };

      if (search) {
        params.search = search;
      }

      const response = await adminService.getAllUsers(params);
      if (response.data.success) {
        const data = response.data.data;
        setUsers(data.users || []);
        setTotalUsers(data.pagination?.totalItems || data.users?.length || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || page);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserType = () => {
    setUserTypeForm({
      name: "",
      display_name: "",
      description: "",
      color: "blue",
      selectedModules: {},
      selectedItems: {},
    });
    setExpandedModules({});
    setShowCreateModal(true);
  };

  const handleEditUserType = (userType) => {
    setSelectedUserType(userType);

    // Convert existing sidebar_modules to new format
    const selectedModules = {};
    const selectedItems = {};

    if (Array.isArray(userType.sidebar_modules)) {
      userType.sidebar_modules.forEach((module) => {
        selectedModules[module.module_id] = true;

        // Only select the items that were actually saved for this module
        if (Array.isArray(module.items) && module.items.length > 0) {
          module.items.forEach((itemId) => {
            selectedItems[itemId] = true;
          });
        } else {
          // If no specific items were saved, this might be an old format
          // where the entire module was selected - select all items
          const moduleStructure = sidebarStructure.find(
            (m) => m.id === module.module_id
          );
          if (moduleStructure && moduleStructure.items) {
            moduleStructure.items.forEach((item) => {
              selectedItems[item.id] = true;
            });
          }
        }
      });
    }

    setUserTypeForm({
      name: userType.name,
      display_name: userType.display_name,
      description: userType.description || "",
      color: userType.color || "blue",
      selectedModules,
      selectedItems,
    });
    setShowEditModal(true);
  };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleModuleToggle = (moduleId) => {
    const module = sidebarStructure.find((m) => m.id === moduleId);
    const isCurrentlySelected = userTypeForm.selectedModules[moduleId];

    setUserTypeForm((prev) => {
      const newSelectedModules = { ...prev.selectedModules };
      const newSelectedItems = { ...prev.selectedItems };

      if (isCurrentlySelected) {
        // Deselecting module - remove module and all its items
        delete newSelectedModules[moduleId];
        if (module && module.items) {
          module.items.forEach((item) => {
            delete newSelectedItems[item.id];
          });
        }
      } else {
        // Selecting module - add module and all its items
        newSelectedModules[moduleId] = true;
        if (module && module.items) {
          module.items.forEach((item) => {
            newSelectedItems[item.id] = true;
          });
        }
      }

      return {
        ...prev,
        selectedModules: newSelectedModules,
        selectedItems: newSelectedItems,
      };
    });
  };

  const handleItemToggle = (moduleId, itemId) => {
    const module = sidebarStructure.find((m) => m.id === moduleId);

    setUserTypeForm((prev) => {
      const newSelectedItems = { ...prev.selectedItems };
      const newSelectedModules = { ...prev.selectedModules };

      if (newSelectedItems[itemId]) {
        // Deselecting item
        delete newSelectedItems[itemId];

        // Check if any items from this module are still selected
        const hasSelectedItems = module.items.some(
          (item) => newSelectedItems[item.id]
        );
        if (!hasSelectedItems) {
          // No items selected, remove module
          delete newSelectedModules[moduleId];
        } else {
          // Some items still selected, keep module but mark as partial
          newSelectedModules[moduleId] = false; // false indicates partial selection
        }
      } else {
        // Selecting item
        newSelectedItems[itemId] = true;

        // Check if ALL items in this module are now selected
        const allItemsSelected = module.items.every(
          (item) => item.id === itemId || newSelectedItems[item.id]
        );

        // Set module state based on whether all items are selected
        newSelectedModules[moduleId] = allItemsSelected;
      }

      return {
        ...prev,
        selectedModules: newSelectedModules,
        selectedItems: newSelectedItems,
      };
    });
  };

  const getModuleSelectionState = (module) => {
    if (!module.items || module.items.length === 0) {
      // For modules without items, check if module is directly selected
      return userTypeForm.selectedModules[module.id] ? "full" : "none";
    }

    const selectedItemsCount = module.items.filter(
      (item) => userTypeForm.selectedItems[item.id]
    ).length;

    if (selectedItemsCount === 0) return "none";
    if (selectedItemsCount === module.items.length) return "full";
    return "partial";
  };

  const handleSaveUserType = async () => {
    try {
      // Convert selected modules and items back to the expected format
      // Only include modules that have at least one selected item
      const sidebarModules = [];

      // Go through all modules and check which ones have selected items
      SIDEBAR_MODULES_ARRAY.forEach((module) => {
        const selectedItems = module.subItems
          ? module.subItems
              .filter(
                (item) =>
                  userTypeForm.selectedItems[item.permissionId || item.id]
              )
              .map((item) => item.permissionId || item.id)
          : [];

        // Only add module if it has selected items
        if (selectedItems.length > 0) {
          sidebarModules.push({
            module_id: module.id,
            enabled: true,
            permissions: ["read"],
            items: selectedItems,
          });
        }
      });

      const payload = {
        name: userTypeForm.name,
        display_name: userTypeForm.display_name,
        description: userTypeForm.description,
        color: userTypeForm.color,
        sidebar_modules: sidebarModules,
      };

      let response;
      if (selectedUserType) {
        response = await adminService.updateUserType(
          selectedUserType.id,
          payload
        );
      } else {
        response = await adminService.createUserType(payload);
      }

      if (response.data.success) {
        await loadUserTypes();
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedUserType(null);
      } else {
        toast(response.data.message || "Failed to save user type");
      }
    } catch (error) {
      console.error("Error saving user type:", error);
      toast.error("Failed to save user type");
    }
  };

  const handleDeleteUserType = async (userType) => {
    if (
      !confirm(`Are you sure you want to delete "${userType.display_name}"?`)
    ) {
      return;
    }

    try {
      const response = await adminService.deleteUserType(userType.id);
      if (response.data.success) {
        await loadUserTypes();
      } else {
        toast(response.data.message || "Failed to delete user type");
      }
    } catch (error) {
      console.error("Error deleting user type:", error);
      toast.error("Failed to delete user type");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      position: user.position || "",
    });
    setShowEditUserModal(true);
  };

  const handleSaveUserEdit = async () => {
    try {
      const response = await adminService.updateUser(
        selectedUser.id,
        editUserForm
      );
      if (response.data.success) {
        toast.success("User updated successfully");
        await loadUsers(currentPage, searchQuery);
        setShowEditUserModal(false);
        setSelectedUser(null);
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setShowResetPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await adminService.resetUserPassword(selectedUser.id, {
        password: newPassword,
      });
      if (response.data.success) {
        toast.success("Password reset successfully");
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const handleAssignUserType = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const handleSaveUserAssignment = async (userTypeId) => {
    try {
      const response = await adminService.assignUserType(
        selectedUser.id,
        userTypeId
      );
      if (response.data.success) {
        await loadUsers(currentPage, searchQuery);
        setShowAssignModal(false);
        setSelectedUser(null);
      } else {
        toast(response.data.message || "Failed to assign user type");
      }
    } catch (error) {
      console.error("Error assigning user type:", error);
      toast.error("Failed to assign user type");
    }
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
    loadUsers(1, searchInput);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
    loadUsers(1, "");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadUsers(nextPage, searchQuery);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      loadUsers(prevPage, searchQuery);
    }
  };

  const handleGoToPage = (page) => {
    setCurrentPage(page);
    loadUsers(page, searchQuery);
  };

  const getColorClass = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 border-primary-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[color] || colors.blue;
  };

  // Use the centralized grouping function but convert to our local structure
  const groupedModules = {};
  sidebarStructure.forEach((module) => {
    if (!groupedModules[module.category]) {
      groupedModules[module.category] = [];
    }
    groupedModules[module.category].push(module);
  });

  const getSelectedItemsCount = () => {
    return Object.keys(userTypeForm.selectedItems).length;
  };

  const getSelectedModulesCount = () => {
    return Object.keys(userTypeForm.selectedModules).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <img
            src="/icon.png"
            alt="Cloudspace Icon"
            className="h-16 w-16 opacity-80"
          />
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">
            Loading User Management...
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Enhanced User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create user types with detailed sidebar access control
          </p>
        </div>
        <button
          onClick={handleCreateUserType}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User Type
        </button>
      </div>

      {/* User Types Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              User Types ({userTypes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserTypesView("grid")}
                className={`p-2 rounded-md ${
                  userTypesView === "grid"
                    ? "bg-blue-100 text-primary"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setUserTypesView("list")}
                className={`p-2 rounded-md ${
                  userTypesView === "list"
                    ? "bg-blue-100 text-primary"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userTypes.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No user types created yet</p>
              <button
                onClick={handleCreateUserType}
                className="mt-4 text-primary hover:text-blue-800"
              >
                Create your first user type
              </button>
            </div>
          ) : userTypesView === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTypes.map((userType) => {
                const totalItems = Array.isArray(userType.sidebar_modules)
                  ? userType.sidebar_modules.reduce((acc, module) => {
                      return (
                        acc +
                        (Array.isArray(module.items) ? module.items.length : 0)
                      );
                    }, 0)
                  : 0;

                return (
                  <div
                    key={userType.id}
                    className={`border rounded-lg p-4 ${getColorClass(
                      userType.color
                    )}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          {userType.display_name}
                        </h3>
                        <p className="text-sm opacity-75">
                          {userType.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditUserType(userType)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUserType(userType)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Users:</span>
                        <span className="font-medium">
                          {userType.user_count || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Modules:</span>
                        <span className="font-medium">
                          {Array.isArray(userType.sidebar_modules)
                            ? userType.sidebar_modules.length
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Items:</span>
                        <span className="font-medium">{totalItems}</span>
                      </div>

                      {Array.isArray(userType.sidebar_modules) &&
                        userType.sidebar_modules.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">
                              Assigned Modules:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {userType.sidebar_modules
                                .slice(0, 3)
                                .map((module) => {
                                  const moduleInfo = SIDEBAR_MODULES_ARRAY.find(
                                    (m) => m.id === module.module_id
                                  );
                                  return (
                                    <span
                                      key={module.module_id}
                                      className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded"
                                    >
                                      {moduleInfo?.name || module.module_id}
                                    </span>
                                  );
                                })}
                              {userType.sidebar_modules.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                  +{userType.sidebar_modules.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userTypes.map((userType) => {
                const totalItems = Array.isArray(userType.sidebar_modules)
                  ? userType.sidebar_modules.reduce((acc, module) => {
                      return (
                        acc +
                        (Array.isArray(module.items) ? module.items.length : 0)
                      );
                    }, 0)
                  : 0;

                return (
                  <div
                    key={userType.id}
                    className={`border rounded-lg p-3 ${getColorClass(
                      userType.color
                    )} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {userType.display_name}
                          </h3>
                          <span className="text-xs opacity-75">
                            ({userType.name})
                          </span>
                        </div>
                        <p className="text-sm opacity-75 mt-1">
                          {userType.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold">
                            {userType.user_count || 0}
                          </div>
                          <div className="text-xs opacity-75">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">
                            {Array.isArray(userType.sidebar_modules)
                              ? userType.sidebar_modules.length
                              : 0}
                          </div>
                          <div className="text-xs opacity-75">Modules</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{totalItems}</div>
                          <div className="text-xs opacity-75">Items</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditUserType(userType)}
                        className="p-2 hover:bg-white hover:bg-opacity-50 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUserType(userType)}
                        className="p-2 hover:bg-white hover:bg-opacity-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Users ({totalUsers})
            </CardTitle>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                Search
              </button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const userType = userTypes.find(
                      (ut) => ut.id === user.user_type_id
                    );
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.first_name?.[0]}
                                {user.last_name?.[0]}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userType ? (
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getColorClass(
                                userType.color
                              )}`}
                            >
                              {userType.display_name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No type assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-primary hover:text-blue-900"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Reset Password"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAssignUserType(user)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Assign Type"
                            >
                              <UserCog className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {users.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * usersPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * usersPerPage, totalUsers)}
                </span>{" "}
                of <span className="font-medium">{totalUsers}</span> users
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handleGoToPage(page)}
                            className={`px-3 py-2 border rounded-md text-sm font-medium ${
                              page === currentPage
                                ? "bg-primary text-white border-primary"
                                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Type Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedUserType ? "Edit User Type" : "Create User Type"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {getSelectedModulesCount()} modules,{" "}
                  {getSelectedItemsCount()} items
                </p>
              </div>
              {/* {JSON.stringify(userTypeForm.selectedModules)} */}
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedUserType(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={userTypeForm.display_name}
                    onChange={(e) =>
                      setUserTypeForm((prev) => ({
                        ...prev,
                        display_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Employee, Manager, Admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Name *
                  </label>
                  <input
                    type="text"
                    value={userTypeForm.name}
                    onChange={(e) =>
                      setUserTypeForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., employee, manager, admin"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={userTypeForm.description}
                    onChange={(e) =>
                      setUserTypeForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe the role and responsibilities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={userTypeForm.color}
                    onChange={(e) =>
                      setUserTypeForm((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>

              {/* Sidebar Module Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Select Sidebar Modules & Items
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Choose which modules and specific items this user type can
                  access. Click on modules to expand and see individual items.
                </p>

                {Object.entries(groupedModules).map(([category, modules]) => (
                  <div key={category} className="mb-6">
                    <h5 className="text-md font-medium text-gray-800 mb-3 border-b pb-1">
                      {category}
                    </h5>
                    <div className="space-y-3">
                      {modules.map((module) => {
                        const selectionState = getModuleSelectionState(module);
                        const isExpanded = expandedModules[module.id];

                        return (
                          <div key={module.id} className="border rounded-lg">
                            {/* Module Header */}
                            <div
                              className={`p-4 cursor-pointer transition-all ${
                                selectionState === "full"
                                  ? "border-blue-500 bg-primary-50"
                                  : selectionState === "partial"
                                  ? "border-yellow-500 bg-yellow-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center flex-1"
                                  onClick={() => handleModuleToggle(module.id)}
                                >
                                  <div className="flex items-center mr-3">
                                    {selectionState === "full" ? (
                                      <Check className="h-5 w-5 text-primary" />
                                    ) : selectionState === "partial" ? (
                                      <Minus className="h-5 w-5 text-yellow-600" />
                                    ) : (
                                      <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    {(() => {
                                      const customIconPath = getCustomIcon(module.id);
                                      if (customIconPath) {
                                        return (
                                          <img 
                                            src={customIconPath} 
                                            alt={module.name}
                                            className="h-5 w-5 object-contain"
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                            }}
                                          />
                                        );
                                      } else if (module.icon) {
                                        return React.createElement(module.icon, {
                                          className: "h-5 w-5 text-gray-600",
                                        });
                                      }
                                      return null;
                                    })()}
                                    <div>
                                      <span className="font-medium text-gray-900">
                                        {module.name}
                                      </span>
                                      <p className="text-xs text-gray-600">
                                        {module.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {module.items && module.items.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleModuleExpansion(module.id);
                                    }}
                                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {module.items && module.items.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {
                                    module.items.filter(
                                      (item) =>
                                        userTypeForm.selectedItems[item.id]
                                    ).length
                                  }{" "}
                                  of {module.items.length} items selected
                                </div>
                              )}
                            </div>

                            {/* Module Items */}
                            {isExpanded &&
                              module.items &&
                              module.items.length > 0 && (
                                <div className="border-t border-gray-200 bg-gray-50">
                                  <div className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {module.items.map((item) => (
                                        <div
                                          key={item.id}
                                          className={`flex items-center p-2 rounded cursor-pointer transition-all ${
                                            userTypeForm.selectedItems[item.id]
                                              ? "bg-blue-100 border border-blue-300"
                                              : "bg-white border border-gray-200 hover:border-gray-300"
                                          }`}
                                          onClick={() =>
                                            handleItemToggle(module.id, item.id)
                                          }
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              userTypeForm.selectedItems[
                                                item.id
                                              ] || false
                                            }
                                            onChange={() =>
                                              handleItemToggle(
                                                module.id,
                                                item.id
                                              )
                                            }
                                            className="mr-2"
                                          />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                              {item.name}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              {item.description}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {getSelectedItemsCount() > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Preview Selected Items ({getSelectedItemsCount()} items from{" "}
                    {getSelectedModulesCount()} modules):
                  </h5>
                  <div className="max-h-40 overflow-y-auto">
                    {Object.entries(groupedModules).map(
                      ([category, modules]) => {
                        const selectedModulesInCategory = modules.filter(
                          (module) => userTypeForm.selectedModules[module.id]
                        );
                        if (selectedModulesInCategory.length === 0) return null;

                        return (
                          <div key={category} className="mb-3">
                            <h6 className="text-sm font-medium text-gray-700 mb-1">
                              {category}:
                            </h6>
                            <div className="space-y-1">
                              {selectedModulesInCategory.map((module) => {
                                const selectedItems = module.items
                                  ? module.items.filter(
                                      (item) =>
                                        userTypeForm.selectedItems[item.id]
                                    )
                                  : [];

                                return (
                                  <div
                                    key={module.id}
                                    className="text-xs text-gray-600 ml-2"
                                  >
                                    <span className="font-medium">
                                      {module.name}
                                    </span>
                                    {selectedItems.length > 0 && (
                                      <span className="ml-1">
                                        (
                                        {selectedItems
                                          .map((item) => item.name)
                                          .join(", ")}
                                        )
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedUserType(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserType}
                disabled={!userTypeForm.name || !userTypeForm.display_name}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                {selectedUserType ? "Update" : "Create"} User Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                User Details
              </h3>
              <button
                onClick={() => {
                  setShowViewUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <p className="text-gray-900">{selectedUser.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <p className="text-gray-900">{selectedUser.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-gray-900">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <p className="text-gray-900">
                    {selectedUser.department || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <p className="text-gray-900">
                    {selectedUser.position || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowViewUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editUserForm.first_name}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editUserForm.last_name}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editUserForm.department}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={editUserForm.position}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        position: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Reset Password
              </h3>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Resetting password for:{" "}
                  <strong>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedUser(null);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                <Key className="h-4 w-4 mr-2 inline" />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Type Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign User Type to {selectedUser.first_name}{" "}
                {selectedUser.last_name}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a user type to assign to this user. This will determine
                which sidebar modules and items they can access.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userTypes.map((userType) => {
                  const totalItems = Array.isArray(userType.sidebar_modules)
                    ? userType.sidebar_modules.reduce((acc, module) => {
                        return (
                          acc +
                          (Array.isArray(module.items)
                            ? module.items.length
                            : 0)
                        );
                      }, 0)
                    : 0;

                  return (
                    <div
                      key={userType.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-blue-300 ${getColorClass(
                        userType.color
                      )}`}
                      onClick={() => handleSaveUserAssignment(userType.id)}
                    >
                      <h4 className="font-medium">{userType.display_name}</h4>
                      <p className="text-sm opacity-75 mt-1">
                        {userType.description}
                      </p>
                      <div className="mt-2 text-xs">
                        <span className="font-medium">
                          {Array.isArray(userType.sidebar_modules)
                            ? userType.sidebar_modules.length
                            : 0}{" "}
                          modules
                        </span>
                        <span className="ml-2">• {totalItems} items</span>
                        {userType.user_count > 0 && (
                          <span className="ml-2">
                            • {userType.user_count} users
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {userTypes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No user types available. Create a user type first.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserManagementWithSidebar;
