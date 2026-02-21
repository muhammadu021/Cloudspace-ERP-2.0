/**
 * GlobalSearch Component
 * 
 * Unified search across routes, entities, and actions with keyboard shortcuts.
 * Features:
 * - Cmd/Ctrl+K keyboard shortcut
 * - Search indexing with relevance ranking
 * - Results within 200ms
 * - Highlighted matching text
 * - Recent searches history
 * - Keyboard navigation (arrow keys, Enter, Esc)
 * 
 * Requirements: 1.4, 1.5
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import Modal from '../design-system/components/Modal';
import Badge from '../design-system/components/Badge';
import { cn } from '../design-system/utils';

// Search index with routes, entities, and actions
const SEARCH_INDEX = {
  routes: [
    { id: 'dashboard', title: 'Dashboard', path: '/dashboard', type: 'route', category: 'Overview', icon: '📊' },
    { id: 'projects', title: 'Projects', path: '/projects', type: 'route', category: 'Operations', icon: '📁' },
    { id: 'projects-list', title: 'Project List', path: '/projects/list', type: 'route', category: 'Operations', icon: '📋' },
    { id: 'projects-calendar', title: 'Project Calendar', path: '/projects/calendar', type: 'route', category: 'Operations', icon: '📅' },
    { id: 'projects-board', title: 'Project Board', path: '/projects/board', type: 'route', category: 'Operations', icon: '📌' },
    { id: 'hr', title: 'Human Resources', path: '/hr', type: 'route', category: 'People', icon: '👥' },
    { id: 'hr-employees', title: 'Employees', path: '/hr/employees', type: 'route', category: 'People', icon: '👤' },
    { id: 'hr-attendance', title: 'Attendance', path: '/hr/attendance', type: 'route', category: 'People', icon: '⏰' },
    { id: 'hr-payroll', title: 'Payroll', path: '/hr/payroll', type: 'route', category: 'People', icon: '💰' },
    { id: 'finance', title: 'Finance', path: '/finance', type: 'route', category: 'Finance', icon: '💵' },
    { id: 'finance-dashboard', title: 'Finance Dashboard', path: '/finance/dashboard', type: 'route', category: 'Finance', icon: '📈' },
    { id: 'finance-transactions', title: 'Transactions', path: '/finance/transactions', type: 'route', category: 'Finance', icon: '💳' },
    { id: 'finance-budgets', title: 'Budgets', path: '/finance/budgets', type: 'route', category: 'Finance', icon: '📊' },
    { id: 'sales', title: 'Sales', path: '/sales', type: 'route', category: 'Finance', icon: '🛒' },
    { id: 'sales-customers', title: 'Customers', path: '/sales/customers', type: 'route', category: 'Finance', icon: '👥' },
    { id: 'sales-orders', title: 'Orders', path: '/sales/orders', type: 'route', category: 'Finance', icon: '📦' },
    { id: 'sales-leads', title: 'Leads', path: '/sales/leads', type: 'route', category: 'Finance', icon: '🎯' },
    { id: 'inventory', title: 'Inventory', path: '/inventory', type: 'route', category: 'Operations', icon: '📦' },
    { id: 'inventory-items', title: 'Inventory Items', path: '/inventory/items', type: 'route', category: 'Operations', icon: '📋' },
    { id: 'inventory-movements', title: 'Stock Movements', path: '/inventory/movements', type: 'route', category: 'Operations', icon: '🔄' },
    { id: 'admin', title: 'Administration', path: '/admin', type: 'route', category: 'System', icon: '⚙️' },
    { id: 'admin-users', title: 'User Management', path: '/admin/users', type: 'route', category: 'System', icon: '👥' },
    { id: 'admin-settings', title: 'System Settings', path: '/admin/settings', type: 'route', category: 'System', icon: '🔧' },
    { id: 'support', title: 'Support', path: '/support', type: 'route', category: 'Support', icon: '🎧' },
    { id: 'support-tickets', title: 'Support Tickets', path: '/support/tickets', type: 'route', category: 'Support', icon: '🎫' },
    { id: 'portal', title: 'Self-Service Portal', path: '/portal', type: 'route', category: 'People', icon: '🏠' },
  ],
  entities: [
    { id: 'project-1', title: 'Website Redesign', type: 'project', path: '/projects/1', category: 'Projects', icon: '📁' },
    { id: 'project-2', title: 'Mobile App Development', type: 'project', path: '/projects/2', category: 'Projects', icon: '📁' },
    { id: 'project-3', title: 'ERP System Upgrade', type: 'project', path: '/projects/3', category: 'Projects', icon: '📁' },
    { id: 'employee-1', title: 'John Doe', type: 'employee', path: '/hr/employees/1', category: 'Employees', icon: '👤' },
    { id: 'employee-2', title: 'Jane Smith', type: 'employee', path: '/hr/employees/2', category: 'Employees', icon: '👤' },
    { id: 'customer-1', title: 'Acme Corporation', type: 'customer', path: '/sales/customers/1', category: 'Customers', icon: '🏢' },
    { id: 'customer-2', title: 'Tech Solutions Inc', type: 'customer', path: '/sales/customers/2', category: 'Customers', icon: '🏢' },
    { id: 'order-1', title: 'Order #1001', type: 'order', path: '/sales/orders/1001', category: 'Orders', icon: '📦' },
    { id: 'item-1', title: 'Laptop - Dell XPS 15', type: 'inventory', path: '/inventory/items/1', category: 'Inventory', icon: '💻' },
    { id: 'item-2', title: 'Office Chair - Ergonomic', type: 'inventory', path: '/inventory/items/2', category: 'Inventory', icon: '🪑' },
  ],
  actions: [
    { id: 'create-project', title: 'Create New Project', type: 'action', action: 'navigate:/projects/new', category: 'Actions', icon: '➕' },
    { id: 'add-employee', title: 'Add Employee', type: 'action', action: 'navigate:/hr/employees/new', category: 'Actions', icon: '➕' },
    { id: 'new-order', title: 'Create Sales Order', type: 'action', action: 'navigate:/sales/orders/new', category: 'Actions', icon: '➕' },
    { id: 'clock-in', title: 'Clock In', type: 'action', action: 'clock-in', category: 'Actions', icon: '⏰' },
    { id: 'request-leave', title: 'Request Leave', type: 'action', action: 'navigate:/portal/leave/new', category: 'Actions', icon: '📅' },
    { id: 'submit-expense', title: 'Submit Expense', type: 'action', action: 'navigate:/portal/expenses/new', category: 'Actions', icon: '💰' },
  ],
};

const RECENT_SEARCHES_KEY = 'erp-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [usageFrequency, setUsageFrequency] = useState({});
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Load recent searches and usage frequency from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setRecentSearches(data.recent || []);
        setUsageFrequency(data.frequency || {});
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Save recent searches and usage frequency to localStorage
  const saveToLocalStorage = (recent, frequency) => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify({
        recent,
        frequency,
      }));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  };

  // Keyboard shortcut listener (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Fuzzy search with relevance scoring
  const searchItems = useMemo(() => {
    if (!query.trim()) return [];

    const startTime = performance.now();
    const searchTerm = query.toLowerCase();
    const allItems = [
      ...SEARCH_INDEX.routes,
      ...SEARCH_INDEX.entities,
      ...SEARCH_INDEX.actions,
    ];

    const scoredResults = allItems
      .map(item => {
        const title = item.title.toLowerCase();
        const category = item.category?.toLowerCase() || '';
        
        // Calculate relevance score
        let score = 0;
        
        // Exact match gets highest score
        if (title === searchTerm) {
          score += 100;
        }
        
        // Starts with search term
        if (title.startsWith(searchTerm)) {
          score += 50;
        }
        
        // Contains search term
        if (title.includes(searchTerm)) {
          score += 30;
        }
        
        // Word boundary match
        const words = title.split(/\s+/);
        if (words.some(word => word.startsWith(searchTerm))) {
          score += 20;
        }
        
        // Category match
        if (category.includes(searchTerm)) {
          score += 10;
        }
        
        // Usage frequency boost
        const frequency = usageFrequency[item.id] || 0;
        score += frequency * 5;
        
        // Fuzzy match (simple character matching)
        let fuzzyScore = 0;
        let lastIndex = -1;
        for (const char of searchTerm) {
          const index = title.indexOf(char, lastIndex + 1);
          if (index > lastIndex) {
            fuzzyScore++;
            lastIndex = index;
          }
        }
        if (fuzzyScore === searchTerm.length) {
          score += fuzzyScore;
        }
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20 results

    const endTime = performance.now();
    console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms`);

    return scoredResults;
  }, [query, usageFrequency]);

  // Update results when search changes
  useEffect(() => {
    setResults(searchItems);
    setSelectedIndex(0);
  }, [searchItems]);

  // Handle result selection
  const handleSelectResult = (item) => {
    // Update usage frequency
    const newFrequency = {
      ...usageFrequency,
      [item.id]: (usageFrequency[item.id] || 0) + 1,
    };
    setUsageFrequency(newFrequency);

    // Add to recent searches
    const newRecent = [
      item,
      ...recentSearches.filter(r => r.id !== item.id),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(newRecent);

    // Save to localStorage
    saveToLocalStorage(newRecent, newFrequency);

    // Navigate or execute action
    if (item.type === 'action') {
      if (item.action.startsWith('navigate:')) {
        const path = item.action.replace('navigate:', '');
        window.location.href = path;
      } else {
        console.log('Execute action:', item.action);
      }
    } else {
      window.location.href = item.path;
    }

    // Close modal
    handleClose();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-neutral-900 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Handle modal close
  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups = {};
    results.forEach(item => {
      const category = item.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }, [results]);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md',
          'bg-neutral-100 hover:bg-neutral-200',
          'text-neutral-600 text-sm',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto px-2 py-0.5 text-xs bg-white rounded border border-neutral-300">
          {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </button>

      {/* Search Modal */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        title=""
        size="lg"
        className="!p-0"
      >
        <div className="flex flex-col h-full">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
            <Search className="h-5 w-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search routes, entities, and actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-base bg-transparent border-0 focus:outline-none placeholder-neutral-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded hover:bg-neutral-100 transition-colors"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Results */}
          <div ref={resultsRef} className="flex-1 overflow-y-auto max-h-96">
            {query.trim() ? (
              results.length > 0 ? (
                <div className="py-2">
                  {Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category} className="mb-4">
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                        {category}
                      </div>
                      {items.map((item, index) => {
                        const globalIndex = results.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        
                        return (
                          <button
                            key={item.id}
                            data-index={globalIndex}
                            onClick={() => handleSelectResult(item)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left',
                              'transition-colors duration-150',
                              isSelected
                                ? 'bg-primary-50 border-l-2 border-primary-500'
                                : 'hover:bg-neutral-50 border-l-2 border-transparent'
                            )}
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-neutral-900">
                                {highlightMatch(item.title, query)}
                              </div>
                              {item.path && (
                                <div className="text-xs text-neutral-500 truncate">
                                  {item.path}
                                </div>
                              )}
                            </div>
                            <Badge variant="default" size="sm">
                              {item.type}
                            </Badge>
                            {usageFrequency[item.id] > 0 && (
                              <div className="flex items-center gap-1 text-xs text-neutral-400">
                                <TrendingUp className="h-3 w-3" />
                                {usageFrequency[item.id]}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-neutral-300 mb-3" />
                  <p className="text-sm text-neutral-500">No results found for "{query}"</p>
                  <p className="text-xs text-neutral-400 mt-1">Try a different search term</p>
                </div>
              )
            ) : (
              <div className="py-4">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </div>
                    {recentSearches.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900">
                            {item.title}
                          </div>
                          {item.path && (
                            <div className="text-xs text-neutral-500 truncate">
                              {item.path}
                            </div>
                          )}
                        </div>
                        <Badge variant="default" size="sm">
                          {item.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
                <div className="px-4 py-8 text-center">
                  <Search className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">Start typing to search</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Search across routes, entities, and actions
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white rounded border border-neutral-300">Esc</kbd>
                  Close
                </span>
              </div>
              {results.length > 0 && (
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GlobalSearch;
