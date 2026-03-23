'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Calendar, CreditCard, CheckCircle, Hash, Building2 } from 'lucide-react';
import api from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const month = params.month;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        // Find the payment for this month from subscriptions list
        const res = await api.get('/user/subscriptions');
        const found = (res.data.subscriptions || []).find(p => p.month === month);
        setPayment(found || null);
      } catch (err) {
        console.error('Failed to fetch payment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [month]);

  const downloadInvoice = async () => {
    if (!payment) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const auth = getAuth();
    const user = auth?.user;

    const doc = new jsPDF();

    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Society Subscription Management', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Invoice', 14, 22);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${payment.transaction_id || payment.id}`, 14, 42);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 14, 50);
    doc.text(`Billing Month: ${payment.month}`, 14, 58);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(user?.name || 'Resident', 14, 80);
    doc.text(user?.email || '', 14, 87);

    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Month', 'Mode', 'Amount']],
      body: [['Society Maintenance', payment.month, payment.payment_mode, `Rs. ${payment.amount}`]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
      foot: [['', '', 'Total Paid', `Rs. ${payment.amount}`]],
      footStyles: { fontStyle: 'bold', fillColor: [240, 240, 255] },
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(14, finalY, 60, 14, 3, 3, 'F');
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', 44, finalY + 9, { align: 'center' });

    doc.save(`invoice-${payment.month}-${payment.transaction_id || payment.id}.pdf`);
  };

  if (loading) {
    return <div className="text-gray-400 text-sm p-8">Loading...</div>;
  }

  if (!payment) {
    return (
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} /> Back
        </button>
        <p className="text-gray-500">No payment record found for {month}.</p>
      </div>
    );
  }

  const details = [
    { icon: Calendar, label: 'Billing Month', value: payment.month },
    { icon: CreditCard, label: 'Amount', value: `₹${payment.amount}` },
    { icon: CreditCard, label: 'Payment Mode', value: payment.payment_mode },
    { icon: Hash, label: 'Transaction ID', value: payment.transaction_id || '—' },
    { icon: CheckCircle, label: 'Payment Date', value: payment.payment_date ? new Date(payment.payment_date).toLocaleString() : '—' },
  ];

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} /> Back to Subscriptions
      </button>

      <div className="max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {payment.status.toUpperCase()}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-3 mb-4">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Icon size={20} className="text-accent shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {payment.status === 'paid' && (
          <button
            onClick={downloadInvoice}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium"
          >
            <Download size={18} /> Download Invoice PDF
          </button>
        )}
      </div>
    </div>
  );
}
