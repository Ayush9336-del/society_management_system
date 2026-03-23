'use client';

import { useState, useEffect } from 'react';
import FormInput from '@/components/FormInput';
import { Download } from 'lucide-react';
import api from '@/lib/api';
import { downloadReceipt } from '@/lib/receipt';

export default function MonthlyRecordsPage() {
  const [records, setRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filter, setFilter] = useState('all'); // all | paid | unpaid
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ total: 0, paid: 0, unpaid: 0, collected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => { fetchRecords(); }, [selectedMonth]);

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/admin/monthly-records?month=${selectedMonth}`);
      const data = res.data.records || [];
      setRecords(data);

      const assigned = data.filter(r => r.resident_name);
      setSummary({
        total: assigned.length,
        paid: assigned.filter(r => r.status === 'paid').length,
        unpaid: assigned.filter(r => r.status === 'unpaid').length,
        collected: assigned.reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0),
      });
    } catch (err) {
      console.error('Failed to fetch monthly records:', err);
    }
  };

  const filtered = records.filter(r => {
    if (filter === 'paid') return r.status === 'paid';
    if (filter === 'unpaid') return r.status === 'unpaid' && r.resident_name;
    return true;
  }).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.flat_number && r.flat_number.toLowerCase().includes(q)) ||
      (r.resident_name && r.resident_name.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Monthly Records</h1>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="w-48">
          <FormInput label="Select Month" type="month" value={selectedMonth} onChange={v => { setSelectedMonth(v); setCurrentPage(1); }} />
        </div>
        <div className="flex-1 min-w-48">
          <FormInput label="Search" value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Flat number or resident name..." />
        </div>
        <div className="flex gap-2 pb-1">
          {['all', 'paid', 'unpaid'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${filter === f
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Residents', value: summary.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Paid', value: summary.paid, color: 'bg-green-50 text-green-700' },
          { label: 'Unpaid', value: summary.unpaid, color: 'bg-red-50 text-red-700' },
          { label: 'Collected', value: `₹${summary.collected}`, color: 'bg-purple-50 text-purple-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Flat</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Resident</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount Due</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount Paid</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mode</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Transaction ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Paid At</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">No records for {selectedMonth}</td>
              </tr>
            ) : (
              paginated.map(row => (
                <tr key={row.flat_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.flat_number} <span className="text-xs text-gray-400">({row.flat_type})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.resident_name || <span className="text-gray-400 italic">Vacant</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ₹{row.amount_due || row.monthly_amount || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.amount_paid ? `₹${row.amount_paid}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{row.payment_mode || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.transaction_id || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {row.payment_date ? new Date(row.payment_date).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.resident_name ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {row.status.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === 'paid' && (
                      <button onClick={() => downloadReceipt({ ...row, month: selectedMonth })}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Download Receipt">
                        <Download size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>{filtered.length} results · Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${page === currentPage
                      ? 'bg-accent text-white border-accent'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
