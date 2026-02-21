import { describe, it, expect } from 'vitest';
import {
  SPACES,
  SPACE_CATEGORIES,
  ROUTE_METADATA,
  getRouteMetadata,
  getSpace,
  getSpacesByCategory,
  isSpaceAlwaysVisible,
  getVisibleSpaces,
  generateBreadcrumbs,
} from './routeConfig';

describe('Route Configuration', () => {
  describe('SPACES', () => {
    it('should have 9 spaces defined', () => {
      const spaceCount = Object.keys(SPACES).length;
      expect(spaceCount).toBe(9);
    });

    it('should have Dashboard space', () => {
      expect(SPACES.DASHBOARD).toBeDefined();
      expect(SPACES.DASHBOARD.id).toBe('dashboard');
      expect(SPACES.DASHBOARD.alwaysVisible).toBe(true);
    });

    it('should have Projects space', () => {
      expect(SPACES.PROJECTS).toBeDefined();
      expect(SPACES.PROJECTS.id).toBe('projects');
      expect(SPACES.PROJECTS.permissionId).toBe('projects-view');
    });

    it('should have My Space (Self-Service)', () => {
      expect(SPACES.MY_SPACE).toBeDefined();
      expect(SPACES.MY_SPACE.id).toBe('self-service');
      expect(SPACES.MY_SPACE.alwaysVisible).toBe(true);
    });

    it('should have all required properties for each space', () => {
      Object.values(SPACES).forEach(space => {
        expect(space.id).toBeDefined();
        expect(space.name).toBeDefined();
        expect(space.path).toBeDefined();
        expect(space.icon).toBeDefined();
        expect(space.description).toBeDefined();
      });
    });
  });

  describe('SPACE_CATEGORIES', () => {
    it('should have 6 categories defined', () => {
      const categoryCount = Object.keys(SPACE_CATEGORIES).length;
      expect(categoryCount).toBe(6);
    });

    it('should have Overview category with Dashboard', () => {
      expect(SPACE_CATEGORIES.OVERVIEW).toBeDefined();
      expect(SPACE_CATEGORIES.OVERVIEW.spaces).toContain('dashboard');
    });

    it('should have Operations category with Projects and Inventory', () => {
      expect(SPACE_CATEGORIES.OPERATIONS).toBeDefined();
      expect(SPACE_CATEGORIES.OPERATIONS.spaces).toContain('projects');
      expect(SPACE_CATEGORIES.OPERATIONS.spaces).toContain('inventory');
    });

    it('should have People category with HR and Self-Service', () => {
      expect(SPACE_CATEGORIES.PEOPLE).toBeDefined();
      expect(SPACE_CATEGORIES.PEOPLE.spaces).toContain('hr');
      expect(SPACE_CATEGORIES.PEOPLE.spaces).toContain('self-service');
    });

    it('should have Finance category with Finance and Sales', () => {
      expect(SPACE_CATEGORIES.FINANCE).toBeDefined();
      expect(SPACE_CATEGORIES.FINANCE.spaces).toContain('finance');
      expect(SPACE_CATEGORIES.FINANCE.spaces).toContain('sales');
    });

    it('should have Support category', () => {
      expect(SPACE_CATEGORIES.SUPPORT).toBeDefined();
      expect(SPACE_CATEGORIES.SUPPORT.spaces).toContain('support');
    });

    it('should have System category with Admin', () => {
      expect(SPACE_CATEGORIES.SYSTEM).toBeDefined();
      expect(SPACE_CATEGORIES.SYSTEM.spaces).toContain('admin');
    });
  });

  describe('ROUTE_METADATA', () => {
    it('should have metadata for Dashboard routes', () => {
      expect(ROUTE_METADATA['/dashboard']).toBeDefined();
      expect(ROUTE_METADATA['/dashboard'].title).toBe('Dashboard');
      expect(ROUTE_METADATA['/dashboard'].space).toBe('dashboard');
    });

    it('should have metadata for Projects routes', () => {
      expect(ROUTE_METADATA['/projects']).toBeDefined();
      expect(ROUTE_METADATA['/projects/dashboard']).toBeDefined();
      expect(ROUTE_METADATA['/projects/kanban']).toBeDefined();
    });

    it('should have metadata for all 8 spaces', () => {
      const spaces = ['dashboard', 'projects', 'inventory', 'hr', 'finance', 'sales', 'admin', 'support'];
      
      spaces.forEach(space => {
        const routesForSpace = Object.values(ROUTE_METADATA).filter(
          meta => meta.space === space
        );
        expect(routesForSpace.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRouteMetadata', () => {
    it('should return metadata for valid route', () => {
      const metadata = getRouteMetadata('/dashboard');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Dashboard');
      expect(metadata.space).toBe('dashboard');
    });

    it('should return null for invalid route', () => {
      const metadata = getRouteMetadata('/invalid-route');
      
      expect(metadata).toBeNull();
    });

    it('should return metadata for nested routes', () => {
      const metadata = getRouteMetadata('/projects/dashboard');
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('Project Dashboard');
    });
  });

  describe('getSpace', () => {
    it('should return space by ID', () => {
      const space = getSpace('dashboard');
      
      expect(space).toBeDefined();
      expect(space.id).toBe('dashboard');
      expect(space.name).toBe('Dashboard');
    });

    it('should return null for invalid space ID', () => {
      const space = getSpace('invalid-space');
      
      expect(space).toBeNull();
    });

    it('should return space with all properties', () => {
      const space = getSpace('projects');
      
      expect(space.id).toBe('projects');
      expect(space.name).toBe('Projects');
      expect(space.path).toBe('/projects');
      expect(space.icon).toBeDefined();
      expect(space.permissionId).toBe('projects-view');
    });
  });

  describe('getSpacesByCategory', () => {
    it('should return spaces for Overview category', () => {
      const spaces = getSpacesByCategory('overview');
      
      expect(spaces.length).toBe(1);
      expect(spaces[0].id).toBe('dashboard');
    });

    it('should return spaces for Operations category', () => {
      const spaces = getSpacesByCategory('operations');
      
      expect(spaces.length).toBe(2);
      expect(spaces.map(s => s.id)).toContain('projects');
      expect(spaces.map(s => s.id)).toContain('inventory');
    });

    it('should return empty array for invalid category', () => {
      const spaces = getSpacesByCategory('invalid-category');
      
      expect(spaces).toEqual([]);
    });

    it('should handle case-insensitive category IDs', () => {
      const spaces = getSpacesByCategory('OVERVIEW');
      
      expect(spaces.length).toBe(1);
    });
  });

  describe('isSpaceAlwaysVisible', () => {
    it('should return true for Dashboard', () => {
      const isVisible = isSpaceAlwaysVisible('dashboard');
      
      expect(isVisible).toBe(true);
    });

    it('should return true for My Space', () => {
      const isVisible = isSpaceAlwaysVisible('self-service');
      
      expect(isVisible).toBe(true);
    });

    it('should return false for Projects', () => {
      const isVisible = isSpaceAlwaysVisible('projects');
      
      expect(isVisible).toBe(false);
    });

    it('should return false for invalid space', () => {
      const isVisible = isSpaceAlwaysVisible('invalid-space');
      
      expect(isVisible).toBe(false);
    });
  });

  describe('getVisibleSpaces', () => {
    it('should return always-visible spaces without permissions', () => {
      const hasPermission = () => false;
      const spaces = getVisibleSpaces(hasPermission);
      
      expect(spaces.length).toBeGreaterThanOrEqual(2);
      expect(spaces.map(s => s.id)).toContain('dashboard');
      expect(spaces.map(s => s.id)).toContain('self-service');
    });

    it('should return all spaces with full permissions', () => {
      const hasPermission = () => true;
      const spaces = getVisibleSpaces(hasPermission);
      
      expect(spaces.length).toBe(9);
    });

    it('should return only permitted spaces', () => {
      const hasPermission = (permissionId) => permissionId === 'projects-view';
      const spaces = getVisibleSpaces(hasPermission);
      
      expect(spaces.map(s => s.id)).toContain('dashboard');
      expect(spaces.map(s => s.id)).toContain('self-service');
      expect(spaces.map(s => s.id)).toContain('projects');
      expect(spaces.map(s => s.id)).not.toContain('hr');
    });

    it('should handle multiple permissions', () => {
      const permissions = ['projects-view', 'hr-view'];
      const hasPermission = (permissionId) => permissions.includes(permissionId);
      const spaces = getVisibleSpaces(hasPermission);
      
      expect(spaces.map(s => s.id)).toContain('projects');
      expect(spaces.map(s => s.id)).toContain('hr');
      expect(spaces.map(s => s.id)).not.toContain('finance');
    });
  });

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for single-level path', () => {
      const breadcrumbs = generateBreadcrumbs('/dashboard');
      
      expect(breadcrumbs.length).toBe(1);
      expect(breadcrumbs[0].label).toBe('Dashboard');
      expect(breadcrumbs[0].path).toBe('/dashboard');
      expect(breadcrumbs[0].isLast).toBe(true);
    });

    it('should generate breadcrumbs for nested path', () => {
      const breadcrumbs = generateBreadcrumbs('/projects/dashboard');
      
      expect(breadcrumbs.length).toBe(2);
      expect(breadcrumbs[0].label).toBe('Projects');
      expect(breadcrumbs[0].path).toBe('/projects');
      expect(breadcrumbs[0].isLast).toBe(false);
      expect(breadcrumbs[1].label).toBe('Project Dashboard');
      expect(breadcrumbs[1].path).toBe('/projects/dashboard');
      expect(breadcrumbs[1].isLast).toBe(true);
    });

    it('should generate breadcrumbs for deep nested path', () => {
      const breadcrumbs = generateBreadcrumbs('/projects/templates/new');
      
      expect(breadcrumbs.length).toBe(3);
      expect(breadcrumbs[0].label).toBe('Projects');
      expect(breadcrumbs[1].label).toBe('Templates');
      expect(breadcrumbs[2].isLast).toBe(true);
    });

    it('should handle paths without metadata', () => {
      const breadcrumbs = generateBreadcrumbs('/unknown/path');
      
      expect(breadcrumbs.length).toBe(2);
      expect(breadcrumbs[0].label).toBe('Unknown');
      expect(breadcrumbs[1].label).toBe('Path');
    });

    it('should handle root path', () => {
      const breadcrumbs = generateBreadcrumbs('/');
      
      expect(breadcrumbs.length).toBe(0);
    });

    it('should capitalize segments without metadata', () => {
      const breadcrumbs = generateBreadcrumbs('/custom-route');
      
      expect(breadcrumbs[0].label).toBe('Custom-route');
    });
  });
});
