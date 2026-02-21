/**
 * GlobalSearch Component Example
 * 
 * Demonstrates the usage of the GlobalSearch component in the ERP system.
 * 
 * Features demonstrated:
 * - Basic integration in a header/navbar
 * - Keyboard shortcut (Cmd/Ctrl+K)
 * - Search across routes, entities, and actions
 * - Recent searches
 * - Usage frequency tracking
 */

import React from 'react';
import GlobalSearch from './GlobalSearch';

const GlobalSearchExample = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with GlobalSearch */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-neutral-900">ERP System</h1>
          </div>
          
          {/* GlobalSearch Component */}
          <div className="flex-1 max-w-md mx-8">
            <GlobalSearch />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
              Notifications
            </button>
            <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            GlobalSearch Component Demo
          </h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                How to Use
              </h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-600">
                <li>Click the search button in the header or press <kbd className="px-2 py-1 bg-neutral-100 rounded text-xs">Cmd/Ctrl+K</kbd></li>
                <li>Type to search across routes, entities, and actions</li>
                <li>Use arrow keys (↑↓) to navigate results</li>
                <li>Press Enter to select a result</li>
                <li>Press Escape to close the search modal</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">🔍 Smart Search</h4>
                  <p className="text-sm text-neutral-600">
                    Fuzzy search with relevance ranking based on exact matches, 
                    word boundaries, and usage frequency.
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">⚡ Fast Results</h4>
                  <p className="text-sm text-neutral-600">
                    Search results appear within 200ms with highlighted matching text.
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">🕐 Recent Searches</h4>
                  <p className="text-sm text-neutral-600">
                    Your last 5 searches are saved and displayed when you open the search.
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">📊 Usage Tracking</h4>
                  <p className="text-sm text-neutral-600">
                    Frequently accessed items are ranked higher in search results.
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">⌨️ Keyboard Navigation</h4>
                  <p className="text-sm text-neutral-600">
                    Full keyboard support with arrow keys, Enter, and Escape.
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">🏷️ Categorized Results</h4>
                  <p className="text-sm text-neutral-600">
                    Results are grouped by category (Routes, Entities, Actions) for easy browsing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Search Index
              </h3>
              <p className="text-neutral-600 mb-4">
                The GlobalSearch component searches across the following types:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">📍 Routes (26 items)</h4>
                  <p className="text-sm text-neutral-600">
                    All major routes in the ERP system including Dashboard, Projects, HR, 
                    Finance, Sales, Inventory, Admin, Support, and Self-Service Portal.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">📦 Entities (10 items)</h4>
                  <p className="text-sm text-neutral-600">
                    Sample entities like projects, employees, customers, orders, and inventory items.
                    In production, this would be populated with real data from the backend.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">⚡ Actions (6 items)</h4>
                  <p className="text-sm text-neutral-600">
                    Common actions like creating projects, adding employees, creating orders, 
                    clocking in, requesting leave, and submitting expenses.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Try These Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  dashboard
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  project
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  employee
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  finance
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  sales
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  inventory
                </kbd>
                <kbd className="px-3 py-2 bg-neutral-100 rounded text-sm cursor-pointer hover:bg-neutral-200">
                  create
                </kbd>
              </div>
            </section>

            <section className="border-t border-neutral-200 pt-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Integration Notes
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>For Production Use:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Replace the static SEARCH_INDEX with dynamic data from your backend API</li>
                  <li>Implement server-side search for large datasets (10,000+ items)</li>
                  <li>Add debouncing for API calls to reduce server load</li>
                  <li>Implement search analytics to track popular searches</li>
                  <li>Add search filters (by type, date, status, etc.)</li>
                  <li>Consider implementing Elasticsearch or similar for advanced search</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GlobalSearchExample;
