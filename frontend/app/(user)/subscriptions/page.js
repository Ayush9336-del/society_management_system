'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText } from 'lucide-react';
import api from '@/lib/api';
import { getAuth } from '@/lib/auth';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/user/subscriptions');
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  };

  const downloadInvoice = async (payment) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const auth = getAuth();
    const user = auth?.user;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Society Subscription Management', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Invoice', 14, 22);

    // Invoice meta
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${payment.transaction_id || payment.id}`, 14, 42);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 14, 50);
    doc.text(`Billing Month: ${payment.month}`, 14, 58);

    // Resident info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(user?.name || 'Resident', 14, 80);
    doc.text(user?.email || '', 14, 87);

    // Payment details table
    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Month', 'Mode', 'Amount']],
      body: [[
        'Society Maintenance',
        payment.month,
        payment.payment_mode,
        `Rs. ${payment.amount}`,
      ]],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] },
      foot: [['', '', 'Total Paid', `Rs. ${payment.amount}`]],
      footStyles: { fontStyle: 'bold', fillColor: [240, 240, 255] },
    });

    // Status stamp
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(14, finalY, 60, 14, 3, 3, 'F');
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', 44, finalY + 9, { align: 'center' });

    doc.save(`invoice-${payment.month}-${payment.transaction_id || payment.id}.pdf`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription History</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Month</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mode</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Transaction ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">No payment records yet</td>
              </tr>
            ) : (
              subscriptions.map(row => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/subscriptions/${row.month}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                  <td className="px-4 py-3 text-gray-700">₹{row.amount}</td>
                  <td className="px-4 py-3 text-gray-700">{row.payment_mode || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.transaction_id || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    {row.status === 'paid' ? (
                      <button
                        onClick={() => downloadInvoice(row)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-accent hover:bg-accent/10 rounded-lg text-xs font-medium"
                      >
                        <Download size={14} /> PDF
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
