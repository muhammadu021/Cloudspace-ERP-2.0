import React, { useState } from 'react';
import NavigationSidebar from './NavigationSidebar';

/**
 * NavigationSidebar Quick Access Example
 * 
 * This example demonstrates the Quick Access feature in the NavigationSidebar.
 * 
 * Features demonstrated:
 * 1. Quick Access section with top 5 most accessed spaces
 * 2. Frequency tracking (click spaces to see them appear in Quick Access)
 * 3. Drag-and-drop reordering
 * 4. Pin/unpin functionality
 * 5. Collapsible Quick Access section
 * 6. Persistence across page reloads
 * 
 * To test:
 * 1. Click on different spaces multiple times
 * 2. Watch them appear in Quick Access section
 * 3. Hover over Quick Access items to see pin button
 * 4. Click pin to keep a space in Quick Access
 * 5. Drag items to reorder them
 * 6. Collapse/expand Quick Access section
 * 7. Reload page to see preferences persist
 */

const NavigationSidebarQuickAccessExample = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Simulate user permissions (all spaces accessible)
  const userPermissions = {
    projects: true,
    inventory: true,
    hr: true,
    finance: true,
    admin: true,
    sales: true,
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Navigation Sidebar with Quick Access */}
      <NavigationSidebar userPermissions={userPermissions} />
      
      {/* Main Content Area */}
      <main className="flex-1 p-8 ml-64 lg:ml-64">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-800 mb-6">
            Quick Access Feature Demo
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              How to Use Quick Access
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Click Spaces to Track Frequency
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Click on different spaces in the sidebar. The system automatically tracks how often you access each space.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Quick Access Appears Automatically
                  </h3>
                  <p className="text-sm text-neutral-600">
                    After accessing spaces, a "Quick Access" section appears at the top of the sidebar showing your 5 most frequently accessed spaces.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Pin Your Favorites
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Hover over a Quick Access item and click the star icon to pin it. Pinned spaces stay in Quick Access regardless of frequency.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Drag to Reorder
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Click and drag Quick Access items to reorder them. Your custom order is saved automatically.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  5
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Collapse/Expand Section
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Click the "Quick Access" header to collapse or expand the section. Your preference persists across sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Current Page: {currentPage}
            </h2>
            <p className="text-neutral-600 mb-4">
              Navigate using the sidebar to see the Quick Access feature in action.
            </p>
            
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-medium text-primary-800 mb-2">
                💡 Pro Tip
              </h3>
              <p className="text-sm text-primary-700">
                The Quick Access feature uses localStorage to persist your preferences. Try reloading the page after setting up your Quick Access - your preferences will be restored!
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Technical Details
            </h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Frequency Tracking</span>
                <span className="font-mono text-neutral-800">localStorage: quick-access-frequency</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Custom Order</span>
                <span className="font-mono text-neutral-800">localStorage: quick-access-custom-order</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Pinned Spaces</span>
                <span className="font-mono text-neutral-800">localStorage: quick-access-pinned</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Section State</span>
                <span className="font-mono text-neutral-800">localStorage: quick-access-collapsed</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Max Items</span>
                <span className="font-semibold text-neutral-800">5 spaces</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NavigationSidebarQuickAccessExample;
