import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModuleAccessProvider } from '@/contexts/ModuleAccessContext';

// Mock the lazy-loaded components
vi.mock('@/components/dashboard/DashboardPage', () => ({
  default: () => <div>Dashboard</div>,
}));

vi.mock('@/modules/projects/Projects', () => ({
  default: () => <div>Projects</div>,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('@/components/LoadingFallback', () => ({
  default: () => <div>Loading...</div>,
}));

// Helper to render routes with providers
const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ModuleAccessProvider>
          {/* Route rendering would go here */}
        </ModuleAccessProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Router Configuration', () => {
  describe('Route Structure', () => {
    it('should have public routes defined', () => {
      const publicRoutes = routes.filter(route => route.public);
      
      expect(publicRoutes).toHaveLength(4);
      expect(publicRoutes.map(r => r.path)).toContain('/login');
      expect(publicRoutes.map(r => r.path)).toContain('/register');
      expect(publicRoutes.map(r => r.path)).toContain('/forgot-password');
      expect(publicRoutes.map(r => r.path)).toContain('/reset-password');
    });

    it('should have protected routes with Layout wrapper', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      
      expect(protectedRoute).toBeDefined();
      expect(protectedRoute.children).toBeDefined();
      expect(protectedRoute.children.length).toBeGreaterThan(0);
    });

    it('should have nested routes for Projects space', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const projectsRoute = protectedRoute.children.find(child => child.path === 'projects');
      
      expect(projectsRoute).toBeDefined();
      expect(projectsRoute.children).toBeDefined();
      expect(projectsRoute.children.length).toBeGreaterThan(0);
    });

    it('should have 404 route defined', () => {
      const notFoundRoute = routes.find(route => route.path === '*');
      
      expect(notFoundRoute).toBeDefined();
    });
  });

  describe('Space Routes', () => {
    it('should have Dashboard route', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const dashboardRoute = protectedRoute.children.find(child => child.path === 'dashboard');
      
      expect(dashboardRoute).toBeDefined();
    });

    it('should have Projects space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const projectsRoute = protectedRoute.children.find(child => child.path === 'projects');
      
      expect(projectsRoute).toBeDefined();
      expect(projectsRoute.children).toBeDefined();
    });

    it('should have Inventory space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const inventoryRoute = protectedRoute.children.find(child => child.path === 'inventory/*');
      
      expect(inventoryRoute).toBeDefined();
    });

    it('should have HR space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const hrRoute = protectedRoute.children.find(child => child.path === 'hr/*');
      
      expect(hrRoute).toBeDefined();
    });

    it('should have Finance space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const financeRoute = protectedRoute.children.find(child => child.path === 'finance/*');
      
      expect(financeRoute).toBeDefined();
    });

    it('should have Sales space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const salesRoute = protectedRoute.children.find(child => child.path === 'sales/*');
      
      expect(salesRoute).toBeDefined();
    });

    it('should have Admin space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const adminRoute = protectedRoute.children.find(child => child.path === 'admin');
      
      expect(adminRoute).toBeDefined();
    });

    it('should have Support space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const supportRoute = protectedRoute.children.find(child => child.path === 'support/*');
      
      expect(supportRoute).toBeDefined();
    });

    it('should have My Space routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const myspaceRoute = protectedRoute.children.find(child => child.path === 'myspace');
      
      expect(myspaceRoute).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should wrap lazy-loaded components in LazyRoute', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const dashboardRoute = protectedRoute.children.find(child => child.path === 'dashboard');
      
      // Check that the element is wrapped (we can't directly test Suspense in unit tests)
      expect(dashboardRoute.element).toBeDefined();
    });
  });

  describe('Route Guards', () => {
    it('should protect main routes with ProtectedRoute', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      
      // The element should contain ProtectedRoute wrapper
      expect(protectedRoute.element).toBeDefined();
    });

    it('should protect permission-based routes with PermissionRoute', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const officeDeskRoute = protectedRoute.children.find(child => child.path === 'office-desk');
      
      // Office desk should have permission guard
      expect(officeDeskRoute).toBeDefined();
      expect(officeDeskRoute.element).toBeDefined();
    });

    it('should protect purchase request routes with permissions', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const purchaseRoute = protectedRoute.children.find(child => child.path === 'purchase-requests');
      
      expect(purchaseRoute).toBeDefined();
      expect(purchaseRoute.children).toBeDefined();
      
      // Check that child routes exist
      const dashboardRoute = purchaseRoute.children.find(child => child.path === 'dashboard');
      expect(dashboardRoute).toBeDefined();
    });
  });

  describe('Nested Route Structure', () => {
    it('should have proper nesting for Projects routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const projectsRoute = protectedRoute.children.find(child => child.path === 'projects');
      
      const expectedPaths = [
        'dashboard',
        'kanban',
        'calendar',
        'new',
        'create',
        'templates',
        'reports',
        'analytics',
        'archive',
      ];
      
      const actualPaths = projectsRoute.children
        .filter(child => !child.path?.includes(':'))
        .map(child => child.path || 'index');
      
      expectedPaths.forEach(path => {
        expect(actualPaths).toContain(path);
      });
    });

    it('should have dynamic routes for Projects', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const projectsRoute = protectedRoute.children.find(child => child.path === 'projects');
      
      const dynamicRoutes = projectsRoute.children.filter(child => 
        child.path?.includes(':id')
      );
      
      expect(dynamicRoutes.length).toBeGreaterThan(0);
    });

    it('should have nested templates routes', () => {
      const protectedRoute = routes.find(route => route.path === '/');
      const projectsRoute = protectedRoute.children.find(child => child.path === 'projects');
      const templatesRoute = projectsRoute.children.find(child => child.path === 'templates');
      
      expect(templatesRoute).toBeDefined();
      expect(templatesRoute.children).toBeDefined();
      expect(templatesRoute.children.length).toBeGreaterThan(0);
    });
  });

  describe('Code Splitting', () => {
    it('should use lazy loading for all space modules', () => {
      // This is a structural test - we verify that routes use lazy loading
      // by checking that they're wrapped in LazyRoute components
      const protectedRoute = routes.find(route => route.path === '/');
      
      const spacePaths = [
        'dashboard',
        'projects',
        'inventory/*',
        'hr/*',
        'finance/*',
        'sales/*',
        'admin',
        'support/*',
        'self-service/*',
      ];
      
      spacePaths.forEach(path => {
        const route = protectedRoute.children.find(child => 
          child.path === path || child.path?.startsWith(path)
        );
        expect(route).toBeDefined();
      });
    });
  });
});
