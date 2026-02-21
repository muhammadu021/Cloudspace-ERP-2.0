/**
 * Export and Print Functionality Example
 * 
 * Demonstrates how to use the export and print features with DataTable
 * and report views. Shows CSV, Excel, PDF export and print-friendly layouts.
 */

import React, { useState } from 'react';
import { DataTable, ExportButton, PrintButton } from '../components';
import PrintableReport from '../../components/PrintableReport';
import { Card } from '../components';

// Sample data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 75000, status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 68000, status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', salary: 72000, status: 'Active' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', department: 'HR', salary: 65000, status: 'On Leave' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'Finance', salary: 80000, status: 'Active' },
];

// Column definitions
const columns = [
  {
    Header: 'ID',
    accessor: 'id',
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Email',
    accessor: 'email',
  },
  {
    Header: 'Department',
    accessor: 'department',
  },
  {
    Header: 'Salary',
    accessor: 'salary',
    Cell: ({ value }) => `$${value.toLocaleString()}`,
  },
  {
    Header: 'Status',
    accessor: 'status',
  },
];

const ExportPrintExample = () => {
  const [exportMessage, setExportMessage] = useState('');

  const handleExportComplete = (format, result) => {
    setExportMessage(`Successfully exported as ${format.toUpperCase()}`);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleExportError = (format, error) => {
    setExportMessage(`Failed to export as ${format.toUpperCase()}: ${error.message}`);
    setTimeout(() => setExportMessage(''), 5000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export and Print Examples</h1>
        <p className="text-neutral-600">
          Demonstrates universal export functionality (CSV, Excel, PDF) and print-friendly views.
        </p>
      </div>

      {/* Export message */}
      {exportMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {exportMessage}
        </div>
      )}

      {/* Example 1: DataTable with Export */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Example 1: DataTable with Export</h2>
          <p className="text-sm text-neutral-600 mb-4">
            DataTable component with built-in export functionality. Export respects current filters and sorting.
          </p>
          
          <DataTable
            columns={columns}
            data={sampleData}
            enableSorting
            enableFiltering
            enablePagination
            enableExport
            exportFilename="employee-report"
            exportFormats={['csv', 'excel', 'pdf']}
            exportTitle="Employee Report"
            onExportComplete={handleExportComplete}
            onExportError={handleExportError}
          />
        </div>
      </Card>

      {/* Example 2: Standalone Export Button */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Example 2: Standalone Export Button</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Use ExportButton independently for custom data exports.
          </p>
          
          <div className="flex gap-4 mb-4">
            <ExportButton
              data={sampleData}
              columns={columns}
              filename="employees"
              formats={['csv', 'excel', 'pdf']}
              title="Employee List"
              onExportComplete={handleExportComplete}
              onExportError={handleExportError}
            />
            
            <ExportButton
              data={sampleData}
              columns={columns}
              filename="employees-csv-only"
              formats={['csv']}
              variant="primary"
              onExportComplete={handleExportComplete}
              onExportError={handleExportError}
            />
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Export Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
              <li>CSV: Simple comma-separated values for spreadsheet import</li>
              <li>Excel: Formatted XLSX with column widths and styling</li>
              <li>PDF: Professional formatted table with headers and pagination</li>
              <li>Respects filtered and sorted data</li>
              <li>Automatic timestamp in filename</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Example 3: Printable Report */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Example 3: Printable Report</h2>
          <p className="text-sm text-neutral-600 mb-4">
            Use PrintableReport wrapper for print-optimized layouts. Click Print to see the optimized view.
          </p>
          
          <div className="mb-4">
            <PrintButton
              title="Employee Report - January 2024"
              showPreview
            />
          </div>

          <PrintableReport
            title="Employee Report"
            subtitle="January 2024"
            showDate
            showPageNumbers
            confidential
          >
            <div className="space-y-6">
              <section className="report-section">
                <h3 className="report-section-title">Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="metric-card">
                    <div className="metric-label">Total Employees</div>
                    <div className="metric-value">{sampleData.length}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Active</div>
                    <div className="metric-value">
                      {sampleData.filter(e => e.status === 'Active').length}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Departments</div>
                    <div className="metric-value">
                      {new Set(sampleData.map(e => e.department)).size}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Avg Salary</div>
                    <div className="metric-value">
                      ${Math.round(sampleData.reduce((sum, e) => sum + e.salary, 0) / sampleData.length).toLocaleString()}
                    </div>
                  </div>
                </div>
              </section>

              <section className="report-section">
                <h3 className="report-section-title">Employee Details</h3>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th className="amount">Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department}</td>
                        <td className="amount">${employee.salary.toLocaleString()}</td>
                        <td>{employee.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </PrintableReport>
        </div>
      </Card>

      {/* Example 4: Print Optimization Tips */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Print Optimization Features</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Automatically Hidden:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>Navigation sidebar</li>
                <li>Header and footer bars</li>
                <li>Buttons and interactive elements</li>
                <li>Filters and search controls</li>
                <li>Pagination controls</li>
                <li>Tooltips and dropdowns</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Print Optimizations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-700">
                <li>A4 page size with proper margins</li>
                <li>Page breaks avoid splitting content</li>
                <li>Tables repeat headers on each page</li>
                <li>Black text on white background</li>
                <li>Optimized font sizes for readability</li>
                <li>Page numbers and timestamps</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Usage Tips:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Use <code className="bg-blue-100 px-1 rounded">className="no-print"</code> to hide elements from print</li>
              <li>Use <code className="bg-blue-100 px-1 rounded">className="print-only"</code> to show elements only in print</li>
              <li>Wrap reports in <code className="bg-blue-100 px-1 rounded">&lt;PrintableReport&gt;</code> for automatic formatting</li>
              <li>Add <code className="bg-blue-100 px-1 rounded">page-break-before</code> or <code className="bg-blue-100 px-1 rounded">page-break-after</code> classes for manual page breaks</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExportPrintExample;
