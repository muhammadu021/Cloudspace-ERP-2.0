import React from 'react'

const TestComponent = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">CSS Test Component</h2>
      <div className="space-y-4">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-success">Success Button</button>
        <button className="btn btn-warning">Warning Button</button>
        <button className="btn btn-error">Error Button</button>
      </div>
      <div className="mt-6">
        <input 
          type="text" 
          placeholder="Test input field" 
          className="input w-full"
        />
      </div>
      <div className="mt-4 flex space-x-2">
        <span className="badge badge-default">Default</span>
        <span className="badge badge-success">Success</span>
        <span className="badge badge-warning">Warning</span>
        <span className="badge badge-error">Error</span>
      </div>
    </div>
  )
}

export default TestComponent