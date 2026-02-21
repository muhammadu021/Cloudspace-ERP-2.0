/**
 * ExportButton Component
 * 
 * A dropdown button component for exporting data in multiple formats.
 * Supports CSV, Excel (XLSX), and PDF exports.
 * Integrates with DataTable and respects filters/sorting.
 * 
 * @example
 * <ExportButton
 *   data={data}
 *   columns={columns}
 *   filename="customers"
 *   formats={['csv', 'excel', 'pdf']}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Download, FileText, FileSpreadsheet, FileDown, ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import Button from './Button';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  getExportFilename,
  EXPORT_FORMATS,
  getExportFormatLabel
} from '../../utils/exportUtils';

const ExportButton = ({
  data,
  columns,
  filename = 'export',
  formats = ['csv', 'excel', 'pdf'],
  title,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  onExportStart,
  onExportComplete,
  onExportError,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsOpen(false);
    setIsExporting(true);

    try {
      if (onExportStart) {
        onExportStart(format);
      }

      const exportFilename = getExportFilename(filename);
      let result;

      switch (format) {
        case EXPORT_FORMATS.CSV:
          result = exportToCSV(data, columns, exportFilename);
          break;
        case EXPORT_FORMATS.EXCEL:
          result = exportToExcel(data, columns, exportFilename, {
            sheetName: title || 'Data'
          });
          break;
        case EXPORT_FORMATS.PDF:
          result = exportToPDF(data, columns, exportFilename, {
            title: title || 'Data Export',
            orientation: 'landscape'
          });
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      if (result.success) {
        if (onExportComplete) {
          onExportComplete(format, result);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      if (onExportError) {
        onExportError(format, error);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case EXPORT_FORMATS.CSV:
        return <FileText className="w-4 h-4" />;
      case EXPORT_FORMATS.EXCEL:
        return <FileSpreadsheet className="w-4 h-4" />;
      case EXPORT_FORMATS.PDF:
        return <FileDown className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  // If only one format, show simple button
  if (formats.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        icon={getFormatIcon(formats[0])}
        onClick={() => handleExport(formats[0])}
        disabled={disabled || isExporting || !data || data.length === 0}
        loading={isExporting}
        className={className}
        {...props}
      >
        Export {getExportFormatLabel(formats[0])}
      </Button>
    );
  }

  // Multiple formats - show dropdown
  return (
    <div className={cn('relative inline-block', className)} {...props}>
      <Button
        variant={variant}
        size={size}
        icon={<Download className="w-4 h-4" />}
        iconPosition="left"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting || !data || data.length === 0}
        loading={isExporting}
        className="gap-1"
      >
        Export
        <ChevronDown className="w-3 h-3 ml-1" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 py-1">
            {formats.map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-3 transition-colors"
              >
                {getFormatIcon(format)}
                <span>Export as {getExportFormatLabel(format)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

ExportButton.propTypes = {
  /** Data to export */
  data: PropTypes.array.isRequired,
  /** Column definitions */
  columns: PropTypes.array.isRequired,
  /** Base filename for export (timestamp will be added) */
  filename: PropTypes.string,
  /** Available export formats */
  formats: PropTypes.arrayOf(
    PropTypes.oneOf(['csv', 'excel', 'pdf'])
  ),
  /** Title for PDF export */
  title: PropTypes.string,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Button variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Callback when export starts */
  onExportStart: PropTypes.func,
  /** Callback when export completes */
  onExportComplete: PropTypes.func,
  /** Callback when export fails */
  onExportError: PropTypes.func,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ExportButton;
