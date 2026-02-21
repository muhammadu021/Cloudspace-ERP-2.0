/**
 * DataTable Component
 * 
 * A comprehensive table component with sorting, filtering, pagination,
 * column visibility toggle, and reordering capabilities.
 * Built with react-table and designed for flexibility and accessibility.
 * 
 * @example
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50, 100] }}
 *   enableSorting
 *   enableFiltering
 *   enableColumnVisibility
 * />
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTable, useSortBy, useFilters, usePagination, useRowSelect } from 'react-table';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
  Settings2,
  Loader2
} from 'lucide-react';
import { cn } from '../utils';
import Button from './Button';
import ExportButton from './ExportButton';

// Default filter UI component
const DefaultColumnFilter = ({ column: { filterValue, setFilter, Header } }) => {
  return (
    <div className="relative">
      <input
        value={filterValue || ''}
        onChange={(e) => setFilter(e.target.value || undefined)}
        placeholder={`Search ${Header}...`}
        className="w-full px-3 py-1.5 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      {filterValue && (
        <button
          onClick={() => setFilter(undefined)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Column visibility toggle component
const ColumnVisibilityToggle = ({ allColumns, onClose }) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-700">Column Visibility</h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {allColumns.map((column) => (
          <label
            key={column.id}
            className="flex items-center gap-2 text-sm text-neutral-700 hover:bg-neutral-50 p-2 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              {...column.getToggleHiddenProps()}
              className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span>{column.Header}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const DataTable = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  enableSorting = true,
  enableFiltering = false,
  enablePagination = true,
  enableColumnVisibility = false,
  enableRowSelection = false,
  enableExport = false,
  exportFilename = 'export',
  exportFormats = ['csv', 'excel', 'pdf'],
  exportTitle,
  pagination = {},
  onRowClick,
  onSelectionChange,
  onExportStart,
  onExportComplete,
  onExportError,
  className,
  ...props
}) => {
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);

  // Default pagination config
  const paginationConfig = {
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
    ...pagination,
  };

  // Default filter type
  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  // Table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds },
    allColumns,
    rows,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { 
        pageIndex: 0, 
        pageSize: paginationConfig.pageSize,
      },
    },
    enableFiltering ? useFilters : () => {},
    enableSorting ? useSortBy : () => {},
    enablePagination ? usePagination : () => {},
    enableRowSelection ? useRowSelect : () => {},
    (hooks) => {
      if (enableRowSelection) {
        hooks.visibleColumns.push((columns) => [
          {
            id: 'selection',
            Header: ({ getToggleAllPageRowsSelectedProps }) => (
              <input
                type="checkbox"
                {...getToggleAllPageRowsSelectedProps()}
                className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              />
            ),
            Cell: ({ row }) => (
              <input
                type="checkbox"
                {...row.getToggleRowSelectedProps()}
                className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              />
            ),
          },
          ...columns,
        ]);
      }
    }
  );

  // Handle selection change
  React.useEffect(() => {
    if (onSelectionChange && enableRowSelection) {
      onSelectionChange(selectedFlatRows.map((row) => row.original));
    }
  }, [selectedRowIds, onSelectionChange, selectedFlatRows, enableRowSelection]);

  // Determine which rows to display
  const displayRows = enablePagination ? page : rows;

  // Get current page data for export (respects filters and sorting)
  const exportData = enablePagination ? rows.map(row => row.original) : data;

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Toolbar with column visibility and export */}
      {(enableColumnVisibility || enableExport) && (
        <div className="flex justify-end gap-2 mb-4 relative">
          {enableColumnVisibility && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Settings2 className="w-4 h-4" />}
                onClick={() => setShowColumnVisibility(!showColumnVisibility)}
              >
                Columns
              </Button>
              {showColumnVisibility && (
                <ColumnVisibilityToggle
                  allColumns={allColumns}
                  onClose={() => setShowColumnVisibility(false)}
                />
              )}
            </>
          )}
          {enableExport && (
            <ExportButton
              data={exportData}
              columns={columns}
              filename={exportFilename}
              formats={exportFormats}
              title={exportTitle}
              onExportStart={onExportStart}
              onExportComplete={onExportComplete}
              onExportError={onExportError}
            />
          )}
        </div>
      )}

      {/* Table container */}
      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table {...getTableProps()} className="w-full border-collapse">
          <thead className="bg-neutral-50 border-b-2 border-neutral-200">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(
                      enableSorting && column.canSort
                        ? column.getSortByToggleProps()
                        : {}
                    )}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider',
                      enableSorting && column.canSort && 'cursor-pointer select-none hover:bg-neutral-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.render('Header')}</span>
                      {enableSorting && column.canSort && (
                        <span className="text-neutral-400">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronUp className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                    {/* Filter UI */}
                    {enableFiltering && column.canFilter && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        {column.render('Filter')}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    <span className="text-sm text-neutral-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : displayRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-8 h-8 text-neutral-300" />
                    <span className="text-sm text-neutral-500">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              displayRows.map((row) => {
                prepareRow(row);
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      'border-b border-neutral-200 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-neutral-50'
                    )}
                  >
                    {row.cells.map((cell) => (
                      <td
                        {...cell.getCellProps()}
                        className="px-4 py-3 text-sm text-neutral-700"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && !loading && displayRows.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">
              Showing {pageIndex * pageSize + 1} to{' '}
              {Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length}{' '}
              results
            </span>
            {enableRowSelection && selectedFlatRows.length > 0 && (
              <span className="text-sm text-primary-600 font-medium">
                ({selectedFlatRows.length} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {paginationConfig.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                icon={<ChevronsLeft className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                icon={<ChevronLeft className="w-4 h-4" />}
              />
              <span className="px-3 py-1 text-sm text-neutral-600">
                Page {pageIndex + 1} of {pageOptions.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => nextPage()}
                disabled={!canNextPage}
                icon={<ChevronRight className="w-4 h-4" />}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                icon={<ChevronsRight className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  /** Column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      Header: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
      accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
      Cell: PropTypes.func,
      Filter: PropTypes.func,
      disableSortBy: PropTypes.bool,
      disableFilters: PropTypes.bool,
    })
  ).isRequired,
  /** Table data */
  data: PropTypes.array.isRequired,
  /** Loading state */
  loading: PropTypes.bool,
  /** Empty state message */
  emptyMessage: PropTypes.string,
  /** Enable sorting */
  enableSorting: PropTypes.bool,
  /** Enable filtering */
  enableFiltering: PropTypes.bool,
  /** Enable pagination */
  enablePagination: PropTypes.bool,
  /** Enable column visibility toggle */
  enableColumnVisibility: PropTypes.bool,
  /** Enable row selection */
  enableRowSelection: PropTypes.bool,
  /** Enable export functionality */
  enableExport: PropTypes.bool,
  /** Base filename for exports */
  exportFilename: PropTypes.string,
  /** Available export formats */
  exportFormats: PropTypes.arrayOf(PropTypes.oneOf(['csv', 'excel', 'pdf'])),
  /** Title for PDF exports */
  exportTitle: PropTypes.string,
  /** Pagination configuration */
  pagination: PropTypes.shape({
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  }),
  /** Row click handler */
  onRowClick: PropTypes.func,
  /** Selection change handler */
  onSelectionChange: PropTypes.func,
  /** Export start handler */
  onExportStart: PropTypes.func,
  /** Export complete handler */
  onExportComplete: PropTypes.func,
  /** Export error handler */
  onExportError: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default DataTable;
