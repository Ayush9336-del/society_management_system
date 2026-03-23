'use client';

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [meta, setMeta] = useState({ month: '', year: '' });

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReport(res.data.report);
      setMeta({ month: res.data.month, year: res.data.year });
    } catch (err) {
      console.error('Failed to fetch report:', err);
    }
  };

  const cards = [
    {
      label: 'Monthly Expected',
      desc: `Total due from all residents — ${meta.month}`,
      value: `₹${report?.monthly_expected || 0}`,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      label: 'Monthly Collected',
      desc: `Payments received this month — ${meta.month}`,
      value: `₹${report?.monthly_collected || 0}`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-700 border-green-100',
    },
    {
      label: 'Monthly Pending',
      desc: `Residents yet to pay — ${meta.month}`,
      value: `₹${report?.monthly_pending || 0}`,
      icon: AlertCircle,
      color: 'bg-red-50 text-red-700 border-red-100',
    },
    {
      label: 'Yearly Collected',
      desc: `Total collected in ${meta.year}`,
      value: `₹${report?.yearly_collected || 0}`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 border-purple-100',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map(card => (
          <div key={card.label} className={`rounded-xl border p-6 ${card.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-70">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                <p className="text-xs mt-2 opacity-60">{card.desc}</p>
              </div>
              <div className="p-3 bg-white/50 rounded-xl">
                <card.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
