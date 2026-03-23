import jsPDF from 'jspdf';

export function downloadReceipt(row) {
  const doc = new jsPDF({ unit: 'pt', format: 'a5' });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 65, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Society Management', W / 2, 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Payment Receipt', W / 2, 50, { align: 'center' });

  // Divider
  y = 90;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1);
  doc.line(40, y, W - 40, y);
  y += 24;

  // Fields
  const fields = [
    ['Flat',           `${row.flat_number} (${row.flat_type})`],
    ['Resident',       row.resident_name || '—'],
    ['Month',          row.month],
    ['Amount Paid',    `Rs. ${Number(row.amount_paid || 0).toLocaleString('en-IN')}`],
    ['Payment Mode',   row.payment_mode || '—'],
    ['Transaction ID', row.transaction_id || '—'],
    ['Paid On',        row.payment_date ? new Date(row.payment_date).toLocaleString('en-IN') : '—'],
  ];

  doc.setFontSize(10);
  fields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(label, 50, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(String(value), 190, y);
    y += 22;
  });

  // Status badge
  y += 12;
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(W / 2 - 55, y - 13, 110, 22, 4, 4, 'F');
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('✓  PAYMENT CONFIRMED', W / 2, y + 1, { align: 'center' });

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(40, pageH - 30, W - 40, pageH - 30);
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('This is a system-generated receipt.', W / 2, pageH - 16, { align: 'center' });

  doc.save(`receipt_${row.flat_number}_${row.month}.pdf`);
}
