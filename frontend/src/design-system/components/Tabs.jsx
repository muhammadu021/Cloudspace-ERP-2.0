/**
 * Tabs Component
 * 
 * A tabbed interface component for organizing content into separate views.
 * Supports keyboard navigation and accessibility features.
 * 
 * @example
 * <Tabs defaultTab="overview">
 *   <TabList>
 *     <Tab id="overview">Overview</Tab>
 *     <Tab id="tasks">Tasks</Tab>
 *     <Tab id="timeline">Timeline</Tab>
 *   </TabList>
 *   <TabPanel id="overview">Overview content</TabPanel>
 *   <TabPanel id="tasks">Tasks content</TabPanel>
 *   <TabPanel id="timeline">Timeline content</TabPanel>
 * </Tabs>
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/design-system/utils';

// Context for managing tab state
const TabsContext = createContext(null);

/**
 * Tabs Container Component
 */
export const Tabs = ({ 
  children, 
  defaultTab, 
  activeTab: controlledActiveTab,
  onTabChange,
  className 
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);
  
  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  const handleTabChange = useCallback((tabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  }, [controlledActiveTab, onTabChange]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

/**
 * TabList Component - Container for Tab buttons
 */
export const TabList = ({ children, className }) => {
  return (
    <div 
      role="tablist"
      className={cn(
        'flex border-b border-neutral-200 overflow-x-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Tab Component - Individual tab button
 */
export const Tab = ({ 
  id, 
  children, 
  icon: Icon,
  badge,
  disabled = false,
  className 
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('Tab must be used within Tabs component');
  }

  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === id;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap',
        'border-b-2 transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'min-h-[44px]', // Touch-friendly minimum height
        isActive
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
      {badge !== undefined && badge !== null && (
        <span className={cn(
          'ml-1 px-2 py-0.5 text-xs rounded-full',
          isActive 
            ? 'bg-primary-100 text-primary-700'
            : 'bg-neutral-100 text-neutral-600'
        )}>
          {badge}
        </span>
      )}
    </button>
  );
};

/**
 * TabPanel Component - Content container for each tab
 */
export const TabPanel = ({ 
  id, 
  children, 
  className,
  lazy = false 
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabPanel must be used within Tabs component');
  }

  const { activeTab } = context;
  const isActive = activeTab === id;

  // Lazy loading: don't render content until tab is active
  if (lazy && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!isActive}
      className={cn(
        'py-6',
        !isActive && 'hidden',
        className
      )}
    >
      {children}
    </div>
  );
};

// Export as default for convenience
const TabsComponent = Tabs;
TabsComponent.List = TabList;
TabsComponent.Tab = Tab;
TabsComponent.Panel = TabPanel;

export default TabsComponent;
