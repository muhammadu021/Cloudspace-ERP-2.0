/**
 * Router module exports
 * Centralized exports for routing configuration, guards, and utilities
 */

export { routes } from './routes';
export {
  AuthGuard,
  PermissionGuard,
  RoleGuard,
  ModuleGuard,
  GuestGuard,
  CombinedGuard,
} from './routeGuards';
export {
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
