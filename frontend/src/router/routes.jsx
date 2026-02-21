import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingFallback from '@/components/LoadingFallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import PermissionRoute from '@/components/PermissionRoute';
import DefaultRedirect from '@/components/DefaultRedirect';
import Layout from '@/components/Layout';

// Auth pages (not lazy loaded - needed immediately)
import Login from '@/modules/auth/Login';
import Register from '@/modules/auth/Register';
import ForgotPassword from '@/modules/auth/ForgotPassword';
import ResetPassword from '@/modules/auth/ResetPassword';
import NotFound from '@/components/NotFound';

// Lazy load space modules for code splitting
const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage'));
const RoleDashboard = lazy(() => import('@/components/dashboard/RoleDashboard'));
const DebugDashboard = lazy(() => import('@/pages/DebugDashboard'));

// Projects Space - lazy loaded
const Projects = lazy(() => import('@/modules/projects/Projects'));
const ProjectDetail = lazy(() => import('@/modules/projects/ProjectDetail'));
const ProjectForm = lazy(() => import('@/modules/projects/ProjectForm'));
const EnhancedProjectForm = lazy(() => import('@/modules/projects/EnhancedProjectForm'));
const ProjectDashboard = lazy(() => import('@/modules/projects/ProjectDashboard'));
const ProjectKanban = lazy(() => import('@/modules/projects/ProjectKanban'));
const ProjectBoard = lazy(() => import('@/modules/projects/ProjectBoard'));
const ProjectCalendar = lazy(() => import('@/modules/projects/ProjectCalendar'));
const ProjectReports = lazy(() => import('@/modules/projects/ProjectReports'));
const ProjectTemplates = lazy(() => import('@/modules/projects/ProjectTemplates'));
const ProjectAnalytics = lazy(() => import('@/modules/projects/ProjectAnalytics'));
const ProjectArchive = lazy(() => import('@/modules/projects/ProjectArchive'));
const ProjectTasks = lazy(() => import('@/modules/projects/ProjectTasks'));
const ProjectTeam = lazy(() => import('@/modules/projects/ProjectTeam'));
const ProjectTimeline = lazy(() => import('@/modules/projects/ProjectTimeline'));
const ProjectBudget = lazy(() => import('@/modules/projects/ProjectBudget'));
const ProjectSettings = lazy(() => import('@/modules/projects/ProjectSettings'));

// Inventory Space - lazy loaded
const Inventory = lazy(() => import('@/modules/inventory/Inventory'));

// HR Space - lazy loaded
const HR = lazy(() => import('@/modules/hr/HR'));

// Finance Space - lazy loaded
const Finance = lazy(() => import('@/modules/finance/Finance'));

// Sales Space - lazy loaded
const SalesDesk = lazy(() => import('@/modules/sales/SalesDesk'));

// Admin Space - lazy loaded
const Admin = lazy(() => import('@/modules/admin/Admin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const CompanyManagement = lazy(() => import('@/modules/company-management/CompanyManagement'));

// Support Space - lazy loaded
const SupportDesk = lazy(() => import('@/modules/support/SupportDesk'));

// My Space (Self-Service Portal) - lazy loaded
const MySpaceDashboard = lazy(() => import('@/modules/myspace/MySpaceDashboard'));
const MyProfile = lazy(() => import('@/modules/myspace/MyProfile'));
const MyRequests = lazy(() => import('@/modules/myspace/MyRequests'));
const MyDocuments = lazy(() => import('@/modules/myspace/MyDocuments'));

// Other modules - lazy loaded
const Collaboration = lazy(() => import('@/modules/collaboration/Collaboration'));
const FileShare = lazy(() => import('@/modules/file-share/FileShare'));
const EnhancedDocumentManagement = lazy(() => import('@/modules/documents/EnhancedDocumentManagement'));
const DocumentWorkflow = lazy(() => import('@/modules/documents/DocumentWorkflow'));
const SettingsDesk = lazy(() => import('@/modules/settings/SettingsDesk'));
const OfficeDesk = lazy(() => import('@/pages/OfficeDesk'));

// Purchase Request pages - lazy loaded
const PurchaseRequestDashboard = lazy(() => import('@/pages/PurchaseRequest').then(m => ({ default: m.PurchaseRequestDashboard })));
const PurchaseRequestList = lazy(() => import('@/pages/PurchaseRequest').then(m => ({ default: m.PurchaseRequestList })));
const PurchaseRequestForm = lazy(() => import('@/pages/PurchaseRequest').then(m => ({ default: m.PurchaseRequestForm })));
const PurchaseRequestDetail = lazy(() => import('@/pages/PurchaseRequest').then(m => ({ default: m.PurchaseRequestDetail })));
const PurchaseRequestKanban = lazy(() => import('@/components/PurchaseRequest/PurchaseRequestKanban'));
const PurchaseRequestSettings = lazy(() => import('@/components/PurchaseRequest/PurchaseRequestSettings'));
const PurchaseRequestHistory = lazy(() => import('@/components/PurchaseRequest/PurchaseRequestHistory'));
const ManagerApproval = lazy(() => import('@/components/PurchaseRequest/ManagerApproval'));
const ProcurementApproval = lazy(() => import('@/components/PurchaseRequest/ProcurementApproval'));
const FinancePayment = lazy(() => import('@/components/PurchaseRequest/FinancePayment'));

/**
 * Wrapper component for lazy-loaded routes with Suspense boundary
 */
const LazyRoute = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

/**
 * Route configuration for the ERP system
 * Organized by space with nested routes for optimal code splitting
 */
export const routes = [
  // Public routes (no authentication required)
  {
    path: '/login',
    element: <Login />,
    public: true,
  },
  {
    path: '/register',
    element: <Register />,
    public: true,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    public: true,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    public: true,
  },

  // Protected routes (authentication required)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard Space (always visible)
      {
        path: 'dashboard',
        element: (
          <LazyRoute>
            <RoleDashboard />
          </LazyRoute>
        ),
      },
      
      // Debug Dashboard (development only)
      {
        path: 'debug-dashboard',
        element: (
          <LazyRoute>
            <DebugDashboard />
          </LazyRoute>
        ),
      },

      // Projects Space (requires permission)
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <ProjectDashboard />
              </LazyRoute>
            ),
          },
          {
            path: 'list',
            element: (
              <LazyRoute>
                <Projects />
              </LazyRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <LazyRoute>
                <ProjectDashboard />
              </LazyRoute>
            ),
          },
          {
            path: 'kanban',
            element: (
              <LazyRoute>
                <ProjectKanban />
              </LazyRoute>
            ),
          },
          {
            path: 'board',
            element: (
              <LazyRoute>
                <ProjectBoard />
              </LazyRoute>
            ),
          },
          {
            path: 'calendar',
            element: (
              <LazyRoute>
                <ProjectCalendar />
              </LazyRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <LazyRoute>
                <EnhancedProjectForm />
              </LazyRoute>
            ),
          },
          {
            path: 'create',
            element: (
              <LazyRoute>
                <EnhancedProjectForm />
              </LazyRoute>
            ),
          },
          {
            path: 'templates',
            children: [
              {
                index: true,
                element: (
                  <LazyRoute>
                    <ProjectTemplates />
                  </LazyRoute>
                ),
              },
              {
                path: 'new',
                element: (
                  <LazyRoute>
                    <ProjectForm />
                  </LazyRoute>
                ),
              },
              {
                path: ':id',
                element: (
                  <LazyRoute>
                    <ProjectDetail />
                  </LazyRoute>
                ),
              },
              {
                path: ':id/edit',
                element: (
                  <LazyRoute>
                    <ProjectForm />
                  </LazyRoute>
                ),
              },
            ],
          },
          {
            path: 'reports',
            element: (
              <LazyRoute>
                <ProjectReports />
              </LazyRoute>
            ),
          },
          {
            path: 'analytics',
            element: (
              <LazyRoute>
                <ProjectAnalytics />
              </LazyRoute>
            ),
          },
          {
            path: 'archive',
            element: (
              <LazyRoute>
                <ProjectArchive />
              </LazyRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <LazyRoute>
                <ProjectDetail />
              </LazyRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <LazyRoute>
                <ProjectForm />
              </LazyRoute>
            ),
          },
          {
            path: ':id/tasks',
            element: (
              <LazyRoute>
                <ProjectTasks />
              </LazyRoute>
            ),
          },
          {
            path: ':id/team',
            element: (
              <LazyRoute>
                <ProjectTeam />
              </LazyRoute>
            ),
          },
          {
            path: ':id/timeline',
            element: (
              <LazyRoute>
                <ProjectTimeline />
              </LazyRoute>
            ),
          },
          {
            path: ':id/budget',
            element: (
              <LazyRoute>
                <ProjectBudget />
              </LazyRoute>
            ),
          },
          {
            path: ':id/settings',
            element: (
              <LazyRoute>
                <ProjectSettings />
              </LazyRoute>
            ),
          },
        ],
      },

      // Inventory Space (requires permission)
      {
        path: 'inventory/*',
        element: (
          <LazyRoute>
            <Inventory />
          </LazyRoute>
        ),
      },

      // HR Space (requires permission)
      {
        path: 'hr/*',
        element: (
          <LazyRoute>
            <HR />
          </LazyRoute>
        ),
      },

      // Finance Space (requires permission)
      {
        path: 'finance/*',
        element: (
          <LazyRoute>
            <Finance />
          </LazyRoute>
        ),
      },

      // Sales Space (requires permission)
      {
        path: 'sales/*',
        element: (
          <LazyRoute>
            <SalesDesk />
          </LazyRoute>
        ),
      },

      // Admin Space (requires permission)
      {
        path: 'admin/*',
        element: (
          <LazyRoute>
            <Admin />
          </LazyRoute>
        ),
      },
      {
        path: 'admin/companies',
        element: (
          <LazyRoute>
            <CompanyManagement />
          </LazyRoute>
        ),
      },
      {
        path: 'admin-dashboard',
        element: (
          <LazyRoute>
            <AdminDashboard />
          </LazyRoute>
        ),
      },

      // Support Space (requires permission)
      {
        path: 'support/*',
        element: (
          <LazyRoute>
            <SupportDesk />
          </LazyRoute>
        ),
      },

      // My Space / Self-Service Portal (always visible)
      {
        path: 'myspace',
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <MySpaceDashboard />
              </LazyRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <LazyRoute>
                <MyProfile />
              </LazyRoute>
            ),
          },
          {
            path: 'requests',
            element: (
              <LazyRoute>
                <MyRequests />
              </LazyRoute>
            ),
          },
          {
            path: 'documents',
            element: (
              <LazyRoute>
                <MyDocuments />
              </LazyRoute>
            ),
          },
        ],
      },

      // Settings (requires permission)
      {
        path: 'settings/*',
        element: (
          <LazyRoute>
            <SettingsDesk />
          </LazyRoute>
        ),
      },

      // Office Desk (requires permission)
      {
        path: 'office-desk',
        element: (
          <PermissionRoute permissionId="office-desk-view">
            <LazyRoute>
              <OfficeDesk />
            </LazyRoute>
          </PermissionRoute>
        ),
      },

      // Collaboration (requires permission)
      {
        path: 'collaboration/*',
        element: (
          <LazyRoute>
            <Collaboration />
          </LazyRoute>
        ),
      },

      // File Share (requires permission)
      {
        path: 'file-share/*',
        element: (
          <LazyRoute>
            <FileShare />
          </LazyRoute>
        ),
      },

      // Document Management (requires permission)
      {
        path: 'documents',
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <EnhancedDocumentManagement />
              </LazyRoute>
            ),
          },
          {
            path: 'workflow',
            element: (
              <LazyRoute>
                <DocumentWorkflow />
              </LazyRoute>
            ),
          },
        ],
      },

      // Purchase Requests (requires permission)
      {
        path: 'purchase-requests',
        children: [
          {
            index: true,
            element: (
              <PermissionRoute permissionId="purchase-dashboard">
                <LazyRoute>
                  <PurchaseRequestList />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <PermissionRoute permissionId="purchase-dashboard">
                <LazyRoute>
                  <PurchaseRequestDashboard />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'create',
            element: (
              <PermissionRoute permissionId="purchase-create">
                <LazyRoute>
                  <PurchaseRequestKanban />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'pending-approval',
            element: (
              <PermissionRoute permissionId="purchase-pending">
                <LazyRoute>
                  <ManagerApproval />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'procurement',
            element: (
              <PermissionRoute permissionId="purchase-procurement">
                <LazyRoute>
                  <ProcurementApproval />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'finance',
            element: (
              <PermissionRoute permissionId="purchase-finance">
                <LazyRoute>
                  <FinancePayment />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'history',
            element: (
              <PermissionRoute permissionId="purchase-history">
                <LazyRoute>
                  <PurchaseRequestHistory />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <PermissionRoute permissionId="purchase-settings">
                <LazyRoute>
                  <PurchaseRequestSettings />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <PermissionRoute permissionId="purchase-create">
                <LazyRoute>
                  <PurchaseRequestForm />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
          {
            path: ':requestId',
            element: (
              <PermissionRoute permissionId="purchase-dashboard">
                <LazyRoute>
                  <PurchaseRequestDetail />
                </LazyRoute>
              </PermissionRoute>
            ),
          },
        ],
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: <NotFound />,
  },
];
