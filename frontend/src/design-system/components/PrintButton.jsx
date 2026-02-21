/**
 * PrintButton Component
 * 
 * A button component for printing the current view.
 * Triggers browser print dialog with optimized print stylesheet.
 * Can optionally show print preview before printing.
 * 
 * @example
 * <PrintButton
 *   title="Sales Report"
 *   showPreview={false}
 * />
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Printer, Eye } from 'lucide-react';
import Button from './Button';
import { cn } from '../utils';

const PrintButton = ({
  title,
  showPreview = false,
  onBeforePrint,
  onAfterPrint,
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);

    try {
      // Call before print callback
      if (onBeforePrint) {
        onBeforePrint();
      }

      // Add print title to document if provided
      const originalTitle = document.title;
      if (title) {
        document.title = title;
      }

      // Trigger print dialog
      window.print();

      // Restore original title
      if (title) {
        document.title = originalTitle;
      }

      // Call after print callback
      if (onAfterPrint) {
        onAfterPrint();
      }
    } catch (error) {
      console.error('Print error:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePreview = () => {
    // Open print preview (browser's print dialog with preview)
    handlePrint();
  };

  return (
    <div className={cn('inline-flex gap-2', className)} {...props}>
      <Button
        variant={variant}
        size={size}
        icon={<Printer className="w-4 h-4" />}
        onClick={handlePrint}
        disabled={isPrinting}
        loading={isPrinting}
        className="print-button"
      >
        Print
      </Button>
      {showPreview && (
        <Button
          variant="ghost"
          size={size}
          icon={<Eye className="w-4 h-4" />}
          onClick={handlePreview}
          disabled={isPrinting}
          className="print-button"
          title="Print Preview"
        />
      )}
    </div>
  );
};

PrintButton.propTypes = {
  /** Title to use for print document */
  title: PropTypes.string,
  /** Show preview button */
  showPreview: PropTypes.bool,
  /** Callback before printing */
  onBeforePrint: PropTypes.func,
  /** Callback after printing */
  onAfterPrint: PropTypes.func,
  /** Button variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default PrintButton;
