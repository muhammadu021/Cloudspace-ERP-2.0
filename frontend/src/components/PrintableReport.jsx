/**
 * PrintableReport Component
 * 
 * A wrapper component that adds print-friendly structure to reports.
 * Includes print header, footer, and proper formatting.
 * Automatically hides non-printable elements.
 * 
 * @example
 * <PrintableReport
 *   title="Monthly Sales Report"
 *   subtitle="January 2024"
 *   showDate
 *   showPageNumbers
 * >
 *   <ReportContent />
 * </PrintableReport>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../design-system/utils';

const PrintableReport = ({
  title,
  subtitle,
  showDate = true,
  showPageNumbers = true,
  showHeader = true,
  showFooter = true,
  headerContent,
  footerContent,
  watermark,
  confidential = false,
  children,
  className,
  ...props
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={cn('printable-report', className)} {...props}>
      {/* Print Header */}
      {showHeader && (
        <div className="print-header hidden print:block">
          {headerContent || (
            <>
              {title && <h1 className="print-title">{title}</h1>}
              {subtitle && <p className="print-subtitle">{subtitle}</p>}
              {showDate && <p className="print-date">Generated: {currentDate}</p>}
            </>
          )}
        </div>
      )}

      {/* Watermark */}
      {watermark && (
        <div className="print-watermark hidden print:block">
          {watermark}
        </div>
      )}

      {/* Main Content */}
      <div className="report-content">
        {children}
      </div>

      {/* Print Footer */}
      {showFooter && (
        <div className="print-footer hidden print:block">
          {footerContent || (
            <div className="flex justify-between items-center text-sm">
              <span>{title || 'Report'}</span>
              {showPageNumbers && (
                <span>
                  Page <span className="page-number"></span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confidential Footer */}
      {confidential && (
        <div className="confidential-footer hidden print:block">
          CONFIDENTIAL - For Internal Use Only
        </div>
      )}
    </div>
  );
};

PrintableReport.propTypes = {
  /** Report title */
  title: PropTypes.string,
  /** Report subtitle */
  subtitle: PropTypes.string,
  /** Show generation date */
  showDate: PropTypes.bool,
  /** Show page numbers */
  showPageNumbers: PropTypes.bool,
  /** Show header section */
  showHeader: PropTypes.bool,
  /** Show footer section */
  showFooter: PropTypes.bool,
  /** Custom header content */
  headerContent: PropTypes.node,
  /** Custom footer content */
  footerContent: PropTypes.node,
  /** Watermark text */
  watermark: PropTypes.string,
  /** Mark as confidential */
  confidential: PropTypes.bool,
  /** Report content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default PrintableReport;
