import jsPDF from 'jspdf';

/**
 * Generate and print a thermal receipt (80mm width, no margins)
 * @param {Object} receiptData - Receipt data including sale, items, totals, and company info
 */
export const printThermalReceipt = (receiptData) => {
  const {
    companyName = 'YOUR COMPANY NAME',
    address = '123 Business Avenue',
    phone = '+234 800 123 4567',
    date,
    receiptNo,
    items = [],
    subtotal = 0,
    discount = 0,
    tax = 0,
    total = 0,
    customerName = ''
  } = receiptData;

  // 80mm = 226.77 points (1mm = 2.83465 points)
  const pageWidth = 80 * 2.83465; // 226.77 points
  const marginLeft = 20; // Left margin (in points)
  const marginTop = 25; // Top margin (in points)
  const marginRight = 20; // Right margin (in points)
  const contentWidth = pageWidth - (marginLeft + marginRight);
  
  // Create PDF with exact 80mm width and auto height
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, 500], // Start with 500pt height, will auto-adjust
    compress: true
  });

  let yPos = marginTop;
  const lineHeight = 12;
  const smallLineHeight = 10;

  // Helper function to add text
  const addText = (text, x, y, options = {}) => {
    const {
      align = 'left',
      fontSize = 9,
      fontStyle = 'normal',
      maxWidth = contentWidth
    } = options;

    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);

    if (align === 'center') {
      pdf.text(text, pageWidth / 2, y, { align: 'center', maxWidth });
    } else if (align === 'right') {
      pdf.text(text, pageWidth - margin, y, { align: 'right', maxWidth });
    } else {
      pdf.text(text, x, y, { maxWidth });
    }
  };

  // Helper function to add line
  const addLine = (y, thickness = 0.5) => {
    pdf.setLineWidth(thickness);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
  };

  // ===== HEADER =====
  addText(companyName, 0, yPos, { 
    align: 'center', 
    fontSize: 14, 
    fontStyle: 'bold' 
  });
  yPos += lineHeight + 2;

  addText(address, 0, yPos, { align: 'center', fontSize: 8 });
  yPos += smallLineHeight;

  addText(phone, 0, yPos, { align: 'center', fontSize: 8 });
  yPos += lineHeight;

  // ===== DATE & RECEIPT NO =====
  addText(`Date: ${date}`, marginLeft, yPos, { fontSize: 8 });
  yPos += smallLineHeight;

  addText(`Receipt No: ${receiptNo}`, marginLeft, yPos, { 
    fontSize: 9, 
    fontStyle: 'bold' 
  });
  yPos += lineHeight;

  if (customerName) {
    addText(`Customer: ${customerName}`, marginLeft, yPos, { fontSize: 8 });
    yPos += lineHeight;
  }

  // ===== SEPARATOR LINE =====
  addLine(yPos, 1);
  yPos += 8;

  // ===== ITEMS HEADER =====
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITEM', marginLeft, yPos);
  pdf.text('QTY', pageWidth / 2 - 15, yPos, { align: 'center' });
  pdf.text('PRICE', pageWidth - marginRight, yPos, { align: 'right' });
  yPos += smallLineHeight;

  addLine(yPos, 0.3);
  yPos += 6;

  // ===== ITEMS =====
  pdf.setFont('helvetica', 'normal');
  items.forEach((item) => {
    const itemName = item.name || item.item_name || 'Item';
    const qty = item.quantity || item.qty || 1;
    const price = parseFloat(item.price || item.unit_price || 0);
    const itemTotal = price * qty;

    // Item name (may wrap to multiple lines)
    const nameLines = pdf.splitTextToSize(itemName, contentWidth * 0.5);
    pdf.setFontSize(8);
    pdf.text(nameLines, marginLeft, yPos);

    // Quantity
    pdf.text(`x${qty}`, pageWidth / 2 - 15, yPos, { align: 'center' });

    // Price (without Naira sign)
    pdf.text(`${itemTotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      pageWidth - marginRight, yPos, { align: 'right' });

    yPos += (nameLines.length * smallLineHeight) + 2;
  });

  yPos += 4;

  // ===== SUBTOTAL BOX =====
  const boxHeight = 18;
  const boxY = yPos;
  
  // Draw filled rectangle for subtotal
  pdf.setFillColor(63, 105, 116); // #3f6974
  pdf.rect(marginLeft, boxY, contentWidth, boxHeight, 'F');

  // Subtotal text in white (without Naira sign)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBTOTAL', marginLeft + 4, boxY + 12);
  pdf.text(`${total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
    pageWidth - marginRight - 4, boxY + 12, { align: 'right' });

  // Reset text color
  pdf.setTextColor(0, 0, 0);
  yPos += boxHeight + 8;

  // ===== SEPARATOR LINE =====
  addLine(yPos, 1);
  yPos += 10;

  // ===== FOOTER =====
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  addText('THANK YOU', 0, yPos, { align: 'center' });
  yPos += lineHeight;
  addText('FOR YOUR PURCHASE', 0, yPos, { align: 'center' });
  yPos += lineHeight + 4;

  // ===== FOOTER LOGO =====
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  addText('Cloudspace', 0, yPos, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  yPos += smallLineHeight;
  addText('ERP System', 0, yPos, { align: 'center' });
  yPos += marginTop;

  // Adjust page height to fit content exactly
  const finalHeight = yPos;
  const newPdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, finalHeight],
    compress: true
  });

  // Copy content to new PDF with exact height
  const pageData = pdf.output('datauristring');
  
  // Open print dialog with the PDF
  pdf.autoPrint();
  window.open(pdf.output('bloburl'), '_blank');
};

/**
 * Download thermal receipt as PDF
 */
export const downloadThermalReceipt = (receiptData) => {
  const { receiptNo = '000001' } = receiptData;
  
  const pdf = generateThermalReceiptPDF(receiptData);
  pdf.save(`receipt_${receiptNo}.pdf`);
};

/**
 * Generate thermal receipt PDF (internal function)
 */
const generateThermalReceiptPDF = (receiptData) => {
  const {
    companyName = 'YOUR COMPANY NAME',
    address = '123 Business Avenue',
    phone = '+234 800 123 4567',
    date,
    receiptNo,
    items = [],
    total = 0,
    customerName = ''
  } = receiptData;

  const pageWidth = 80 * 2.83465;
  const marginLeft = 20;
  const marginTop = 25;
  const marginRight = 20;
  const contentWidth = pageWidth - (marginLeft + marginRight);
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [pageWidth, 500],
    compress: true
  });

  let yPos = marginTop;
  const lineHeight = 12;
  const smallLineHeight = 10;

  const addText = (text, x, y, options = {}) => {
    const { align = 'left', fontSize = 9, fontStyle = 'normal', maxWidth = contentWidth } = options;
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    if (align === 'center') {
      pdf.text(text, pageWidth / 2, y, { align: 'center', maxWidth });
    } else if (align === 'right') {
      pdf.text(text, pageWidth - marginRight, y, { align: 'right', maxWidth });
    } else {
      pdf.text(text, x, y, { maxWidth });
    }
  };

  const addLine = (y, thickness = 0.5) => {
    pdf.setLineWidth(thickness);
    pdf.line(marginLeft, y, pageWidth - marginRight, y);
  };

  addText(companyName, 0, yPos, { align: 'center', fontSize: 14, fontStyle: 'bold' });
  yPos += lineHeight + 2;
  addText(address, 0, yPos, { align: 'center', fontSize: 8 });
  yPos += smallLineHeight;
  addText(phone, 0, yPos, { align: 'center', fontSize: 8 });
  yPos += lineHeight;
  addText(`Date: ${date}`, marginLeft, yPos, { fontSize: 8 });
  yPos += smallLineHeight;
  addText(`Receipt No: ${receiptNo}`, marginLeft, yPos, { fontSize: 9, fontStyle: 'bold' });
  yPos += lineHeight;
  if (customerName) {
    addText(`Customer: ${customerName}`, marginLeft, yPos, { fontSize: 8 });
    yPos += lineHeight;
  }
  addLine(yPos, 1);
  yPos += 8;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITEM', marginLeft, yPos);
  pdf.text('QTY', pageWidth / 2 - 15, yPos, { align: 'center' });
  pdf.text('PRICE', pageWidth - marginRight, yPos, { align: 'right' });
  yPos += smallLineHeight;
  addLine(yPos, 0.3);
  yPos += 6;

  pdf.setFont('helvetica', 'normal');
  items.forEach((item) => {
    const itemName = item.name || item.item_name || 'Item';
    const qty = item.quantity || item.qty || 1;
    const price = parseFloat(item.price || item.unit_price || 0);
    const itemTotal = price * qty;
    const nameLines = pdf.splitTextToSize(itemName, contentWidth * 0.5);
    pdf.setFontSize(8);
    pdf.text(nameLines, marginLeft, yPos);
    pdf.text(`x${qty}`, pageWidth / 2 - 15, yPos, { align: 'center' });
    pdf.text(`${itemTotal.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      pageWidth - marginRight, yPos, { align: 'right' });
    yPos += (nameLines.length * smallLineHeight) + 2;
  });

  yPos += 4;
  const boxHeight = 18;
  const boxY = yPos;
  pdf.setFillColor(63, 105, 116);
  pdf.rect(marginLeft, boxY, contentWidth, boxHeight, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBTOTAL', marginLeft + 4, boxY + 12);
  pdf.text(`${total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
    pageWidth - marginRight - 4, boxY + 12, { align: 'right' });
  pdf.setTextColor(0, 0, 0);
  yPos += boxHeight + 8;
  addLine(yPos, 1);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  addText('THANK YOU', 0, yPos, { align: 'center' });
  yPos += lineHeight;
  addText('FOR YOUR PURCHASE', 0, yPos, { align: 'center' });
  yPos += lineHeight + 4;

  // ===== FOOTER LOGO =====
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  addText('Cloudspace', 0, yPos, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  yPos += smallLineHeight;
  addText('ERP System', 0, yPos, { align: 'center' });

  return pdf;
};
