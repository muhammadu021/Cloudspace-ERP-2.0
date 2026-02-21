import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { filterSubItemsByPermissions } from "@/utils/permissions";
import { getSidebarModulesForDynamicSidebar, MODULE_ID_MAPPING } from "@/config/sidebarConfig";
import purchaseRequestService from "@/services/purchaseRequestService";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { getCustomIcon } from "@/config/iconMapping";

// Helper function to scroll main content to top
const scrollMainToTop = (behavior = "smooth") => {
  const mainElement = document.querySelector("main");
  if (mainElement) {
    mainElement.scrollTo({
      top: 0,
      left: 0,
      behavior: behavior,
    });
  }
};

const DynamicSidebar = ({ user }) => {
  const location = useLocation();
  const { permissions, hasModule } = useAuth();
  const [userModules, setUserModules] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar open by default
  const [badgeCounts, setBadgeCounts] = useState({});

  // Get all available modules from centralized configuration
  const allModules = getSidebarModulesForDynamicSidebar();

  // Load user's assigned modules
  useEffect(() => {
    loadUserModules();
  }, [user, permissions]);

  // Load counts for Purchase Requests sub-items
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const counts = {};
        // Pending Approval count
        try {
          const resPending = await purchaseRequestService.getPendingApprovals({
            limit: 1,
          });
          counts["/purchase-requests/pending-approval"] =
            resPending?.data?.data?.total ||
            (resPending?.data?.data?.requests?.length ?? 0);
        } catch (e) {}
        // Procurement Approval count
        try {
          const resProc = await purchaseRequestService.getPendingProcurement({
            limit: 1,
          });
          counts["/purchase-requests/procurement"] =
            resProc?.data?.data?.total ||
            (resProc?.data?.data?.requests?.length ?? 0);
        } catch (e) {}
        // Payment Process count (sum of finance approval + payment in progress)
        try {
          const resFin = await purchaseRequestService.getPendingFinance({
            limit: 1,
          });
          const resPay = await purchaseRequestService.getAllRequests({
            status: "payment_in_progress",
            current_stage: "pay_vendor_stage",
            show_all: true,
            limit: 1,
          });
          const finCount =
            resFin?.data?.data?.total ||
            (resFin?.data?.data?.requests?.length ?? 0);
          const payCount =
            resPay?.data?.data?.total ||
            (resPay?.data?.data?.requests?.length ?? 0);
          counts["/purchase-requests/finance"] =
            (finCount || 0) + (payCount || 0);
        } catch (e) {}
        setBadgeCounts(counts);
      } catch (err) {
        // silent fail
      }
    };
    loadCounts();
  }, []);

  const loadUserModules = () => {
    try {
      // Get company's allowed modules
      const userCompany = user?.Company || null;
      let companyAllowedModules = userCompany?.allowed_modules || [];
      
      // Parse if string
      if (typeof companyAllowedModules === 'string') {
        try {
          companyAllowedModules = JSON.parse(companyAllowedModules);
        } catch (e) {
          companyAllowedModules = [];
        }
      }
      
      if (!Array.isArray(companyAllowedModules)) {
        companyAllowedModules = [];
      }
      
      // Normalize company allowed modules
      const normalizedCompanyModules = companyAllowedModules.map(moduleId => 
        MODULE_ID_MAPPING[moduleId] || moduleId
      );
      
      console.log('=== DynamicSidebar ===');
      console.log('User:', user?.email, 'UserType:', user?.UserType?.name);
      console.log('Company allowed_modules:', normalizedCompanyModules);
      
      // Parse sidebar_modules (handle double-encoded JSON)
      let userSidebarModules = user?.UserType?.sidebar_modules || [];
      if (typeof userSidebarModules === 'string') {
        try {
          userSidebarModules = JSON.parse(userSidebarModules);
          if (typeof userSidebarModules === 'string') {
            userSidebarModules = JSON.parse(userSidebarModules);
          }
        } catch (e) {
          userSidebarModules = [];
        }
      }
      
      if (!Array.isArray(userSidebarModules)) {
        userSidebarModules = [];
      }
      
      console.log('User sidebar_modules:', userSidebarModules.map(m => m.module_id));
      
      // PRIORITY 1: Use UserType sidebar_modules if available
      if (userSidebarModules.length > 0) {
        const allowedModules = [];
        const addedModuleIds = new Set();
        
        userSidebarModules.forEach((moduleData) => {
          const moduleId = moduleData.module_id;
          if (!moduleId) return;
          
          const normalizedModuleId = MODULE_ID_MAPPING[moduleId] || moduleId;
          
          // Filter by company's allowed modules if they exist
          if (normalizedCompanyModules.length > 0 && 
              !normalizedCompanyModules.includes(moduleId) && 
              !normalizedCompanyModules.includes(normalizedModuleId)) {
            return;
          }
          
          let moduleConfig = allModules[moduleId] || allModules[normalizedModuleId];
          if (!moduleConfig) {
            moduleConfig = allModules[moduleId.replace('-desk', '')];
          }

          if (moduleConfig && moduleData.enabled !== false) {
            if (moduleConfig.customVisibility && !moduleConfig.customVisibility(user)) return;
            if (addedModuleIds.has(moduleConfig.id)) return;

            const packageSubItems = moduleData.items || moduleData.sub_items || [];
            let filteredSubItems = moduleConfig.subItems || [];
            
            if (packageSubItems.length > 0) {
              filteredSubItems = filteredSubItems.filter(item => packageSubItems.includes(item.id));
            }

            allowedModules.push({ ...moduleConfig, subItems: filteredSubItems });
            addedModuleIds.add(moduleConfig.id);
          }
        });
        
        allowedModules.sort((a, b) => (a.status === 'active' ? -1 : 1) - (b.status === 'active' ? -1 : 1));
        console.log('✅ Modules from UserType:', allowedModules.map(m => m.id));
        setUserModules(allowedModules);
        setExpandedItems({});
        return;
      }
      
      // PRIORITY 2: Use company's allowed_modules as fallback
      if (normalizedCompanyModules.length > 0) {
        console.log('⚠️ No UserType sidebar_modules, using company allowed_modules');
        const allowedModules = [];
        const addedModuleIds = new Set();
        
        normalizedCompanyModules.forEach(moduleId => {
          const normalizedModuleId = MODULE_ID_MAPPING[moduleId] || moduleId;
          let moduleConfig = allModules[moduleId] || allModules[normalizedModuleId];
          if (!moduleConfig) moduleConfig = allModules[moduleId.replace('-desk', '')];
          
          if (moduleConfig && !addedModuleIds.has(moduleConfig.id)) {
            if (moduleConfig.customVisibility && !moduleConfig.customVisibility(user)) return;
            allowedModules.push({ ...moduleConfig, subItems: moduleConfig.subItems || [] });
            addedModuleIds.add(moduleConfig.id);
          }
        });
        
        console.log('✅ Modules from company:', allowedModules.map(m => m.id));
        setUserModules(allowedModules);
        setExpandedItems({});
        return;
      }

      // PRIORITY 3: Use AuthContext permissions
      if (permissions && permissions.modules) {
        const allowedModules = [];
        Object.keys(permissions.modules).forEach((moduleId) => {
          const moduleConfig = allModules[moduleId];
          if (moduleConfig && hasModule(moduleId)) {
            if (moduleConfig.customVisibility && !moduleConfig.customVisibility(user)) return;
            const filteredSubItems = filterSubItemsByPermissions(moduleConfig.subItems, permissions);
            if (filteredSubItems.length > 0 || moduleConfig.subItems.length === 0) {
              allowedModules.push({ ...moduleConfig, subItems: filteredSubItems });
            }
          }
        });
        setUserModules(allowedModules);
        setExpandedItems({});
        return;
      }
      
      // FALLBACK: Show my-desk only
      console.log('⚠️ No permissions found, showing fallback');
      const myDeskModule = allModules["my-desk"];
      setUserModules(myDeskModule ? [{ ...myDeskModule, subItems: myDeskModule.subItems || [] }] : []);
      
    } catch (error) {
      console.error("Error loading user modules:", error);
      const myDeskModule = allModules["my-desk"];
      setUserModules(myDeskModule ? [{ ...myDeskModule, subItems: [] }] : []);
    }
  };

  const toggleExpanded = (moduleId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isModuleActive = (module) => {
    if (isActive(module.path)) return true;
    return module.subItems.some((subItem) => isActive(subItem.path));
  };

  return (
    <>
      {/* Toggle Button - Only show when sidebar is collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 text-gray-800 h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-0 overflow-hidden" : "w-64"
        }`}
      >
        {/* Header - Fixed at top */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Cloudspace ERP"
                className="h-24 w-24"
                onError={(e) => {
                  // Fallback to puffin icon if main logo doesn't load
                  e.target.src = "/icon.png";
                }}
              />
            </div>
            {/* Close button beside the logo */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {user && (
            <p className="text-xs text-gray-600 mt-1">
              Welcome, {user.first_name}
            </p>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto sidebar-nav-scroll px-3 py-2">
          <div className="space-y-1">
            {userModules.map((module) => {
              const Icon = module.icon;
              const customIconPath = getCustomIcon(module.id);
              const hasSubItems = module.subItems && module.subItems.length > 0;
              const isExpanded = expandedItems[module.id];
              const moduleActive = isModuleActive(module);

              return (
                <div key={module.id}>
                  {/* Main module item */}
                  <div
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      moduleActive
                        ? "bg-[#D0E0D6] text-[var(--logo-green)] border border-[#9FB7A5]"
                        : "text-gray-700 hover:bg-[#F5FBF6] hover:text-[var(--logo-green)]"
                    }`}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpanded(module.id);
                      }
                    }}
                  >
                    {hasSubItems ? (
                      // If module has sub-items, make it non-clickable (just for expansion)
                      <div className="flex items-center flex-1">
                        {customIconPath ? (
                          <span
                            className="sidebar-icon-mask mr-2"
                            style={{ WebkitMaskImage: `url(${customIconPath})`, maskImage: `url(${customIconPath})` }}
                          />
                        ) : null}
                        {!customIconPath && Icon && <Icon className="h-4 w-4 mr-2 text-[var(--logo-green)]" />}
                        <span className="text-sm font-medium">
                          {module.name}
                        </span>
                        {module.badge && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            {module.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      // If no sub-items, make it a clickable link
                      <Link
                        to={module.path}
                        className="flex items-center flex-1"
                        onClick={() => scrollMainToTop("smooth")}
                      >
                        {customIconPath ? (
                          <span
                            className="sidebar-icon-mask mr-2"
                            style={{ WebkitMaskImage: `url(${customIconPath})`, maskImage: `url(${customIconPath})` }}
                          />
                        ) : null}
                        {!customIconPath && Icon && <Icon className="h-4 w-4 mr-2 text-[var(--logo-green)]" />}
                        <span className="text-sm font-medium">
                          {module.name}
                        </span>
                        {module.badge && (
                          <span className="ml-2 px-2 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            {module.badge}
                          </span>
                        )}
                      </Link>
                    )}

                    {hasSubItems && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(module.id);
                        }}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Sub-items */}
                  {hasSubItems && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {module.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                            isActive(subItem.path)
                              ? "bg-[#E5F1E9] text-[var(--logo-green)] border-l-2 border-[var(--logo-green)]"
                              : "text-gray-600 hover:bg-[#F5FBF6] hover:text-[var(--logo-green)]"
                          }`}
                          onClick={() => scrollMainToTop("smooth")}
                        >
                          <div className="flex items-center gap-1">
                            <span>{subItem.name}</span>
                            {subItem.badge && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                {subItem.badge}
                              </span>
                            )}
                          </div>
                          {[
                            "/purchase-requests/pending-approval",
                            "/purchase-requests/procurement",
                            "/purchase-requests/finance",
                          ].includes(subItem.path) && (
                            <span
                              className={`ml-2 inline-flex items-center justify-center min-w-[18px] px-1 py-0.5 rounded-full text-[10px] font-semibold ${
                                badgeCounts[subItem.path] > 0
                                  ? "bg-[#D0E0D6] text-[var(--logo-green)]"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {badgeCounts[subItem.path] || 0}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-[#D0E0D6] rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-[var(--logo-green)]">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-gray-800">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicSidebar;
