import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { toast } from 'react-hot-toast';

// Excel Export
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    return { success: true }
  } catch (error) {
    console.error('Excel export error:', error)
    return { success: false, error: error.message }
  }
}

export const exportMultipleSheets = (sheets, filename = 'export') => {
  try {
    const workbook = XLSX.utils.book_new()
    
    sheets.forEach(({ data, name }) => {
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, name)
    })
    
    XLSX.writeFile(workbook, `${filename}.xlsx`)
    
    return { success: true }
  } catch (error) {
    console.error('Multi-sheet Excel export error:', error)
    return { success: false, error: error.message }
  }
}

// PDF Export
export const exportToPDF = (data, options = {}) => {
  try {
    const {
      filename = 'export',
      title = 'Report',
      orientation = 'portrait',
      format = 'a4',
      columns = [],
      showHeader = true,
      showFooter = true,
      margin = { top: 20, right: 20, bottom: 20, left: 20 }
    } = options

    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format
    })

    // Add title
    if (title) {
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text(title, margin.left, margin.top)
    }

    // Add date
    if (showHeader) {
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin.left, margin.top + 10)
    }

    // Prepare table data
    const tableColumns = columns.length > 0 ? columns : Object.keys(data[0] || {})
    const tableRows = data.map(row => 
      tableColumns.map(col => row[col] || '')
    )

    // Add table
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: margin.top + 20,
      margin: { horizontal: margin.left },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [37, 99, 235], // Primary blue
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      }
    })

    // Add footer
    if (showFooter) {
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - margin.right - 20,
          doc.internal.pageSize.height - margin.bottom
        )
      }
    }

    doc.save(`${filename}.pdf`)
    
    return { success: true }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: error.message }
  }
}

// CSV Export
export const exportToCSV = (data, filename = 'export') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export')
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    return { success: true }
  } catch (error) {
    console.error('CSV export error:', error)
    return { success: false, error: error.message }
  }
}

// JSON Export
export const exportToJSON = (data, filename = 'export') => {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    return { success: true }
  } catch (error) {
    console.error('JSON export error:', error)
    return { success: false, error: error.message }
  }
}

// Print functionality
export const printTable = (data, options = {}) => {
  try {
    const {
      title = 'Report',
      columns = [],
      showDate = true
    } = options

    const tableColumns = columns.length > 0 ? columns : Object.keys(data[0] || {})
    
    let printContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #2563eb; color: white; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${showDate ? `<div class="date">Generated: ${new Date().toLocaleDateString()}</div>` : ''}
          <table>
            <thead>
              <tr>
                ${tableColumns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${tableColumns.map(col => `<td>${row[col] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
    
    return { success: true }
  } catch (error) {
    console.error('Print error:', error)
    return { success: false, error: error.message }
  }
}

// Export component for UI
export const ExportButton = ({ 
  data, 
  filename = 'export', 
  format = 'excel',
  options = {},
  children,
  className = '',
  disabled = false
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast('No data to export')
      return
    }

    switch (format) {
      case 'excel':
        exportToExcel(data, filename, options.sheetName)
        break
      case 'pdf':
        exportToPDF(data, { filename, ...options })
        break
      case 'csv':
        exportToCSV(data, filename)
        break
      case 'json':
        exportToJSON(data, filename)
        break
      case 'print':
        printTable(data, options)
        break
      default:
        console.error('Unsupported export format:', format)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className={`btn btn-outline ${className}`}
    >
      {children || `Export ${format.toUpperCase()}`}
    </button>
  )
}