/**
 * Export Utilities
 * 
 * Provides universal export functionality for data tables and reports.
 * Supports CSV, Excel (XLSX), and PDF formats.
 * Respects current filters, sorting, and column visibility.
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with Header and accessor
 * @param {string} filename - Output filename (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  try {
    // Filter out selection column and get visible columns
    const visibleColumns = columns.filter(col => col.id !== 'selection' && !col.hidden);
    
    // Create CSV header
    const headers = visibleColumns.map(col => col.Header);
    
    // Create CSV rows
    const rows = data.map(row => {
      return visibleColumns.map(col => {
        const accessor = col.accessor;
        let value = '';
        
        if (typeof accessor === 'function') {
          value = accessor(row);
        } else if (typeof accessor === 'string') {
          value = row[accessor];
        }
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert to string and escape quotes
        const stringValue = String(value);
        
        // If value contains comma, newline, or quote, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      });
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
    
    return { success: true, message: 'CSV exported successfully' };
  } catch (error) {
    console.error('CSV export error:', error);
    return { success: false, message: 'Failed to export CSV', error };
  }
};

/**
 * Export data to Excel (XLSX) format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with Header and accessor
 * @param {string} filename - Output filename (without extension)
 * @param {Object} options - Additional options (sheetName, etc.)
 */
export const exportToExcel = (data, columns, filename = 'export', options = {}) => {
  try {
    const { sheetName = 'Sheet1', includeFilters = false } = options;
    
    // Filter out selection column and get visible columns
    const visibleColumns = columns.filter(col => col.id !== 'selection' && !col.hidden);
    
    // Create worksheet data
    const wsData = [];
    
    // Add headers
    const headers = visibleColumns.map(col => col.Header);
    wsData.push(headers);
    
    // Add data rows
    data.forEach(row => {
      const rowData = visibleColumns.map(col => {
        const accessor = col.accessor;
        let value = '';
        
        if (typeof accessor === 'function') {
          value = accessor(row);
        } else if (typeof accessor === 'string') {
          value = row[accessor];
        }
        
        return value ?? '';
      });
      wsData.push(rowData);
    });
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = visibleColumns.map(col => ({
      wch: Math.max(
        col.Header.length,
        ...data.slice(0, 100).map(row => {
          const accessor = col.accessor;
          let value = '';
          if (typeof accessor === 'function') {
            value = accessor(row);
          } else if (typeof accessor === 'string') {
            value = row[accessor];
          }
          return String(value ?? '').length;
        })
      )
    }));
    ws['!cols'] = colWidths;
    
    // Style header row
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'F3F4F6' } },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
    
    return { success: true, message: 'Excel file exported successfully' };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, message: 'Failed to export Excel file', error };
  }
};

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions with Header and accessor
 * @param {string} filename - Output filename (without extension)
 * @param {Object} options - Additional options (title, orientation, etc.)
 */
export const exportToPDF = (data, columns, filename = 'export', options = {}) => {
  try {
    const {
      title = 'Data Export',
      orientation = 'landscape',
      pageSize = 'a4',
      includeDate = true,
      fontSize = 10
    } = options;
    
    // Filter out selection column and get visible columns
    const visibleColumns = columns.filter(col => col.id !== 'selection' && !col.hidden);
    
    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    });
    
    // Add title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, 14, 15);
    
    // Add date if requested
    if (includeDate) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${dateStr}`, 14, 22);
    }
    
    // Prepare table data
    const headers = visibleColumns.map(col => col.Header);
    const body = data.map(row => {
      return visibleColumns.map(col => {
        const accessor = col.accessor;
        let value = '';
        
        if (typeof accessor === 'function') {
          value = accessor(row);
        } else if (typeof accessor === 'string') {
          value = row[accessor];
        }
        
        return String(value ?? '');
      });
    });
    
    // Add table
    doc.autoTable({
      head: [headers],
      body: body,
      startY: includeDate ? 28 : 22,
      styles: {
        fontSize: fontSize,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [99, 102, 241], // primary-500
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // neutral-50
      },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          pageHeight - 5
        );
      }
    });
    
    // Save PDF
    doc.save(`${filename}.pdf`);
    
    return { success: true, message: 'PDF exported successfully' };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, message: 'Failed to export PDF', error };
  }
};

/**
 * Helper function to download a blob
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get export filename with timestamp
 * @param {string} baseName - Base filename
 * @returns {string} Filename with timestamp
 */
export const getExportFilename = (baseName = 'export') => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  return `${baseName}_${timestamp}`;
};

/**
 * Prepare data for export by applying filters and sorting
 * @param {Array} data - Original data array
 * @param {Object} filters - Active filters
 * @param {Object} sorting - Active sorting
 * @returns {Array} Filtered and sorted data
 */
export const prepareDataForExport = (data, filters = {}, sorting = null) => {
  let processedData = [...data];
  
  // Apply filters
  Object.keys(filters).forEach(key => {
    const filterValue = filters[key];
    if (filterValue) {
      processedData = processedData.filter(row => {
        const value = String(row[key] ?? '').toLowerCase();
        return value.includes(String(filterValue).toLowerCase());
      });
    }
  });
  
  // Apply sorting
  if (sorting && sorting.id) {
    processedData.sort((a, b) => {
      const aVal = a[sorting.id];
      const bVal = b[sorting.id];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sorting.desc ? -comparison : comparison;
    });
  }
  
  return processedData;
};

/**
 * Export options for different formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf'
};

/**
 * Get export format label
 * @param {string} format - Export format
 * @returns {string} Human-readable label
 */
export const getExportFormatLabel = (format) => {
  const labels = {
    [EXPORT_FORMATS.CSV]: 'CSV',
    [EXPORT_FORMATS.EXCEL]: 'Excel (XLSX)',
    [EXPORT_FORMATS.PDF]: 'PDF'
  };
  return labels[format] || format;
};
