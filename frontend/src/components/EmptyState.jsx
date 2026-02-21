import React from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../design-system/components';

/**
 * EmptyState Component
 * 
 * Displays helpful messaging and quick actions when no data exists in a view.
 * Provides guidance to users on what to do next.
 * 
 * @example
 * <EmptyState
 *   icon="FolderOpen"
 *   title="No projects yet"
 *   description="Create your first project to get started"
 *   action={{
 *     label: "Create Project",
 *     onClick: () => navigate('/projects/new')
 *   }}
 * />
 */

const EmptyState = ({
  icon = 'Inbox',
  title,
  description,
  action,
  secondaryAction,
  children,
  size = 'medium',
  className = '',
}) => {
  // Get icon component
  const IconComponent = Icons[icon] || Icons.Inbox;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'py-8',
      icon: 32,
      title: 'text-base',
      description: 'text-sm',
    },
    medium: {
      container: 'py-12',
      icon: 48,
      title: 'text-lg',
      description: 'text-base',
    },
    large: {
      container: 'py-16',
      icon: 64,
      title: 'text-xl',
      description: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${config.container} ${className}`}>
      {/* Icon */}
      <div className="mb-4 text-neutral-400">
        <IconComponent size={config.icon} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-neutral-900 mb-2 ${config.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-neutral-600 mb-6 max-w-md ${config.description}`}>
          {description}
        </p>
      )}

      {/* Custom Content */}
      {children && (
        <div className="mb-6">
          {children}
        </div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * EmptyStateCard Component
 * 
 * Empty state with card styling for use in widgets and panels.
 * 
 * @example
 * <EmptyStateCard
 *   icon="BarChart"
 *   title="No data available"
 *   description="Data will appear here once available"
 * />
 */
export const EmptyStateCard = ({
  icon = 'Inbox',
  title,
  description,
  action,
  className = '',
}) => {
  const IconComponent = Icons[icon] || Icons.Inbox;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 ${className}`}>
      <div className="mb-3 text-neutral-400">
        <IconComponent size={40} strokeWidth={1.5} />
      </div>
      <h4 className="font-medium text-neutral-900 mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-neutral-600 mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          icon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

/**
 * EmptySearchState Component
 * 
 * Specialized empty state for search results.
 * 
 * @example
 * <EmptySearchState
 *   query={searchQuery}
 *   onClear={() => setSearchQuery('')}
 * />
 */
export const EmptySearchState = ({
  query,
  onClear,
  suggestions = [],
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 ${className}`}>
      <div className="mb-4 text-neutral-400">
        <Icons.Search size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No results found
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md">
        {query ? (
          <>
            No results found for <span className="font-medium">"{query}"</span>
          </>
        ) : (
          'Try adjusting your search or filters'
        )}
      </p>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-neutral-600 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => suggestion.onClick()}
                className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {onClear && (
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>
      )}
    </div>
  );
};

/**
 * EmptyFilterState Component
 * 
 * Specialized empty state for filtered results.
 * 
 * @example
 * <EmptyFilterState
 *   onClearFilters={() => resetFilters()}
 * />
 */
export const EmptyFilterState = ({
  onClearFilters,
  activeFiltersCount = 0,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 ${className}`}>
      <div className="mb-4 text-neutral-400">
        <Icons.Filter size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No matching results
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md">
        {activeFiltersCount > 0 ? (
          <>
            No items match your current filters ({activeFiltersCount} active).
            Try adjusting or clearing your filters.
          </>
        ) : (
          'Try adjusting your filters to see results'
        )}
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

/**
 * Predefined empty states for common scenarios
 */
export const EmptyStates = {
  // Dashboard
  DashboardWidget: ({ onAdd }) => (
    <EmptyStateCard
      icon="LayoutDashboard"
      title="No data available"
      description="This widget will display data once available"
    />
  ),

  // Projects
  NoProjects: ({ onCreate }) => (
    <EmptyState
      icon="FolderKanban"
      title="No projects yet"
      description="Create your first project to start tracking tasks, timelines, and resources"
      action={{
        label: 'Create Project',
        onClick: onCreate,
        icon: <Icons.Plus size={16} />,
      }}
    />
  ),

  NoTasks: ({ onCreate }) => (
    <EmptyState
      icon="CheckSquare"
      title="No tasks yet"
      description="Add tasks to track work and assign to team members"
      action={{
        label: 'Add Task',
        onClick: onCreate,
        icon: <Icons.Plus size={16} />,
      }}
      size="small"
    />
  ),

  // HR
  NoEmployees: ({ onAdd }) => (
    <EmptyState
      icon="Users"
      title="No employees yet"
      description="Add your first employee to start managing your team"
      action={{
        label: 'Add Employee',
        onClick: onAdd,
        icon: <Icons.UserPlus size={16} />,
      }}
    />
  ),

  // Finance
  NoTransactions: ({ onCreate }) => (
    <EmptyState
      icon="Receipt"
      title="No transactions yet"
      description="Record your first transaction to start tracking finances"
      action={{
        label: 'Add Transaction',
        onClick: onCreate,
        icon: <Icons.Plus size={16} />,
      }}
    />
  ),

  // Sales
  NoCustomers: ({ onAdd }) => (
    <EmptyState
      icon="Users"
      title="No customers yet"
      description="Add your first customer to start managing sales"
      action={{
        label: 'Add Customer',
        onClick: onAdd,
        icon: <Icons.UserPlus size={16} />,
      }}
    />
  ),

  NoOrders: ({ onCreate }) => (
    <EmptyState
      icon="ShoppingCart"
      title="No orders yet"
      description="Create your first order to start processing sales"
      action={{
        label: 'Create Order',
        onClick: onCreate,
        icon: <Icons.Plus size={16} />,
      }}
    />
  ),

  // Inventory
  NoItems: ({ onAdd }) => (
    <EmptyState
      icon="Package"
      title="No inventory items"
      description="Add your first item to start tracking inventory"
      action={{
        label: 'Add Item',
        onClick: onAdd,
        icon: <Icons.Plus size={16} />,
      }}
    />
  ),

  // Support
  NoTickets: ({ onCreate }) => (
    <EmptyState
      icon="LifeBuoy"
      title="No support tickets"
      description="All caught up! No open support tickets at the moment"
    />
  ),

  // Documents
  NoDocuments: ({ onUpload }) => (
    <EmptyState
      icon="FileText"
      title="No documents yet"
      description="Upload your first document to get started"
      action={{
        label: 'Upload Document',
        onClick: onUpload,
        icon: <Icons.Upload size={16} />,
      }}
    />
  ),

  // Generic
  NoData: () => (
    <EmptyStateCard
      icon="Inbox"
      title="No data available"
      description="Data will appear here once available"
    />
  ),
};

export default EmptyState;
