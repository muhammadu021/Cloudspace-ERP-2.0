import React from 'react';

const ProjectDashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Active Projects</h2>
          <p className="text-3xl font-bold text-primary">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Completed Projects</h2>
          <p className="text-3xl font-bold text-green-600">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Overdue Projects</h2>
          <p className="text-3xl font-bold text-red-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Team Members</h2>
          <p className="text-3xl font-bold text-purple-600">42</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;