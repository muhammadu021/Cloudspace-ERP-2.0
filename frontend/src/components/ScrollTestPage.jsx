import React from 'react';

/**
 * Test page with long content to test scroll-to-top functionality
 */
const ScrollTestPage = () => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📜 Scroll-to-Top Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          This page has long content to test the scroll-to-top functionality.
          Click any sidebar item to see the page scroll to the top smoothly.
        </p>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            ✨ How it works:
          </h2>
          <ul className="text-primary-700 space-y-1">
            <li>• Click any sidebar navigation item</li>
            <li>• The main content area will smoothly scroll to the top</li>
            <li>• You'll see a brief "Scrolling to top..." indicator</li>
            <li>• A scroll-to-top button appears when you scroll down</li>
          </ul>
        </div>
      </div>

      {/* Generate long content for testing */}
      {Array.from({ length: 20 }, (_, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            📄 Section {index + 1}
          </h2>
          <p className="text-gray-600 mb-4">
            This is section {index + 1} of the test content. Lorem ipsum dolor sit amet, 
            consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et 
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-800 mb-2">Feature {index + 1}A</h3>
              <p className="text-sm text-gray-600">
                Duis aute irure dolor in reprehenderit in voluptate velit esse 
                cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-gray-800 mb-2">Feature {index + 1}B</h3>
              <p className="text-sm text-gray-600">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa 
                qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
          
          {index === 10 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎯 Scroll Test Checkpoint
              </h3>
              <p className="text-green-700">
                You're halfway through the content! Try clicking a sidebar item now 
                to see the smooth scroll-to-top in action.
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="bg-gradient-to-r from-primary-400 to-purple-600 text-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-3">🏁 End of Content</h2>
        <p className="mb-4">
          You've reached the bottom! Click any sidebar navigation item to test 
          the scroll-to-top functionality.
        </p>
        <div className="bg-white bg-opacity-20 rounded p-3">
          <p className="text-sm">
            💡 <strong>Pro tip:</strong> The scroll-to-top button should be visible 
            in the bottom-right corner. Click it to scroll back to the top!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrollTestPage;