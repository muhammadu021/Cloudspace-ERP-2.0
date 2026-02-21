/**
 * Breadcrumbs Component Example
 * 
 * Demonstrates the usage of the Breadcrumbs component in different scenarios.
 * This example shows how breadcrumbs automatically generate from routes and
 * provide navigation capabilities.
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { cn } from '../design-system/utils';

// Example page components
const DashboardPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <p className="text-neutral-600">Welcome to the ERP System Dashboard</p>
    <div className="space-y-2">
      <Link to="/projects" className="block text-primary-600 hover:underline">
        Go to Projects
      </Link>
      <Link to="/hr/employees" className="block text-primary-600 hover:underline">
        Go to HR Employees
      </Link>
      <Link to="/sales/customers/123" className="block text-primary-600 hover:underline">
        Go to Customer Detail
      </Link>
    </div>
  </div>
);

const ProjectsPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Projects</h1>
    <p className="text-neutral-600">Manage your projects</p>
    <div className="space-y-2">
      <Link to="/projects/list" className="block text-primary-600 hover:underline">
        View Project List
      </Link>
      <Link to="/projects/board" className="block text-primary-600 hover:underline">
        View Project Board
      </Link>
      <Link to="/projects/123" className="block text-primary-600 hover:underline">
        View Project #123
      </Link>
    </div>
  </div>
);

const ProjectListPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Project List</h1>
    <p className="text-neutral-600">All projects in list view</p>
    <Link to="/projects/123/edit" className="block text-primary-600 hover:underline">
      Edit Project #123
    </Link>
  </div>
);

const ProjectDetailPage = () => {
  const location = useLocation();
  const projectId = location.pathname.split('/')[2];
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Project #{projectId}</h1>
      <p className="text-neutral-600">Project details and information</p>
      <Link to={`/projects/${projectId}/edit`} className="block text-primary-600 hover:underline">
        Edit this project
      </Link>
    </div>
  );
};

const ProjectEditPage = () => {
  const location = useLocation();
  const projectId = location.pathname.split('/')[2];
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Edit Project #{projectId}</h1>
      <p className="text-neutral-600">Edit project details</p>
    </div>
  );
};

const HREmployeesPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Employees</h1>
    <p className="text-neutral-600">Manage employee records</p>
    <Link to="/hr/employees/456" className="block text-primary-600 hover:underline">
      View Employee #456
    </Link>
  </div>
);

const EmployeeDetailPage = () => {
  const location = useLocation();
  const employeeId = location.pathname.split('/')[3];
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Employee #{employeeId}</h1>
      <p className="text-neutral-600">Employee details and information</p>
    </div>
  );
};

const CustomerDetailPage = () => {
  const location = useLocation();
  const customerId = location.pathname.split('/')[3];
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customer #{customerId}</h1>
      <p className="text-neutral-600">Customer details and order history</p>
      <Link to={`/sales/customers/${customerId}/orders`} className="block text-primary-600 hover:underline">
        View Orders
      </Link>
    </div>
  );
};

const CustomerOrdersPage = () => {
  const location = useLocation();
  const customerId = location.pathname.split('/')[3];
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customer #{customerId} Orders</h1>
      <p className="text-neutral-600">All orders for this customer</p>
    </div>
  );
};

// Layout component with breadcrumbs
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar with breadcrumbs */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <Breadcrumbs />
      </div>
      
      {/* Main content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

/**
 * Breadcrumbs Example Application
 */
const BreadcrumbsExample = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Breadcrumbs Component Example
            </h1>
            <p className="text-neutral-600">
              Navigate through different routes to see breadcrumbs in action.
              The breadcrumbs automatically generate from the current route and allow
              quick navigation to parent levels.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <Routes>
              <Route path="/" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
              <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
              <Route path="/projects/list" element={<Layout><ProjectListPage /></Layout>} />
              <Route path="/projects/board" element={<Layout><div><h1 className="text-2xl font-bold">Project Board</h1></div></Layout>} />
              <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
              <Route path="/projects/:id/edit" element={<Layout><ProjectEditPage /></Layout>} />
              <Route path="/hr/employees" element={<Layout><HREmployeesPage /></Layout>} />
              <Route path="/hr/employees/:id" element={<Layout><EmployeeDetailPage /></Layout>} />
              <Route path="/sales/customers/:id" element={<Layout><CustomerDetailPage /></Layout>} />
              <Route path="/sales/customers/:id/orders" element={<Layout><CustomerOrdersPage /></Layout>} />
            </Routes>
          </div>

          {/* Feature highlights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Auto-generation
              </h3>
              <p className="text-sm text-neutral-600">
                Breadcrumbs automatically generate from the current route path,
                using predefined labels for known routes and capitalizing unknown segments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Click Navigation
              </h3>
              <p className="text-sm text-neutral-600">
                Click any parent breadcrumb to navigate to that level. The current
                page breadcrumb is not clickable and marked with aria-current.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Responsive Design
              </h3>
              <p className="text-sm text-neutral-600">
                On mobile devices (&lt;768px), middle breadcrumbs are hidden and
                replaced with an ellipsis, showing only the first and last items.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Keyboard Accessible
              </h3>
              <p className="text-sm text-neutral-600">
                Full keyboard navigation support with Enter and Space keys.
                Proper focus indicators and ARIA labels for screen readers.
              </p>
            </div>
          </div>

          {/* Usage example */}
          <div className="mt-8 bg-neutral-900 text-neutral-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Usage Example</h3>
            <pre className="text-sm overflow-x-auto">
              <code>{`import Breadcrumbs from './components/Breadcrumbs';

// In your layout or page component
function Layout() {
  return (
    <div>
      <header className="bg-white border-b px-6 py-4">
        <Breadcrumbs />
      </header>
      <main>
        {/* Your page content */}
      </main>
    </div>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default BreadcrumbsExample;
